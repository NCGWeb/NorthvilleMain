import { prisma } from "@northville/database";
import { createSessionToken, SESSION_COOKIE, verifyPassword } from "@northville/auth";
import { clearFailures, isRateLimited, recordFailure } from "@northville/core";
import { NextResponse } from "next/server";
import { audit } from "../../../_lib/audit";

// Failed attempts are counted in the database, so every server shares one count. Both the address and the email are limited.
const MAX_PER_EMAIL = 8;
const MAX_PER_IP = 20;

export async function POST(req: Request) {
  const { email, password } = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  const emailKey = `email:${(email ?? "").toLowerCase().slice(0, 200)}`;
  const ipKey = `ip:${req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"}`;
  if ((await isRateLimited(emailKey, MAX_PER_EMAIL)) || (await isRateLimited(ipKey, MAX_PER_IP))) {
    return NextResponse.json({ error: "Too many attempts. Please wait 15 minutes and try again." }, { status: 429 });
  }

  const lower = (email ?? "").toLowerCase();
  const user = lower ? await prisma.user.findUnique({ where: { email: lower } }) : null;
  const ok = user && user.isActive && password && (await verifyPassword(password, user.passwordHash));
  if (!ok || !user) {
    await recordFailure([emailKey, ipKey]);
    return NextResponse.json({ error: "That email or password is not right." }, { status: 401 });
  }
  const secret = process.env.ADMIN_SESSION_JWT_SECRET;
  if (!secret) return NextResponse.json({ error: "The server is not set up for sign in yet." }, { status: 500 });
  await clearFailures([emailKey]);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(user.id, secret, user.sessionVersion), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
  await audit(user.id, "signed in", "account");
  return res;
}
