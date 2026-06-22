import { NextRequest } from "next/server";
import { requireApiSession } from "@/lib/auth/api-session";
import { jsonOk, logRequest } from "@/lib/api/response";
import { getMatchSide, isContactShared, isUnlocked, otherSide } from "@/lib/match/state";
import { prisma } from "@/lib/prisma";

function matchStatus(
  match: {
    userAUnlockAt: Date | null;
    userBUnlockAt: Date | null;
    userAContactSharedAt: Date | null;
    userBContactSharedAt: Date | null;
  },
  side: "A" | "B",
): "locked" | "unlocked" | "waiting" | "contact_exchanged" {
  const unlocked = isUnlocked(match, side);
  if (!unlocked) return "locked";

  const shared = isContactShared(match, side);
  const otherShared = isContactShared(match, otherSide(side));
  if (shared && otherShared) return "contact_exchanged";
  if (shared) return "waiting";
  return "unlocked";
}

export async function GET(request: NextRequest) {
  logRequest("GET", "/api/matches");

  const auth = await requireApiSession(request);
  if ("error" in auth) return auth.error;

  const userId = auth.session.sub;

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    orderBy: { createdAt: "desc" },
  });

  return jsonOk({
    matches: matches.map((match) => {
      const side = getMatchSide(match, userId)!;

      return {
        id: match.id,
        similarityScore: match.similarityScore,
        similarityPercent: Math.round(match.similarityScore * 100),
        status: matchStatus(match, side),
        createdAt: match.createdAt,
      };
    }),
  });
}
