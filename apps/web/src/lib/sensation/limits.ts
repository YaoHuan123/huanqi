import { prisma } from "@/lib/prisma";
import { DAILY_SENSATION_LIMIT } from "@/lib/sensation/text";

function isWebBetaUnlimitedPublish(): boolean {
  return process.env.WEB_BETA_UNLIMITED_SENSATIONS !== "false";
}

function startOfToday(): Date {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
}

export async function getDailySensationUsage(userId: string) {
  const publishedToday = await prisma.sensation.count({
    where: {
      userId,
      createdAt: { gte: startOfToday() },
    },
  });

  const unlimited = isWebBetaUnlimitedPublish();
  const limit = DAILY_SENSATION_LIMIT;
  const remaining = unlimited ? null : Math.max(0, limit - publishedToday);

  return { publishedToday, limit, remaining, unlimited };
}

export async function assertDailySensationLimit(userId: string) {
  if (isWebBetaUnlimitedPublish()) return;

  const { publishedToday } = await getDailySensationUsage(userId);
  if (publishedToday >= DAILY_SENSATION_LIMIT) {
    throw new Error("DAILY_SENSATION_LIMIT");
  }
}
export async function getActiveSensationForUser(userId: string) {
  return prisma.sensation.findFirst({
    where: { userId, moderatedOk: true },
    orderBy: { createdAt: "desc" },
  });
}
