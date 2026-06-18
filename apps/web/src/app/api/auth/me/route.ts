import { NextRequest } from "next/server";
import { clearSession, getSessionFromRequest } from "@/lib/auth/session";
import { getUserById } from "@/lib/user/repository";
import { jsonError, jsonOk, logRequest } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  logRequest("GET", "/api/auth/me");

  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonError("Not authenticated", 401);
  }

  const user = await getUserById(session.sub);
  if (!user) {
    return jsonError("User not found", 404);
  }

  return jsonOk({ user });
}

export async function DELETE() {
  await clearSession();
  return jsonOk({ ok: true });
}
