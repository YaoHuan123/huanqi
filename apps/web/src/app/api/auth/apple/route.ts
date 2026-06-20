import { NextRequest } from "next/server";
import { verifyAppleIdentityToken } from "@/lib/auth/apple";
import { appleAuthSchema } from "@/lib/auth/schemas";
import { createSession } from "@/lib/auth/session";
import { jsonError, jsonOk, logRequest } from "@/lib/api/response";
import { getUserByAppleSub, upsertUserWithConsent } from "@/lib/user/repository";

export async function POST(request: NextRequest) {
  logRequest("POST", "/api/auth/apple");

  try {
    const body = await request.json();
    const parsed = appleAuthSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid request");
    }

    const profile = await verifyAppleIdentityToken(parsed.data.identityToken);

    let email = profile.email;
    if (!email) {
      const existing = await getUserByAppleSub(profile.sub);
      if (existing?.email) {
        email = existing.email;
      }
    }

    if (!email) {
      return jsonError(
        "Apple did not share an email. In Settings → Apple Account → Sign in with Apple → HuanQi, stop using this app, then sign in again and choose Share My Email.",
        400
      );
    }

    const user = await upsertUserWithConsent({
      email,
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
    if (error instanceof Error && error.message.includes("Apple token verification failed")) {
      console.error(error);
      return jsonError(
        "Could not verify Apple sign-in on the server. Ensure APPLE_CLIENT_ID matches the iOS bundle ID (io.github.YaoHuan123.huanqi) and the API can reach Apple.",
        401
      );
    }
    console.error(error);
    return jsonError("Apple Sign In failed", 401);
  }
}
