import { NextResponse } from "next/server";
import { prisma } from "@northville/database";
import { hashPassword } from "@northville/auth";
import { apiUser } from "../../_lib/session";
import { handle } from "../../_lib/api";
import { audit } from "../../_lib/audit";

export const POST = handle(async (req: Request) => {
  const me = await apiUser("users:edit");
  const b = (await req.json()) as { name?: string; email?: string; password?: string; roleId?: string };
  if (!b.name?.trim() || !b.email?.trim()) return NextResponse.json({ error: "Please enter a name and an email." }, { status: 400 });
  if (!b.password || b.password.length < 10) return NextResponse.json({ error: "Please set a password of at least 10 characters. They can change it after signing in." }, { status: 400 });
  const u = await prisma.user.create({ data: { name: b.name.trim(), email: b.email.trim().toLowerCase(), passwordHash: await hashPassword(b.password), roleId: b.roleId || null } });
  await audit(me.id, "added user", u.email);
  return NextResponse.json({ id: u.id });
});
