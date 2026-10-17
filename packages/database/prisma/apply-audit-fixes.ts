/**
 * One-time data fixes from the October 2026 site audit. Safe to run more than once, and it never overwrites text an editor has changed:
 *  - trims the About and Services Google descriptions to 155 characters
 *  - hides pages that still say "Draft for legal review" from Google (they stay visitable, but out of the sitemap)
 *  - sets the short title ending used when a title is too long for Google
 * Run: cd packages/database && npx tsx prisma/apply-audit-fixes.ts   (with DATABASE_URL pointing at the database to fix)
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

try { process.loadEnvFile(new URL("../../../.env", import.meta.url)); } catch { /* real env */ }
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const swaps: [string, string, string][] = [
    ["about", "An integrated strategy, finance and transaction advisory partner working embedded with leadership across strategy, finance, transactions, tax, legal and marketing.", "An integrated strategy, finance and transaction advisory partner, embedded with leadership across strategy, finance, deals, tax, legal and marketing."],
    ["services", "Twelve service lines under one roof: strategy, CFO services, transaction advisory, fundraising, tax, legal, people, marketing, data, risk, PMO and family business.", "Twelve service lines under one roof: strategy, CFO services, deals, fundraising, tax, legal, people, marketing, data, risk, PMO and family business."],
  ];
  for (const [slug, from, to] of swaps) {
    const r = await prisma.page.updateMany({ where: { slug, seoDescription: from }, data: { seoDescription: to } });
    console.log(`description ${slug}: ${r.count} updated`);
  }

  // Service titles of 53 characters or more cannot also carry the short brand ending within Google's limit.
  const titles: [string, string][] = [
    ["Business Strategy and Transformation Consulting in India", "Business Strategy and Transformation Consulting"],
    ["Fundraising and Investor Services for Startups in India", "Fundraising and Investor Services for Startups"],
    ["Commercial Contracts and Legal Due Diligence Services", "Commercial Contracts and Legal Due Diligence"],
  ];
  for (const [from, to] of titles) {
    const r = await prisma.service.updateMany({ where: { seoTitle: from }, data: { seoTitle: to } });
    if (r.count) console.log(`service title shortened: ${to}`);
  }

  const pages = await prisma.page.findMany({ select: { id: true, slug: true, publishedBlocks: true, draftBlocks: true, noindex: true } });
  for (const p of pages) {
    const draftText = JSON.stringify([p.publishedBlocks, p.draftBlocks]).includes("Draft for legal review");
    if (draftText && !p.noindex) { await prisma.page.update({ where: { id: p.id }, data: { noindex: true } }); console.log("hidden from Google until reviewed:", p.slug); }
  }

  const seo = await prisma.siteSetting.findUnique({ where: { key: "seo" } });
  const value = (seo?.value ?? {}) as Record<string, unknown>;
  if (seo && !value.shortSuffix) {
    await prisma.siteSetting.update({ where: { key: "seo" }, data: { value: { ...value, shortSuffix: "| Northville" } } });
    console.log("short title ending set");
  }
}
main().finally(() => prisma.$disconnect());
