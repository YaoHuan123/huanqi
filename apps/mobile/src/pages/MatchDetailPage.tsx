import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

type MatchDetail = {
  id: string;
  similarityPercent: number;
  loginEmail: string;
  otherSensation: { body: string; full: boolean };
  selfSensation: { body: string };
  my: {
    unlocked: boolean;
    confirmed: boolean;
    shared: boolean;
    otherShared: boolean;
    bothShared: boolean;
  };
  otherContact: { email?: string } | null;
  canUnlock: boolean;
  canConfirm: boolean;
  canShare: boolean;
  waitingForOther: boolean;
};

export function MatchDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const json = await apiRequest<{ ok: true; data: { match: MatchDetail } }>(
      `/api/matches/${id}`,
      {},
      true,
    );
    setMatch(json.data.match);
  }

  useEffect(() => {
    void load()
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  async function runAction(path: string, method = "POST") {
    setActionLoading(true);
    setError(null);
    try {
      await apiRequest(path, { method }, true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <p className="app-page-content text-sm text-stone-500">Loading…</p>;
  if (!match) {
    return (
      <div className="app-page-content">
        <p className="text-sm text-red-400">{error ?? "Not found"}</p>
        <Link to="/matches" className="mt-4 inline-block text-sm text-violet-300">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="app-page-content">
      <Link to="/matches" className="text-sm text-stone-500">
        ← Back
      </Link>
      <h1 className="mt-6 text-2xl font-semibold">{match.similarityPercent}% resonance</h1>
      <article className="mt-8 rounded-xl border border-stone-800 bg-stone-900/40 p-5 text-sm whitespace-pre-wrap text-stone-200">
        {match.otherSensation.body}
      </article>
      {match.canUnlock && (
        <button
          type="button"
          onClick={() => runAction(`/api/matches/${id}`)}
          disabled={actionLoading}
          className="mt-6 rounded-lg bg-violet-600 px-5 py-2.5 text-sm text-white disabled:opacity-50"
        >
          Unlock (free beta)
        </button>
      )}
      {match.canConfirm && (
        <button
          type="button"
          onClick={() => runAction(`/api/matches/${id}/confirm`)}
          disabled={actionLoading}
          className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Confirm match
        </button>
      )}
      {match.canShare && (
        <button
          type="button"
          onClick={() => runAction(`/api/matches/${id}/share-contact`)}
          disabled={actionLoading}
          className="mt-4 rounded-lg bg-violet-600 px-5 py-2.5 text-sm text-white disabled:opacity-50"
        >
          Share my email
        </button>
      )}
      {match.my.bothShared && match.otherContact?.email && (
        <p className="mt-6 font-mono text-sm text-emerald-300">{match.otherContact.email}</p>
      )}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <div className="mt-10 flex gap-4">
        <button
          type="button"
          onClick={async () => {
            await runAction(`/api/matches/${id}`, "DELETE");
            navigate("/matches");
          }}
          className="text-sm text-stone-500"
        >
          Remove
        </button>
        <button
          type="button"
          onClick={async () => {
            await runAction(`/api/matches/${id}/block`);
            navigate("/matches");
          }}
          className="text-sm text-red-400"
        >
          Block
        </button>
      </div>
    </div>
  );
}
