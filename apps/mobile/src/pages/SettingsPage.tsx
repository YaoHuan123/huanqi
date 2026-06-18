import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAccountApi, getMe, logoutApi } from "../api/client";
import { authTokenStore } from "../lib/authToken";
import { getApiBaseUrl } from "../lib/apiBase";

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
    <div className="app-page-content">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-sm text-stone-400">Signed in as {email}</p>
      {memberSince && (
        <p className="mt-1 text-sm text-stone-500">Member since {memberSince}</p>
      )}
      <section className="mt-8 rounded-xl border border-stone-800 bg-stone-900/40 p-5">
        <p className="text-xs uppercase tracking-wider text-stone-500">API server</p>
        <p className="mt-2 font-mono text-sm text-stone-300">{getApiBaseUrl() || "(same origin)"}</p>
      </section>
      <button
        type="button"
        onClick={signOut}
        disabled={loading}
        className="mt-6 rounded-lg border border-stone-700 px-4 py-2 text-sm text-stone-200 disabled:opacity-50"
      >
        Sign out
      </button>
      <button
        type="button"
        onClick={deleteAccount}
        disabled={loading}
        className="mt-8 rounded-lg border border-red-900/50 px-4 py-2 text-sm text-red-400 disabled:opacity-50"
      >
        Delete account
      </button>
    </div>
  );
}
