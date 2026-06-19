import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAccountApi, getMe, logoutApi } from "../api/client";
import { authTokenStore } from "../lib/authToken";
import { getApiBaseUrl } from "../lib/apiBase";
import { IosLargeTitle, IosPage, IosSection } from "../components/ios/IosChrome";

export function SettingsPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void getMe().then((res) => {
      setEmail(res.data.user.email);
      if (res.data.user.createdAt) {
        setMemberSince(new Date(res.data.user.createdAt).toLocaleDateString("en-US"));
      }
    });
  }, []);

  async function signOut() {
    setLoading(true);
    await logoutApi();
    authTokenStore.clear();
    navigate("/login", { replace: true });
  }

  async function deleteAccount() {
    if (!confirm("Permanently delete your account?")) return;
    setLoading(true);
    await deleteAccountApi();
    navigate("/login", { replace: true });
  }

  return (
    <IosPage>
      <IosLargeTitle title="Me" subtitle="Account and preferences." />

      <IosSection header="Profile">
        <div className="ios-row">
          <span className="ios-row__main">
            <span className="ios-row__label">Email</span>
            <span className="ios-row__detail">{email || "…"}</span>
          </span>
        </div>
        {memberSince && (
          <div className="ios-row">
            <span className="ios-row__main">
              <span className="ios-row__label">Member since</span>
              <span className="ios-row__detail">{memberSince}</span>
            </span>
          </div>
        )}
      </IosSection>

      <IosSection
        header="Developer"
        footer="API endpoint used by this app build."
      >
        <div className="ios-row">
          <span className="ios-row__main">
            <span className="ios-row__label">Server</span>
            <span className="ios-row__detail" style={{ fontFamily: "ui-monospace, monospace" }}>
              {getApiBaseUrl() || "Same origin"}
            </span>
          </span>
        </div>
      </IosSection>

      <IosSection>
        <button
          type="button"
          onClick={signOut}
          disabled={loading}
          className="ios-row ios-row--brand"
        >
          <span className="ios-row__label">Sign out</span>
        </button>
      </IosSection>

      <IosSection
        header="Danger zone"
        footer="Permanently removes your sensations, matches, and contact data."
      >
        <button
          type="button"
          onClick={deleteAccount}
          disabled={loading}
          className="ios-row ios-row--destructive"
        >
          <span className="ios-row__label">Delete account</span>
        </button>
      </IosSection>
    </IosPage>
  );
}
