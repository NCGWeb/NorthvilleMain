import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@northville/database";
import { hashPassword } from "@northville/auth";
import { apiUser } from "../../_lib/session";
import { handle } from "../../_lib/api";
import { audit } from "../../_lib/audit";

export const POST = handle(async (req: Request) => {
  const me = await apiUser("users:edit");
  const parsed = z.object({ name: z.string().trim().min(1).max(120), email: z.string().trim().email().max(200), password: z.string().max(200).optional(), roleId: z.string().max(100).nullish() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please enter a name and a valid email." }, { status: 400 });
  const b = parsed.data;
  if (!b.password || b.password.length < 10) return NextResponse.json({ error: "Please set a password of at least 10 characters. They can change it after signing in." }, { status: 400 });
  const u = await prisma.user.create({ data: { name: b.name, email: b.email.toLowerCase(), passwordHash: await hashPassword(b.password), roleId: b.roleId || null } });
  await audit(me.id, "added user", u.email);
  return NextResponse.json({ id: u.id });
});
