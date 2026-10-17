/** One-time: adds the starter chatbot answers and settings if none exist. Never overwrites edits. */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CHATBOT_SETTINGS, CHAT_ANSWERS } from "./seed-chat";

try { process.loadEnvFile(new URL("../../../.env", import.meta.url)); } catch { /* real env */ }
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  if ((await prisma.chatAnswer.count()) === 0) {
    await prisma.chatAnswer.createMany({ data: CHAT_ANSWERS.map((a, i) => ({ question: a.question, keywords: a.keywords, answer: a.answer, linkLabel: a.linkLabel ?? "", linkHref: a.linkHref ?? "", showAsPill: a.showAsPill ?? true, sortOrder: i })) });
    console.log(`added ${CHAT_ANSWERS.length} chatbot answers`);
  } else console.log("chatbot answers already present");
  const have = await prisma.siteSetting.findUnique({ where: { key: "chatbot" } });
  if (!have) { await prisma.siteSetting.create({ data: { key: "chatbot", value: CHATBOT_SETTINGS } }); console.log("chatbot settings added"); }
}
main().finally(() => prisma.$disconnect());
