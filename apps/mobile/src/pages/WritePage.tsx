import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SENSATION_MAX_WORDS, SENSATION_MIN_WORDS } from "@huanqi/shared";
import { apiRequest } from "../api/client";
import {
  clearSensationDraft,
  loadSensationDraft,
  saveSensationDraft,
} from "../lib/draft-storage";

type PublishQuota = {
  publishedToday: number;
  limit: number;
  remaining: number | null;
  unlimited: boolean;
};

export function WritePage() {
  const navigate = useNavigate();
  const [body, setBody] = useState("");
  const [quota, setQuota] = useState<PublishQuota | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setBody(loadSensationDraft());
    void apiRequest<{ ok: true; data: { quota: PublishQuota } }>("/api/sensations", {}, true).then(
      (json) => setQuota(json.data.quota),
    );
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => saveSensationDraft(body), 400);
    return () => window.clearTimeout(timer);
  }, [body]);

  const wordCount = useMemo(
    () => body.trim().split(/\s+/).filter(Boolean).length,
    [body],
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const json = await apiRequest<{
        ok: true;
        data: { matching?: { matchesCreated?: number; warning?: string } };
      }>(
        "/api/sensations",
        { method: "POST", body: JSON.stringify({ body }) },
        true,
      );
      clearSensationDraft();
      const matches = json.data.matching?.matchesCreated ?? 0;
      setSuccess(
        json.data.matching?.warning ??
          (matches > 0
            ? `Published. ${matches} new match${matches > 1 ? "es" : ""} found.`
            : "Published. No matches yet."),
      );
      window.setTimeout(() => navigate("/matches"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setLoading(false);
    }
  }

  const atDailyLimit = quota !== null && !quota.unlimited && quota.remaining === 0;

  return (
    <div className="app-page-content">
      <h1 className="text-2xl font-semibold">Write your sensation</h1>
      <p className="mt-2 text-sm text-stone-400">
        Describe a surreal bodily or perceptual experience in English.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={14}
          className="w-full resize-y rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 text-stone-100 outline-none ring-violet-400 focus:ring-2"
          placeholder="It felt like my skin remembered a room that no longer exists..."
        />
        <p className="text-sm text-stone-500">
          {wordCount} / {SENSATION_MAX_WORDS} words (min {SENSATION_MIN_WORDS})
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-emerald-400">{success}</p>}
        <button
          type="submit"
          disabled={loading || atDailyLimit}
          className="rounded-lg bg-violet-600 px-5 py-2.5 font-medium text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "Publishing…" : "Publish"}
        </button>
      </form>
    </div>
  );
}
