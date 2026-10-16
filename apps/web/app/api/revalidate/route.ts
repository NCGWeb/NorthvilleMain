import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/** Called by the admin after a publish so visitors see changes immediately. */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { paths } = (await req.json().catch(() => ({ paths: ["/"] }))) as { paths?: string[] };
  // Menus, footer and settings appear on every page, so refresh the whole tree.
  revalidatePath("/", "layout");
  for (const p of paths ?? []) revalidatePath(p);
  return NextResponse.json({ ok: true });
}
