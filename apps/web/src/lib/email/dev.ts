/** No Resend key, or explicit mock — OTP shown in UI / console, not emailed. */
export function isEmailOtpDevMode(): boolean {
  if (process.env.EMAIL_OTP_DEV_MOCK === "1") return true;
  if (process.env.RESEND_API_KEY?.trim()) return false;
  return process.env.NODE_ENV === "development";
}
