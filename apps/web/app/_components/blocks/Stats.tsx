import { Reveal } from "../Reveal";
import { Section, SectionHead } from "../ui";
import { arr, str, type BlockProps } from "./types";

export function Stats({ data }: BlockProps) {
  const items = arr(data.items);
  if (!items.length) return null;
  return (
    <Section tone="white" className="border-b border-line">
      <SectionHead heading={str(data.heading)} />
      <dl className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={i} delay={i * 80} className="border-l border-line pl-6 first:border-l-0 md:first:border-l md:first:pl-6">
            <dd className="font-sans font-semibold tracking-tight text-5xl text-navy md:text-6xl">{str(it.value)}<span className="gradient-text">{str(it.suffix)}</span></dd>
            <dt className="mt-2 text-sm font-medium  text-muted">{str(it.label)}</dt>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}
