import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_AUTH_ROUTES = new Set(["/login", "/register", "/recover"]);
const AUTH_COOKIE_KEY = "void-wars-session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore Next internals & static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_AUTH_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_KEY)?.value ?? "";
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"],
};

