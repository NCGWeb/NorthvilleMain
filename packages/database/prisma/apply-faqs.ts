/** One-time: adds the starter FAQs to services that have none. Never overwrites questions an editor has written. */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { FAQS } from "./seed-faqs";

try { process.loadEnvFile(new URL("../../../.env", import.meta.url)); } catch { /* real env */ }
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  let n = 0;
  for (const s of await prisma.service.findMany({ select: { id: true, slug: true, faqs: true } })) {
    const have = Array.isArray(s.faqs) ? s.faqs.length : 0;
    if (have === 0 && FAQS[s.slug]) { await prisma.service.update({ where: { id: s.id }, data: { faqs: FAQS[s.slug] } }); n++; console.log("faqs added:", s.slug); }
  }
  console.log(`${n} service(s) updated.`);
}
main().finally(() => prisma.$disconnect());
