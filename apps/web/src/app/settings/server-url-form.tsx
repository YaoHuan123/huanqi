"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  buildServerRedirectUrl,
  getDefaultServerUrl,
  getStoredServerUrl,
  normalizeServerUrl,
  setStoredServerUrl,
} from "@/lib/server-url";

export function ServerUrlForm() {
  const [currentOrigin, setCurrentOrigin] = useState("");
  const [input, setInput] = useState("");
  const [stored, setStored] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentOrigin(window.location.origin);
    void getStoredServerUrl().then((url) => {
      setStored(url);
      if (url) setInput(url);
    });
  }, []);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const normalized = normalizeServerUrl(input);
    if (!normalized) {
      setError("Enter a valid server URL, e.g. http://192.168.1.100:3001");
      return;
    }

    setLoading(true);
    try {
      await setStoredServerUrl(normalized);

      if (normalized === window.location.origin) {
        setStored(normalized);
        setMessage("Server address saved. You are already on this server.");
        return;
      }

      window.location.href = buildServerRedirectUrl(normalized, "/settings");
    } catch {
      setError("Failed to save server address");
      setLoading(false);
    }
  }

  async function onReset() {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await setStoredServerUrl(null);
      const fallback = normalizeServerUrl(getDefaultServerUrl()) ?? getDefaultServerUrl();

      if (fallback === window.location.origin) {
        setStored(null);
        setInput(fallback);
        setMessage("Reset to default server.");
        setLoading(false);
        return;
      }

      window.location.href = buildServerRedirectUrl(fallback, "/settings");
    } catch {
      setError("Failed to reset server address");
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 space-y-4 rounded-xl border border-stone-800 bg-stone-900/40 p-5">
      <div>
        <p className="text-xs uppercase tracking-wider text-stone-500">Server</p>
        <p className="mt-1 text-sm text-stone-400">
          Point the app at your HuanQi backend. Useful for iOS device testing on the same Wi‑Fi.
        </p>
      </div>

      <p className="text-sm text-stone-500">
        Connected to:{" "}
        <span className="font-mono text-stone-300">{currentOrigin || "…"}</span>
      </p>
      {stored && stored !== currentOrigin && (
        <p className="text-xs text-amber-300/90">
          Saved server differs from current — reload may redirect automatically on launch.
        </p>
      )}

      <form onSubmit={onSave} className="space-y-3">
        <label className="block space-y-2">
          <span className="text-sm text-stone-400">Server URL</span>
          <input
            type="url"
            inputMode="url"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="http://192.168.1.100:3001"
            className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 font-mono text-sm text-stone-100 outline-none ring-violet-400 focus:ring-2"
          />
        </label>
        <p className="text-xs text-stone-500">
          Default: {getDefaultServerUrl()}. No path — host and port only.
        </p>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {message && <p className="text-sm text-emerald-400">{message}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save & reconnect"}
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            className="rounded-lg border border-stone-700 px-4 py-2 text-sm text-stone-300 hover:bg-stone-800 disabled:opacity-50"
          >
            Reset to default
          </button>
        </div>
      </form>
    </section>
  );
}
