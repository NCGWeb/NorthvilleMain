import { NextResponse } from "next/server";
import { prisma } from "@northville/database";
import { refreshWebsite } from "@northville/core";
import { BLOCK_BY_TYPE, type BlockData } from "@northville/content";
import { apiUser } from "../../../_lib/session";
import { handle } from "../../../_lib/api";
import { audit } from "../../../_lib/audit";
import { cleanValues } from "../../../_lib/collection";

type Ctx = { params: Promise<{ id: string }> };

function cleanBlocks(raw: unknown): BlockData[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((b) => b && BLOCK_BY_TYPE[b.type]).map((b) => ({ id: String(b.id), type: String(b.type), data: cleanValues(BLOCK_BY_TYPE[b.type].fields, b.data ?? {}) }));
}

/** Save a draft. Visitors do not see this until it is published. */
export const PUT = handle(async (req: Request, { params }: Ctx) => {
  const { id } = await params;
  const user = await apiUser("pages:edit");
  const b = (await req.json()) as Record<string, unknown>;
  await prisma.page.update({
    where: { id },
    data: {
      title: String(b.title ?? "").trim() || "Untitled",
      seoTitle: String(b.seoTitle ?? "").trim(), seoDescription: String(b.seoDescription ?? "").trim(),
      seoImageUrl: typeof b.seoImageUrl === "string" && b.seoImageUrl ? b.seoImageUrl : null,
      draftBlocks: cleanBlocks(b.blocks) as object[], hasUnpublishedChanges: true,
    },
  });
  await audit(user.id, "saved draft of", `Page: ${String(b.title)}`);
  return NextResponse.json({ ok: true });
});

export const POST = handle(async (req: Request, { params }: Ctx) => {
  const { id } = await params;
  const { action, versionId, note } = (await req.json()) as { action: "publish" | "unpublish" | "restore" | "discard"; versionId?: string; note?: string };
  const user = await apiUser(action === "restore" || action === "discard" ? "pages:edit" : "pages:publish");
  const page = await prisma.page.findUniqueOrThrow({ where: { id } });

  if (action === "publish") {
    await prisma.$transaction([
      prisma.pageVersion.create({ data: { pageId: id, blocks: page.draftBlocks as object[], note: note ?? "", createdBy: user.name } }),
      prisma.page.update({ where: { id }, data: { publishedBlocks: page.draftBlocks as object[], hasUnpublishedChanges: false, isPublished: true } }),
    ]);
  } else if (action === "unpublish") {
    await prisma.page.update({ where: { id }, data: { isPublished: false } });
  } else if (action === "discard") {
    await prisma.page.update({ where: { id }, data: { draftBlocks: page.publishedBlocks as object[], hasUnpublishedChanges: false } });
  } else if (action === "restore") {
    const v = await prisma.pageVersion.findFirstOrThrow({ where: { id: versionId, pageId: id } });
    await prisma.page.update({ where: { id }, data: { draftBlocks: v.blocks as object[], hasUnpublishedChanges: true } });
  }
  await audit(user.id, action === "publish" ? "published" : action === "unpublish" ? "took offline" : action === "restore" ? "restored an older version of" : "discarded changes to", `Page: ${page.title}`);
  await refreshWebsite([page.slug ? `/${page.slug}` : "/"]);
  return NextResponse.json({ ok: true });
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  const { id } = await params;
  const user = await apiUser("pages:delete");
  const page = await prisma.page.findUniqueOrThrow({ where: { id } });
  if (["", "blog", "contact"].includes(page.slug)) return NextResponse.json({ error: "This page is needed by the website and cannot be deleted. You can take it offline or edit it instead." }, { status: 409 });
  await prisma.page.delete({ where: { id } });
  await audit(user.id, "deleted", `Page: ${page.title}`);
  await refreshWebsite();
  return NextResponse.json({ ok: true });
});
