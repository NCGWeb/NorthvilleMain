import { prisma } from "@northville/database";

/** Public web address of a row, and where visitors go if it disappears. Only lists whose pages have their own address. */
const ADDRESSES: Record<string, { path: (slug: string) => string; fallback: string }> = {
  services: { path: (s) => `/services/${s}`, fallback: "/services" },
  blog: { path: (s) => `/blog/${s}`, fallback: "/blog" },
  caseStudies: { path: (s) => `/case-studies/${s}`, fallback: "/case-studies" },
  blogCategories: { path: (s) => `/blog/category/${s}`, fallback: "/blog" },
};

export const hasAddress = (collection: string) => collection in ADDRESSES;
export const addressOf = (collection: string, slug: string) => ADDRESSES[collection]?.path(slug);

/** Creates a permanent redirect, keeping the table tidy: no loops, and older redirects that pointed at the old address follow along. */
export async function addRedirect(from: string, to: string) {
  if (!from || !to || from === to) return;
  await prisma.$transaction([
    // The address being (re)used must serve a real page, so it cannot also redirect away.
    prisma.redirect.deleteMany({ where: { fromPath: to } }),
    prisma.redirect.updateMany({ where: { toPath: from }, data: { toPath: to } }),
    prisma.redirect.upsert({ where: { fromPath: from }, update: { toPath: to }, create: { fromPath: from, toPath: to } }),
  ]);
}

/** Call after a slug changed. */
export async function redirectOnRename(collection: string, oldSlug: string | undefined, newSlug: string | undefined) {
  const a = ADDRESSES[collection];
  if (!a || !oldSlug || !newSlug || oldSlug === newSlug) return;
  await addRedirect(a.path(oldSlug), a.path(newSlug));
}

/** Call after a row was deleted: its old address now sends visitors to the parent page instead of a dead end. */
export async function redirectOnDelete(collection: string, slug: string | undefined) {
  const a = ADDRESSES[collection];
  if (!a || !slug) return;
  await addRedirect(a.path(slug), a.fallback);
}

export async function redirectOnPageDelete(slug: string) {
  if (!slug) return;
  await addRedirect(`/${slug}`, "/");
}
