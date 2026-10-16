import { NextResponse } from "next/server";
import { prisma } from "@northville/database";
import { ALL_PERMISSIONS } from "@northville/content";
import { apiUser } from "../../../_lib/session";
import { handle } from "../../../_lib/api";
import { audit } from "../../../_lib/audit";

export const PUT = handle(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const me = await apiUser("users:edit");
  const { id } = await params;
  const b = (await req.json()) as { permissions?: string[]; description?: string };
  const perms = (b.permissions ?? []).filter((p) => ALL_PERMISSIONS.includes(p));
  // Anything editable needs to be viewable, so the person can open the screen.
  const withView = [...new Set([...perms, ...perms.map((p) => `${p.split(":")[0]}:view`)])];
  const r = await prisma.role.update({ where: { id }, data: { permissions: withView, ...(b.description !== undefined ? { description: b.description } : {}) } });
  await audit(me.id, "changed role", r.name);
  return NextResponse.json({ ok: true });
});

export const DELETE = handle(async (_r: Request, { params }: { params: Promise<{ id: string }> }) => {
  const me = await apiUser("users:delete");
  const { id } = await params;
  const count = await prisma.user.count({ where: { roleId: id } });
  if (count) return NextResponse.json({ error: `${count} user(s) still have this role. Give them another role first.` }, { status: 409 });
  const r = await prisma.role.delete({ where: { id } });
  await audit(me.id, "deleted role", r.name);
  return NextResponse.json({ ok: true });
});
