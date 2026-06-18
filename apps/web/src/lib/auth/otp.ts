import { createHash, randomInt } from "crypto";
import { isEmailOtpDevMode } from "@/lib/email/dev";

const OTP_PEPPER = process.env.SESSION_SECRET ?? "dev-pepper";
const DEV_MOCK_CODE = "123456";

export function generateOtpCode(): string {
  if (isEmailOtpDevMode() && process.env.EMAIL_OTP_DEV_MOCK === "1") {
    return DEV_MOCK_CODE;
  }
  return String(randomInt(100000, 999999));
}

export function hashOtpCode(email: string, code: string): string {
  return createHash("sha256")
    .update(`${email.toLowerCase()}:${code}:${OTP_PEPPER}`)
    .digest("hex");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
