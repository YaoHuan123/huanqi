import Link from "next/link";
import {
  APP_STORE_SUBTITLE,
  APP_TAGLINE,
  SENSATION_MIN_WORDS,
  SENSATION_MAX_WORDS,
} from "@huanqi/shared";

export default function Home() {
  return (
    <main className="app-page-content flex flex-col gap-10">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-violet-900/50 bg-violet-950/30 px-3 py-1 text-xs text-violet-300">
            iOS · English
          </span>
        </div>
        <p className="text-sm text-violet-300/90">{APP_STORE_SUBTITLE}</p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {APP_TAGLINE}
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-stone-400">
          HuanQi matches surreal bodily and perceptual experiences using semantic similarity — not
          tags, photos, or profiles. No in-app chat. Other users' sensation text is never shown;
          after a mutual match, unlock contact and optionally share your Apple account email off-platform.
        </p>
      </section>

      <section className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6">
        <h2 className="text-lg font-semibold text-stone-100">Get the app</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-stone-400">
          HuanQi runs on iPhone. Sign in with Apple, publish English sensation records,
          and unlock matches with Apple In-App Purchase.
        </p>
        <p className="mt-4 text-sm text-stone-500">
          App Store link will appear here when the build is live.
        </p>
      </section>

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
