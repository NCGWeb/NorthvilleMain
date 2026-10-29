import { NextResponse, after } from "next/server";
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
  // Same order as the admin list, with id as a tie breaker so equal positions never shuffle.
  const rows: { id: string; sortOrder: number }[] = await delegate(def.model).findMany({ where, orderBy: [def.orderBy, { id: "asc" }], select: { id: true, sortOrder: true } });
  const i = rows.findIndex((r) => r.id === id), j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return NextResponse.json({ ok: true });
  // Renumber from the group's smallest existing position so groups never overlap.
  const base = Math.min(...rows.map((r) => r.sortOrder), 0);
  const order = rows.map((r) => r.id);
  [order[i], order[j]] = [order[j], order[i]];
  // Only write the rows whose position actually changes (usually just the two that swapped).
  const was = new Map(rows.map((r) => [r.id, r.sortOrder]));
  const changes = order.map((rid, n) => ({ id: rid, sortOrder: base + n })).filter((c) => was.get(c.id) !== c.sortOrder);
  const model = (prisma as never as Record<string, { update: (a: unknown) => never }>)[def.model];
  if (changes.length) await prisma.$transaction(changes.map((c) => model.update({ where: { id: c.id }, data: { sortOrder: c.sortOrder } })));
  // The editor does not wait for the website to refresh.
  after(() => refreshWebsite());
  return NextResponse.json({ ok: true });
});
