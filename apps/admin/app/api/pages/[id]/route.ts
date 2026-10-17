import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@northville/database";
import { refreshWebsite } from "@northville/core";
import { BLOCK_BY_TYPE, type BlockData } from "@northville/content";
import { apiUser } from "../../../_lib/session";
import { handle } from "../../../_lib/api";
import { audit } from "../../../_lib/audit";
import { cleanValues } from "../../../_lib/collection";
import { redirectOnPageDelete } from "../../../_lib/redirects";

type Ctx = { params: Promise<{ id: string }> };

function cleanBlocks(raw: unknown): BlockData[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((b) => b && BLOCK_BY_TYPE[b.type]).map((b) => ({ id: String(b.id), type: String(b.type), data: cleanValues(BLOCK_BY_TYPE[b.type].fields, b.data ?? {}) }));
}

/** Save a draft. Visitors do not see this until it is published. */
const saveBody = z.object({
  title: z.string().max(200).optional(), seoTitle: z.string().max(200).optional(), seoDescription: z.string().max(400).optional(),
  seoImageUrl: z.string().max(1000).nullish(), noindex: z.boolean().optional(), blocks: z.array(z.unknown()).max(200),
});
const actionBody = z.object({ action: z.enum(["publish", "unpublish", "restore", "discard"]), versionId: z.string().optional(), note: z.string().max(300).optional() });

export const PUT = handle(async (req: Request, { params }: Ctx) => {
  const { id } = await params;
  const user = await apiUser("pages:edit");
  const parsed = saveBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "That page could not be read. Please reload and try again." }, { status: 400 });
  const b = parsed.data;
  await prisma.page.update({
    where: { id },
    data: {
      title: String(b.title ?? "").trim() || "Untitled",
      seoTitle: String(b.seoTitle ?? "").trim(), seoDescription: String(b.seoDescription ?? "").trim(),
      seoImageUrl: typeof b.seoImageUrl === "string" && b.seoImageUrl ? b.seoImageUrl : null,
      ...(b.noindex !== undefined ? { noindex: b.noindex } : {}),
      draftBlocks: cleanBlocks(b.blocks) as object[], hasUnpublishedChanges: true,
    },
  });
  await audit(user.id, "saved draft of", `Page: ${String(b.title)}`);
  return NextResponse.json({ ok: true });
});

export const POST = handle(async (req: Request, { params }: Ctx) => {
  const { id } = await params;
  const parsed = actionBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "That action is not recognised." }, { status: 400 });
  const { action, versionId, note } = parsed.data;
  const user = await apiUser(action === "restore" || action === "discard" ? "pages:edit" : "pages:publish");
  const page = await prisma.page.findUniqueOrThrow({ where: { id } });
  let blocks: unknown;

  if (action === "publish") {
    await prisma.$transaction([
      prisma.pageVersion.create({ data: { pageId: id, blocks: page.draftBlocks as object[], note: note ?? "", createdBy: user.name } }),
      prisma.page.update({ where: { id }, data: { publishedBlocks: page.draftBlocks as object[], hasUnpublishedChanges: false, isPublished: true } }),
    ]);
  } else if (action === "unpublish") {
    await prisma.page.update({ where: { id }, data: { isPublished: false } });
  } else if (action === "discard") {
    await prisma.page.update({ where: { id }, data: { draftBlocks: page.publishedBlocks as object[], hasUnpublishedChanges: false } });
    blocks = page.publishedBlocks;
  } else if (action === "restore") {
    const v = await prisma.pageVersion.findFirstOrThrow({ where: { id: versionId, pageId: id } });
    await prisma.page.update({ where: { id }, data: { draftBlocks: v.blocks as object[], hasUnpublishedChanges: true } });
    blocks = v.blocks;
  }
  await audit(user.id, action === "publish" ? "published" : action === "unpublish" ? "took offline" : action === "restore" ? "restored an older version of" : "discarded changes to", `Page: ${page.title}`);
  await refreshWebsite([page.slug ? `/${page.slug}` : "/"]);
  return NextResponse.json({ ok: true, ...(blocks ? { blocks } : {}) });
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  const { id } = await params;
  const user = await apiUser("pages:delete");
  const page = await prisma.page.findUniqueOrThrow({ where: { id } });
  if (["", "blog", "contact"].includes(page.slug)) return NextResponse.json({ error: "This page is needed by the website and cannot be deleted. You can take it offline or edit it instead." }, { status: 409 });
  await prisma.page.delete({ where: { id } });
  await redirectOnPageDelete(page.slug);
  await audit(user.id, "deleted", `Page: ${page.title}`);
  await refreshWebsite();
  return NextResponse.json({ ok: true });
});
