import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("@northville/database", () => ({ prisma: {} }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("next/navigation", () => ({ redirect: () => { throw new Error("redirect"); } }));

import { cleanValues, missingRequired, normalizeRow } from "./collection";

describe("cleanValues", () => {
  it("trims text, fixes bare web addresses and builds a slug from the name", () => {
    const out = cleanValues(
      [
        { kind: "text", name: "name", label: "Name" },
        { kind: "url", name: "link", label: "Link" },
        { kind: "slug", name: "slug", label: "Address", from: "name" },
      ],
      { name: "  Virtual CFO ", link: "linkedin.com/in/x", slug: "" },
    );
    expect(out).toEqual({ name: "Virtual CFO", link: "https://linkedin.com/in/x", slug: "virtual-cfo" });
  });
  it("keeps site paths, mailto and tel links as typed", () => {
    const f = [{ kind: "url" as const, name: "u", label: "U" }];
    expect(cleanValues(f, { u: "/contact" }).u).toBe("/contact");
    expect(cleanValues(f, { u: "mailto:a@b.com" }).u).toBe("mailto:a@b.com");
  });
  it("falls back to the default for an unknown select value", () => {
    const f = [{ kind: "select" as const, name: "s", label: "S", options: [{ value: "A", label: "A" }, { value: "B", label: "B" }], default: "B" }];
    expect(cleanValues(f, { s: "DROP TABLE" }).s).toBe("B");
  });
  it("strips scripts from rich text", () => {
    expect(String(cleanValues([{ kind: "richtext", name: "b", label: "B" }], { b: "<p>ok</p><script>x</script>" }).b)).not.toMatch(/script/);
  });
});

describe("required fields and redirects", () => {
  it("asks for a missing required field by its label", () => {
    expect(missingRequired([{ kind: "text", name: "t", label: "Title", required: true }], { t: "" })).toBe('Please fill in "Title".');
  });
  it("normalises redirect addresses", () => {
    const d: Record<string, unknown> = { fromPath: "old-page/", toPath: "services" };
    normalizeRow("redirects", d);
    expect(d).toEqual({ fromPath: "/old-page", toPath: "/services" });
  });
});

/** Rule from CLAUDE.md: every admin API route checks permission with apiUser. */
describe("admin API routes", () => {
  const OPEN = ["auth/login", "auth/logout"];
  const files: string[] = [];
  const walk = (dir: string) => { for (const n of readdirSync(dir)) { const p = path.join(dir, n); statSync(p).isDirectory() ? walk(p) : n === "route.ts" && files.push(p); } };
  walk(path.resolve(__dirname, "../api"));
  it("finds the routes", () => expect(files.length).toBeGreaterThan(10));
  it.each(files.map((f) => [path.relative(path.resolve(__dirname, "../api"), f), f]))("%s checks permission", (rel, file) => {
    if (OPEN.some((o) => String(rel).startsWith(o))) return;
    expect(readFileSync(file, "utf8")).toMatch(/apiUser\(/);
  });
});
