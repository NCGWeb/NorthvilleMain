import { NextResponse } from "next/server";
import { signPreviewToken } from "@northville/core";
import { apiUser } from "../../../../_lib/session";
import { handle } from "../../../../_lib/api";

/** Returns a private link (valid for two hours) that shows the saved draft of this page on the real website. */
export const POST = handle(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await apiUser("pages:view");
  const { id } = await params;
  const base = (process.env.WEB_URL ?? "http://localhost:3000").replace(/\/$/, "");
  if (!process.env.REVALIDATE_SECRET) return NextResponse.json({ error: "Preview is not set up on the server yet." }, { status: 500 });
  return NextResponse.json({ url: `${base}/preview/${id}?t=${encodeURIComponent(signPreviewToken(id))}` });
});
