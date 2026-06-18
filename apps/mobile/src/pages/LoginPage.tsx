import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_NAME, APP_TAGLINE } from "@huanqi/shared";
import { appleLogin, sendEmailCode, verifyEmailCode } from "../api/client";
import { authTokenStore } from "../lib/authToken";
import { signInWithAppleNative } from "../lib/appleSignIn";
import { isIosNative } from "../lib/platform";

type Step = "email" | "code";

export function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const consentOk = acceptTerms && acceptPrivacy;

  function finishAuth(token?: string) {
    if (token) authTokenStore.set(token);
    navigate("/write", { replace: true });
  }

  async function onAppleSignIn() {
    if (!consentOk) {
      setError("Accept the Terms and Privacy Policy to continue");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { identityToken } = await signInWithAppleNative();
      const res = await appleLogin(identityToken);
      finishAuth(res.data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apple Sign In failed");
    } finally {
      setLoading(false);
    }
  }

  async function onSendCode(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await sendEmailCode(email);
      setStep("code");
      if (res.data?.devCode) {
        setCode(res.data.devCode);
        setInfo(res.data.devHint ?? "Local dev: use the code below.");
      } else {
        setInfo("Check your email for a 6-digit code.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyCode(event: FormEvent) {
    event.preventDefault();
    if (!consentOk) {
      setError("Accept the Terms and Privacy Policy to continue");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await verifyEmailCode(email, code);
      finishAuth(res.data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell-phone">
      <div className="login-shell">
        <div className="login-hero">
          <h1 className="login-shell-title">{APP_NAME}</h1>
          <p className="mt-2 text-sm text-stone-400">{APP_TAGLINE}</p>
        </div>

        <div className="login-card">
          {isIosNative() && (
            <button
              type="button"
              onClick={onAppleSignIn}
              disabled={loading}
              className="w-full rounded-lg bg-white px-4 py-2.5 font-medium text-black hover:bg-stone-200 disabled:opacity-50"
            >
              Continue with Apple
            </button>
          )}

          {step === "email" ? (
            <form onSubmit={onSendCode} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-stone-100 outline-none ring-violet-400 focus:ring-2"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-violet-600 px-4 py-2.5 font-medium text-white hover:bg-violet-500 disabled:opacity-50"
              >
                Send code
              </button>
            </form>
          ) : (
            <form onSubmit={onVerifyCode} className="space-y-3">
              <input
                inputMode="numeric"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 tracking-widest text-stone-100 outline-none ring-violet-400 focus:ring-2"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-violet-600 px-4 py-2.5 font-medium text-white hover:bg-violet-500 disabled:opacity-50"
              >
                Sign in
              </button>
            </form>
          )}

          <label className="flex items-start gap-2 text-xs text-stone-400">
            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
            <span>I accept the Terms of Service</span>
          </label>
          <label className="flex items-start gap-2 text-xs text-stone-400">
            <input type="checkbox" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} />
            <span>I accept the Privacy Policy</span>
          </label>

          {info && <p className="text-sm text-emerald-400">{info}</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
