import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

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
    <div className="app-page-content">
      <h1 className="text-2xl font-semibold">My sensations</h1>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {loading ? (
        <p className="mt-10 text-sm text-stone-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-10 text-sm text-stone-400">
          Nothing yet. <Link to="/write" className="text-violet-300">Write one</Link>
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-stone-800 bg-stone-900/40 p-5">
              <p className="whitespace-pre-wrap text-sm text-stone-200">{item.body.slice(0, 280)}</p>
              <div className="mt-3 flex justify-between gap-3">
                <p className="text-xs text-stone-500">
                  {item.wordCount} words · {new Date(item.createdAt).toLocaleDateString("en-US")}
                </p>
                <button
                  type="button"
                  onClick={() => deleteSensation(item.id)}
                  className="text-xs text-red-400"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
