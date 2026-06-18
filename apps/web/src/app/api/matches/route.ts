import { requireApiSession } from "@/lib/auth/api-session";
import { jsonOk, logRequest } from "@/lib/api/response";
import { getMatchSide, isUnlocked } from "@/lib/match/state";
import { excerpt } from "@/lib/sensation/text";
import { prisma } from "@/lib/prisma";

export async function GET() {
  logRequest("GET", "/api/matches");

  const auth = await requireApiSession();
  if ("error" in auth) return auth.error;

  const userId = auth.session.sub;

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      sensationA: { select: { id: true, body: true, userId: true } },
      sensationB: { select: { id: true, body: true, userId: true } },
    },
  });

  return jsonOk({
    matches: matches.map((match) => {
      const side = getMatchSide(match, userId)!;
      const isUserA = side === "A";
      const otherSensation = isUserA ? match.sensationB : match.sensationA;
      const unlocked = isUnlocked(match, side);

      return {
        id: match.id,
        similarityScore: match.similarityScore,
        similarityPercent: Math.round(match.similarityScore * 100),
        unlocked,
        createdAt: match.createdAt,
        preview: excerpt(otherSensation.body, unlocked ? 220 : 120),
      };
    }),
  });
}
