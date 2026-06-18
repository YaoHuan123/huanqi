import { z } from "zod";

export const publishSensationSchema = z.object({
  body: z.string().min(1),
});
