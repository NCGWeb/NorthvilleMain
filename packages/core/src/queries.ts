import { prisma } from "@northville/database";
import { UI_TEXT_DEFAULTS, type BlockData } from "@northville/content";

/** Read helpers for the public website. The admin never goes through these. */

export type Settings = {
  general: { siteName: string; tagline: string; footerBlurb: string; logo: string | null; copyright: string; servicePageCta: string | null };
  contact: { email: string; hrEmail: string; phones: string[]; whatsappNumber: string; whatsappMessage: string; officeHours: string; responseTime: string; enquiryRecipient: string };
  social: { linkedin: string; instagram: string; facebook: string; x: string; youtube: string };
  navigation: { mainLinks: { label: string; href: string }[]; ctaLabel: string; ctaHref: string; footerLinks: { label: string; href: string }[]; legalLinks: { label: string; href: string }[] };
  text: Record<string, string>;
  announcement: { enabled: boolean; badge: string | null; title: string; text: string; href: string };
  seo: { titleSuffix: string; description: string; image: string | null };
};

export async function getSettings(): Promise<Settings> {
  const rows = await prisma.siteSetting.findMany();
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const d = <T,>(k: string, fallback: T): T => ({ ...fallback, ...((byKey[k] as object) ?? {}) }) as T;
  return {
    general: d("general", { siteName: "Northville Consulting Group", tagline: "", footerBlurb: "", logo: null, copyright: "Northville Consulting Group", servicePageCta: null }),
    contact: d("contact", { email: "", hrEmail: "", phones: [], whatsappNumber: "", whatsappMessage: "", officeHours: "", responseTime: "", enquiryRecipient: "" }),
    social: d("social", { linkedin: "", instagram: "", facebook: "", x: "", youtube: "" }),
    navigation: d("navigation", { mainLinks: [], ctaLabel: "", ctaHref: "", footerLinks: [], legalLinks: [] }),
    // Editors can blank a box to get the standard wording back.
    text: { ...UI_TEXT_DEFAULTS, ...Object.fromEntries(Object.entries((byKey.text as Record<string, string>) ?? {}).filter(([, v]) => typeof v === "string" && v.trim())) },
    announcement: d("announcement", { enabled: false, badge: null, title: "", text: "", href: "" }),
    seo: d("seo", { titleSuffix: "", description: "", image: null }),
  };
}

export async function getPage(slug: string) {
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.isPublished) return null;
  return { ...page, blocks: page.publishedBlocks as unknown as BlockData[] };
}

export async function getAllPageSlugs() {
  return prisma.page.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } });
}

export async function getSharedBlock(id: string) {
  const row = await prisma.sharedBlock.findUnique({ where: { id } });
  return row ? ({ id: row.id, type: row.type, data: row.data as Record<string, unknown> } as BlockData) : null;
}

export async function getServiceGroups() {
  return prisma.serviceGroup.findMany({
    orderBy: { sortOrder: "asc" },
    include: { services: { where: { isPublished: true }, orderBy: { sortOrder: "asc" }, include: { offerings: { orderBy: { sortOrder: "asc" }, select: { title: true } } } } },
  });
}

export async function getServices() {
  return prisma.service.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" }, include: { group: true } });
}

export async function getService(slug: string) {
  return prisma.service.findFirst({
    where: { slug, isPublished: true },
    include: { offerings: { orderBy: { sortOrder: "asc" } }, group: true },
  });
}

export const getTeam = (leadershipOnly = false) =>
  prisma.teamMember.findMany({ where: { isPublished: true, ...(leadershipOnly ? { isLeadership: true } : {}) }, orderBy: { sortOrder: "asc" } });

export const getTestimonials = () => prisma.testimonial.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } });

export const getLogos = (wall: "CLIENT" | "INVESTOR" | "INSTITUTION" | "NETWORK") =>
  prisma.logoItem.findMany({ where: { wall, isActive: true }, orderBy: { sortOrder: "asc" } });

export const getOffices = () => prisma.office.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });

export const getJobs = () => prisma.jobOpening.findMany({ where: { isOpen: true }, orderBy: { sortOrder: "asc" } });

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

export const getCategories = () => prisma.blogCategory.findMany({ orderBy: { name: "asc" } });

export const getRedirect = (fromPath: string) => prisma.redirect.findUnique({ where: { fromPath } });
