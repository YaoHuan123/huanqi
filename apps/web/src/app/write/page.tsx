"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { SENSATION_MAX_WORDS, SENSATION_MIN_WORDS } from "@huanqi/shared";
import {
  clearSensationDraft,
  loadSensationDraft,
  saveSensationDraft,
} from "@/lib/sensation/draft-storage";

type PublishQuota = {
  publishedToday: number;
  limit: number;
  remaining: number | null;
  unlimited: boolean;
};

export default function WritePage() {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [draftRestored, setDraftRestored] = useState(false);
  const [quota, setQuota] = useState<PublishQuota | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const draft = loadSensationDraft();
    if (draft) {
      setBody(draft);
      setDraftRestored(true);
    }

    fetch("/api/sensations")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.data?.quota) {
          setQuota(json.data.quota);
        }
      });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => saveSensationDraft(body), 400);
    return () => window.clearTimeout(timer);
  }, [body]);

  const wordCount = useMemo(
    () => body.trim().split(/\s+/).filter(Boolean).length,
    [body]
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/sensations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Publish failed");
        return;
      }

      clearSensationDraft();
      setDraftRestored(false);
      setQuota((prev) =>
        prev && !prev.unlimited && prev.remaining !== null
          ? { ...prev, publishedToday: prev.publishedToday + 1, remaining: prev.remaining - 1 }
          : prev
      );

      const matches = json.data.matching?.matchesCreated ?? 0;
      const warning = json.data.matching?.warning;
      setSuccess(
        warning ??
          (matches > 0
            ? `Published. ${matches} new match${matches > 1 ? "es" : ""} found.`
            : "Published. No matches yet — check back as more people join.")
      );
      setTimeout(() => router.push("/matches"), 1200);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const atDailyLimit = quota !== null && !quota.unlimited && quota.remaining === 0;

  return (
    <div className="app-page-content">
      <h1 className="shell-page-title">Write your sensation</h1>
      <p className="shell-page-desc">
        Describe a surreal bodily or perceptual experience in your own words. English only.
        Contact details live in Settings. After unlock and confirm, you share your login email only.
        {quota && !quota.unlimited && (
          <>
            {" "}
            You can publish up to {quota.limit} sensations per day
            {quota.remaining !== null && ` (${quota.remaining} left today)`}.
          </>
        )}
      </p>

      {atDailyLimit && (
        <p className="mt-4 rounded-lg border border-amber-900/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
          You have reached today&apos;s publish limit. Come back tomorrow to share another sensation.
        </p>
      )}

      <form onSubmit={onSubmit} className="shell-stack-lg">
        <label className="block space-y-2">
          <div className="shell-field-label">
            <span>Sensation record</span>
            <span
              className={
                wordCount < SENSATION_MIN_WORDS || wordCount > SENSATION_MAX_WORDS
                  ? "shell-word-count--warn"
                  : "shell-word-count--ok"
              }
            >
              {wordCount} / {SENSATION_MAX_WORDS} words (min {SENSATION_MIN_WORDS})
            </span>
          </div>
          {draftRestored && body.trim() && (
            <p className="text-xs text-stone-500">Draft restored — your last edit was saved locally.</p>
          )}
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className="shell-textarea"
            placeholder="It felt like my skin remembered a room that no longer exists..."
          />
        </label>

        {error && <p className="shell-status-error">{error}</p>}
        {success && <p className="shell-status-success">{success}</p>}

        <button type="submit" disabled={loading || atDailyLimit} className="shell-btn-primary">
          {loading ? "Publishing…" : "Publish to the resonance pool"}
        </button>
      </form>
    </div>
  );
}
