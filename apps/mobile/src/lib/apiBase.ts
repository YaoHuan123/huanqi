const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export function resolveApiUrl(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`API path must start with /: ${path}`);
  }
  return API_BASE ? `${API_BASE}${path}` : path;
}

export function getApiBaseUrl(): string {
  return API_BASE;
}
