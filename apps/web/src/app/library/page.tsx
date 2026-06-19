"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type MySensation = {
  id: string;
  body: string;
  wordCount: number;
  createdAt: string;
};

function excerpt(text: string, maxLength = 280) {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trim()}…`;
}

export default function LibraryPage() {
  const [items, setItems] = useState<MySensation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sensations", { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) setItems(json.data.sensations ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function deleteSensation(id: string) {
    if (
      !confirm(
        "Delete this sensation? Related matches will be removed and you can publish again."
      )
    ) {
      return;
    }

    setDeletingId(id);
    setError(null);

    const res = await fetch(`/api/sensations/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const json = await res.json();
    setDeletingId(null);

    if (!json.ok) {
      setError(json.error ?? "Delete failed");
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="app-page-content">
      <h1 className="shell-page-title">My sensations</h1>
      <p className="shell-page-desc">
        Your published sensations. Delete any entry to remove it from matching.
      </p>

      {error && <p className="shell-status-error mt-4">{error}</p>}

      {loading ? (
        <p className="mt-10 text-sm text-stone-500">Loading…</p>
      ) : items.length === 0 ? (
        <div className="shell-empty-state">
          <p>You have not published anything yet.</p>
          <p className="mt-2">
            <Link href="/write" className="shell-link">
              Write a sensation
            </Link>
          </p>
        </div>
      ) : (
        <ul className="shell-list">
          {items.map((item) => (
            <li key={item.id} className="shell-card">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-200">
                {excerpt(item.body, 280)}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="shell-match-meta">
                  {item.wordCount} words · {new Date(item.createdAt).toLocaleDateString("en-US")}
                </p>
                <button
                  type="button"
                  onClick={() => deleteSensation(item.id)}
                  disabled={deletingId === item.id}
                  className="rounded-md border border-red-900/50 px-3 py-1 text-xs text-red-400 hover:bg-red-950/30 disabled:opacity-50"
                >
                  {deletingId === item.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
