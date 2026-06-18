import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function requireApiSession() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 }) };
  }
  return { session };
}
