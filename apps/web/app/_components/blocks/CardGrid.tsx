import { Reveal } from "../Reveal";
import { Section, SectionHead } from "../ui";
import { arr, str, type BlockProps } from "./types";

export function CardGrid({ data }: BlockProps) {
  const items = arr(data.items);
  return (
    <Section tone="mist">
      <SectionHead heading={str(data.heading)} intro={str(data.intro)} />
      <Reveal>
        <div className={`grid gap-10 md:gap-0 md:divide-x md:divide-line ${items.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          {items.map((it, i) => (
            <div key={i} className="md:px-8 md:first:pl-0 md:last:pr-0">
              <h3 className="border-b border-navy pb-3 text-lg text-navy">{str(it.title)}</h3>
              <p className="mt-4 leading-relaxed text-ink/80">{str(it.body)}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
