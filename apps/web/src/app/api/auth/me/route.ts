import { clearSession, getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/user/repository";
import { jsonError, jsonOk, logRequest } from "@/lib/api/response";

export async function GET() {
  logRequest("GET", "/api/auth/me");

  const session = await getSession();
  if (!session) {
    return jsonError("Not authenticated", 401);
  }

  const user = await getUserById(session.sub);
  if (!user) {
    return jsonError("User not found", 404);
  }

  return jsonOk({ user });
}
