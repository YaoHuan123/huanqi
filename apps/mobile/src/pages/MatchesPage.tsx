import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { IosChevron, IosEmptyState, IosLargeTitle, IosPage } from "../components/ios/IosChrome";

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
    <IosPage>
      <IosLargeTitle title="Matches" subtitle="People who resonate with your sensations." />

      {loading ? (
        <p className="ios-loading">Loading…</p>
      ) : matches.length === 0 ? (
        <IosEmptyState
          title="No matches yet"
          body="Publish a sensation and we'll look for resonance."
          actionLabel="Write a sensation"
          actionTo="/write"
        />
      ) : (
        <div className="ios-group" style={{ margin: "8px 16px 0" }}>
          {matches.map((match) => (
            <Link key={match.id} to={`/matches/${match.id}`} className="ios-row ios-row--link">
              <span className="ios-row__main">
                <span className="ios-row__label" style={{ color: "var(--shell-brand)" }}>
                  {match.similarityPercent}% resonance
                </span>
                <span className="ios-row__detail">{match.preview}</span>
              </span>
              <IosChevron />
            </Link>
          ))}
        </div>
      )}
    </IosPage>
  );
}
