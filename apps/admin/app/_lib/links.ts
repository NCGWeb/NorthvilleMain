import { prisma } from "@northville/database";

/** Internal addresses offered as suggestions in link boxes, so editors never type them by hand. */
export async function pageLinkSuggestions(): Promise<string[]> {
  const [pages, services, posts] = await Promise.all([
    prisma.page.findMany({ select: { slug: true } }),
    prisma.service.findMany({ select: { slug: true } }),
    prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } }),
  ]);
  return [...pages.map((p) => `/${p.slug}`), ...services.map((s) => `/services/${s.slug}`), ...posts.map((p) => `/blog/${p.slug}`)];
}
