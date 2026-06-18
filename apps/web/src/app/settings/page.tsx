import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/user/repository";
import { DeleteAccountButton } from "./delete-account-button";
import { SignOutButton } from "./sign-out-button";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const user = await getUserById(session.sub);
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-16">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-300">
        ← Home
      </Link>

      <h1 className="mt-8 text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-sm text-stone-400">Signed in as {user.email}</p>

      <section className="mt-10 space-y-3 rounded-xl border border-stone-800 bg-stone-900/40 p-5">
        <p className="text-xs uppercase tracking-wider text-stone-500">Contact method</p>
        <p className="text-sm text-stone-300">{user.email}</p>
        <p className="text-sm text-stone-500">
          HuanQi only uses your login email. After you unlock and confirm a match, you can choose
          to share this email in that match.
        </p>
      </section>

      <section className="mt-6 space-y-4 rounded-xl border border-stone-800 bg-stone-900/40 p-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-stone-500">Account</p>
          <p className="mt-1 text-sm text-stone-300">
            Member since {user.createdAt.toLocaleDateString("en-US")}
          </p>
        </div>
        <SignOutButton />
      </section>

      <section className="mt-6 space-y-3 rounded-xl border border-red-900/30 bg-red-950/10 p-5">
        <p className="text-sm font-medium text-red-200">Delete account</p>
        <p className="text-sm text-stone-400">
          Permanently removes your sensations, matches, and contact data. This cannot be undone.
        </p>
        <DeleteAccountButton />
      </section>
    </div>
  );
}
