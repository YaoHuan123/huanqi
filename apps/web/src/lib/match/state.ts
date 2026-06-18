import type { Match } from "@prisma/client";
import { decryptContactPayload } from "@/lib/sensation/decrypt-contact";
import { encryptContact } from "@/lib/crypto/contact";
import { buildSharePayload } from "@/lib/user/contact-profile";

export type MatchSide = "A" | "B";

export function getMatchSide(match: Match, userId: string): MatchSide | null {
  if (match.userAId === userId) return "A";
  if (match.userBId === userId) return "B";
  return null;
}

export function isUnlocked(match: Match, side: MatchSide): boolean {
  return side === "A" ? Boolean(match.userAUnlockAt) : Boolean(match.userBUnlockAt);
}

export function isConfirmed(match: Match, side: MatchSide): boolean {
  return side === "A" ? Boolean(match.userAConfirmedAt) : Boolean(match.userBConfirmedAt);
}

export function isContactShared(match: Match, side: MatchSide): boolean {
  return side === "A" ? Boolean(match.userAContactSharedAt) : Boolean(match.userBContactSharedAt);
}

export function otherSide(side: MatchSide): MatchSide {
  return side === "A" ? "B" : "A";
}

export function unlockField(side: MatchSide): "userAUnlockAt" | "userBUnlockAt" {
  return side === "A" ? "userAUnlockAt" : "userBUnlockAt";
}

export function confirmField(side: MatchSide): "userAConfirmedAt" | "userBConfirmedAt" {
  return side === "A" ? "userAConfirmedAt" : "userBConfirmedAt";
}

export function sharedAtField(side: MatchSide): "userAContactSharedAt" | "userBContactSharedAt" {
  return side === "A" ? "userAContactSharedAt" : "userBContactSharedAt";
}

export function sharedContactField(
  side: MatchSide
): "userASharedContactEncrypted" | "userBSharedContactEncrypted" {
  return side === "A" ? "userASharedContactEncrypted" : "userBSharedContactEncrypted";
}

export function readSharedContact(
  match: Match,
  side: MatchSide
): Record<string, string> | null {
  const encrypted =
    side === "A" ? match.userASharedContactEncrypted : match.userBSharedContactEncrypted;
  const payload = decryptContactPayload(encrypted);
  if (!payload) return null;
  return Object.fromEntries(
    Object.entries(payload).filter((entry): entry is [string, string] => Boolean(entry[1]))
  );
}

export function encryptSharePayload(payload: Record<string, string>): string {
  return encryptContact(JSON.stringify(payload));
}

export function buildEncryptedShareFromEmail(email: string): string {
  return encryptSharePayload(buildSharePayload(email));
}
