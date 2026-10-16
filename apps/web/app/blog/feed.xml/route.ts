import { getPosts, getSettings } from "@northville/core";
import { abs } from "../../_lib/site";

export const revalidate = 3600;

const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** RSS feed of published posts. Helps readers and search engines discover new articles. */
export async function GET() {
  const [posts, s] = await Promise.all([getPosts({ take: 30 }), getSettings()]);
  const items = posts.map((p) => `<item><title>${esc(p.title)}</title><link>${abs(`/blog/${p.slug}`)}</link><guid>${abs(`/blog/${p.slug}`)}</guid><pubDate>${(p.publishedAt ?? p.createdAt).toUTCString()}</pubDate><description>${esc(p.excerpt)}</description></item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(s.general.siteName)} Insights</title><link>${abs("/blog")}</link><description>${esc(s.seo.description)}</description><language>en-IN</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
