import { prisma } from "@northville/database";
import { getSettings, sendMail } from "@northville/core";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().default(""),
  message: z.string().trim().max(4000).optional().default(""),
  website: z.string().optional(), // honeypot
  elapsed: z.number().optional(),
});

// Light per-instance throttle. Add Upstash later if abuse appears.
const hits = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 5) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  hits.set(ip, [...recent, now]);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your name and email." }, { status: 400 });
  const d = parsed.data;

  // Bots fill the hidden field or submit instantly. Pretend success, store as spam.
  const spam = !!d.website || (d.elapsed !== undefined && d.elapsed < 1500);
  await prisma.enquiry.create({ data: { name: d.name, email: d.email, phone: d.phone, message: d.message, status: spam ? "SPAM" : "NEW" } });
  if (!spam) {
    const s = await getSettings();
    const to = s.contact.enquiryRecipient || s.contact.email;
    if (to) {
      await sendMail({
        to, replyTo: d.email, subject: `New website enquiry from ${d.name}`,
        text: `Name: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone || "-"}\n\n${d.message || "(no message)"}`,
      });
    }
  }
  return NextResponse.json({ ok: true });
}
