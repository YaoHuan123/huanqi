import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export function logRequest(method: string, path: string, meta?: Record<string, unknown>) {
  const entry = {
    ts: new Date().toISOString(),
    method,
    path,
    ...meta,
  };
  console.info(JSON.stringify(entry));
}
