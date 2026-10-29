import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { altFor, getCaseStudies, getCaseStudy, getSettings, getSharedBlock } from "@northville/core";
import { BlockRenderer } from "../../_components/blocks";
import { toCard } from "../../_components/blocks/CaseStudies";
import { CaseCardView } from "../../_components/blocks/CaseStudiesBrowser";
import { JsonLd } from "../../_components/JsonLd";
import { Metric } from "../../_components/Metric";
import { Reveal } from "../../_components/Reveal";
import { Button, Section } from "../../_components/ui";
import { abs, breadcrumbLd, buildMetadata } from "../../_lib/site";

export const revalidate = 3600;
type Props = { params: Promise<{ slug: string }> };
type Step = { title?: string; body?: string };
type Stat = Record<string, unknown>;

const paras = (t: string) => t.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

export async function generateStaticParams() {
  return (await getCaseStudies()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const c = await getCaseStudy((await params).slug);
  if (!c) return {};
  return buildMetadata({ title: c.seoTitle || `${c.clientName} Case Study`, description: c.seoDescription || c.summary, path: `/case-studies/${c.slug}`, image: c.coverUrl });
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const [c, all, s] = await Promise.all([getCaseStudy(slug), getCaseStudies(), getSettings()]);
  if (!c) notFound();
  const contactStrip = s.general.servicePageCta ? await getSharedBlock(s.general.servicePageCta) : null;
  const steps = ((c.approach as Step[]) ?? []).filter((x) => x.title);
  const stats = ((c.stats as Stat[]) ?? []).filter((x) => x.value && x.label);
  const mainAlt = await altFor(c.coverUrl, "", `${c.clientName} case study`);
  const phoneAlt = await altFor(c.mobileUrl, "", `${c.clientName} ${s.text.casePhoneAlt}`);
  // More work: same area first, then the rest.
  const mine = [c.domainId, c.alsoDomainId];
  const others = all.filter((x) => x.id !== c.id);
  const more = [...others.filter((x) => mine.includes(x.domainId) || mine.includes(x.alsoDomainId)), ...others.filter((x) => !mine.includes(x.domainId) && !mine.includes(x.alsoDomainId))].slice(0, 3);
  const meta = [c.domain?.name, c.alsoDomain?.name].filter(Boolean).join("  |  ");
  const ld = breadcrumbLd([{ name: "Home", path: "/" }, { name: s.text.caseCrumb, path: "/case-studies" }, { name: c.clientName, path: `/case-studies/${c.slug}` }]);

  return (
    <>
      <header className="mesh relative overflow-hidden pt-16 text-white">
        <div className="hero-in relative mx-auto w-full max-w-[1120px] px-6 pb-14 pt-14 lg:px-8 md:pb-20">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/60">
            <Link href="/" className="hover:text-white">{s.text.crumbHome}</Link> / <Link href="/case-studies" className="hover:text-white">{s.text.caseCrumb}</Link>
            {c.domain && <> / <span>{c.domain.name}</span></>}
          </nav>
          <h1 className="max-w-4xl text-balance text-3xl leading-[1.1] sm:text-4xl md:text-5xl">{c.clientName}</h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-white/80">{c.summary}</p>
          <div className="mt-10 border-t border-white/25 pt-6">
            {c.metricValue && (
              <>
                <p className="font-sans text-6xl font-semibold leading-none tracking-tight sm:text-7xl md:text-8xl"><Metric value={c.metricValue} /></p>
                {c.metricLabel && <p className="mt-4 font-sans text-lg text-sky">{c.metricLabel}</p>}
              </>
            )}
            {(meta || c.industry) && <p className={`text-sm text-white/60 ${c.metricValue ? "mt-6" : ""}`}>{[meta, c.industry && `${s.text.caseIndustry}: ${c.industry}`].filter(Boolean).join("  |  ")}</p>}
          </div>
        </div>
      </header>

      {c.coverUrl && (
        <Section tone="mist" className="[&>div]:py-10 md:[&>div]:py-14">
          <Reveal variant="zoom">
            <div className={`grid items-end gap-6 ${c.mobileUrl ? "md:grid-cols-12" : ""}`}>
              <div className={`relative aspect-[16/9] overflow-hidden border border-line bg-white ${c.mobileUrl ? "md:col-span-9" : ""}`}>
                <Image src={c.coverUrl} alt={mainAlt} fill priority sizes="(min-width:1120px) 840px, 100vw" className="object-cover object-top" />
              </div>
              {c.mobileUrl && (
                <div className="relative mx-auto aspect-[9/19] w-1/2 max-w-[220px] overflow-hidden border border-line bg-white md:col-span-3 md:w-full">
                  <Image src={c.mobileUrl} alt={phoneAlt} fill sizes="220px" className="object-cover object-top" />
                </div>
              )}
            </div>
          </Reveal>
        </Section>
      )}

      {stats.length > 0 && (
        <Section>
          <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((st, i) => (
              <Reveal key={i} delay={i * 110} className="border-t-2 border-royal pt-4">
                <dd className="font-sans text-4xl font-semibold leading-none tracking-tight text-navy sm:text-5xl"><Metric value={`${st.prefix ?? ""}${st.value}${st.suffix ?? ""}`} /></dd>
                <dt className="mt-3 font-sans text-[15px] text-steel">{String(st.label)}</dt>
              </Reveal>
            ))}
          </dl>
        </Section>
      )}

      {c.challenge && (
        <Section>
          <Reveal>
            <div className="grid gap-4 border-t border-navy pt-6 md:grid-cols-12 md:gap-10">
              <h2 className="text-[1.75rem] leading-[1.2] text-navy sm:text-[2rem] md:col-span-4">{s.text.caseChallenge}</h2>
              <div className="space-y-4 text-[1.0625rem] leading-relaxed text-ink/85 md:col-span-8">{paras(c.challenge).map((p, i) => <p key={i}>{p}</p>)}</div>
            </div>
          </Reveal>
        </Section>
      )}

      {steps.length > 0 && (
        <Section tone="mist">
          <div className="grid gap-4 border-t border-navy pt-6 md:grid-cols-12 md:gap-10">
            <h2 className="text-[1.75rem] leading-[1.2] text-navy sm:text-[2rem] md:col-span-4">{s.text.caseApproach}</h2>
            <Reveal variant="fade" className="md:col-span-8">
              <ol className="relative space-y-10">
                <span aria-hidden className="case-rail absolute bottom-3 left-[1.1rem] top-3 w-px bg-navy/25" />
                {steps.map((st, i) => (
                  <li key={i} className="relative flex gap-6">
                    <span className="relative z-10 flex size-9 shrink-0 items-center justify-center bg-navy font-sans text-sm font-semibold text-white">{i + 1}</span>
                    <div>
                      <h3 className="text-xl text-navy">{st.title}</h3>
                      {st.body && <p className="mt-2 leading-relaxed text-ink/85">{st.body}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </Section>
      )}

      {c.results && (
        <Section>
          <Reveal>
            <div className="grid gap-4 border-t border-navy pt-6 md:grid-cols-12 md:gap-10">
              <h2 className="text-[1.75rem] leading-[1.2] text-navy sm:text-[2rem] md:col-span-4">{s.text.caseResults}</h2>
              <div className="md:col-span-8">
                <div className="space-y-4 text-[1.0625rem] leading-relaxed text-ink/85">{paras(c.results).map((p, i) => <p key={i}>{p}</p>)}</div>
                {(c.service || c.websiteUrl) && (
                  <div className="mt-8 flex flex-wrap gap-3">
                    {c.service && <Button href={`/services/${c.service.slug}`}>{s.text.caseService} {c.service.name}</Button>}
                    {c.websiteUrl && <Button href={c.websiteUrl} variant="outline">{s.text.caseVisit}</Button>}
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </Section>
      )}

      {c.testimonial && (
        <Section tone="navy">
          <Reveal>
            <figure className="mx-auto max-w-3xl">
              <blockquote className="font-serif text-2xl leading-snug sm:text-3xl">&ldquo;{c.testimonial.quote}&rdquo;</blockquote>
              <figcaption className="mt-6 text-white/75">{[c.testimonial.authorName, c.testimonial.authorRole, c.testimonial.company].filter(Boolean).join(", ")}</figcaption>
            </figure>
          </Reveal>
        </Section>
      )}

      {more.length > 0 && (
        <Section tone="mist">
          <h2 className="mb-8 border-b border-navy pb-3 text-[1.75rem] leading-[1.2] text-navy sm:text-[2rem]">{s.text.caseMore}</h2>
          <ul className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((m, i) => <li key={m.id}><Reveal delay={i * 110} className="h-full"><CaseCardView c={toCard(m)} read={s.text.caseRead} /></Reveal></li>)}
          </ul>
          <div className="mt-12"><Button href="/case-studies" variant="outline">{s.text.caseAllStudies}</Button></div>
        </Section>
      )}

      {contactStrip && <BlockRenderer blocks={[{ id: "s", type: contactStrip.type, data: contactStrip.data }]} />}
      <JsonLd data={ld} />
    </>
  );
}
