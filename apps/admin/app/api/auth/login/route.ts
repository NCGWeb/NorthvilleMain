import { prisma } from "@northville/database";
import { createSessionToken, SESSION_COOKIE, verifyPassword } from "@northville/auth";
import { NextResponse } from "next/server";
import { audit } from "../../../_lib/audit";

const fails = new Map<string, number[]>();

export async function POST(req: Request) {
  const { email, password } = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  const key = (email ?? "").toLowerCase();
  const now = Date.now();
  const recent = (fails.get(key) ?? []).filter((t) => now - t < 15 * 60_000);
  if (recent.length >= 8) return NextResponse.json({ error: "Too many attempts. Please wait 15 minutes and try again." }, { status: 429 });

  const user = key ? await prisma.user.findUnique({ where: { email: key } }) : null;
  const ok = user && user.isActive && password && (await verifyPassword(password, user.passwordHash));
  if (!ok || !user) {
    fails.set(key, [...recent, now]);
    return NextResponse.json({ error: "That email or password is not right." }, { status: 401 });
  }
  const secret = process.env.ADMIN_SESSION_JWT_SECRET;
  if (!secret) return NextResponse.json({ error: "The server is not set up for sign in yet." }, { status: 500 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(user.id, secret), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
  await audit(user.id, "signed in", "account");
  return res;
}
