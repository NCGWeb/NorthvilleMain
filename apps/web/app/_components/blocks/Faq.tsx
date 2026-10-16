import { JsonLd } from "../JsonLd";
import { Section, SectionHead } from "../ui";
import { arr, str, type BlockProps } from "./types";

export function FaqList({ items, heading }: { items: { question: string; answer: string }[]; heading?: string }) {
  if (!items.length) return null;
  return (
    <Section>
      <SectionHead heading={heading} />
      <div className="max-w-3xl divide-y divide-line rounded-none border border-line bg-white">
        {items.map((q, i) => (
          <details key={i} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-sans text-[1.0625rem] font-semibold text-navy">
              {q.question}<span aria-hidden className="text-2xl text-royal transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-relaxed text-muted">{q.answer}</p>
          </details>
        ))}
      </div>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.answer } })) }} />
    </Section>
  );
}

export function Faq({ data }: BlockProps) {
  return <FaqList heading={str(data.heading)} items={arr(data.items).map((x) => ({ question: str(x.question), answer: str(x.answer) }))} />;
}
