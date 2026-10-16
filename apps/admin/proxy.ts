import { SESSION_COOKIE, verifySessionToken } from "@northville/auth";
import { NextResponse, type NextRequest } from "next/server";

// Everything needs a valid session except the sign-in page and its API.
const OPEN = ["/login", "/api/auth/login", "/api/auth/logout"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (OPEN.some((p) => pathname.startsWith(p))) return NextResponse.next();
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.ADMIN_SESSION_JWT_SECRET;
  const ok = token && secret ? await verifySessionToken(token, secret) : null;
  if (!ok) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads|seed|.*\\..*).*)"] };
