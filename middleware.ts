import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protects /app/* routes that require authentication
export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!token) {
    const loginUrl = new URL("/app/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/dashboard/:path*",
    "/app/onboarding/:path*",
    "/app/caii/:path*",
    "/app/roadmap/:path*",
    "/app/coach/:path*",
    "/app/wins/:path*",
    "/app/book/:path*",
    "/app/bridge/:path*",
  ],
};
