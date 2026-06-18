import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-sm text-stone-500">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
