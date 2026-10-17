import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@northville/database";
import { ALL_PERMISSIONS } from "@northville/content";
import { apiUser } from "../../_lib/session";
import { handle } from "../../_lib/api";
import { audit } from "../../_lib/audit";

export const POST = handle(async (req: Request) => {
  const me = await apiUser("users:edit");
  const parsed = z.object({ name: z.string().trim().min(1).max(60), description: z.string().max(300).optional() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please name the role." }, { status: 400 });
  const b = parsed.data;
  const r = await prisma.role.create({ data: { name: b.name, description: b.description ?? "", permissions: ["pages:view"] } });
  await audit(me.id, "created role", r.name);
  return NextResponse.json({ id: r.id, all: ALL_PERMISSIONS.length });
});
