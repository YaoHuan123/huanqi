"use client";

import { useEffect } from "react";
import { getStoredServerUrl, normalizeServerUrl } from "@/lib/server-url";

/** On native / saved URL, redirect to the configured server if needed. */
export function ServerUrlBootstrap() {
  useEffect(() => {
    void (async () => {
      const stored = await getStoredServerUrl();
      if (!stored) return;

      const normalized = normalizeServerUrl(stored);
      if (!normalized || normalized === window.location.origin) return;

      const target =
        normalized +
        window.location.pathname +
        window.location.search +
        window.location.hash;

      window.location.replace(target);
    })();
  }, []);

  return null;
}
