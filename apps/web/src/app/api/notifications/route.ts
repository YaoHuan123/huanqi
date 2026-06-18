import { NextRequest } from "next/server";
import { requireApiSession } from "@/lib/auth/api-session";
import { jsonOk, logRequest } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  logRequest("GET", "/api/notifications");

  const auth = await requireApiSession(request);
  if ("error" in auth) return auth.error;

  const notifications = await prisma.notification.findMany({
    where: { userId: auth.session.sub },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return jsonOk({ notifications });
}

export async function POST(request: NextRequest) {
  logRequest("POST", "/api/notifications/read-all");

  const auth = await requireApiSession(request);
  if ("error" in auth) return auth.error;

  await prisma.notification.updateMany({
    where: { userId: auth.session.sub, readAt: null },
    data: { readAt: new Date() },
  });

  return jsonOk({ message: "All notifications marked read" });
}
