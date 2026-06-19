import { SignInWithApple } from "@capacitor-community/apple-sign-in";
import { isIosNative } from "./platform";

export const APPLE_DEV_MOCK_TOKEN = "dev-apple-mock-token";

function shouldUseDevMock(): boolean {
  return import.meta.env.VITE_APPLE_DEV_MOCK === "1";
}

function formatAppleSignInError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (/error 1000|AuthorizationError.*1000|ASAuthorizationErrorUnknown/i.test(message)) {
    return [
      "Apple Sign In is not configured on this build.",
      "In Xcode: Target → Signing & Capabilities → add “Sign in with Apple”.",
      "In developer.apple.com: enable Sign in with Apple for App ID io.github.YaoHuan123.huanqi.",
      "On device: Settings → Apple Account must be signed in, then rebuild and reinstall the app.",
    ].join(" ");
  }

  if (/error 1001|canceled|cancelled/i.test(message)) {
    return "Sign in was canceled.";
  }

  return message || "Apple Sign In failed";
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

  try {
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
  } catch (error) {
    throw new Error(formatAppleSignInError(error));
  }
}
