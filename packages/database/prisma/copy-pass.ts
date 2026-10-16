/**
 * One-time copy pass: Title Case for headings, buttons and menu labels, plus a few grammar fixes.
 * Safe to run on production: it only replaces exact old values, so edits an editor has made are left alone.
 * Usage: DATABASE_URL=... npx tsx prisma/copy-pass.ts   (set DRY=1 to preview)
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

try { process.loadEnvFile(new URL("../../../.env", import.meta.url)); } catch { /* real env */ }
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const DRY = process.env.DRY === "1";

/** Whole-value replacements (the entire text must match). */
export const EXACT: [string, string][] = [
  ["Our team", "Our Team"], ["Contact us", "Contact Us"], ["Privacy policy", "Privacy Policy"], ["Terms and conditions", "Terms and Conditions"],
  ["About us", "About Us"], ["Contact us strip", "Contact Us Strip"], ["Careers strip", "Careers Strip"], ["Follow us strip", "Follow Us Strip"],
  ["Contact us for enquiries", "Contact Us for Enquiries"], ["Get in touch", "Get in Touch"], ["Be a part of the team", "Be a Part of the Team"],
  ["Say hi", "Say Hi"], ["Want updates about us?", "Want Updates About Us?"], ["Talk to us", "Talk to Us"], ["Explore services", "Explore Services"],
  ["Your success is the only metric that matters to us.", "Your Success Is the Only Metric That Matters to Us."],
  ["Our impact in numbers", "Our Impact in Numbers"], ["Investor connects", "Investor Connects"],
  ["One team across strategy, finance, deals, tax and law", "One Team Across Strategy, Finance, Deals, Tax and Law"],
  ["Meet the founders", "Meet the Founders"], ["What they say about us", "What They Say About Us"], ["Our clients", "Our Clients"],
  ["Our top investor connects", "Our Top Investor Connects"], ["Institutional collaborations", "Institutional Collaborations"], ["Network firms", "Network Firms"],
  ["Who are we?", "Who Are We?"], ["Senior expertise without the cost of a large in-house function", "Senior Expertise Without the Cost of a Large In-House Function"],
  ["See our services", "See Our Services"], ["Mission and vision", "Mission and Vision"], ["Our mission", "Our Mission"], ["Our vision", "Our Vision"],
  ["The people behind the firm", "The People Behind the Firm"], ["Crafting your business's future", "Crafting Your Business's Future"],
  ["Everything under one roof", "Everything Under One Roof"], ["Meet the team", "Meet the Team"], ["The people you will work with", "The People You Will Work With"],
  ["Open roles", "Open Roles"], ["Let's begin a conversation", "Let's Begin a Conversation"], ["Send us an enquiry", "Send Us an Enquiry"], ["Visit us", "Visit Us"],
  ["Ideas for growing businesses", "Ideas for Growing Businesses"], ["Insights on Finance, Strategy, M&A and Tax", "Insights on Finance, Strategy, M&A and Tax"],
  ["When does a startup need a virtual CFO?", "When Does a Startup Need a Virtual CFO?"], ["The Wider team", "The Wider Team"],
  ["Information we collect", "Information We Collect"], ["How we use it", "How We Use It"], ["Your choices", "Your Choices"],
  ["Use of this website", "Use of This Website"], ["Intellectual property", "Intellectual Property"],
  ["People & Organization", "People & Organisation"], ["Cost & Working Capital Optimization", "Cost & Working Capital Optimisation"],
  ["About Northville Consulting Group", "About Us"], ["Careers at Northville Consulting Group", "Careers"], ["Contact Northville Consulting Group", "Contact Us"],
  ["Full time", "Full-Time"],
];

/** Substring replacements (grammar and spelling inside sentences). */
export const SUBSTRING: [string, string][] = [
  ["India, the U.S., the UK and the UAE", "India, the US, the UK and the UAE"],
  ["across Finance, Legal, Marketing and Strategy", "across finance, legal, marketing and strategy"],
  ["People & Organization", "People & Organisation"],
  ["Cost & Working Capital Optimization", "Cost & Working Capital Optimisation"],
  ["<h2>Information we collect</h2>", "<h2>Information We Collect</h2>"], ["<h2>How we use it</h2>", "<h2>How We Use It</h2>"],
  ["<h2>Sharing</h2>", "<h2>Sharing</h2>"], ["<h2>Your choices</h2>", "<h2>Your Choices</h2>"],
  ["<h2>Use of this website</h2>", "<h2>Use of This Website</h2>"], ["<h2>Intellectual property</h2>", "<h2>Intellectual Property</h2>"],
  ["<h2>Liability</h2>", "<h2>Liability</h2>"],
  ["the organization your next", "the organisation your next"], ["The organization your next stage requires", "The organisation your next stage requires"],
  ["Equity structured", "Equity structured"], ["professionalization", "professionalisation"],
];

const fixString = (v: string): string => {
  let out = v;
  for (const [a, b] of EXACT) if (out === a) return b;
  for (const [a, b] of SUBSTRING) if (out.includes(a)) out = out.split(a).join(b);
  return out;
};
const fixJson = (v: unknown): unknown => {
  if (typeof v === "string") return fixString(v);
  if (Array.isArray(v)) return v.map(fixJson);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fixJson(x)]));
  return v;
};
const changed = (a: unknown, b: unknown) => JSON.stringify(a) !== JSON.stringify(b);
let n = 0;
const log = (what: string) => { n++; console.log((DRY ? "[dry] " : "") + what); };

async function main() {
  for (const p of await prisma.page.findMany()) {
    const data = { title: fixString(p.title), seoTitle: fixString(p.seoTitle), seoDescription: fixString(p.seoDescription), draftBlocks: fixJson(p.draftBlocks) as object, publishedBlocks: fixJson(p.publishedBlocks) as object };
    if (changed(data, { title: p.title, seoTitle: p.seoTitle, seoDescription: p.seoDescription, draftBlocks: p.draftBlocks, publishedBlocks: p.publishedBlocks })) { log(`page ${p.slug || "home"}`); if (!DRY) await prisma.page.update({ where: { id: p.id }, data }); }
  }
  for (const s of await prisma.siteSetting.findMany()) {
    const v = fixJson(s.value) as object;
    if (changed(v, s.value)) { log(`setting ${s.key}`); if (!DRY) await prisma.siteSetting.update({ where: { key: s.key }, data: { value: v } }); }
  }
  for (const b of await prisma.sharedBlock.findMany()) {
    const data = { name: fixString(b.name), data: fixJson(b.data) as object };
    if (changed(data, { name: b.name, data: b.data })) { log(`shared ${b.name}`); if (!DRY) await prisma.sharedBlock.update({ where: { id: b.id }, data }); }
  }
  for (const sv of await prisma.service.findMany({ include: { offerings: true } })) {
    const data = { name: fixString(sv.name), summary: fixString(sv.summary), tagline: fixString(sv.tagline), heroHeading: fixString(sv.heroHeading), heroSubtext: fixString(sv.heroSubtext), seoTitle: fixString(sv.seoTitle), seoDescription: fixString(sv.seoDescription) };
    if (changed(data, { name: sv.name, summary: sv.summary, tagline: sv.tagline, heroHeading: sv.heroHeading, heroSubtext: sv.heroSubtext, seoTitle: sv.seoTitle, seoDescription: sv.seoDescription })) { log(`service ${sv.slug}`); if (!DRY) await prisma.service.update({ where: { id: sv.id }, data }); }
    for (const o of sv.offerings) {
      const od = { title: fixString(o.title), tagline: fixString(o.tagline), body: fixString(o.body), bullets: o.bullets.map(fixString) };
      if (changed(od, { title: o.title, tagline: o.tagline, body: o.body, bullets: o.bullets })) { log(`offering ${o.title}`); if (!DRY) await prisma.serviceOffering.update({ where: { id: o.id }, data: od }); }
    }
  }
  for (const g of await prisma.serviceGroup.findMany()) { const d = { name: fixString(g.name), blurb: fixString(g.blurb) }; if (changed(d, { name: g.name, blurb: g.blurb })) { log(`group ${g.name}`); if (!DRY) await prisma.serviceGroup.update({ where: { id: g.id }, data: d }); } }
  for (const l of await prisma.logoItem.findMany()) { const d = { name: fixString(l.name) }; if (changed(d, { name: l.name })) { log(`logo ${l.name}`); if (!DRY) await prisma.logoItem.update({ where: { id: l.id }, data: d }); } }
  for (const b of await prisma.blogPost.findMany()) {
    const d = { title: fixString(b.title), excerpt: fixString(b.excerpt), body: fixString(b.body) };
    if (changed(d, { title: b.title, excerpt: b.excerpt, body: b.body })) { log(`post ${b.slug}`); if (!DRY) await prisma.blogPost.update({ where: { id: b.id }, data: d }); }
  }
  console.log(`${n} record(s) ${DRY ? "would change" : "updated"}.`);
}
main().finally(() => prisma.$disconnect());
