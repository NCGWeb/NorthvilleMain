import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getServiceGroups } from "@northville/core";
import { Reveal } from "../Reveal";
import { Section, SectionHead, TextLink } from "../ui";
import { str, type BlockProps } from "./types";

/** One block, two layouts. The text always comes from the Services list. */
export async function ServicesOverview({ data }: BlockProps) {
  const groups = (await getServiceGroups()).filter((g) => g.services.length > 0);
  const detailed = str(data.layout) === "detailed";
  return (
    <Section tone={detailed ? "white" : "mist"}>
      <SectionHead heading={str(data.heading)} intro={str(data.intro)} />
      {detailed ? (
        <div className="space-y-16">
          {groups.map((g) => (
            <Reveal key={g.id}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 border-b border-navy pb-3">
                <h2 className="text-xl text-navy">{g.name}</h2>
                {g.blurb && <p className="text-[15px] text-muted">{g.blurb}</p>}
              </div>
              <ul className="divide-y divide-line">
                {g.services.map((s) => (
                  <li key={s.id}>
                    <Link href={`/services/${s.slug}`} className="group grid gap-6 py-8 md:grid-cols-12">
                      <div className="relative aspect-[4/3] overflow-hidden bg-mist md:col-span-4">
                        {s.imageUrl && <Image src={s.imageUrl} alt={s.name} fill sizes="(min-width:768px) 360px, 100vw" className="object-cover" />}
                      </div>
                      <div className="md:col-span-8">
                        <h3 className="text-xl text-navy group-hover:text-royal">{s.name}</h3>
                        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink/80">{s.summary}</p>
                        {s.offerings.length > 0 && <p className="mt-3 max-w-xl text-sm text-muted">{s.offerings.map((o) => o.title).join("  |  ")}</p>}
                        <span className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-semibold text-royal">Learn more <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden /></span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-line">
            {groups.map((g) => (
              <div key={g.id} className="lg:px-7 lg:first:pl-0 lg:last:pr-0">
                <h3 className="border-b border-navy pb-3 text-lg text-navy">{g.name}</h3>
                {g.blurb && <p className="mt-3 text-[15px] leading-relaxed text-muted">{g.blurb}</p>}
                <ul className="mt-4 space-y-2.5">
                  {g.services.map((s) => (
                    <li key={s.id}><Link href={`/services/${s.slug}`} className="text-[15px] text-ink hover:text-royal">{s.name}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10"><TextLink href="/services">See all services</TextLink></div>
        </Reveal>
      )}
    </Section>
  );
}
