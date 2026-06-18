import { NextRequest } from "next/server";
import { requireApiSession } from "@/lib/auth/api-session";
import { jsonError, jsonOk, logRequest } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  logRequest("POST", `/api/matches/${id}/block`);

  const auth = await requireApiSession(request);
  if ("error" in auth) return auth.error;

  const match = await prisma.match.findFirst({
    where: {
      id,
      OR: [{ userAId: auth.session.sub }, { userBId: auth.session.sub }],
    },
  });

  if (!match) return jsonError("Match not found", 404);

  const blockedId =
    match.userAId === auth.session.sub ? match.userBId : match.userAId;

  await prisma.$transaction([
    prisma.block.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: auth.session.sub,
          blockedId,
        },
      },
      create: {
        blockerId: auth.session.sub,
        blockedId,
      },
      update: {},
    }),
    prisma.match.delete({ where: { id: match.id } }),
  ]);

  return jsonOk({ message: "User blocked and match removed" });
}
