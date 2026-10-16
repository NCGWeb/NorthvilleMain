import { NextResponse } from "next/server";
import { prisma } from "@northville/database";
import { hashPassword } from "@northville/auth";
import { apiUser } from "../../../_lib/session";
import { handle } from "../../../_lib/api";
import { audit } from "../../../_lib/audit";

export const PUT = handle(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const me = await apiUser("users:edit");
  const { id } = await params;
  const b = (await req.json()) as { name?: string; roleId?: string | null; isActive?: boolean; password?: string; bio?: string };
  const target = await prisma.user.findUniqueOrThrow({ where: { id } });
  const isOwner = !!process.env.SUPERADMIN_EMAIL && target.email.toLowerCase() === process.env.SUPERADMIN_EMAIL.toLowerCase();
  if (isOwner && me.id !== id && !me.isSuperAdmin) return NextResponse.json({ error: "Only the site owner can change the owner account." }, { status: 403 });
  if (id === me.id && b.isActive === false) return NextResponse.json({ error: "You cannot switch off your own account." }, { status: 400 });
  if (isOwner && b.isActive === false) return NextResponse.json({ error: "The owner account cannot be switched off." }, { status: 400 });
  if (b.password && b.password.length < 10) return NextResponse.json({ error: "Passwords need at least 10 characters." }, { status: 400 });
  await prisma.user.update({ where: { id }, data: {
    ...(b.name !== undefined ? { name: b.name.trim() } : {}), ...(b.bio !== undefined ? { bio: b.bio } : {}),
    ...(b.roleId !== undefined ? { roleId: b.roleId || null } : {}), ...(b.isActive !== undefined ? { isActive: b.isActive } : {}),
    ...(b.password ? { passwordHash: await hashPassword(b.password) } : {}),
  } });
  await audit(me.id, "changed user", target.email, b.password ? "password reset" : "");
  return NextResponse.json({ ok: true });
});
