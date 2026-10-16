/** One-time: creates the starter drafts, or fills in an existing sample draft that an editor has not published. */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { POSTS } from "./seed-posts";

try { process.loadEnvFile(new URL("../../../.env", import.meta.url)); } catch { /* real env */ }
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const author = await prisma.user.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" } });
  for (const p of POSTS) {
    const category = await prisma.blogCategory.findUnique({ where: { slug: p.category } });
    const existing = await prisma.blogPost.findUnique({ where: { slug: p.slug } });
    const data = { title: p.title, excerpt: p.excerpt, seoDescription: p.seoDescription, body: p.body, categoryId: category?.id ?? null };
    if (!existing) { await prisma.blogPost.create({ data: { slug: p.slug, status: "DRAFT", authorId: author?.id, ...data } }); console.log("created draft:", p.slug); }
    else if (existing.status === "DRAFT" && existing.body.includes("This is a sample draft")) { await prisma.blogPost.update({ where: { id: existing.id }, data }); console.log("filled in sample draft:", p.slug); }
    else console.log("left alone:", p.slug);
  }
}
main().finally(() => prisma.$disconnect());
