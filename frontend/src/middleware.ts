import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  // Render serves over HTTPS, so the session cookie has the __Secure- prefix there
  const secure =
    req.headers.get("x-forwarded-proto") === "https" ||
    req.nextUrl.protocol === "https:";

  let token = await getToken({ req, secret, secureCookie: secure });
  if (!token && secure) {
    // Fallback check in case cookie was set without secure prefix in dev/preview
    token = await getToken({ req, secret, secureCookie: false });
  }
  if (token) return NextResponse.next();

  const { pathname, search } = req.nextUrl;

  // API routes: return 401 instead of redirecting
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  }

  // Pages: send to /signin with callbackUrl
  const url = req.nextUrl.clone();
  url.pathname = "/signin";
  url.search = "";
  url.searchParams.set("callbackUrl", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/discover", "/discover/:path*", "/api/recommend-destinations"],
};