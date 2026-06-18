const STORAGE_KEY = "huanqi:server-url";

export function getDefaultServerUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return normalizeServerUrl(fromEnv) ?? fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3001";
}

export function normalizeServerUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const withScheme = trimmed.includes("://") ? trimmed : `http://${trimmed}`;
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.pathname !== "" && url.pathname !== "/") return null;
    if (url.search || url.hash) return null;
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

async function isNativeApp(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const { Capacitor } = await import("@capacitor/core");
  return Capacitor.isNativePlatform();
}

export async function getStoredServerUrl(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (await isNativeApp()) {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    return value ? normalizeServerUrl(value) : null;
  }

  const value = localStorage.getItem(STORAGE_KEY);
  return value ? normalizeServerUrl(value) : null;
}

export async function setStoredServerUrl(url: string | null): Promise<void> {
  if (typeof window === "undefined") return;

  if (await isNativeApp()) {
    const { Preferences } = await import("@capacitor/preferences");
    if (url) {
      await Preferences.set({ key: STORAGE_KEY, value: url });
    } else {
      await Preferences.remove({ key: STORAGE_KEY });
    }
    return;
  }

  if (url) {
    localStorage.setItem(STORAGE_KEY, url);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function buildServerRedirectUrl(serverUrl: string, path = "/settings"): string {
  const base = normalizeServerUrl(serverUrl);
  if (!base) throw new Error("Invalid server URL");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
