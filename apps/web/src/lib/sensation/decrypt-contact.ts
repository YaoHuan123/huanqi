import { decryptContact } from "@/lib/crypto/contact";

export type DecryptedContact = {
  email?: string;
};

export function decryptContactPayload(
  encrypted: string | null | undefined
): DecryptedContact | null {
  if (!encrypted) return null;

  try {
    const json = decryptContact(encrypted);
    const parsed = JSON.parse(json) as DecryptedContact;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.email && typeof parsed.email === "string") {
      return { email: parsed.email };
    }
    return null;
  } catch {
    return null;
  }
}
