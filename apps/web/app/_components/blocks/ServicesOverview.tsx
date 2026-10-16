import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getServiceGroups } from "@northville/core";
import { Reveal } from "../Reveal";
import { Section, SectionHead } from "../ui";
import { str, type BlockProps } from "./types";

/** One block, two layouts. The text always comes from the Services list. */
export async function ServicesOverview({ data }: BlockProps) {
  const groups = (await getServiceGroups()).filter((g) => g.services.length > 0);
  const detailed = str(data.layout) === "detailed";
  return (
    <Section tone={detailed ? "white" : "mist"}>
      <SectionHead heading={str(data.heading)} intro={str(data.intro)} />
      {detailed ? (
        <div className="space-y-20">
          {groups.map((g) => (
            <div key={g.id}>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-2 border-b border-line pb-4">
                <h2 className="text-3xl text-navy">{g.name}</h2>
                {g.blurb && <p className="max-w-md text-muted">{g.blurb}</p>}
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {g.services.map((s, i) => (
                  <Reveal key={s.id} delay={i * 70}>
                    <Link href={`/services/${s.slug}`} className="group grid h-full overflow-hidden rounded-none border border-line bg-white transition hover:border-royal/40 sm:grid-cols-5">
                      <div className="relative min-h-44 sm:col-span-2">
                        {s.imageUrl && <Image src={s.imageUrl} alt={s.name} fill sizes="(min-width:640px) 20vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
                      </div>
                      <div className="flex flex-col p-6 sm:col-span-3">
                        <h3 className="text-2xl text-navy">{s.name}</h3>
                        <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.summary}</p>
                        {s.offerings.length > 0 && (
                          <ul className="mt-4 flex flex-wrap gap-2">
                            {s.offerings.slice(0, 4).map((o) => (<li key={o.title} className="rounded-none bg-mist px-3 py-1 text-xs font-medium text-steel">{o.title}</li>))}
                          </ul>
                        )}
                        <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-semibold text-royal">Learn more <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden /></span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((g, i) => (
            <Reveal key={g.id} delay={i * 90}>
              <div className="h-full rounded-none border border-line bg-white p-7">
                <h3 className="text-2xl text-navy">{g.name}</h3>
                {g.blurb && <p className="mt-2 text-sm leading-relaxed text-muted">{g.blurb}</p>}
                <ul className="mt-5 divide-y divide-line border-t border-line">
                  {g.services.map((s) => (
                    <li key={s.id}>
                      <Link href={`/services/${s.slug}`} className="group flex items-center justify-between gap-3 py-3 text-[15px] font-medium text-ink transition hover:text-royal">
                        {s.name}
                        <ArrowRight size={15} className="shrink-0 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}
