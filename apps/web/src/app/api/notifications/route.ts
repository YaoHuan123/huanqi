import { requireApiSession } from "@/lib/auth/api-session";
import { jsonOk, logRequest } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  logRequest("GET", "/api/notifications");

  const auth = await requireApiSession();
  if ("error" in auth) return auth.error;

  const notifications = await prisma.notification.findMany({
    where: { userId: auth.session.sub },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return jsonOk({ notifications });
}

export async function POST() {
  logRequest("POST", "/api/notifications/read-all");

  const auth = await requireApiSession();
  if ("error" in auth) return auth.error;

  await prisma.notification.updateMany({
    where: { userId: auth.session.sub, readAt: null },
    data: { readAt: new Date() },
  });

  return jsonOk({ message: "All notifications marked read" });
}
