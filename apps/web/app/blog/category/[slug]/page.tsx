import { notFound } from "next/navigation";
import { getCategories, getPage, getPosts, getSettings } from "@northville/core";
import { BlockRenderer } from "../../../_components/blocks";
import { buildMetadata } from "../../../_lib/site";

export const revalidate = 3600;
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

const headingFor = (c: { name: string; heading: string }, prefix: string) => c.heading || `${prefix} ${c.name}`;

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [cats, s] = await Promise.all([getCategories(), getSettings()]);
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) return {};
  const hasPosts = (await getPosts({ take: 1, categorySlug: cat.slug })).length > 0; // thin pages stay out of Google until they have articles
  return buildMetadata({
    noindex: !hasPosts, title: headingFor(cat, s.text.categoryHeadingPrefix),
    description: cat.description || `Practical articles on ${cat.name.toLowerCase()} from the Northville Consulting team, written for founders and growing businesses.`,
    path: `/blog/category/${cat.slug}`,
  });
}

/** The blog page, filtered to one category. Same blocks, so editors change the layout in one place. */
export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [page, cats, s] = await Promise.all([getPage("blog"), getCategories(), getSettings()]);
  const cat = cats.find((c) => c.slug === slug);
  if (!page || !cat) notFound();
  return <BlockRenderer blocks={page.blocks} category={slug} heading={headingFor(cat, s.text.categoryHeadingPrefix)} intro={cat.description} />;
}
