import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cleanHtml, getPost, getPosts, getRelatedPosts, getSettings, readingMinutes } from "@northville/core";
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
  const html = cleanHtml(post.body);
  const mins = readingMinutes(post.body);
  const ld = [
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "Insights", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }]),
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
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/60"><Link href="/blog" className="hover:text-white">Insights</Link>{post.category && <> / <Link href={`/blog/category/${post.category.slug}`} className="hover:text-white">{post.category.name}</Link></>}</nav>
          <h1 className="max-w-3xl text-balance text-3xl leading-[1.15] sm:text-4xl md:text-[2.75rem]">{post.title}</h1>
          <p className="mt-6 text-sm text-white/65">{[post.author?.name, dateFmt(post.publishedAt), `${mins} min read`].filter(Boolean).join(" · ")}</p>
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
          <aside className="mt-14 flex items-start gap-4 rounded-none border border-line bg-mist p-6">
            <div><p className="text-xs font-semibold  text-royal">Written by</p><p className="font-serif text-xl text-navy">{post.author.name}</p>{post.author.bio && <p className="mt-1 text-sm text-muted">{post.author.bio}</p>}</div>
          </aside>
        )}
      </article>
      {related.length > 0 && (
        <Section tone="mist">
          <h2 className="mb-6 text-xl text-navy">Keep reading</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`} className="rounded-none border border-line bg-white p-6 transition ">
                <p className="text-xs font-semibold  text-royal">{r.category?.name ?? "Insights"}</p>
                <h3 className="mt-2 text-lg text-navy group-hover:text-royal">{r.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{r.excerpt}</p>
              </Link>
            ))}
          </div>
          <div className="mt-10"><Button href="/blog" variant="outline">All insights</Button></div>
        </Section>
      )}
      <JsonLd data={ld} />
      <p className="sr-only">{s.general.siteName}</p>
    </>
  );
}
