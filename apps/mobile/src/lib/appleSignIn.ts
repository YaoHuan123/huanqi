import { SignInWithApple } from "@capacitor-community/apple-sign-in";
import { isIosNative } from "./platform";

export const APPLE_DEV_MOCK_TOKEN = "dev-apple-mock-token";

function shouldUseDevMock(): boolean {
  return import.meta.env.VITE_APPLE_DEV_MOCK === "1";
}

export async function signInWithAppleNative(): Promise<{ identityToken: string }> {
  if (shouldUseDevMock() && !isIosNative()) {
    return { identityToken: APPLE_DEV_MOCK_TOKEN };
  }

  if (!isIosNative()) {
    throw new Error("Apple Sign In is only available in the iOS app");
  }

  const clientId =
    import.meta.env.VITE_APPLE_BUNDLE_ID?.trim() || "io.github.YaoHuan123.huanqi";

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
