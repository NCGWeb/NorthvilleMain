/**
 * Tells the public site to refresh after a publish. Fire and forget: if the
 * site is unreachable, content still saves and pages refresh on their own
 * schedule (see revalidate in apps/web).
 */
export async function refreshWebsite(paths: string[] = ["/"]): Promise<void> {
  const base = process.env.WEB_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!base || !secret) return;
  try {
    await fetch(`${base}/api/revalidate`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
      body: JSON.stringify({ paths }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // ignore
  }
}

/**
 * Refreshes only the listed addresses (not the whole site). An address with a bracket, such as /blog/[slug],
 * refreshes every page of that template. Use it for content that appears on a known set of pages.
 */
export async function refreshPaths(paths: string[]): Promise<void> {
  if (!paths.length) return;
  const base = process.env.WEB_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!base || !secret) return;
  try {
    await fetch(`${base}/api/revalidate`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
      body: JSON.stringify({ paths, scope: "paths" }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // ignore
  }
}
