import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { APP_NAME } from "@huanqi/shared";

const links = [
  { href: "/write", label: "Write" },
  { href: "/library", label: "My sensations" },
  { href: "/matches", label: "Matches" },
  { href: "/settings", label: "Settings" },
];

export async function AppNav() {
  const session = await getSession();

  return (
    <header className="border-b border-stone-800/80 bg-stone-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-medium tracking-[0.18em] uppercase text-stone-300">
          {APP_NAME}
        </Link>

        {session ? (
          <nav className="flex flex-wrap items-center gap-4 text-sm text-stone-400">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-violet-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : (
          <Link href="/login" className="text-sm text-violet-300 hover:text-violet-200">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
