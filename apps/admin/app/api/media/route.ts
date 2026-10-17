import { NextResponse } from "next/server";
import { prisma } from "@northville/database";
import { deleteUpload, saveUpload } from "@northville/core";
import { z } from "zod";
import { apiUser } from "../../_lib/session";
import { handle } from "../../_lib/api";
import { audit } from "../../_lib/audit";
import { findImageUsage } from "../../_lib/usage";

// SVG is left out on purpose: an SVG file can carry a script.
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

const PAGE = 60;

export const GET = handle(async (req: Request) => {
  await apiUser("media:view");
  const page = Math.max(1, Number(new URL(req.url).searchParams.get("page")) || 1);
  const rows = await prisma.media.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE + 1 });
  return NextResponse.json({ items: rows.slice(0, PAGE), hasMore: rows.length > PAGE });
});

export const POST = handle(async (req: Request) => {
  const user = await apiUser("media:edit");
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Please choose a file." }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Only pictures can be uploaded (JPG, PNG, WebP, GIF or AVIF). SVG files are not accepted for safety." }, { status: 400 });
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "That picture is over 12 MB. Please shrink it first (squoosh.app is a free tool)." }, { status: 400 });
  const saved = await saveUpload(file);
  const media = await prisma.media.create({ data: { url: saved.url, name: file.name, mimeType: saved.mimeType, sizeBytes: saved.sizeBytes, width: saved.width, height: saved.height } });
  await audit(user.id, "uploaded", `Image: ${file.name}`);
  return NextResponse.json({ item: media });
});

const idBody = z.object({ id: z.string().min(1) });

export const DELETE = handle(async (req: Request) => {
  const user = await apiUser("media:delete");
  const parsed = idBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please choose a picture." }, { status: 400 });
  const m = await prisma.media.findUnique({ where: { id: parsed.data.id } });
  if (!m) return NextResponse.json({ ok: true });
  const used = await findImageUsage(m.url);
  if (used.length) {
    const shown = used.slice(0, 5).join(", ");
    return NextResponse.json({ error: `This picture is still used on: ${shown}${used.length > 5 ? ` and ${used.length - 5} more` : ""}. Replace it there first, then delete it.` }, { status: 409 });
  }
  await prisma.media.delete({ where: { id: m.id } });
  await deleteUpload(m.url);
  await audit(user.id, "deleted", `Image: ${m.name}`);
  return NextResponse.json({ ok: true });
});

const altBody = z.object({ id: z.string().min(1), alt: z.string().max(200) });

export const PATCH = handle(async (req: Request) => {
  await apiUser("media:edit");
  const parsed = altBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "That description is too long." }, { status: 400 });
  await prisma.media.update({ where: { id: parsed.data.id }, data: { alt: parsed.data.alt } });
  return NextResponse.json({ ok: true });
});
