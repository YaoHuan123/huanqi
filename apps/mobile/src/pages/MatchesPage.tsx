import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

type MatchItem = {
  id: string;
  similarityPercent: number;
  preview: string;
  unlocked: boolean;
  createdAt: string;
};

export function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void apiRequest<{ ok: true; data: { matches: MatchItem[] } }>("/api/matches", {}, true)
      .then((json) => setMatches(json.data.matches))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-page-content">
      <h1 className="text-2xl font-semibold">Your matches</h1>
      {loading ? (
        <p className="mt-10 text-sm text-stone-500">Loading…</p>
      ) : matches.length === 0 ? (
        <p className="mt-10 text-sm text-stone-400">
          No matches yet. <Link to="/write" className="text-violet-300">Write a sensation</Link>
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {matches.map((match) => (
            <li key={match.id}>
              <Link
                to={`/matches/${match.id}`}
                className="block rounded-xl border border-stone-800 bg-stone-900/40 p-5"
              >
                <span className="text-sm font-medium text-violet-300">
                  {match.similarityPercent}% resonance
                </span>
                <p className="mt-3 text-sm text-stone-300">{match.preview}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
