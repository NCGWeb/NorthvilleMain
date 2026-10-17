import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@northville/database";
import { hashPassword } from "@northville/auth";
import { apiUser } from "../../../_lib/session";
import { handle } from "../../../_lib/api";
import { audit } from "../../../_lib/audit";

export const PUT = handle(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const me = await apiUser("users:edit");
  const { id } = await params;
  const parsed = z.object({ name: z.string().trim().min(1).max(120).optional(), roleId: z.string().max(100).nullish(), isActive: z.boolean().optional(), password: z.string().max(200).optional(), bio: z.string().max(2000).optional() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Those details could not be read. Please check them and try again." }, { status: 400 });
  const b = parsed.data;
  const target = await prisma.user.findUniqueOrThrow({ where: { id } });
  const isOwner = !!process.env.SUPERADMIN_EMAIL && target.email.toLowerCase() === process.env.SUPERADMIN_EMAIL.toLowerCase();
  if (isOwner && me.id !== id && !me.isSuperAdmin) return NextResponse.json({ error: "Only the site owner can change the owner account." }, { status: 403 });
  if (id === me.id && b.isActive === false) return NextResponse.json({ error: "You cannot switch off your own account." }, { status: 400 });
  if (isOwner && b.isActive === false) return NextResponse.json({ error: "The owner account cannot be switched off." }, { status: 400 });
  if (b.password && b.password.length < 10) return NextResponse.json({ error: "Passwords need at least 10 characters." }, { status: 400 });
  // A password change or switching an account off ends every sign in that user already has.
  const endSessions = !!b.password || (b.isActive === false && target.isActive);
  await prisma.user.update({ where: { id }, data: {
    ...(endSessions ? { sessionVersion: { increment: 1 } } : {}),
    ...(b.name !== undefined ? { name: b.name } : {}), ...(b.bio !== undefined ? { bio: b.bio } : {}),
    ...(b.roleId !== undefined ? { roleId: b.roleId || null } : {}), ...(b.isActive !== undefined ? { isActive: b.isActive } : {}),
    ...(b.password ? { passwordHash: await hashPassword(b.password) } : {}),
  } });
  await audit(me.id, "changed user", target.email, b.password ? "password reset" : "");
  return NextResponse.json({ ok: true });
});
