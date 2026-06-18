import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/write", "/matches", "/settings", "/library"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!needsAuth) {
    return NextResponse.next();
  }

  const session = request.cookies.get("huanqi_session");
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/write", "/matches/:path*", "/settings", "/library"],
};
