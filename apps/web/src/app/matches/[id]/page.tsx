"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/matches/${params.id}`);
    const json = await res.json();
    if (!json.ok) {
      setError(json.error ?? "Failed to load match");
      return;
    }
    setMatch(json.data.match);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [params.id]);

  async function unlock() {
    setActionLoading(true);
    setError(null);
    const res = await fetch(`/api/matches/${params.id}`, { method: "POST" });
    const json = await res.json();
    setActionLoading(false);
    if (!json.ok) {
      setError(json.error ?? "Unlock failed");
      return;
    }
    await load();
  }

  async function confirmMatch() {
    setActionLoading(true);
    setError(null);
    const res = await fetch(`/api/matches/${params.id}/confirm`, { method: "POST" });
    const json = await res.json();
    setActionLoading(false);
    if (!json.ok) {
      setError(json.error ?? "Confirm failed");
      return;
    }
    await load();
  }

  async function shareContact() {
    setActionLoading(true);
    setError(null);
    const res = await fetch(`/api/matches/${params.id}/share-contact`, { method: "POST" });
    const json = await res.json();
    setActionLoading(false);
    if (!json.ok) {
      setError(json.error ?? "Share failed");
      return;
    }
    await load();
  }

  async function removeMatch() {
    if (!confirm("Remove this match from your list? The other person can still see it.")) return;
    setActionLoading(true);
    const res = await fetch(`/api/matches/${params.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.ok) {
      setError(json.error ?? "Remove failed");
      setActionLoading(false);
      return;
    }
    router.push("/matches");
  }

  async function blockUser() {
    if (!confirm("Block this user permanently? The match will be removed.")) return;
    setActionLoading(true);
    const res = await fetch(`/api/matches/${params.id}/block`, { method: "POST" });
    const json = await res.json();
    if (!json.ok) {
      setError(json.error ?? "Block failed");
      setActionLoading(false);
      return;
    }
    router.push("/matches");
  }

  if (loading) {
    return <p className="app-page-content text-sm text-stone-500">Loading…</p>;
  }

  if (!match) {
    return (
      <div className="app-page-content">
        <p className="text-sm text-red-400">{error ?? "Match not found"}</p>
        <Link href="/matches" className="mt-4 inline-block text-sm text-violet-300">
          ← Back to matches
        </Link>
      </div>
    );
  }

  return (
    <div className="app-page-content">
      <Link href="/matches" className="text-sm text-stone-500 hover:text-stone-300">
        ← Back to matches
      </Link>

      <div className="mt-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{match.similarityPercent}% resonance</h1>
        <span className="text-xs text-stone-500">
          {!match.my.unlocked ? "Locked" : match.my.bothShared ? "Email exchanged" : "Unlocked"}
        </span>
      </div>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone-500">
          Their sensation
        </h2>
        <article className="rounded-xl border border-stone-800 bg-stone-900/40 p-5 text-sm leading-relaxed text-stone-200 whitespace-pre-wrap">
          {match.otherSensation.body}
        </article>
        {!match.otherSensation.full && (
          <p className="text-xs text-stone-500">Pay to unlock to read the full sensation.</p>
        )}
      </section>

      {match.my.unlocked && (
        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-stone-500">
            Your sensation in this match
          </h2>
          <article className="rounded-xl border border-stone-800 bg-stone-900/20 p-5 text-sm leading-relaxed text-stone-400 whitespace-pre-wrap">
            {match.selfSensation.body}
          </article>
        </section>
      )}

      {match.canUnlock && (
        <div className="mt-8 space-y-3 rounded-xl border border-violet-900/40 bg-violet-950/20 p-5">
          <p className="text-sm text-violet-100">
            Unlock to read their full sensation and decide if this match is right for you.
          </p>
          <button
            type="button"
            onClick={unlock}
            disabled={actionLoading}
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {actionLoading ? "Processing…" : "Pay to unlock (free web beta)"}
          </button>
        </div>
      )}

      {match.canConfirm && (
        <div className="mt-8 space-y-4 rounded-xl border border-stone-800 bg-stone-900/40 p-5">
          <p className="text-sm text-stone-200">Is this the resonance you were looking for?</p>
          <button
            type="button"
            onClick={confirmMatch}
            disabled={actionLoading}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            Yes, this is my match
          </button>
        </div>
      )}

      {match.canShare && (
        <div className="mt-8 space-y-4 rounded-xl border border-stone-800 bg-stone-900/40 p-5">
          <p className="text-sm text-stone-300">
            Share your login email with this match only. The other person must share theirs before
            you can see it.
          </p>
          <p className="rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 font-mono text-sm text-stone-200">
            {match.loginEmail}
          </p>
          <button
            type="button"
            onClick={shareContact}
            disabled={actionLoading}
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {actionLoading ? "Sharing…" : "Share my login email in this match"}
          </button>
        </div>
      )}

      {match.waitingForOther && (
        <p className="mt-8 text-sm text-amber-200/90">
          You shared your email. Waiting for the other person to share theirs.
        </p>
      )}

      {match.my.bothShared && match.otherContact?.email && (
        <section className="mt-8 rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5">
          <h2 className="text-sm font-medium text-emerald-200">Their email</h2>
          <p className="mt-3 font-mono text-sm text-emerald-100">{match.otherContact.email}</p>
        </section>
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={removeMatch}
          disabled={actionLoading}
          className="text-sm text-stone-500 hover:text-stone-300 disabled:opacity-50"
        >
          Remove match
        </button>
        <button
          type="button"
          onClick={blockUser}
          disabled={actionLoading}
          className="text-sm text-stone-500 hover:text-red-300 disabled:opacity-50"
        >
          Block this user
        </button>
      </div>
    </div>
  );
}
