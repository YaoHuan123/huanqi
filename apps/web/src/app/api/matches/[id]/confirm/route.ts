import { NextRequest } from "next/server";
import { requireApiSession } from "@/lib/auth/api-session";
import { jsonError, jsonOk, logRequest } from "@/lib/api/response";
import { confirmField, getMatchSide, isConfirmed, isUnlocked } from "@/lib/match/state";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  logRequest("POST", `/api/matches/${id}/confirm`);

  const auth = await requireApiSession(request);
  if ("error" in auth) return auth.error;

  const match = await prisma.match.findFirst({
    where: {
      id,
      OR: [{ userAId: auth.session.sub }, { userBId: auth.session.sub }],
    },
  });

  if (!match) return jsonError("Match not found", 404);

  const side = getMatchSide(match, auth.session.sub);
  if (!side) return jsonError("Match not found", 404);

  if (!isUnlocked(match, side)) {
    return jsonError("Unlock this match before confirming.", 400);
  }

  if (isConfirmed(match, side)) {
    return jsonOk({ message: "Already confirmed" });
  }

  await prisma.match.update({
    where: { id: match.id },
    data: { [confirmField(side)]: new Date() },
  });

  return jsonOk({ message: "Match confirmed" });
}
