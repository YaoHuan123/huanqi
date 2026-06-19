import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { IosBanner, IosNavBar, IosPage, IosSection } from "../components/ios/IosChrome";

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

  if (loading) {
    return (
      <>
        <IosNavBar title="Match" backLabel="Matches" onBack={() => navigate("/matches")} />
        <p className="ios-loading">Loading…</p>
      </>
    );
  }

  if (!match) {
    return (
      <>
        <IosNavBar title="Match" backLabel="Matches" onBack={() => navigate("/matches")} />
        <IosPage>
          <IosBanner tone="error">{error ?? "Not found"}</IosBanner>
        </IosPage>
      </>
    );
  }

  return (
    <>
      <IosNavBar
        title={`${match.similarityPercent}%`}
        backLabel="Matches"
        onBack={() => navigate("/matches")}
      />
      <IosPage>
        {error && <IosBanner tone="error">{error}</IosBanner>}

        <IosSection header="Their sensation">
          <div className="ios-article">{match.otherSensation.body}</div>
        </IosSection>

        {(match.canUnlock || match.canConfirm || match.canShare) && (
          <IosSection header="Actions">
            {match.canUnlock && (
              <button
                type="button"
                onClick={() => runAction(`/api/matches/${id}`)}
                disabled={actionLoading}
                className="ios-row ios-row--brand"
              >
                <span className="ios-row__label">Unlock (free beta)</span>
              </button>
            )}
            {match.canConfirm && (
              <button
                type="button"
                onClick={() => runAction(`/api/matches/${id}/confirm`)}
                disabled={actionLoading}
                className="ios-row ios-row--brand"
              >
                <span className="ios-row__label">Confirm match</span>
              </button>
            )}
            {match.canShare && (
              <button
                type="button"
                onClick={() => runAction(`/api/matches/${id}/share-contact`)}
                disabled={actionLoading}
                className="ios-row ios-row--brand"
              >
                <span className="ios-row__label">Share my email</span>
              </button>
            )}
          </IosSection>
        )}

        {match.my.bothShared && match.otherContact?.email && (
          <IosSection header="Contact">
            <div className="ios-row">
              <span className="ios-row__main">
                <span className="ios-row__label">{match.otherContact.email}</span>
              </span>
            </div>
          </IosSection>
        )}

        {match.waitingForOther && (
          <IosBanner tone="info">Waiting for the other person to share contact.</IosBanner>
        )}

        <IosSection
          header="Manage"
          footer="Removing or blocking cannot be undone for this match."
        >
          <button
            type="button"
            onClick={async () => {
              await runAction(`/api/matches/${id}`, "DELETE");
              navigate("/matches");
            }}
            disabled={actionLoading}
            className="ios-row"
          >
            <span className="ios-row__label">Remove match</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              await runAction(`/api/matches/${id}/block`);
              navigate("/matches");
            }}
            disabled={actionLoading}
            className="ios-row ios-row--destructive"
          >
            <span className="ios-row__label">Block</span>
          </button>
        </IosSection>
      </IosPage>
    </>
  );
}
