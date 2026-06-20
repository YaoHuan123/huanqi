import appleSignin from "apple-signin-auth";
import { APP_BUNDLE_ID } from "@huanqi/shared";

export const APPLE_AUTH_DEV_MOCK_TOKEN = "dev-apple-mock-token";
export const APPLE_AUTH_DEV_MOCK_SUB = "dev-mock-apple-sub";

export type AppleProfile = {
  sub: string;
  email?: string;
  emailVerified: boolean;
};

function isDevMockEnabled(): boolean {
  const v = (process.env.APPLE_AUTH_DEV_MOCK ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function resolveAppleClientId(): string {
  const configured = process.env.APPLE_CLIENT_ID?.trim();
  return configured || APP_BUNDLE_ID;
}

export async function verifyAppleIdentityToken(
  identityToken: string
): Promise<AppleProfile> {
  if (
    isDevMockEnabled() &&
    process.env.NODE_ENV !== "production" &&
    identityToken === APPLE_AUTH_DEV_MOCK_TOKEN
  ) {
    return {
      sub: APPLE_AUTH_DEV_MOCK_SUB,
      email: "dev@example.com",
      emailVerified: true,
    };
  }

  const clientId = resolveAppleClientId();

  let payload: Awaited<ReturnType<typeof appleSignin.verifyIdToken>>;
  try {
    payload = await appleSignin.verifyIdToken(identityToken, {
      audience: clientId,
      ignoreExpiration: false,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Apple token verification failed (audience ${clientId}): ${detail}`
    );
  }

  if (!payload.sub) {
    throw new Error("Invalid Apple token: missing sub");
  }

  const email =
    typeof payload.email === "string" ? payload.email.toLowerCase() : undefined;

  return {
    sub: payload.sub,
    email,
    emailVerified:
      payload.email_verified === true || payload.email_verified === "true",
  };
}
