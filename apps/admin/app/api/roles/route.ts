import { NextResponse } from "next/server";
import { prisma } from "@northville/database";
import { ALL_PERMISSIONS } from "@northville/content";
import { apiUser } from "../../_lib/session";
import { handle } from "../../_lib/api";
import { audit } from "../../_lib/audit";

export const POST = handle(async (req: Request) => {
  const me = await apiUser("users:edit");
  const b = (await req.json()) as { name?: string; description?: string };
  if (!b.name?.trim()) return NextResponse.json({ error: "Please name the role." }, { status: 400 });
  const r = await prisma.role.create({ data: { name: b.name.trim(), description: b.description ?? "", permissions: ["pages:view"] } });
  await audit(me.id, "created role", r.name);
  return NextResponse.json({ id: r.id, all: ALL_PERMISSIONS.length });
});
