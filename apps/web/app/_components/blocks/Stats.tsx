import { CountUp } from "../CountUp";
import { Section } from "../ui";
import { arr, str, type BlockProps } from "./types";

// How many columns for each count, so 1 to 6 numbers always look balanced.
const COLS: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 3, 6: 3 };

export function Stats({ data }: BlockProps) {
  const items = arr(data.items).filter((it) => str(it.value) && str(it.label));
  if (!items.length) return null;
  const cols = COLS[Math.min(items.length, 6)];
  const basis = { 1: "md:basis-full", 2: "md:basis-1/2", 3: "md:basis-1/3", 4: "md:basis-1/4" }[cols as 1 | 2 | 3 | 4];
  return (
    <Section>
      {str(data.heading) && <h2 className="mb-10 text-center text-[1.75rem] text-navy sm:text-[2rem]">{str(data.heading)}</h2>}
      <dl className="mx-auto flex max-w-4xl flex-wrap justify-center gap-y-10">
        {items.map((it, i) => {
          const raw = str(it.value).replace(/,/g, "");
          const num = parseFloat(raw);
          const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
          return (
            <div key={i} className={`w-1/2 px-4 text-center sm:w-1/2 ${basis} ${i % cols !== 0 ? "md:border-l md:border-line" : ""} ${items.length === 1 ? "w-full" : ""}`}>
              <dd className="font-serif text-5xl font-normal leading-none text-royal sm:text-6xl md:text-7xl">
                {Number.isFinite(num) ? <CountUp value={num} decimals={decimals} prefix={str(it.prefix)} suffix={str(it.suffix)} /> : `${str(it.prefix)}${str(it.value)}${str(it.suffix)}`}
              </dd>
              <dt className="mt-3 text-[15px] text-ink">{str(it.label)}</dt>
            </div>
          );
        })}
      </dl>
    </Section>
  );
}
