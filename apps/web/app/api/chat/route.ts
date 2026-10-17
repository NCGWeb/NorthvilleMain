import { getChatProvider, logChatQuestion } from "@northville/core";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ message: z.string().trim().min(1).max(300), asked: z.array(z.string().max(120)).max(30).optional() });

// Light per-instance throttle so the bot cannot be hammered.
const hits = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 40) return NextResponse.json({ text: "You are sending messages very quickly. Please wait a moment and try again.", matched: false, suggestions: [] }, { status: 429 });
  hits.set(ip, [...recent, now]);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please type a short question." }, { status: 400 });

  const reply = await getChatProvider().reply({ message: parsed.data.message, asked: parsed.data.asked });
  await logChatQuestion(parsed.data.message, reply.matched, reply.answerId);
  return NextResponse.json(reply);
}
