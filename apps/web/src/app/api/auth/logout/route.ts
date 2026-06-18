import { clearSession } from "@/lib/auth/session";
import { jsonOk, logRequest } from "@/lib/api/response";

export async function POST() {
  logRequest("POST", "/api/auth/logout");
  await clearSession();
  return jsonOk({ message: "Signed out" });
}
