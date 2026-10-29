import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/** Called by the admin after a publish so visitors see changes immediately. */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { paths, scope } = (await req.json().catch(() => ({ paths: ["/"] }))) as { paths?: string[]; scope?: string };
  // Menus, footer and settings appear on every page, so most changes refresh the whole tree.
  // scope "paths" is for content that only appears on known pages: refresh just those.
  if (scope !== "paths") revalidatePath("/", "layout");
  for (const p of paths ?? []) {
    if (typeof p !== "string" || !p.startsWith("/")) continue;
    // A template address such as /blog/[slug] covers every page built from it.
    if (p.includes("[")) revalidatePath(p, "page");
    else revalidatePath(p);
  }
  return NextResponse.json({ ok: true });
}
