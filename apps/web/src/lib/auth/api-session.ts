import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function requireApiSession(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return { error: NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 }) };
  }
  return { session };
}
