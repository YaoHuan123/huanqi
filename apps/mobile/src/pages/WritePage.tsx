import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SENSATION_MAX_WORDS, SENSATION_MIN_WORDS } from "@huanqi/shared";
import { apiRequest } from "../api/client";
import { IosBanner, IosLargeTitle, IosPage, IosSection } from "../components/ios/IosChrome";
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

  const wordCountOk = wordCount >= SENSATION_MIN_WORDS && wordCount <= SENSATION_MAX_WORDS;

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

  const quotaHint =
    quota && !quota.unlimited
      ? `Up to ${quota.limit} per day${
          quota.remaining !== null ? ` · ${quota.remaining} left today` : ""
        }.`
      : undefined;

  return (
    <IosPage>
      <IosLargeTitle
        title="Write"
        subtitle="Describe a surreal bodily or perceptual experience in English."
      />

      {atDailyLimit && (
        <IosBanner tone="warning">
          You&apos;ve reached today&apos;s publish limit. Come back tomorrow.
        </IosBanner>
      )}

      {error && <IosBanner tone="error">{error}</IosBanner>}
      {success && <IosBanner tone="success">{success}</IosBanner>}

      <form onSubmit={onSubmit}>
        <IosSection
          header="Sensation"
          footer={`${wordCount} / ${SENSATION_MAX_WORDS} words (min ${SENSATION_MIN_WORDS})${
            quotaHint ? ` · ${quotaHint}` : ""
          }`}
        >
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="ios-field ios-field--textarea"
            placeholder="It felt like my skin remembered a room that no longer exists..."
          />
        </IosSection>

        <div style={{ padding: "0 16px", marginTop: 24 }}>
          <button
            type="submit"
            disabled={loading || atDailyLimit || !wordCountOk}
            className="ios-btn-filled"
          >
            {loading ? "Publishing…" : "Publish"}
          </button>
        </div>
      </form>
    </IosPage>
  );
}
