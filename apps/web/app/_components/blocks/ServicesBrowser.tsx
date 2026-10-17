"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "../Reveal";
import { WRAP } from "../ui";

export type BrowserGroup = {
  id: string;
  name: string;
  blurb: string;
  services: { id: string; slug: string; name: string; summary: string; imageUrl: string | null; offerings: string[] }[];
};

/** The detailed services list with filter pills, so a visitor can jump to a theme without scrolling the whole page. */
export function ServicesBrowser({ groups, learnMore, allLabel, filterLabel }: { groups: BrowserGroup[]; learnMore: string; allLabel: string; filterLabel: string }) {
  const [active, setActive] = useState<string>("all");
  const shown = active === "all" ? groups : groups.filter((g) => g.id === active);
  const total = groups.reduce((n, g) => n + g.services.length, 0);

  const pill = (on: boolean) =>
    `shrink-0 rounded-sm border px-4 py-2 font-sans text-sm font-semibold transition-colors ${on ? "border-navy bg-navy text-white" : "border-line bg-white text-ink hover:border-royal hover:text-royal"}`;

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-6 border-b border-line bg-white/95 backdrop-blur lg:-mx-8">
        <div className={`${WRAP} !max-w-none`}>
          <div role="group" aria-label={filterLabel} className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button type="button" aria-pressed={active === "all"} onClick={() => setActive("all")} className={pill(active === "all")}>{allLabel} ({total})</button>
            {groups.map((g) => (
              <button key={g.id} type="button" aria-pressed={active === g.id} onClick={() => setActive(g.id)} className={pill(active === g.id)}>{g.name} ({g.services.length})</button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-16 pt-10">
        {shown.map((g) => (
          <section key={g.id} aria-label={g.name}>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 border-b border-navy pb-3">
              <h2 className="text-[1.75rem] leading-[1.2] sm:text-[2rem] text-navy">{g.name}</h2>
              {g.blurb && <p className="text-[15px] text-muted">{g.blurb}</p>}
            </div>
            <ul className="divide-y divide-line">
              {g.services.map((s, i) => (
                <li key={s.id}>
                  <Reveal delay={(i % 3) * 80}>
                  <Link href={`/services/${s.slug}`} className="group grid gap-6 py-8 md:grid-cols-12">
                    <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-navy to-royal md:col-span-4 md:aspect-[4/3]">
                      {s.imageUrl && <Image src={s.imageUrl} alt={s.name} fill sizes="(min-width:768px) 360px, 100vw" loading={i < 3 ? "eager" : "lazy"} className="zoom-img object-cover" />}
                    </div>
                    <div className="md:col-span-8">
                      <h3 className="text-xl text-navy group-hover:text-royal">{s.name}</h3>
                      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink/80">{s.summary}</p>
                      {s.offerings.length > 0 && <p className="mt-3 max-w-xl text-sm text-muted">{s.offerings.join("  |  ")}</p>}
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-semibold text-royal">{learnMore} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden /></span>
                    </div>
                  </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
