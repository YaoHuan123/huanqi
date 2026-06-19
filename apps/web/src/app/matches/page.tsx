"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type MatchItem = {
  id: string;
  similarityPercent: number;
  preview: string;
  unlocked: boolean;
  createdAt: string;
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) setMatches(json.data.matches);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-page-content">
      <h1 className="shell-page-title">Your matches</h1>
      <p className="shell-page-desc">
        Mutual semantic resonance only. HuanQi does not include in-app messaging.
      </p>

      {loading ? (
        <p className="mt-10 text-sm text-stone-500">Loading…</p>
      ) : matches.length === 0 ? (
        <div className="shell-empty-state">
          <p>No matches yet.</p>
          <p className="mt-2">
            <Link href="/write" className="shell-link">
              Write a sensation
            </Link>{" "}
            to get started.
          </p>
        </div>
      ) : (
        <ul className="shell-list">
          {matches.map((match) => (
            <li key={match.id}>
              <Link href={`/matches/${match.id}`} className="shell-match-card">
                <div className="flex items-center justify-between gap-4">
                  <span className="shell-match-score">{match.similarityPercent}% resonance</span>
                  <span className="shell-match-meta">
                    {match.unlocked ? "Unlocked" : "Preview only"}
                  </span>
                </div>
                <p className="shell-match-preview">{match.preview}</p>
                <p className="shell-match-meta mt-3">
                  {new Date(match.createdAt).toLocaleDateString("en-US")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
