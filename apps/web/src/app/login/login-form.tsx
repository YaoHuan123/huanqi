"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { APP_NAME, APP_TAGLINE } from "@huanqi/shared";
import { signInWithAppleNative } from "@/lib/native/apple-sign-in";
import { isIosNative } from "@/lib/native/platform";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/write";
  const [iosNative, setIosNative] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const consentOk = acceptTerms && acceptPrivacy;

  useEffect(() => {
    isIosNative().then(setIosNative);
  }, []);

  async function signInWithApple() {
    if (!consentOk) {
      setError("Accept the Terms and Privacy Policy to continue");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { identityToken } = await signInWithAppleNative();
      const res = await fetch("/api/auth/apple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identityToken,
          acceptTerms: true,
          acceptPrivacy: true,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Apple Sign In failed");
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apple Sign In failed");
    } finally {
      setLoading(false);
    }
  }

  const consentFields = (
    <div className="space-y-3 text-sm">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1"
        />
        <span>
          I accept the{" "}
          <Link href="/terms" className="text-violet-300 underline-offset-2 hover:underline">
            Terms of Service
          </Link>{" "}
          (17+)
        </span>
      </label>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={acceptPrivacy}
          onChange={(e) => setAcceptPrivacy(e.target.checked)}
          className="mt-1"
        />
        <span>
          I accept the{" "}
          <Link href="/privacy" className="text-violet-300 underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
        </span>
      </label>
    </div>
  );

  if (!iosNative) {
    return (
      <div className="login-shell">
        <div className="login-hero">
          <p className="login-shell-title">{APP_NAME}</p>
          <p className="mt-2 text-sm text-stone-400">{APP_TAGLINE}</p>
        </div>

        <div className="login-card">
          <h1 className="m-0 text-lg font-semibold text-stone-100">iOS app only</h1>
          <p className="m-0 text-sm text-stone-400">
            HuanQi is available on iPhone and iPad. Sign in with Apple in the app to write
            sensations, get matches, and unlock contact via Apple In-App Purchase.
          </p>
          <p className="m-0 text-sm text-stone-500">
            This website hosts our Privacy Policy, Terms, and API for the iOS app.
          </p>
        </div>

        <p className="text-center text-xs text-stone-600">
          <Link href="/privacy" className="text-stone-400 hover:text-stone-300">
            Privacy Policy
          </Link>
          {" · "}
          <Link href="/terms" className="text-stone-400 hover:text-stone-300">
            Terms of Service
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="login-shell">
      <div className="login-hero">
        <p className="login-shell-title">{APP_NAME}</p>
        <p className="mt-2 text-sm text-stone-400">{APP_TAGLINE}</p>
      </div>

      <div className="login-card">
        <h1 className="m-0 text-lg font-semibold text-stone-100">Sign in</h1>
        <p className="m-0 text-sm text-stone-400">
          You must be 17 or older. HuanQi is a semantic matching tool — not a chat app.
        </p>

        <div className="space-y-4">
          {consentFields}
          {error && <p className="shell-status-error">{error}</p>}
          <button
            type="button"
            onClick={signInWithApple}
            disabled={loading || !consentOk}
            className="shell-btn-apple"
          >
            {loading ? "Please wait…" : "Continue with Apple"}
          </button>
        </div>
      </div>
    </div>
  );
}
