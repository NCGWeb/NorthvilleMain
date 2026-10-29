import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@northville/database";
import { refreshFor } from "../../../../_lib/refresh";
import { apiUser } from "../../../../_lib/session";
import { handle } from "../../../../_lib/api";
import { audit } from "../../../../_lib/audit";
import { redirectOnDelete, redirectOnRename } from "../../../../_lib/redirects";
import { blockFieldsFor, cleanValues, delegate, getDef, missingRequired, normalizeRow } from "../../../../_lib/collection";

type Ctx = { params: Promise<{ collection: string; id: string }> };

export const PUT = handle(async (req: Request, { params }: Ctx) => {
  const { collection, id } = await params;
  const def = getDef(collection);
  const user = await apiUser(`${def.area}:edit`);
  const parsedBody = z.record(z.string(), z.unknown()).safeParse(await req.json().catch(() => null));
  if (!parsedBody.success) return NextResponse.json({ error: "That form could not be read. Please reload and try again." }, { status: 400 });
  const body = parsedBody.data;
  let data: Record<string, unknown>;

  if (def.key === "shared") {
    const existing = await delegate(def.model).findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "That section no longer exists." }, { status: 404 });
    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "Please give this section a name." }, { status: 400 });
    data = { name, data: cleanValues(blockFieldsFor(existing.type), (body.data ?? {}) as Record<string, unknown>) };
  } else {
    data = cleanValues(def.fields, body);
    const missing = missingRequired(def.fields, data);
    if (missing) return NextResponse.json({ error: missing }, { status: 400 });
    normalizeRow(def.key, data);
    if (def.key === "blog") {
      if (data.status === "PUBLISHED" && !data.publishedAt) data.publishedAt = new Date();
      if (data.status === "SCHEDULED" && !data.publishedAt) return NextResponse.json({ error: 'Scheduled posts need a publish date. Pick one under "Publish date".' }, { status: 400 });
    }
  }

  // Child rows (a service's offerings) are not part of the main fields, so clean them separately.
  const children = def.children ? (cleanValues([def.children.field], body)[def.children.field.name] as Record<string, unknown>[]) : undefined;
  const before = await delegate(def.model).findUnique({ where: { id }, select: { slug: true } }).catch(() => null);
  const row = await prisma.$transaction(async (tx) => {
    const t = tx as never as Record<string, ReturnType<typeof delegate>>;
    const updated = await t[def.model].update({ where: { id }, data });
    if (def.children && children) {
      await t[def.children.model].deleteMany({ where: { [def.children.fk]: id } });
      if (children.length) await t[def.children.model].createMany({ data: children.map((c, i) => ({ ...c, [def.children!.fk]: id, sortOrder: i })) });
    }
    return updated;
  });
  // A changed web address keeps working: the old one now points to the new one.
  await redirectOnRename(def.key, before?.slug, typeof row.slug === "string" ? row.slug : undefined);
  await audit(user.id, "edited", `${def.singular}: ${String(row[def.titleField] ?? "")}`);
  await refreshFor(def.key);
  return NextResponse.json({ ok: true });
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  const { collection, id } = await params;
  const def = getDef(collection);
  const user = await apiUser(`${def.area}:delete`);
  if (def.key === "shared") {
    const used = await prisma.page.findMany({ select: { title: true, draftBlocks: true, publishedBlocks: true } });
    const pages = used.filter((p) => JSON.stringify([p.draftBlocks, p.publishedBlocks]).includes(id)).map((p) => p.title);
    if (pages.length) return NextResponse.json({ error: `This section is still used on: ${pages.join(", ")}. Remove it from those pages first.` }, { status: 409 });
  }
  const row = await delegate(def.model).delete({ where: { id } });
  await redirectOnDelete(def.key, typeof row.slug === "string" ? row.slug : undefined);
  await audit(user.id, "deleted", `${def.singular}: ${String(row[def.titleField] ?? "")}`);
  await refreshFor(def.key);
  return NextResponse.json({ ok: true });
});
