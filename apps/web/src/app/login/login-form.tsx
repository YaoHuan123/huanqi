"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { APP_NAME, APP_TAGLINE } from "@huanqi/shared";

type Step = "email" | "code";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/write";
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

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-16">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-300">
        ← Back
      </Link>

      <div className="mt-8 space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">{APP_NAME}</p>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-stone-400">{APP_TAGLINE}</p>
      </div>

      <div className="mt-6 rounded-xl border border-amber-900/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-200/90">
        You must be 17 or older. HuanQi is a semantic matching tool — not a chat app.
      </div>

      <form
        className="mt-8 space-y-4"
        onSubmit={step === "email" ? sendCode : verifyCode}
      >
        <label className="block space-y-2">
          <span className="text-sm text-stone-400">Email address</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={step === "code"}
            className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-violet-400 focus:ring-2 disabled:opacity-60"
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
              className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 tracking-widest text-stone-100 outline-none ring-violet-400 focus:ring-2"
              placeholder="000000"
            />
          </label>
        )}

        {step === "code" && (
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
        )}

        {devCode && (
          <div className="rounded-xl border border-violet-800/50 bg-violet-950/30 px-4 py-3 text-center">
            <p className="text-xs text-violet-300/80">Local dev verification code</p>
            <p className="mt-1 font-mono text-2xl tracking-[0.3em] text-violet-100">{devCode}</p>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
        {info && <p className="text-sm text-emerald-400">{info}</p>}

        <button
          type="submit"
          disabled={loading || (step === "code" && !consentOk)}
          className="w-full rounded-lg bg-violet-600 px-4 py-2.5 font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Please wait…" : step === "email" ? "Send verification code" : "Verify and continue"}
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

      <p className="mt-8 text-center text-xs text-stone-600">
        Sign in with Apple will be wired in the iOS app. Web Apple login requires Services ID setup.
      </p>
    </div>
  );
}
