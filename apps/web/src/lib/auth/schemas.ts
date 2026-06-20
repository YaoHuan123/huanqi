import { z } from "zod";

export const consentSchema = z.object({
  acceptTerms: z.boolean().refine((value) => value === true, {
    message: "You must accept the Terms of Service",
  }),
  acceptPrivacy: z.boolean().refine((value) => value === true, {
    message: "You must accept the Privacy Policy",
  }),
});

export const sendCodeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const verifyCodeSchema = consentSchema.extend({
  email: z.string().email("Invalid email address"),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});

export const appleAuthSchema = consentSchema.extend({
  identityToken: z.string().min(1, "Missing Apple identity token"),
});

export const iosUnlockSchema = z.object({
  transactionId: z.string().min(1, "Missing transaction ID"),
  productId: z.string().min(1, "Missing product ID"),
});
