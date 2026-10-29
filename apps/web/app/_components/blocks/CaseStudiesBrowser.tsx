"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Metric } from "../Metric";
import { Reveal } from "../Reveal";

export type CaseCard = {
  id: string; slug: string; clientName: string; industry: string; metricValue: string; metricLabel: string; summary: string;
  coverUrl: string | null; domainIds: string[]; domainNames: string[];
};
export type CaseTab = { id: string; name: string };

/**
 * One case study card. Every card has the same parts in the same order: area of work, headline result, client, summary, link.
 * No pictures here, so the list stays calm and even. The screenshots live on the case study's own page.
 */
export function CaseCardView({ c, read }: { c: CaseCard; read: string; eager?: boolean }) {
  return (
    <Link href={`/case-studies/${c.slug}`} className="group flex h-full flex-col border-t-2 border-navy pt-5 transition-colors duration-300 hover:border-royal">
      <p className="font-sans text-sm text-muted">{[c.domainNames[0], c.industry].filter(Boolean).join("  |  ")}</p>
      <p className="mt-8 font-sans text-[2.5rem] font-semibold leading-none tracking-tight text-navy sm:text-[2.75rem]"><Metric value={c.metricValue} /></p>
      <p className="mt-2 font-sans text-[15px] text-steel">{c.metricLabel}</p>
      <h3 className="mt-8 text-xl text-navy transition-colors group-hover:text-royal">{c.clientName}</h3>
      <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-ink/75">{c.summary}</p>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[15px] font-semibold text-royal">{read} <ArrowRight size={15} aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5" /></span>
    </Link>
  );
}

/** The full list with filter tabs. Every card is in the page HTML, so search engines see them all. */
export function CaseStudiesBrowser({ cards, tabs, allLabel, filterLabel, read }: { cards: CaseCard[]; tabs: CaseTab[]; allLabel: string; filterLabel: string; read: string }) {
  const [active, setActive] = useState("all");
  const [touched, setTouched] = useState(false);
  const shown = active === "all" ? cards : cards.filter((c) => c.domainIds.includes(active));
  const pill = (on: boolean) =>
    `shrink-0 rounded-sm border px-4 py-2 font-sans text-sm font-semibold transition-colors ${on ? "border-navy bg-navy text-white" : "border-line bg-white text-ink hover:border-royal hover:text-royal"}`;
  const pick = (id: string) => { setActive(id); setTouched(true); };

  return (
    <div>
      {tabs.length > 0 && (
        <div role="group" aria-label={filterLabel} className="mb-10 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button type="button" aria-pressed={active === "all"} onClick={() => pick("all")} className={pill(active === "all")}>{allLabel} ({cards.length})</button>
          {tabs.map((t) => (
            <button key={t.id} type="button" aria-pressed={active === t.id} onClick={() => pick(t.id)} className={pill(active === t.id)}>
              {t.name} ({cards.filter((c) => c.domainIds.includes(t.id)).length})
            </button>
          ))}
        </div>
      )}
      <ul key={active} className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c, i) => (
          <li key={c.id}>
            {touched ? (
              <div className="case-in h-full" style={{ "--i": i } as React.CSSProperties}><CaseCardView c={c} read={read} eager /></div>
            ) : (
              <Reveal delay={(i % 3) * 110} className="h-full"><CaseCardView c={c} read={read} eager={i < 3} /></Reveal>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
