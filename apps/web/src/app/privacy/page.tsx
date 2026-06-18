import Link from "next/link";
import { APP_NAME } from "@huanqi/shared";

export const metadata = {
  title: `Privacy Policy · ${APP_NAME}`,
};

export default function PrivacyPage() {
  return (
    <article className="app-page-content prose prose-invert prose-stone prose-sm max-w-none">
      <Link href="/" className="text-sm text-stone-400 no-underline hover:text-stone-200">
        ← Back
      </Link>
      <h1>Privacy Policy</h1>
      <p className="lead">
        {APP_NAME} is a semantic sensation matching tool. This English policy
        applies to the V1 release. Last updated: June 2026.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Apple Sign In identifier and email address</li>
        <li>English sensation text you publish</li>
        <li>Login email address (shared per match only after you choose)</li>
        <li>Purchase receipts via Apple In-App Purchase</li>
      </ul>
      <h2>What we do not do</h2>
      <ul>
        <li>No in-app messaging</li>
        <li>No sale of personal data</li>
      </ul>
      <h2>Your rights</h2>
      <p>
        You may export or permanently delete your account and all associated
        data from Settings in the iOS app.
      </p>
      <p className="text-sm text-stone-500">
        Placeholder for legal review before App Store submission.
      </p>
    </article>
  );
}
