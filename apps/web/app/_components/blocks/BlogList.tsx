import Image from "next/image";
import Link from "next/link";
import { getCategories, getPosts, getSettings } from "@northville/core";
import { Reveal } from "../Reveal";
import { Section, SectionHead, TextLink } from "../ui";
import { str, type BlockProps } from "./types";

export const dateFmt = (d: Date | null) => (d ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(d) : "");

export async function BlogList({ data, category }: BlockProps & { category?: string }) {
  const count = Number(data.count) || undefined;
  const [posts, cats, s] = await Promise.all([getPosts({ take: count, categorySlug: category }), getCategories(), getSettings()]);
  // Embedded on another page (a post count is set): stay hidden until there is something to show.
  if (count && posts.length === 0) return null;
  return (
    <Section>
      <SectionHead heading={str(data.heading) || (count ? "" : s.text.insightsHeading)} intro={str(data.intro)} />
      {data.showFilters !== false && cats.length > 0 && (
        <nav aria-label="Categories" className="mb-10 flex flex-wrap gap-2">
          <Link href="/blog" className={`rounded-none px-4 py-1.5 text-sm font-medium ${!category ? "bg-navy text-white" : "bg-mist text-steel hover:bg-sky"}`}>{s.text.blogAll}</Link>
          {cats.map((c) => (
            <Link key={c.id} href={`/blog/category/${c.slug}`} className={`rounded-none px-4 py-1.5 text-sm font-medium ${category === c.slug ? "bg-navy text-white" : "bg-mist text-steel hover:bg-sky"}`}>{c.name}</Link>
          ))}
        </nav>
      )}
      {posts.length === 0 ? (
        <p className="border-y border-line py-8 text-lg text-muted">{s.text.blogEmpty}</p>
      ) : (
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 100}>
            <article className="group">
              <Link href={`/blog/${p.slug}`} className="block">
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-navy to-royal">
                  {p.coverUrl && <Image src={p.coverUrl} alt="" fill sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw" className="zoom-img object-cover" />}
                </div>
                <div className="pt-4">
                  <p className="text-sm font-medium text-royal">{p.category?.name ?? "Insights"} <span className="text-muted">· {dateFmt(p.publishedAt)}</span></p>
                  <h3 className="mt-2 text-xl leading-snug text-navy group-hover:text-royal">{p.title}</h3>
                  <p className="mt-2 line-clamp-3 text-[15px] text-ink/75">{p.excerpt}</p>
                </div>
              </Link>
            </article>
            </Reveal>
          ))}
        </div>
      )}
      {count && posts.length > 0 && <div className="mt-10"><TextLink href="/blog">{s.text.blogAllInsights}</TextLink></div>}
    </Section>
  );
}
