import type { Metadata } from "next";
import { getSettings } from "@northville/core";
import { resolveTitle } from "@northville/content";

export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`);

type Meta = { title: string; description?: string; path: string; image?: string | null; type?: "website" | "article"; noindex?: boolean; publishedTime?: string };

/** One place builds every page's metadata, so titles, canonicals and sharing cards stay consistent. */
export async function buildMetadata(m: Meta): Promise<Metadata> {
  const s = await getSettings();
  const description = m.description || s.seo.description;
  const image = abs(m.image || s.seo.image || "/seed/brand/og-default.png");
  // Full brand ending if the title still fits in a Google result (about 65 characters), else the short ending.
  const fullTitle = resolveTitle(m.title, m.path, s.seo);
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: abs(m.path) },
    robots: m.noindex ? { index: false, follow: false } : { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      type: m.type ?? "website", url: abs(m.path), siteName: s.general.siteName, title: fullTitle, description,
      images: [{ url: image }], locale: "en_IN",
      ...(m.publishedTime ? { publishedTime: m.publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image] },
  };
}

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
});
