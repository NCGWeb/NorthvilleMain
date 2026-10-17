import { prisma } from "@northville/database";
import { getOffices, getSettings, getTeam } from "./queries";

/**
 * Chatbot engine.
 *
 * The widget talks to ONE function, `getChatProvider().reply(...)`. Today that is the rules provider below,
 * which matches the visitor's words against the editable answers (Chatbot answers in the admin).
 * To use an AI model later, write a provider with the same shape (see docs/CHATBOT.md) and return it
 * from `getChatProvider()`. Nothing in the widget or the API route has to change.
 */

export type ChatReply = {
  text: string;
  link?: { label: string; href: string };
  matched: boolean;
  answerId?: string;
  /** Questions to offer as tap-to-ask pills after this reply. */
  suggestions: string[];
};

export type ChatInput = { message: string; asked?: string[] };

export interface ChatProvider {
  reply(input: ChatInput): Promise<ChatReply>;
}

const STOP = new Set("a an the and or of to for in on at is are am was were be do does did can could would should will you your yours we our us i me my it this that with from about any have has how what when where who which please tell want need like get give there their they them as by if so not no yes just also".split(" "));

const norm = (s: string) => s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const stem = (w: string) => (w.length > 4 ? w.replace(/(ing|ers|er|es|s)$/, "") : w);
const tokens = (s: string) => norm(s).split(" ").filter((w) => w && !STOP.has(w)).map(stem);

type AnswerRow = { id: string; question: string; keywords: string; answer: string; linkLabel: string; linkHref: string };

/** Scores one answer against the message. Phrases and exact questions weigh most. */
function score(message: string, msgTokens: string[], a: AnswerRow): number {
  const m = norm(message);
  if (m === norm(a.question)) return 100; // a tapped pill
  let s = 0;
  for (const k of a.keywords.split(",").map(norm).filter(Boolean)) {
    const words = k.split(" ");
    if (words.length > 1 ? m.includes(k) : msgTokens.includes(stem(k)) || new RegExp(`\\b${k}\\b`).test(m)) s += words.length > 1 ? 4 : 3;
  }
  const qt = new Set(tokens(a.question));
  for (const t of msgTokens) if (qt.has(t)) s += 1;
  return s;
}

const SMALL_TALK: { test: RegExp; text: string }[] = [
  { test: /^(hi|hello|hey|hii|good (morning|afternoon|evening)|namaste)\b/, text: "Hello! How can I help you today? Tap a question below or type your own." },
  { test: /\b(thanks|thank you|thx|cheers)\b/, text: "You are welcome. Is there anything else I can help with?" },
  { test: /^(bye|goodbye|see you)\b/, text: "Thanks for stopping by. We are here whenever you need us." },
];

async function fill(text: string): Promise<string> {
  const needs = /\{(email|phone|hrEmail|hours|response|offices|founders)\}/.test(text);
  if (!needs) return text;
  const [s, offices, leaders] = await Promise.all([getSettings(), getOffices(), getTeam(true)]);
  const vars: Record<string, string> = {
    email: s.contact.email,
    phone: s.contact.phones[0] ?? "",
    hrEmail: s.contact.hrEmail,
    hours: s.contact.officeHours,
    response: s.contact.responseTime,
    offices: offices.map((o) => `${o.city} (${o.address})`).join("; "),
    founders: leaders.map((p) => `${p.name} (${p.designation})`).join(" and "),
  };
  return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "").replace(/\s+([.,;])/g, "$1").trim();
}

export const rulesProvider: ChatProvider = {
  async reply({ message, asked = [] }) {
    const text = message.trim().slice(0, 300);
    const m = norm(text);
    const settings = await getSettings();
    const answers = await prisma.chatAnswer.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
    const askedSet = new Set(asked.map(norm));
    const suggestions = (exclude: string) =>
      answers.filter((a) => a.showAsPill && norm(a.question) !== norm(exclude) && !askedSet.has(norm(a.question))).slice(0, 3).map((a) => a.question);

    const msgTokens = tokens(text);
    let best: { a: AnswerRow; s: number } | null = null;
    for (const a of answers) {
      const sc = score(text, msgTokens, a);
      if (sc > (best?.s ?? 0)) best = { a, s: sc };
    }
    if (best && best.s >= 3) {
      return {
        text: await fill(best.a.answer),
        link: best.a.linkHref ? { label: best.a.linkLabel || "Learn more", href: best.a.linkHref } : undefined,
        matched: true, answerId: best.a.id, suggestions: suggestions(best.a.question),
      };
    }
    const talk = SMALL_TALK.find((t) => t.test.test(m));
    if (talk) return { text: talk.text, matched: true, suggestions: suggestions("") };
    return { text: await fill(settings.chatbot.fallback || "I am not sure about that one. Please contact the team and we will help you directly."), matched: false, suggestions: suggestions("") };
  },
};

/** The one place that decides who answers. Replace with an AI-backed provider later. */
export function getChatProvider(): ChatProvider {
  return rulesProvider;
}

/** Opening state for the widget: greeting and the first pills. */
export async function getChatStart() {
  const [s, answers] = await Promise.all([getSettings(), prisma.chatAnswer.findMany({ where: { isActive: true, showAsPill: true }, orderBy: { sortOrder: "asc" }, take: 5 })]);
  return { enabled: s.chatbot.enabled && answers.length > 0, title: s.chatbot.title || "Ask Northville", greeting: s.chatbot.greeting || "Hello! How can we help you today?", placeholder: s.chatbot.placeholder || "Type your question", pills: answers.map((a) => a.question), whatsappNumber: s.contact.whatsappNumber, whatsappMessage: s.contact.whatsappMessage };
}

export async function logChatQuestion(text: string, answered: boolean, answerId?: string) {
  await prisma.chatQuestion.create({ data: { text: text.slice(0, 300), answered, answerId: answerId ?? null } }).catch(() => {});
}
