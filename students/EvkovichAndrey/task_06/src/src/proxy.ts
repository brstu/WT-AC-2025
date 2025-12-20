import {NextRequest, NextResponse} from "next/server";

const publicRoutes = ["/", "/register", "/login", "/api/auth"];
const protectedRoutes = ["/dashboard"];

export function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const  isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && (pathname === "login" || pathname === "register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};