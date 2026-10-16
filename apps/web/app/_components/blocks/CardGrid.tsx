import { Reveal } from "../Reveal";
import { Section, SectionHead } from "../ui";
import { arr, str, type BlockProps } from "./types";

export function CardGrid({ data }: BlockProps) {
  const items = arr(data.items);
  return (
    <Section>
      <SectionHead heading={str(data.heading)} intro={str(data.intro)} />
      <div className={`grid gap-6 ${items.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {items.map((it, i) => (
          <Reveal key={i} delay={i * 90}>
            <div className="h-full rounded-none border border-line bg-gradient-to-br from-white to-mist p-8 transition hover:border-royal/40 ">
              <span className="font-sans font-semibold tracking-tight text-4xl text-royal/30">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-2xl text-navy">{str(it.title)}</h3>
              <p className="mt-3 leading-relaxed text-muted">{str(it.body)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
