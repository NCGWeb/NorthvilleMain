import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getServiceGroups, getSettings } from "@northville/core";
import { Reveal } from "../Reveal";
import { Section, SectionHead, TextLink } from "../ui";
import { ServicesBrowser } from "./ServicesBrowser";
import { str, type BlockProps } from "./types";

/** One block, two layouts. The text always comes from the Services list. */
export async function ServicesOverview({ data }: BlockProps) {
  const [allGroups, cfg] = await Promise.all([getServiceGroups(), getSettings()]);
  const groups = allGroups.filter((g) => g.services.length > 0);
  const detailed = str(data.layout) === "detailed";
  return (
    <Section tone={detailed ? "white" : "mist"}>
      <SectionHead heading={str(data.heading)} intro={str(data.intro)} />
      {detailed ? (
        <ServicesBrowser
          learnMore={cfg.text.learnMore}
          allLabel={cfg.text.servicesAll}
          filterLabel={cfg.text.servicesFilterLabel}
          groups={groups.map((g) => ({ id: g.id, name: g.name, blurb: g.blurb, services: g.services.map((sv) => ({ id: sv.id, slug: sv.slug, name: sv.name, summary: sv.summary, imageUrl: sv.imageUrl, offerings: sv.offerings.map((o) => o.title) })) }))}
        />
      ) : (
        <div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-line">
            {groups.map((g, i) => (
              <Reveal key={g.id} delay={i * 110} className="lg:px-7 lg:first:pl-0 lg:last:pr-0">
                <h3 className="border-b border-navy pb-3 text-xl text-navy">{g.name}</h3>
                {g.blurb && <p className="mt-3 text-[15px] leading-relaxed text-muted">{g.blurb}</p>}
                <ul className="mt-4 space-y-2.5">
                  {g.services.map((s) => (
                    <li key={s.id}><Link href={`/services/${s.slug}`} className="text-[15px] text-ink hover:text-royal">{s.name}</Link></li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10" delay={300}><TextLink href="/services">{cfg.text.seeAllServices}</TextLink></Reveal>
        </div>
      )}
    </Section>
  );
}
