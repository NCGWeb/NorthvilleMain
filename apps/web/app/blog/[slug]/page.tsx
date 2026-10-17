import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { altFillHtml, cleanHtml, getPost, getPosts, getRelatedPosts, getSettings, readingMinutes } from "@northville/core";
import { dateFmt } from "../../_components/blocks/BlogList";
import { JsonLd } from "../../_components/JsonLd";
import { Button, Section } from "../../_components/ui";
import { abs, breadcrumbLd, buildMetadata } from "../../_lib/site";

export const revalidate = 3600;
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const p = await getPost((await params).slug);
  if (!p) return {};
  return buildMetadata({ title: p.seoTitle || p.title, description: p.seoDescription || p.excerpt, path: `/blog/${p.slug}`, image: p.coverUrl, type: "article", publishedTime: p.publishedAt?.toISOString() });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const [related, s] = await Promise.all([getRelatedPosts(post.id, post.categoryId), getSettings()]);
  const html = await altFillHtml(cleanHtml(post.body));
  const mins = readingMinutes(post.body);
  const ld = [
    breadcrumbLd([{ name: "Home", path: "/" }, { name: s.text.blogInsights, path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }]),
    {
      "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.excerpt,
      image: post.coverUrl ? [abs(post.coverUrl)] : undefined, datePublished: post.publishedAt?.toISOString(), dateModified: post.updatedAt.toISOString(),
      author: post.author ? { "@type": "Person", name: post.author.name } : { "@id": abs("/#org") },
      publisher: { "@id": abs("/#org") }, mainEntityOfPage: abs(`/blog/${post.slug}`),
    },
  ];
  return (
    <>
      <header className="mesh pt-16 text-white">
        <div className="mx-auto max-w-[760px] px-6 pb-12 pt-14 lg:px-8 md:pb-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/60"><Link href="/blog" className="hover:text-white">{s.text.blogInsights}</Link>{post.category && <> / <Link href={`/blog/category/${post.category.slug}`} className="hover:text-white">{post.category.name}</Link></>}</nav>
          <h1 className="max-w-3xl text-balance text-3xl leading-[1.15] sm:text-4xl md:text-[2.75rem]">{post.title}</h1>
          <p className="mt-6 text-sm text-white/65">{[post.author?.name, dateFmt(post.publishedAt), `${mins} ${s.text.blogMinRead}`].filter(Boolean).join(" · ")}</p>
        </div>
      </header>
      <article className="mx-auto max-w-[760px] px-6 py-12 lg:px-8 md:py-14">
        {post.coverUrl && (
          <div className="relative -mt-24 mb-12 aspect-[16/9] overflow-hidden rounded-none md:-mt-32">
            <Image src={post.coverUrl} alt={post.title} fill priority sizes="(min-width:768px) 768px, 100vw" className="object-cover" />
          </div>
        )}
        <div className="prose-nv" dangerouslySetInnerHTML={{ __html: html }} />
        {post.author && (
          <aside className="mt-14 border-y border-line py-6">
            <p className="font-sans text-sm font-medium text-royal">{s.text.blogWrittenBy}</p><p className="mt-1 font-sans text-xl font-semibold text-navy">{post.author.name}</p>{post.author.bio && <p className="mt-1 text-sm text-muted">{post.author.bio}</p>}
          </aside>
        )}
      </article>
      {related.length > 0 && (
        <Section tone="mist">
          <h2 className="mb-6 border-b border-navy pb-3 text-[1.75rem] leading-[1.2] text-navy sm:text-[2rem]">{s.text.blogKeepReading}</h2>
          <ul className="divide-y divide-line">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/blog/${r.slug}`} className="group block py-6">
                  <p className="text-sm font-medium text-royal">{r.category?.name ?? s.text.blogInsights}</p>
                  <h3 className="mt-1 text-xl text-navy group-hover:text-royal">{r.title}</h3>
                  <p className="mt-2 line-clamp-2 text-[15px] text-muted">{r.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-10"><Button href="/blog" variant="outline">{s.text.blogAllInsights}</Button></div>
        </Section>
      )}
      <JsonLd data={ld} />
    </>
  );
}
