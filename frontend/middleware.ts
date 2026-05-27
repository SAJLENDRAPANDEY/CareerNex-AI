import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

const protectedRoutes = ["/dashboard", "/coach", "/resume", "/skills", "/roadmaps", "/progress", "/community", "/profile", "/settings"];
const authRoutes = ["/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isAuthRoute = authRoutes.includes(pathname);

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/coach/:path*", "/resume/:path*", "/skills/:path*", "/roadmaps/:path*", "/progress/:path*", "/community/:path*", "/profile/:path*", "/settings/:path*", "/login", "/register", "/forgot-password"],
};
