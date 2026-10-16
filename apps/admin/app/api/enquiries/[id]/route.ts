import { NextResponse } from "next/server";
import { prisma } from "@northville/database";
import { apiUser } from "../../../_lib/session";
import { handle } from "../../../_lib/api";

export const PATCH = handle(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await apiUser("enquiries:edit");
  const { status, note } = (await req.json()) as { status?: "NEW" | "IN_PROGRESS" | "DONE" | "SPAM"; note?: string };
  await prisma.enquiry.update({ where: { id: (await params).id }, data: { ...(status ? { status } : {}), ...(note !== undefined ? { note: note.slice(0, 2000) } : {}) } });
  return NextResponse.json({ ok: true });
});

export const DELETE = handle(async (_r: Request, { params }: { params: Promise<{ id: string }> }) => {
  await apiUser("enquiries:delete");
  await prisma.enquiry.delete({ where: { id: (await params).id } });
  return NextResponse.json({ ok: true });
});
