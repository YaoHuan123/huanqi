"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteAccountButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function deleteAccount() {
    if (!confirm) {
      setConfirm(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/account", { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        alert(json.error ?? "Delete failed");
        setLoading(false);
        setConfirm(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      alert("Network error");
      setLoading(false);
      setConfirm(false);
    }
  }

  return (
    <button
      type="button"
      onClick={deleteAccount}
      disabled={loading}
      className="rounded-lg bg-red-900/80 px-4 py-2 text-sm text-red-100 hover:bg-red-800 disabled:opacity-50"
    >
      {loading ? "Deleting…" : confirm ? "Confirm permanent delete" : "Delete my account"}
    </button>
  );
}
