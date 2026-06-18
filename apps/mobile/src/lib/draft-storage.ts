const DRAFT_KEY = "huanqi:sensation-draft";

export function loadSensationDraft(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(DRAFT_KEY) ?? "";
}

export function saveSensationDraft(body: string): void {
  if (typeof window === "undefined") return;
  if (!body.trim()) {
    localStorage.removeItem(DRAFT_KEY);
    return;
  }
  localStorage.setItem(DRAFT_KEY, body);
}

export function clearSensationDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}
