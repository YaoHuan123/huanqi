import { NextRequest } from "next/server";
import { verifyAppleIdentityToken } from "@/lib/auth/apple";
import { appleAuthSchema } from "@/lib/auth/schemas";
import { createSession } from "@/lib/auth/session";
import { jsonError, jsonOk, logRequest } from "@/lib/api/response";
import { upsertUserWithConsent } from "@/lib/user/repository";

export async function POST(request: NextRequest) {
  logRequest("POST", "/api/auth/apple");

  try {
    const body = await request.json();
    const parsed = appleAuthSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid request");
    }

    const profile = await verifyAppleIdentityToken(parsed.data.identityToken);

    const user = await upsertUserWithConsent({
      email: profile.email,
      appleSub: profile.sub,
      emailVerified: profile.emailVerified,
    });

    const token = await createSession(user.id, user.email);

    return jsonOk({
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_BOUND_TO_OTHER_APPLE_ID") {
      return jsonError("This email is linked to a different Apple account", 409);
    }
    if (error instanceof Error && error.message.includes("APPLE_CLIENT_ID")) {
      return jsonError("Apple Sign In is not configured", 503);
    }
    console.error(error);
    return jsonError("Apple Sign In failed", 401);
  }
}
