import Link from "next/link";
import {
  APP_STORE_SUBTITLE,
  APP_TAGLINE,
  SENSATION_MIN_WORDS,
  SENSATION_MAX_WORDS,
} from "@huanqi/shared";
import { getSession } from "@/lib/auth/session";

export default async function Home() {
  const session = await getSession();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-6 pb-20 pt-10">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-stone-700 px-3 py-1 text-xs text-stone-400">
            Web beta · English
          </span>
          {session && (
            <span className="rounded-full border border-violet-900/50 bg-violet-950/30 px-3 py-1 text-xs text-violet-300">
              Signed in
            </span>
          )}
        </div>
        <p className="text-sm text-violet-300/90">{APP_STORE_SUBTITLE}</p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {APP_TAGLINE}
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-stone-400">
          HuanQi matches surreal bodily and perceptual experiences using semantic
          similarity — not tags, photos, or profiles. No in-app chat. After a
          mutual match, unlock and share your login email to connect off-platform.
        </p>
      </section>

      {session ? (
        <section className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/write"
            className="rounded-xl border border-violet-800/50 bg-violet-950/20 px-5 py-4 text-sm font-medium text-violet-100 hover:bg-violet-950/40"
          >
            Write a sensation →
          </Link>
          <Link
            href="/matches"
            className="rounded-xl border border-stone-800 px-5 py-4 text-sm font-medium text-stone-200 hover:bg-stone-900/60"
          >
            View matches →
          </Link>
          <Link
            href="/library"
            className="rounded-xl border border-stone-800 px-5 py-4 text-sm font-medium text-stone-200 hover:bg-stone-900/60"
          >
            My sensations →
          </Link>
          <Link
            href="/settings"
            className="rounded-xl border border-stone-800 px-5 py-4 text-sm font-medium text-stone-400 hover:bg-stone-900/60"
          >
            Settings →
          </Link>
        </section>
      ) : (
        <Link
          href="/login"
          className="inline-flex w-fit rounded-lg bg-violet-600 px-5 py-2.5 font-medium text-white hover:bg-violet-500"
        >
          Sign in to start
        </Link>
      )}

      <section className="grid gap-4 rounded-2xl border border-stone-800 bg-stone-900/50 p-6 sm:grid-cols-3">
        <div>
          <p className="text-2xl font-semibold">
            {SENSATION_MIN_WORDS}–{SENSATION_MAX_WORDS}
          </p>
          <p className="mt-1 text-sm text-stone-400">words per sensation</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">72%</p>
          <p className="mt-1 text-sm text-stone-400">mutual similarity threshold</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">0</p>
          <p className="mt-1 text-sm text-stone-400">in-app messaging</p>
        </div>
      </section>

      <section className="flex flex-wrap gap-4 text-sm text-stone-500">
        <Link href="/privacy" className="text-stone-300 underline-offset-4 hover:underline">
          Privacy Policy
        </Link>
        <Link href="/terms" className="text-stone-300 underline-offset-4 hover:underline">
          Terms of Service
        </Link>
      </section>
    </main>
  );
}
