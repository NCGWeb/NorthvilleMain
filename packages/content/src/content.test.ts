import { describe, expect, it } from "vitest";
import { ACTIONS, AREAS, BLOCKS, COLLECTIONS, DEFAULT_ROLES, resolveRedirect, resolveTitle, SETTING_GROUPS, UI_TEXT, type Field } from "./index";

const seo = { titleSuffix: "| Northville Consulting Group", shortSuffix: "| Northville" };

describe("resolveTitle", () => {
  it("leaves the home title alone", () => expect(resolveTitle("Northville", "/", seo)).toBe("Northville"));
  it("adds the full ending when it fits", () => expect(resolveTitle("About us", "/about", seo)).toBe("About us | Northville Consulting Group"));
  it("falls back to the short ending when the full one is too long", () => {
    const t = "Virtual CFO services for growing companies";
    expect(resolveTitle(t, "/services/virtual-cfo", seo)).toBe(`${t} | Northville`);
  });
  it("drops the ending when even the short one does not fit", () => {
    const t = "A very long title that already uses almost every character allowed in a result";
    expect(resolveTitle(t, "/x", seo)).toBe(t);
  });
});

describe("resolveRedirect", () => {
  const table = { "/what-we-do": "/services", "/Old-Page": "/about" };
  it("follows a listed redirect, ignoring a trailing slash", () => expect(resolveRedirect("/what-we-do/", table)).toBe("/services"));
  it("matches case-insensitively as a fallback", () => expect(resolveRedirect("/old-page", table)).toBe("/about"));
  it("maps old Wix blog posts", () => expect(resolveRedirect("/post/my-article", table)).toBe("/blog/my-article"));
  it("ignores unknown addresses and self redirects", () => {
    expect(resolveRedirect("/contact", table)).toBeNull();
    expect(resolveRedirect("/same", { "/same": "/same" })).toBeNull();
  });
});

describe("CMS definitions", () => {
  const walk = (fields: Field[], out: Field[] = []): Field[] => {
    for (const f of fields) { out.push(f); if (f.kind === "list") walk(f.fields, out); }
    return out;
  };
  it("gives every field a plain-language label", () => {
    const all = [...BLOCKS.flatMap((b) => walk(b.fields)), ...COLLECTIONS.flatMap((c) => walk(c.fields)), ...SETTING_GROUPS.flatMap((g) => walk(g.fields))];
    expect(all.length).toBeGreaterThan(100);
    for (const f of all) expect(f.label.trim(), `field ${f.name}`).not.toBe("");
  });
  it("uses unique collection keys that point at real permission areas", () => {
    const keys = COLLECTIONS.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    const areas = new Set<string>(AREAS.map((a) => a.key));
    for (const c of COLLECTIONS) expect(areas.has(c.area), c.key).toBe(true);
  });
  it("has a unique name for every editable wording", () => {
    const names = UI_TEXT.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
  it("never grants a default role a permission that does not exist", () => {
    const valid = new Set(AREAS.flatMap((a) => ACTIONS.map((x) => `${a.key}:${x.key}`)));
    for (const r of DEFAULT_ROLES) for (const p of r.permissions) expect(valid.has(p), `${r.name} ${p}`).toBe(true);
  });
  it("keeps the Editor role away from user management and settings changes", () => {
    const editor = DEFAULT_ROLES.find((r) => r.name === "Editor")!;
    expect(editor.permissions).not.toContain("users:edit");
    expect(editor.permissions).not.toContain("settings:edit");
    expect(editor.permissions).toContain("pages:edit");
  });
});
