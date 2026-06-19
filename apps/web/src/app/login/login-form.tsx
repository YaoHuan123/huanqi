"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { APP_NAME, APP_TAGLINE } from "@huanqi/shared";
import { signInWithAppleNative } from "@/lib/native/apple-sign-in";
import { isIosNative } from "@/lib/native/platform";

type Step = "email" | "code";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/write";
  const [iosNative, setIosNative] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

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
    setInfo(null);
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

  async function sendCode(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setDevCode(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/email/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Failed to send code");
        return;
      }
      setStep("code");
      if (json.data?.devCode) {
        setDevCode(json.data.devCode);
        setCode(json.data.devCode);
        setInfo(json.data.devHint ?? "Local dev: use the code below (no email sent).");
      } else {
        setInfo("Check your email for a 6-digit code.");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    if (!consentOk) {
      setError("Accept the Terms and Privacy Policy to continue");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          acceptTerms: true,
          acceptPrivacy: true,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Verification failed");
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Network error");
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

        {iosNative ? (
          <div className="space-y-4">
            {consentFields}
            {error && <p className="shell-status-error">{error}</p>}
            {info && <p className="shell-status-success">{info}</p>}
            <button
              type="button"
              onClick={signInWithApple}
              disabled={loading || !consentOk}
              className="shell-btn-apple"
            >
              {loading ? "Please wait…" : "Continue with Apple"}
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={step === "email" ? sendCode : verifyCode}>
            <label className="block space-y-2">
              <span className="text-sm text-stone-400">Email address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={step === "code"}
                className="shell-input disabled:opacity-60"
                placeholder="you@example.com"
              />
            </label>

            {step === "code" && (
              <label className="block space-y-2">
                <span className="text-sm text-stone-400">Verification code</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="shell-input tracking-widest"
                  placeholder="000000"
                />
              </label>
            )}

            {step === "code" && consentFields}

            {devCode && (
              <div className="rounded-xl border border-violet-800/50 bg-violet-950/30 px-4 py-3 text-center">
                <p className="text-xs text-violet-300/80">Local dev verification code</p>
                <p className="mt-1 font-mono text-2xl tracking-[0.3em] text-violet-100">
                  {devCode}
                </p>
              </div>
            )}

            {error && <p className="shell-status-error">{error}</p>}
            {info && <p className="shell-status-success">{info}</p>}
            <button
              type="submit"
              disabled={loading || (step === "code" && !consentOk)}
              className="shell-btn-primary shell-btn-primary--full"
            >
              {loading
                ? "Please wait…"
                : step === "email"
                  ? "Send verification code"
                  : "Verify and continue"}
            </button>

            {step === "code" && (
              <button
                type="button"
                className="w-full text-sm text-stone-500 hover:text-stone-300"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                  setInfo(null);
                }}
              >
                Use a different email
              </button>
            )}
          </form>
        )}
      </div>

      {!iosNative && (
        <p className="text-center text-xs text-stone-600">
          On iOS, HuanQi uses Sign in with Apple. Email OTP is for web beta.
        </p>
      )}
    </div>
  );
}
