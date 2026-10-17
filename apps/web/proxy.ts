import { resolveRedirect } from "@northville/content";
import { prisma } from "@northville/database";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Old addresses (from the Wix site, or pages that were renamed) are sent to their new home here, before any page is built.
 * The redirect list is kept in memory and refreshed in the background, so an old link answers in milliseconds
 * instead of rendering a whole page just to say "moved".
 */
type Table = Record<string, string>;
const TTL_MS = 60_000;
let table: Table = {};
let loadedAt = 0;
let loading: Promise<void> | null = null;

function refresh(): Promise<void> {
  loading ??= prisma.redirect
    .findMany({ select: { fromPath: true, toPath: true } })
    .then((rows) => {
      table = Object.fromEntries(rows.map((r) => [r.fromPath, r.toPath]));
      loadedAt = Date.now();
    })
    .catch((e) => {
      // Keep serving the last list. Try again soon rather than waiting a full minute.
      console.error("Could not load redirects", e);
      loadedAt = Date.now() - TTL_MS + 5_000;
    })
    .finally(() => { loading = null; });
  return loading;
}

export async function proxy(req: NextRequest) {
  if (loadedAt === 0) await refresh();
  else if (Date.now() - loadedAt > TTL_MS) void refresh(); // serve the current list now, update it for the next visitor

  const to = resolveRedirect(req.nextUrl.pathname, table);
  if (!to) return NextResponse.next();
  return NextResponse.redirect(new URL(to, req.url), 308);
}

// Pages only: skip files, framework internals, APIs and the private draft preview.
export const config = { matcher: ["/((?!_next|api|preview|.*\\..*).*)"] };
