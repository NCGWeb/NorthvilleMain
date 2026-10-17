import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@northville/database";
import { refreshWebsite } from "@northville/core";
import { apiUser } from "../../../../_lib/session";
import { handle } from "../../../../_lib/api";
import { delegate, getDef } from "../../../../_lib/collection";

const body = z.object({ id: z.string().min(1), dir: z.union([z.literal(-1), z.literal(1)]) });

/**
 * Moves one row up or down in its list. Only the rows that share its group (for logos, the same wall)
 * are renumbered, so other groups keep their order.
 */
export const POST = handle(async (req: Request, { params }: { params: Promise<{ collection: string }> }) => {
  const def = getDef((await params).collection);
  await apiUser(`${def.area}:edit`);
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "That move could not be read." }, { status: 400 });
  const { id, dir } = parsed.data;
  const current = await delegate(def.model).findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "That item no longer exists." }, { status: 404 });
  const where = def.groupBy && current[def.groupBy] != null ? { [def.groupBy]: current[def.groupBy] } : undefined;
  const rows: { id: string }[] = await delegate(def.model).findMany({ where, orderBy: def.orderBy, select: { id: true } });
  const i = rows.findIndex((r) => r.id === id), j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return NextResponse.json({ ok: true });
  [rows[i], rows[j]] = [rows[j], rows[i]];
  // Renumber from the group's smallest existing position so groups never overlap.
  const base = Math.min(...(await delegate(def.model).findMany({ where, select: { sortOrder: true } })).map((r: { sortOrder: number }) => r.sortOrder), 0);
  await prisma.$transaction(rows.map((r, n) => (prisma as never as Record<string, { update: (a: unknown) => never }>)[def.model].update({ where: { id: r.id }, data: { sortOrder: base + n } })));
  await refreshWebsite();
  return NextResponse.json({ ok: true });
});
