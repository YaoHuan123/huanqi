import { NextRequest } from "next/server";
import { generateOtpCode, hashOtpCode, isValidEmail, normalizeEmail } from "@/lib/auth/otp";
import { sendCodeSchema } from "@/lib/auth/schemas";
import { jsonError, jsonOk, logRequest } from "@/lib/api/response";
import { sendOtpEmail } from "@/lib/email/send-otp";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  logRequest("POST", "/api/auth/email/send-code");

  try {
    const body = await request.json();
    const parsed = sendCodeSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid request");
    }

    const email = normalizeEmail(parsed.data.email);
    if (!isValidEmail(email)) {
      return jsonError("Invalid email address");
    }

    const recent = await prisma.emailOtp.findFirst({
      where: {
        email,
        createdAt: { gte: new Date(Date.now() - 60_000) },
        usedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (recent) {
      return jsonError("Please wait 60 seconds before requesting a new code", 429);
    }

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.emailOtp.create({
      data: {
        email,
        codeHash: hashOtpCode(email, code),
        expiresAt,
      },
    });

    const delivery = await sendOtpEmail(email, code);

    return jsonOk({
      message:
        delivery.mode === "dev"
          ? "Dev mode: no email sent. Use the code below."
          : "Verification code sent",
      ...(delivery.mode === "dev"
        ? { devCode: delivery.code, devHint: delivery.hint }
        : {}),
    });
  } catch (error) {
    console.error(error);
    return jsonError("Failed to send verification code", 500);
  }
}
