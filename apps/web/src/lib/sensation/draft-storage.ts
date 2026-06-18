const DRAFT_STORAGE_KEY = "huanqi:sensation-draft:v1";

export function loadSensationDraft(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(DRAFT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveSensationDraft(body: string): void {
  if (typeof window === "undefined") return;

  try {
    if (!body.trim()) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }
    localStorage.setItem(DRAFT_STORAGE_KEY, body);
  } catch {
    // Ignore quota or privacy-mode errors.
  }
}

export function clearSensationDraft(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
