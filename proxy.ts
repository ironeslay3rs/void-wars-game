import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_AUTH_ROUTES = new Set(["/login", "/register", "/recover"]);
const AUTH_COOKIE_KEY = "void-wars-session";

function isProbablyValidAccessToken(token: string): boolean {
  const trimmed = token.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return false;

  const parts = trimmed.split(".");
  if (parts.length !== 3) return false;

  try {
    const payloadB64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    const json = JSON.parse(atob(payloadB64)) as { exp?: unknown };
    if (typeof json.exp === "number") {
      const expMs = json.exp * 1000;
      return expMs > Date.now() + 30_000;
    }
  } catch {
    // If decoding fails, still treat as token-shaped value.
  }

  return true;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  if (!isProbablyValidAccessToken(token)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"],
};
