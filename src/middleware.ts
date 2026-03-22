import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define sets of protected and auth-only paths
  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/market-analyzer") ||
    pathname.startsWith("/jobs");

  const isAuthPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/verify-otp") ||
    pathname === "/welcome" ||
    pathname === "/";

  // 2. Check for access or refresh tokens in cookies
  const hasAccessToken = request.cookies.has("cm_access");
  const hasRefreshToken = request.cookies.has("cm_refresh");
  const isAuthenticated = hasAccessToken || hasRefreshToken;

  // 3. Ensure unauthenticated users are redirected to login/welcome when accessing protected routes
  if (isProtectedPath && !isAuthenticated) {
    const welcomeUrl = new URL("/welcome", request.url);
    return NextResponse.redirect(welcomeUrl);
  }

  // 4. Ensure authenticated users are redirected to dashboard when accessing auth routes
  if (isAuthPath && isAuthenticated) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
