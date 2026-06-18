import { NextRequest } from "next/server";
import { hashOtpCode, normalizeEmail } from "@/lib/auth/otp";
import { verifyCodeSchema } from "@/lib/auth/schemas";
import { createSession } from "@/lib/auth/session";
import { jsonError, jsonOk, logRequest } from "@/lib/api/response";
import { upsertUserWithConsent } from "@/lib/user/repository";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  logRequest("POST", "/api/auth/email/verify");

  try {
    const body = await request.json();
    const parsed = verifyCodeSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid request");
    }

    const email = normalizeEmail(parsed.data.email);
    const codeHash = hashOtpCode(email, parsed.data.code);

    const otp = await prisma.emailOtp.findFirst({
      where: {
        email,
        codeHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return jsonError("Invalid or expired verification code", 401);
    }

    await prisma.emailOtp.update({
      where: { id: otp.id },
      data: { usedAt: new Date() },
    });

    const user = await upsertUserWithConsent({ email, emailVerified: true });
    await createSession(user.id, user.email);

    return jsonOk({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_BOUND_TO_OTHER_APPLE_ID") {
      return jsonError("This email is linked to a different Apple account", 409);
    }
    console.error(error);
    return jsonError("Verification failed", 500);
  }
}
