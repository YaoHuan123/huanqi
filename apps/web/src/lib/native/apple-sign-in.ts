import { isIosNative } from "@/lib/native/platform";

export const APPLE_DEV_MOCK_TOKEN = "dev-apple-mock-token";

function shouldUseDevMock(): boolean {
  if (process.env.NEXT_PUBLIC_APPLE_DEV_MOCK === "1") return true;
  return process.env.NODE_ENV === "development";
}

export async function signInWithAppleNative(): Promise<{ identityToken: string }> {
  if (shouldUseDevMock() && !(await isIosNative())) {
    return { identityToken: APPLE_DEV_MOCK_TOKEN };
  }

  if (!(await isIosNative())) {
    throw new Error("Apple Sign In is only available in the iOS app");
  }

  const { SignInWithApple } = await import("@capacitor-community/apple-sign-in");
  const clientId =
    process.env.NEXT_PUBLIC_APPLE_BUNDLE_ID?.trim() || "com.huanqi.app";

  const result = await SignInWithApple.authorize({
    clientId,
    redirectURI: "",
    scopes: "email name",
  });

  const identityToken = result.response?.identityToken;
  if (!identityToken) {
    throw new Error("Apple Sign In did not return an identity token");
  }

  return { identityToken };
}
