"use client";

import { useEffect } from "react";

export function NativeShell() {
  useEffect(() => {
    void (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) return;

      document.documentElement.classList.remove("app-web-shell");
      document.documentElement.classList.add("app-native");

      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#0c0a09" });
      } catch {
        // Status bar plugin optional during web-only dev
      }
    })();
  }, []);

  return null;
}
