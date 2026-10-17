import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@northville/database";
import { apiUser } from "../../../_lib/session";
import { handle } from "../../../_lib/api";

const body = z.object({ status: z.enum(["NEW", "IN_PROGRESS", "DONE", "SPAM"]).optional(), note: z.string().max(2000).optional() });

export const PATCH = handle(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await apiUser("enquiries:edit");
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "That status is not recognised." }, { status: 400 });
  const { status, note } = parsed.data;
  await prisma.enquiry.update({ where: { id: (await params).id }, data: { ...(status ? { status } : {}), ...(note !== undefined ? { note } : {}) } });
  return NextResponse.json({ ok: true });
});

export const DELETE = handle(async (_r: Request, { params }: { params: Promise<{ id: string }> }) => {
  await apiUser("enquiries:delete");
  await prisma.enquiry.delete({ where: { id: (await params).id } });
  return NextResponse.json({ ok: true });
});
