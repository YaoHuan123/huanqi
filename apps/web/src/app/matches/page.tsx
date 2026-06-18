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
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-semibold">Your matches</h1>
      <p className="mt-2 text-sm text-stone-400">
        Mutual semantic resonance only. HuanQi does not include in-app messaging.
      </p>

      {loading ? (
        <p className="mt-10 text-sm text-stone-500">Loading…</p>
      ) : matches.length === 0 ? (
        <div className="mt-10 rounded-xl border border-stone-800 bg-stone-900/30 p-6 text-sm text-stone-400">
          <p>No matches yet.</p>
          <p className="mt-2">
            <Link href="/write" className="text-violet-300 hover:underline">
              Write a sensation
            </Link>{" "}
            to get started.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {matches.map((match) => (
            <li key={match.id}>
              <Link
                href={`/matches/${match.id}`}
                className="block rounded-xl border border-stone-800 bg-stone-900/40 p-5 transition hover:border-violet-900/60"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-violet-300">
                    {match.similarityPercent}% resonance
                  </span>
                  <span className="text-xs text-stone-500">
                    {match.unlocked ? "Unlocked" : "Preview only"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-stone-300">{match.preview}</p>
                <p className="mt-3 text-xs text-stone-500">
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
