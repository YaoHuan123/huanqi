import { createHash } from "crypto";
import {
  DAILY_MATCH_VIEW_LIMIT,
  DAILY_SENSATION_LIMIT,
  SENSATION_MAX_WORDS,
  SENSATION_MIN_WORDS,
} from "@huanqi/shared";

export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function hashSensationBody(body: string): string {
  const normalized = body.trim().toLowerCase().replace(/\s+/g, " ");
  return createHash("sha256").update(normalized).digest("hex");
}

export function validateWordCount(body: string): { ok: true } | { ok: false; message: string } {
  const count = countWords(body);
  if (count < SENSATION_MIN_WORDS) {
    return { ok: false, message: `Write at least ${SENSATION_MIN_WORDS} words.` };
  }
  if (count > SENSATION_MAX_WORDS) {
    return { ok: false, message: `Maximum ${SENSATION_MAX_WORDS} words.` };
  }
  return { ok: true };
}

/** Lightweight English heuristic for V1. */
export function isLikelyEnglish(text: string): boolean {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  const latinWords = words.filter((word) => /^[a-zA-Z][a-zA-Z'-]*$/.test(word));
  return latinWords.length / words.length >= 0.85;
}

export function excerpt(text: string, maxLength = 160): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trim()}…`;
}

export { DAILY_MATCH_VIEW_LIMIT, DAILY_SENSATION_LIMIT };
