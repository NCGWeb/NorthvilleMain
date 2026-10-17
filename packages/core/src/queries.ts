import { cache } from "react";
import { prisma } from "@northville/database";
import { UI_TEXT_DEFAULTS, type BlockData } from "@northville/content";

/** Read helpers for the public website. The admin never goes through these. */

export type Settings = {
  general: { siteName: string; tagline: string; footerBlurb: string; logo: string | null; copyright: string; servicePageCta: string | null };
  contact: { email: string; hrEmail: string; phones: string[]; whatsappNumber: string; whatsappMessage: string; officeHours: string; responseTime: string; enquiryRecipient: string };
  social: { linkedin: string; instagram: string; facebook: string; x: string; youtube: string };
  navigation: { mainLinks: { label: string; href: string }[]; servicesMenuLinks: { label: string; href: string }[]; ctaLabel: string; ctaHref: string; footerLinks: { label: string; href: string }[]; legalLinks: { label: string; href: string }[] };
  text: Record<string, string>;
  chatbot: { enabled: boolean; title: string; greeting: string; fallback: string; placeholder: string };
  announcement: { enabled: boolean; badge: string | null; title: string; text: string; href: string };
  seo: { titleSuffix: string; shortSuffix: string; description: string; image: string | null; googleVerification: string; gaId: string };
};

export const getSettings = cache(async function getSettings(): Promise<Settings> {
  const rows = await prisma.siteSetting.findMany();
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const d = <T,>(k: string, fallback: T): T => ({ ...fallback, ...((byKey[k] as object) ?? {}) }) as T;
  return {
    general: d("general", { siteName: "Northville Consulting Group", tagline: "", footerBlurb: "", logo: null, copyright: "Northville Consulting Group", servicePageCta: null }),
    contact: d("contact", { email: "", hrEmail: "", phones: [], whatsappNumber: "", whatsappMessage: "", officeHours: "", responseTime: "", enquiryRecipient: "" }),
    social: d("social", { linkedin: "", instagram: "", facebook: "", x: "", youtube: "" }),
    navigation: d("navigation", { mainLinks: [], servicesMenuLinks: [], ctaLabel: "", ctaHref: "", footerLinks: [], legalLinks: [] }),
    // Editors can blank a box to get the standard wording back.
    text: { ...UI_TEXT_DEFAULTS, ...Object.fromEntries(Object.entries((byKey.text as Record<string, string>) ?? {}).filter(([, v]) => typeof v === "string" && v.trim())) },
    chatbot: d("chatbot", { enabled: false, title: "Ask Northville", greeting: "", fallback: "", placeholder: "Type your question" }),
    announcement: d("announcement", { enabled: false, badge: null, title: "", text: "", href: "" }),
    seo: d("seo", { titleSuffix: "", shortSuffix: "| Northville", description: "", image: null, googleVerification: "", gaId: "" }),
  };
});

export const getPage = cache(async function getPage(slug: string) {
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.isPublished) return null;
  return { ...page, blocks: page.publishedBlocks as unknown as BlockData[] };
});

/** The editor's saved draft of a page, for the private preview link. */
export async function getPageDraft(id: string) {
  const page = await prisma.page.findUnique({ where: { id } });
  return page ? { title: page.title, blocks: page.draftBlocks as unknown as BlockData[] } : null;
}

export const getAllPageSlugs = cache(() => prisma.page.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true, noindex: true } }));

export const getSharedBlock = cache(async function getSharedBlock(id: string) {
  const row = await prisma.sharedBlock.findUnique({ where: { id } });
  return row ? ({ id: row.id, type: row.type, data: row.data as Record<string, unknown> } as BlockData) : null;
});

export const getServiceGroups = cache(() =>
  prisma.serviceGroup.findMany({
    orderBy: { sortOrder: "asc" },
    include: { services: { where: { isPublished: true }, orderBy: { sortOrder: "asc" }, include: { offerings: { orderBy: { sortOrder: "asc" }, select: { title: true } } } } },
  }),
);

export const getServices = cache(() => prisma.service.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" }, include: { group: true } }));

export const getService = cache((slug: string) =>
  prisma.service.findFirst({
    where: { slug, isPublished: true },
    include: { offerings: { orderBy: { sortOrder: "asc" } }, group: true },
  }),
);

export const getTeam = cache((leadershipOnly = false) =>
  prisma.teamMember.findMany({ where: { isPublished: true, ...(leadershipOnly ? { isLeadership: true } : {}) }, orderBy: { sortOrder: "asc" } }),
);

export const getTestimonials = cache(() => prisma.testimonial.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }));

export const getLogos = cache((wall: "CLIENT" | "INVESTOR" | "INSTITUTION" | "NETWORK") =>
  prisma.logoItem.findMany({ where: { wall, isActive: true }, orderBy: { sortOrder: "asc" } }),
);

export const getOffices = cache(() => prisma.office.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }));

export const getJobs = cache(() => prisma.jobOpening.findMany({ where: { isOpen: true }, orderBy: { sortOrder: "asc" } }));

const liveWhere = () => ({
  OR: [
    { status: "PUBLISHED" as const },
    { status: "SCHEDULED" as const, publishedAt: { lte: new Date() } },
  ],
});

export const getPosts = (opts: { take?: number; categorySlug?: string } = {}) =>
  prisma.blogPost.findMany({
    where: { ...liveWhere(), ...(opts.categorySlug ? { category: { slug: opts.categorySlug } } : {}) },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: opts.take,
    include: { category: true, author: true },
  });

export const getPost = (slug: string) =>
  prisma.blogPost.findFirst({ where: { slug, ...liveWhere() }, include: { category: true, author: true } });

export const getRelatedPosts = (postId: string, categoryId: string | null) =>
  prisma.blogPost.findMany({
    where: { ...liveWhere(), id: { not: postId }, ...(categoryId ? { categoryId } : {}) },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: { category: true },
  });

export const getCategories = cache(() => prisma.blogCategory.findMany({ orderBy: { name: "asc" } }));

export const getRedirect = (fromPath: string) => prisma.redirect.findUnique({ where: { fromPath } });

/** Every redirect as one lookup table. The website proxy keeps this in memory so old addresses resolve without rendering a page. */
export async function getRedirectMap(): Promise<Record<string, string>> {
  const rows = await prisma.redirect.findMany({ select: { fromPath: true, toPath: true } });
  return Object.fromEntries(rows.map((r) => [r.fromPath, r.toPath]));
}

/** Descriptions saved in the Media library, by picture address, so pictures get real alt text without extra typing. */
export const getMediaMeta = cache(async () => {
  const rows = await prisma.media.findMany({ select: { url: true, alt: true, width: true, height: true } });
  return new Map(rows.map((r) => [r.url, r]));
});

/** Alt text for a picture: what the editor typed here, else what is saved in the Media library, else the fallback. */
export async function altFor(url: string | null | undefined, typed?: string, fallback = ""): Promise<string> {
  if (typed?.trim()) return typed.trim();
  if (!url) return fallback;
  return (await getMediaMeta()).get(url)?.alt?.trim() || fallback;
}

/** Gives every picture inside article text a description: the one saved in the Media library when the article has none. */
export async function altFillHtml(html: string): Promise<string> {
  if (!/<img\b/i.test(html)) return html;
  const meta = await getMediaMeta();
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const alt = /\balt="([^"]*)"/i.exec(tag)?.[1]?.trim();
    if (alt) return tag;
    const src = /\bsrc="([^"]*)"/i.exec(tag)?.[1] ?? "";
    const lib = meta.get(src)?.alt?.trim().replace(/"/g, "&quot;") ?? "";
    return tag.replace(/\balt="[^"]*"\s*/i, "").replace(/<img\b/i, `<img alt="${lib}"`);
  });
}
