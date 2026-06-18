import appleSignin from "apple-signin-auth";

export type AppleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
};

export async function verifyAppleIdentityToken(
  identityToken: string
): Promise<AppleProfile> {
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
