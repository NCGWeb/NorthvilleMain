import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@northville/database";
import { slugify } from "@northville/core";
import { apiUser } from "../../_lib/session";
import { handle } from "../../_lib/api";
import { audit } from "../../_lib/audit";

export const POST = handle(async (req: Request) => {
  const user = await apiUser("pages:edit");
  const parsed = z.object({ title: z.string().max(200).optional(), slug: z.string().max(200).optional() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please give the page a title." }, { status: 400 });
  const { title, slug } = parsed.data;
  if (!title?.trim()) return NextResponse.json({ error: "Please give the page a title." }, { status: 400 });
  const clean = slugify(slug || title);
  if (!clean) return NextResponse.json({ error: "Please give the page a web address." }, { status: 400 });
  const page = await prisma.page.create({ data: { title: title.trim(), slug: clean, isPublished: false, hasUnpublishedChanges: true } });
  await audit(user.id, "created", `Page: ${page.title}`);
  return NextResponse.json({ id: page.id });
});
