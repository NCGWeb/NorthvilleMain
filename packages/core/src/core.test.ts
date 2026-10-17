import { describe, expect, it, vi } from "vitest";

// Database access is not needed for the pure helpers below.
vi.mock("@northville/database", () => ({ prisma: {} }));

import { cleanHtml, slugify, whatsappUrl, readingMinutes } from "./text";
import { signPreviewToken, verifyPreviewToken } from "./preview";

describe("cleanHtml", () => {
  it("removes scripts and event handlers", () => {
    const out = cleanHtml('<p onclick="x()">Hi</p><script>alert(1)</script><img src="/a.png" onerror="x()" alt="A">');
    expect(out).not.toMatch(/script|onclick|onerror/);
    expect(out).toContain('alt="A"');
  });
  it("blocks javascript: links and adds rel to links", () => {
    expect(cleanHtml('<a href="javascript:alert(1)">x</a>')).not.toMatch(/javascript:/);
    expect(cleanHtml('<a href="https://example.com">x</a>')).toMatch(/rel="noopener noreferrer"/);
  });
});

describe("text helpers", () => {
  it("makes web-safe slugs", () => expect(slugify("Tax & Compliance Services!")).toBe("tax-and-compliance-services"));
  it("builds WhatsApp links", () => expect(whatsappUrl("+91 76785 58902", "Hi there")).toBe("https://wa.me/917678558902?text=Hi%20there"));
  it("never reports under one minute of reading", () => expect(readingMinutes("<p>short</p>")).toBe(1));
});

describe("preview links", () => {
  it("accepts a fresh link for the same page only", () => {
    const t = signPreviewToken("page-1");
    expect(verifyPreviewToken("page-1", t)).toBe(true);
    expect(verifyPreviewToken("page-2", t)).toBe(false);
  });
  it("rejects missing, tampered and expired links", () => {
    expect(verifyPreviewToken("page-1", undefined)).toBe(false);
    expect(verifyPreviewToken("page-1", (() => { const t = signPreviewToken("page-1"); return t.slice(0, -1) + (t.endsWith("a") ? "b" : "a"); })())).toBe(false);
    expect(verifyPreviewToken("page-1", signPreviewToken("page-1", -1))).toBe(false);
  });
});
