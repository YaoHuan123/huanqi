import { prisma } from "@/lib/prisma";

export async function deleteUserSensation(userId: string, sensationId: string) {
  const sensation = await prisma.sensation.findFirst({
    where: { id: sensationId, userId },
    select: { id: true },
  });

  if (!sensation) return false;

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ sensationAId: sensationId }, { sensationBId: sensationId }],
    },
    select: { id: true },
  });

  const matchIds = matches.map((match) => match.id);

  await prisma.$transaction([
    ...(matchIds.length > 0
      ? [
          prisma.notification.deleteMany({
            where: { matchId: { in: matchIds } },
          }),
        ]
      : []),
    prisma.sensation.delete({ where: { id: sensationId } }),
  ]);

  return true;
}
