import { notFound, permanentRedirect } from "next/navigation";
import { getAllPageSlugs, getPage, getRedirect } from "@northville/core";
import { BlockRenderer } from "../_components/blocks";
import { JsonLd } from "../_components/JsonLd";
import { buildMetadata, breadcrumbLd } from "../_lib/site";

// Pages are built once, then refreshed the moment an editor publishes (see /api/revalidate).
// The hourly fallback also lets scheduled blog posts go live.
export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ slug?: string[] }> };
const toSlug = (s?: string[]) => (s ?? []).join("/");

export async function generateStaticParams() {
  const pages = await getAllPageSlugs();
  return pages.map((p) => ({ slug: p.slug ? p.slug.split("/") : [] }));
}

export async function generateMetadata({ params }: Props) {
  const slug = toSlug((await params).slug);
  const page = await getPage(slug);
  if (!page) return {};
  return buildMetadata({ title: page.seoTitle || page.title, description: page.seoDescription, path: slug ? `/${slug}` : "/", image: page.seoImageUrl });
}

export default async function CmsPage({ params }: Props) {
  const slug = toSlug((await params).slug);
  const page = await getPage(slug);
  if (!page) {
    // Old Wix address? Send it to its new home with a permanent redirect so rankings carry over.
    const r = await getRedirect(`/${slug}`);
    if (r) permanentRedirect(r.toPath);
    notFound();
  }
  const crumbs = slug ? [{ name: "Home", path: "/" }, { name: page.title, path: `/${slug}` }] : [];
  return (
    <>
      <BlockRenderer blocks={page.blocks} />
      {crumbs.length > 0 && <JsonLd data={breadcrumbLd(crumbs)} />}
    </>
  );
}
