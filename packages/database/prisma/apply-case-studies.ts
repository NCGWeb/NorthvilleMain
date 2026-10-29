/**
 * Adds Case studies to an existing database. Safe to run more than once.
 * Run: cd packages/database && npx tsx prisma/apply-case-studies.ts   (with DATABASE_URL pointing at the database to update)
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { applyCaseStudies } from "./case-studies-lib";

try { process.loadEnvFile(new URL("../../../.env", import.meta.url)); } catch { /* real env */ }
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

applyCaseStudies(prisma).finally(() => prisma.$disconnect());
