/** Patterns for old address shapes that are not listed one by one: Wix blog posts lived at /post/<slug>. */
const PATTERNS: [RegExp, (m: RegExpExecArray) => string][] = [
  [/^\/post\/([^/]+)$/, (m) => `/blog/${m[1]}`],
  [/^\/blog-1\/([^/]+)$/, (m) => `/blog/${m[1]}`],
];

/** Where an old address should go, or null when it is not an old address. `table` maps old address to new address. */
export function resolveRedirect(rawPath: string, table: Record<string, string>): string | null {
  const path = rawPath.replace(/\/+$/, "") || "/";
  const lower = path.toLowerCase();
  const hit = table[path] ?? table[Object.keys(table).find((k) => k.toLowerCase() === lower) ?? ""];
  if (hit) return hit === path ? null : hit;
  for (const [re, to] of PATTERNS) {
    const m = re.exec(path);
    if (m) return to(m);
  }
  return null;
}
