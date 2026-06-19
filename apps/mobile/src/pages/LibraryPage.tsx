import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { IosBanner, IosEmptyState, IosLargeTitle, IosPage } from "../components/ios/IosChrome";

type MySensation = {
  id: string;
  body: string;
  wordCount: number;
  createdAt: string;
};

export function LibraryPage() {
  const [items, setItems] = useState<MySensation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiRequest<{ ok: true; data: { sensations: MySensation[] } }>(
      "/api/sensations",
      {},
      true,
    )
      .then((json) => setItems(json.data.sensations ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function deleteSensation(id: string) {
    if (!confirm("Delete this sensation?")) return;
    try {
      await apiRequest(`/api/sensations/${id}`, { method: "DELETE" }, true);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <IosPage>
      <IosLargeTitle title="Mine" subtitle="Your published sensations." />

      {error && <IosBanner tone="error">{error}</IosBanner>}

      {loading ? (
        <p className="ios-loading">Loading…</p>
      ) : items.length === 0 ? (
        <IosEmptyState
          title="Nothing here yet"
          body="Write your first sensation to start finding resonance."
          actionLabel="Go to Write"
          actionTo="/write"
        />
      ) : (
        <div className="ios-group" style={{ margin: "8px 16px 0" }}>
          {items.map((item) => (
            <div key={item.id} className="ios-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--ios-body-size)",
                  lineHeight: 1.4,
                  color: "var(--shell-label-1)",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.body}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 10,
                  gap: 12,
                }}
              >
                <span className="ios-meta" style={{ padding: 0 }}>
                  {item.wordCount} words · {new Date(item.createdAt).toLocaleDateString("en-US")}
                </span>
                <button
                  type="button"
                  onClick={() => deleteSensation(item.id)}
                  className="ios-btn-plain"
                  style={{ color: "#ff453a", minHeight: 32, fontSize: "var(--ios-footnote-size)" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </IosPage>
  );
}
