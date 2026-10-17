import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@northville/database";
import { refreshWebsite } from "@northville/core";
import { apiUser } from "../../../_lib/session";
import { handle } from "../../../_lib/api";
import { audit } from "../../../_lib/audit";
import { blockFieldsFor, cleanValues, delegate, getDef, missingRequired, normalizeRow } from "../../../_lib/collection";

type Ctx = { params: Promise<{ collection: string }> };

/** GET ?options=1 returns {id,title} pairs for dropdowns. */
export const GET = handle(async (req: Request, { params }: Ctx) => {
  const def = getDef((await params).collection);
  await apiUser(`${def.area}:view`);
  const rows = await delegate(def.model).findMany({ orderBy: def.orderBy });
  return NextResponse.json({ items: rows.map((r: Record<string, unknown>) => ({ id: r.id, title: String(r[def.titleField] ?? "") })) });
});

export const POST = handle(async (req: Request, { params }: Ctx) => {
  const def = getDef((await params).collection);
  const user = await apiUser(`${def.area}:edit`);
  const parsedBody = z.record(z.string(), z.unknown()).safeParse(await req.json().catch(() => null));
  if (!parsedBody.success) return NextResponse.json({ error: "That form could not be read. Please reload and try again." }, { status: 400 });
  const body = parsedBody.data;
  let data: Record<string, unknown>;

  if (def.key === "shared") {
    const type = String(body.type ?? "");
    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: 'Please give this section a name, for example "Contact us strip".' }, { status: 400 });
    if (!blockFieldsFor(type).length) return NextResponse.json({ error: "Please choose what kind of section this is." }, { status: 400 });
    data = { name, type, data: cleanValues(blockFieldsFor(type), (body.data ?? {}) as Record<string, unknown>) };
  } else {
    data = cleanValues(def.fields, body);
    const missing = missingRequired(def.fields, data);
    if (missing) return NextResponse.json({ error: missing }, { status: 400 });
    normalizeRow(def.key, data);
    applyDefaults(def.key, data, user.id);
  }

  // Child rows (a service's offerings) are not part of the main fields, so clean them separately.
  const children = def.children ? (cleanValues([def.children.field], body)[def.children.field.name] as Record<string, unknown>[]) : undefined;
  const created = await prisma.$transaction(async (tx) => {
    const row = await (tx as never as Record<string, ReturnType<typeof delegate>>)[def.model].create({ data });
    if (def.children && children?.length) {
      await (tx as never as Record<string, ReturnType<typeof delegate>>)[def.children.model].createMany({
        data: children.map((c, i) => ({ ...c, [def.children!.fk]: row.id, sortOrder: i })),
      });
    }
    return row;
  });
  await audit(user.id, "created", `${def.singular}: ${String(created[def.titleField] ?? "")}`);
  await refreshWebsite();
  return NextResponse.json({ id: created.id });
});

function applyDefaults(key: string, data: Record<string, unknown>, userId: string) {
  if (key === "blog") {
    data.authorId = userId;
    if (data.status === "PUBLISHED" && !data.publishedAt) data.publishedAt = new Date();
    if (data.status === "SCHEDULED" && !data.publishedAt) data.status = "DRAFT";
  }
}
export { applyDefaults };
