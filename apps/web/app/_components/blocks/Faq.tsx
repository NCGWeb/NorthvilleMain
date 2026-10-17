import { JsonLd } from "../JsonLd";
import { Section, SectionHead } from "../ui";
import { arr, str, type BlockProps } from "./types";

export function FaqList({ items, heading }: { items: { question: string; answer: string }[]; heading?: string }) {
  if (!items.length) return null;
  return (
    <Section>
      <SectionHead heading={heading} />
      <div className="max-w-3xl border-t border-navy">
        {items.map((q, i) => (
          <details key={i} className="group border-b border-line">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-sans text-[1.0625rem] font-semibold text-navy transition-colors hover:text-royal [&::-webkit-details-marker]:hidden">
              <span>{q.question}</span>
              <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center border border-line text-royal"><span className="block text-xl leading-none transition-transform duration-200 group-open:rotate-45">+</span></span>
            </summary>
            <p className="max-w-2xl pb-6 leading-relaxed text-ink/80">{q.answer}</p>
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
