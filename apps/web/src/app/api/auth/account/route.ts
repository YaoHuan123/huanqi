import { NextRequest } from "next/server";
import { clearSession, requireSessionFromRequest } from "@/lib/auth/session";
import { deleteUserAccount } from "@/lib/user/account";
import { jsonError, jsonOk, logRequest } from "@/lib/api/response";

export async function DELETE(request: NextRequest) {
  logRequest("DELETE", "/api/auth/account");

  try {
    const session = await requireSessionFromRequest(request);
    await deleteUserAccount(session.sub);
    await clearSession();
    return jsonOk({ message: "Account permanently deleted" });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return jsonError("Not authenticated", 401);
    }
    console.error(error);
    return jsonError("Failed to delete account", 500);
  }
}
