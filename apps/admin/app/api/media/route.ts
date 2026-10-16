import { NextResponse } from "next/server";
import { prisma } from "@northville/database";
import { saveUpload } from "@northville/core";
import { apiUser } from "../../_lib/session";
import { handle } from "../../_lib/api";
import { audit } from "../../_lib/audit";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif", "image/avif"];

export const GET = handle(async () => {
  await apiUser("media:view");
  return NextResponse.json({ items: await prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 300 }) });
});

export const POST = handle(async (req: Request) => {
  const user = await apiUser("media:edit");
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Please choose a file." }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Only pictures can be uploaded (JPG, PNG, WebP, SVG or GIF)." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "That picture is over 8 MB. Please shrink it first (squoosh.app is a free tool)." }, { status: 400 });
  const url = await saveUpload(file);
  const media = await prisma.media.create({ data: { url, name: file.name, mimeType: file.type, sizeBytes: file.size } });
  await audit(user.id, "uploaded", `Image: ${file.name}`);
  return NextResponse.json({ item: media });
});

export const DELETE = handle(async (req: Request) => {
  const user = await apiUser("media:delete");
  const { id } = (await req.json()) as { id: string };
  const m = await prisma.media.delete({ where: { id } });
  await audit(user.id, "deleted", `Image: ${m.name}`);
  return NextResponse.json({ ok: true });
});

export const PATCH = handle(async (req: Request) => {
  await apiUser("media:edit");
  const { id, alt } = (await req.json()) as { id: string; alt: string };
  await prisma.media.update({ where: { id }, data: { alt: String(alt).slice(0, 200) } });
  return NextResponse.json({ ok: true });
});
