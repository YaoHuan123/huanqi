import { useEffect, useState } from "react";
import { AppPageShell } from "./components/AppPageShell";
import { getAppUrl } from "./lib/appUrl";
import { isNativeApp } from "./lib/platform";

export default function App() {
  const [appUrl] = useState(() => getAppUrl());

  useEffect(() => {
    // When CAPACITOR_SERVER_URL is set, Capacitor loads the web app directly.
    // This redirect covers web preview and native builds without server.url.
    const timer = window.setTimeout(() => {
      window.location.replace(appUrl);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [appUrl]);

  return (
    <AppPageShell>
      <div className="shell-center">
        <h1 className="shell-title">HuanQi</h1>
        <p className="shell-muted">
          {isNativeApp() ? "Opening the app…" : "Redirecting to the web app…"}
        </p>
        <a className="shell-link" href={appUrl}>
          Open manually
        </a>
      </div>
    </AppPageShell>
  );
}
