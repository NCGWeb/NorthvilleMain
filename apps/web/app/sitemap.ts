import type { MetadataRoute } from "next";
import { getAllPageSlugs, getCategories, getPosts, getServices } from "@northville/core";
import { abs } from "./_lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, services, posts, cats] = await Promise.all([getAllPageSlugs(), getServices(), getPosts(), getCategories()]);
  return [
    // Pages marked "hide from Google", and an Insights page with no articles yet, stay out of the sitemap.
    ...pages.filter((p) => !p.noindex && !(p.slug === "blog" && posts.length === 0)).map((p) => ({ url: abs(p.slug ? `/${p.slug}` : "/"), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: p.slug === "" ? 1 : 0.7 })),
    ...services.map((s) => ({ url: abs(`/services/${s.slug}`), lastModified: s.updatedAt, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...posts.map((p) => ({ url: abs(`/blog/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "yearly" as const, priority: 0.6 })),
    ...cats.filter((c) => posts.some((p) => p.categoryId === c.id)).map((c) => ({ url: abs(`/blog/category/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.4 })),
  ];
}
