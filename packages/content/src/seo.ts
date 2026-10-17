/** Longest title Google shows in full, in characters. */
export const TITLE_LIMIT = 65;

/**
 * The exact title a page ends up with. The website and the admin preview both call this, so what an editor sees
 * is what Google gets: the full brand ending if it fits, else the short ending, else the bare title.
 */
export function resolveTitle(title: string, path: string, seo: { titleSuffix: string; shortSuffix: string }): string {
  if (path === "/") return title;
  const full = `${title} ${seo.titleSuffix}`.trim();
  if (full.length <= TITLE_LIMIT) return full;
  const short = `${title} ${seo.shortSuffix}`.trim();
  return short.length <= TITLE_LIMIT ? short : title;
}
