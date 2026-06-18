import appleSignin from "apple-signin-auth";

export const APPLE_AUTH_DEV_MOCK_TOKEN = "dev-apple-mock-token";
export const APPLE_AUTH_DEV_MOCK_SUB = "dev-mock-apple-sub";

export type AppleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
};

function isDevMockEnabled(): boolean {
  const v = (process.env.APPLE_AUTH_DEV_MOCK ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
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

  const clientId = process.env.APPLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("APPLE_CLIENT_ID is not configured");
  }

  const payload = await appleSignin.verifyIdToken(identityToken, {
    audience: clientId,
    ignoreExpiration: false,
  });

  if (!payload.sub) {
    throw new Error("Invalid Apple token: missing sub");
  }

  const email = payload.email;
  if (!email) {
    throw new Error("Apple account must share an email address");
  }

  return {
    sub: payload.sub,
    email: email.toLowerCase(),
    emailVerified: payload.email_verified === true || payload.email_verified === "true",
  };
}
