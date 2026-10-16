import { NextResponse } from "next/server";
import { refreshWebsite } from "@northville/core";
import { apiUser } from "../../../../_lib/session";
import { handle } from "../../../../_lib/api";
import { delegate, getDef } from "../../../../_lib/collection";

/** Moves one row up or down in its list. Renumbers the whole list so order is always clean. */
export const POST = handle(async (req: Request, { params }: { params: Promise<{ collection: string }> }) => {
  const def = getDef((await params).collection);
  await apiUser(`${def.area}:edit`);
  const { id, dir } = (await req.json()) as { id: string; dir: -1 | 1 };
  const rows: { id: string }[] = await delegate(def.model).findMany({ orderBy: def.orderBy, select: { id: true } });
  const i = rows.findIndex((r) => r.id === id), j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return NextResponse.json({ ok: true });
  [rows[i], rows[j]] = [rows[j], rows[i]];
  await Promise.all(rows.map((r, n) => delegate(def.model).update({ where: { id: r.id }, data: { sortOrder: n } })));
  await refreshWebsite();
  return NextResponse.json({ ok: true });
});
