import { Resend } from "resend";
import { APP_NAME } from "@huanqi/shared";
import { isEmailOtpDevMode } from "@/lib/email/dev";

export type OtpDeliveryResult =
  | { mode: "email" }
  | { mode: "dev"; code: string; hint: string };

export async function sendOtpEmail(email: string, code: string): Promise<OtpDeliveryResult> {
  if (isEmailOtpDevMode()) {
    console.info(`[dev] OTP for ${email}: ${code}`);
    return {
      mode: "dev",
      code,
      hint: "Email delivery is off in local dev. Use the code shown below.",
    };
  }

  const apiKey = process.env.RESEND_API_KEY!.trim();
  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM ?? `${APP_NAME} <onboarding@resend.dev>`;

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `${APP_NAME} verification code`,
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your ${APP_NAME} verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { mode: "email" };
}
