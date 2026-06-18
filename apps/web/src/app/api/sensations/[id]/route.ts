import { NextRequest } from "next/server";
import { requireApiSession } from "@/lib/auth/api-session";
import { jsonError, jsonOk, logRequest } from "@/lib/api/response";
import { deleteUserSensation } from "@/lib/sensation/delete";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  logRequest("DELETE", `/api/sensations/${id}`);

  const auth = await requireApiSession(request);
  if ("error" in auth) return auth.error;

  const deleted = await deleteUserSensation(auth.session.sub, id);
  if (!deleted) {
    return jsonError("Sensation not found", 404);
  }

  return jsonOk({ message: "Sensation deleted. Related matches were removed." });
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  logRequest("GET", `/api/sensations/${id}`);

  const auth = await requireApiSession(request);
  if ("error" in auth) return auth.error;

  const sensation = await prisma.sensation.findFirst({
    where: { id, userId: auth.session.sub },
    select: {
      id: true,
      body: true,
      wordCount: true,
      createdAt: true,
      moderatedOk: true,
    },
  });

  if (!sensation) return jsonError("Sensation not found", 404);

  return jsonOk({ sensation });
}
