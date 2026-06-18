import Link from "next/link";
import { APP_NAME } from "@huanqi/shared";

export const metadata = {
  title: `Terms of Service · ${APP_NAME}`,
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-16 prose prose-invert prose-stone">
      <Link href="/" className="text-sm text-stone-400 no-underline hover:text-stone-200">
        ← Back
      </Link>
      <h1>Terms of Service</h1>
      <p className="lead">
        By using {APP_NAME}, you agree that the service only computes text
        similarity. You must be 17 or older.
      </p>
      <h2>Off-platform contact</h2>
      <p>
        Any communication outside {APP_NAME} is solely between users. We are
        not responsible for harassment, fraud, or disputes off the platform.
      </p>
      <h2>Content rules</h2>
      <p>
        Sensation records must be in English for V1. Prohibited content includes
        self-harm, extremism, sexual content, occult recruitment, and graphic
        violence.
      </p>
      <p className="text-sm text-stone-500">
        Placeholder for legal review before App Store submission.
      </p>
    </article>
  );
}
