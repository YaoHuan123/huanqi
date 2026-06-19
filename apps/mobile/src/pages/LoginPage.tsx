import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_NAME, APP_TAGLINE } from "@huanqi/shared";
import { appleLogin, sendEmailCode, verifyEmailCode } from "../api/client";
import { authTokenStore } from "../lib/authToken";
import { signInWithAppleNative } from "../lib/appleSignIn";
import { isIosNative } from "../lib/platform";
import { IosBanner, IosSection } from "../components/ios/IosChrome";

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
    <div className="app-root">
      <div className="app-shell-phone">
        <div className="ios-login">
          <div className="ios-login-hero">
            <h1 className="ios-login-logo">{APP_NAME}</h1>
            <p className="ios-login-tagline">{APP_TAGLINE}</p>
          </div>

          <div className="ios-login-form">
            {error && <IosBanner tone="error">{error}</IosBanner>}
            {info && <IosBanner tone="info">{info}</IosBanner>}

            {isIosNative() && (
              <button
                type="button"
                onClick={onAppleSignIn}
                disabled={loading}
                className="ios-btn-apple"
              >
                Continue with Apple
              </button>
            )}

            {step === "email" ? (
              <form onSubmit={onSendCode}>
                <IosSection header="Email sign in">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    autoComplete="email"
                    className="ios-field"
                  />
                </IosSection>
                <div style={{ marginTop: 20 }}>
                  <button type="submit" disabled={loading} className="ios-btn-filled">
                    Send code
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={onVerifyCode}>
                <IosSection header={`Code sent to ${email}`}>
                  <input
                    inputMode="numeric"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6-digit code"
                    className="ios-field ios-field--code"
                  />
                </IosSection>
                <div style={{ marginTop: 20 }}>
                  <button type="submit" disabled={loading} className="ios-btn-filled">
                    Sign in
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="ios-btn-plain"
                  style={{ width: "100%", marginTop: 8 }}
                >
                  Use a different email
                </button>
              </form>
            )}

            <IosSection header="Legal">
              <label className="ios-toggle-row">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <span>I accept the Terms of Service</span>
              </label>
              <label className="ios-toggle-row">
                <input
                  type="checkbox"
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                />
                <span>I accept the Privacy Policy</span>
              </label>
            </IosSection>
          </div>
        </div>
      </div>
    </div>
  );
}
