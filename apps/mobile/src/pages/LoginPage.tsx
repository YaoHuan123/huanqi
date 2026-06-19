import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_NAME, APP_TAGLINE } from "@huanqi/shared";
import { appleLogin } from "../api/client";
import { authTokenStore } from "../lib/authToken";
import { signInWithAppleNative } from "../lib/appleSignIn";
import { IosBanner, IosSection } from "../components/ios/IosChrome";

export function LoginPage() {
  const navigate = useNavigate();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const consentOk = acceptTerms && acceptPrivacy;

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
      if (res.data.token) authTokenStore.set(res.data.token);
      navigate("/write", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apple Sign In failed");
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

            <IosSection header="Sign in">
              <p className="ios-login-hint">
                HuanQi uses Sign in with Apple. You must be 17 or older. This is a semantic
                matching tool — not a chat app.
              </p>
            </IosSection>

            <IosSection header="Legal">
              <label className="ios-toggle-row">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <span>
                  I accept the{" "}
                  <a href="/terms" target="_blank" rel="noreferrer">
                    Terms of Service
                  </a>{" "}
                  (17+)
                </span>
              </label>
              <label className="ios-toggle-row">
                <input
                  type="checkbox"
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                />
                <span>
                  I accept the{" "}
                  <a href="/privacy" target="_blank" rel="noreferrer">
                    Privacy Policy
                  </a>
                </span>
              </label>
            </IosSection>

            <button
              type="button"
              onClick={onAppleSignIn}
              disabled={loading || !consentOk}
              className="ios-btn-apple"
            >
              {loading ? "Please wait…" : "Continue with Apple"}
            </button>

            <p className="ios-login-footnote">
              Your Apple account email may be used when you choose to share contact after a match.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
