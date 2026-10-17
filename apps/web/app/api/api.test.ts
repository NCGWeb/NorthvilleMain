import { beforeEach, describe, expect, it, vi } from "vitest";

const { create, update, sendMail } = vi.hoisted(() => ({
  create: vi.fn(async (_a?: unknown) => ({ id: "e1" })),
  update: vi.fn(async (_a?: unknown) => ({})),
  sendMail: vi.fn(async (): Promise<"sent" | "failed" | "skipped"> => "sent"),
}));

vi.mock("@northville/database", () => ({ prisma: { enquiry: { create, update } } }));
vi.mock("@northville/core", () => ({
  getSettings: async () => ({ contact: { enquiryRecipient: "team@example.com", email: "info@example.com" } }),
  sendMail,
  getChatProvider: () => ({ reply: async () => ({ text: "hi", matched: true, suggestions: [] }) }),
  logChatQuestion: async () => {},
}));

import { POST as enquiry } from "./enquiry/route";
import { POST as chat } from "./chat/route";

const post = (body: unknown, ip = "1.1.1.1") => new Request("http://x/api", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": ip }, body: JSON.stringify(body) });
const good = { name: "Asha", email: "asha@example.com", phone: "", message: "Hello", elapsed: 9000 };

beforeEach(() => { create.mockClear(); update.mockClear(); sendMail.mockReset(); sendMail.mockResolvedValue("sent"); });

describe("enquiry route", () => {
  it("rejects a bad email", async () => expect((await enquiry(post({ ...good, email: "nope" }, "2.2.2.1"))).status).toBe(400));
  it("saves the enquiry and emails the team", async () => {
    expect((await enquiry(post(good, "2.2.2.2"))).status).toBe(200);
    expect(create).toHaveBeenCalledOnce();
    expect(sendMail).toHaveBeenCalledOnce();
    expect(update).not.toHaveBeenCalled();
  });
  it("records when the email could not be sent", async () => {
    sendMail.mockResolvedValue("failed");
    await enquiry(post(good, "2.2.2.3"));
    expect(update).toHaveBeenCalledWith({ where: { id: "e1" }, data: { emailStatus: "failed" } });
  });
  it("treats a filled honeypot as spam and sends no email", async () => {
    await enquiry(post({ ...good, website: "http://spam" }, "2.2.2.4"));
    expect(create.mock.calls[0]).toMatchObject([{ data: { status: "SPAM" } }]);
    expect(sendMail).not.toHaveBeenCalled();
  });
  it("limits one address to 5 messages in 10 minutes", async () => {
    for (let i = 0; i < 5; i++) await enquiry(post(good, "2.2.2.5"));
    expect((await enquiry(post(good, "2.2.2.5"))).status).toBe(429);
  });
});

describe("chat route", () => {
  it("answers a question", async () => expect((await chat(post({ message: "fees?" }, "3.3.3.1"))).status).toBe(200));
  it("rejects an empty or oversized message", async () => {
    expect((await chat(post({ message: "  " }, "3.3.3.2"))).status).toBe(400);
    expect((await chat(post({ message: "x".repeat(301) }, "3.3.3.3"))).status).toBe(400);
  });
});
