import { getCaseStudies, getCaseStudyDomains, getSettings } from "@northville/core";
import { Section, SectionHead, TextLink } from "../ui";
import { CaseCardView, CaseStudiesBrowser, type CaseCard } from "./CaseStudiesBrowser";
import { Reveal } from "../Reveal";
import { str, type BlockProps } from "./types";

export const toCard = (c: Awaited<ReturnType<typeof getCaseStudies>>[number]): CaseCard => ({
  id: c.id, slug: c.slug, clientName: c.clientName, industry: c.industry, metricValue: c.metricValue, metricLabel: c.metricLabel, summary: c.summary, coverUrl: c.coverUrl,
  domainIds: [c.domainId, c.alsoDomainId].filter((x): x is string => !!x),
  domainNames: [c.domain?.name, c.alsoDomain?.name].filter((x): x is string => !!x),
});

export async function CaseStudies({ data }: BlockProps) {
  const featured = str(data.mode) === "featured";
  const count = Number(data.count) || 3;
  const [studies, domains, s] = await Promise.all([getCaseStudies(featured ? { featured: true, take: count } : {}), getCaseStudyDomains(), getSettings()]);
  // A featured strip on another page stays hidden until there is something to show.
  if (featured && studies.length === 0) return null;
  const cards = studies.map(toCard);
  return (
    <Section>
      <SectionHead heading={str(data.heading)} intro={str(data.intro)} />
      {cards.length === 0 ? (
        <p className="border-y border-line py-8 text-lg text-muted">{s.text.caseEmpty}</p>
      ) : featured ? (
        <>
          <ul className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c, i) => <li key={c.id}><Reveal delay={(i % 3) * 110} className="h-full"><CaseCardView c={c} read={s.text.caseRead} /></Reveal></li>)}
          </ul>
          <div className="mt-12"><TextLink href="/case-studies">{s.text.caseAllStudies}</TextLink></div>
        </>
      ) : (
        <CaseStudiesBrowser cards={cards} tabs={domains.map((d) => ({ id: d.id, name: d.name }))} allLabel={s.text.caseAll} filterLabel={s.text.caseFilterLabel} read={s.text.caseRead} />
      )}
    </Section>
  );
}
