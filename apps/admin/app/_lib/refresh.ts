import { prisma } from "@northville/database";
import { refreshPaths, refreshWebsite } from "@northville/core";

/**
 * What a change to each list touches on the public site. Lists not named here (team, services, offices, chatbot answers and
 * so on) feed the shared layout, so they refresh the whole site.
 * "blocks" are page sections that show this list: every page that has one is refreshed. "extra" are the template pages and files.
 */
const TARGETED: Record<string, { blocks: string[]; extra: string[] }> = {
  testimonials: { blocks: ["testimonials"], extra: ["/case-studies/[slug]"] },
  logos: { blocks: ["logoWall"], extra: [] },
  jobs: { blocks: ["jobList"], extra: [] },
  caseStudies: { blocks: ["caseStudies"], extra: ["/case-studies/[slug]", "/sitemap.xml"] },
  caseStudyDomains: { blocks: ["caseStudies"], extra: ["/case-studies/[slug]"] },
  blog: { blocks: ["blogList"], extra: ["/blog/[slug]", "/blog/category/[slug]", "/blog/feed.xml", "/sitemap.xml"] },
  blogCategories: { blocks: ["blogList"], extra: ["/blog/[slug]", "/blog/category/[slug]", "/sitemap.xml"] },
};

/** Addresses of the published pages that contain at least one of these section types. */
async function pagesWith(types: string[]): Promise<string[]> {
  const pages = await prisma.page.findMany({ where: { isPublished: true }, select: { slug: true, publishedBlocks: true } });
  return pages
    .filter((p) => ((p.publishedBlocks as { type?: string }[]) ?? []).some((b) => b.type && types.includes(b.type)))
    .map((p) => (p.slug ? `/${p.slug}` : "/"));
}

/** Refresh the public site after a change to one list: only the pages that show it, or everything when unsure. */
export async function refreshFor(collection: string): Promise<void> {
  const rule = TARGETED[collection];
  if (!rule) return refreshWebsite();
  await refreshPaths([...(await pagesWith(rule.blocks)), ...rule.extra]);
}
