/** Web app URL loaded inside the native shell (Next.js). */
const APP_URL = (import.meta.env.VITE_APP_URL ?? "http://localhost:3001").replace(/\/$/, "");

export function getAppUrl(): string {
  return APP_URL;
}

export function resolveAppPath(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`App path must start with /: ${path}`);
  }
  return `${APP_URL}${path}`;
}
