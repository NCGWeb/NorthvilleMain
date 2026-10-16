import Image from "next/image";
import { Check } from "lucide-react";
import { Reveal } from "../Reveal";
import { Section, TextLink } from "../ui";
import { arr, str, type BlockProps } from "./types";

export function ImageText({ data }: BlockProps) {
  const image = str(data.image);
  const left = str(data.imageSide) === "left";
  const bullets = arr<string>(data.bullets);
  return (
    <Section>
      <Reveal>
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
          <div className={`md:col-span-5 ${left ? "md:order-2" : ""}`}>
            <h2 className="text-[1.75rem] leading-[1.2] text-navy sm:text-[2rem]">{str(data.heading)}</h2>
            {str(data.body) && <p className="mt-4 leading-relaxed text-ink/80">{str(data.body)}</p>}
            {bullets.length > 0 && <ul className="mt-5 space-y-2.5">{bullets.map((x, i) => (<li key={i} className="flex gap-3 text-[15px]"><Check size={18} className="mt-0.5 shrink-0 text-royal" aria-hidden />{x}</li>))}</ul>}
            {str(data.ctaLabel) && <div className="mt-6"><TextLink href={str(data.ctaHref) || "/contact"}>{str(data.ctaLabel)}</TextLink></div>}
          </div>
          {image && (
            <div className={`md:col-span-7 ${left ? "md:order-1" : ""}`}>
              <div className="relative aspect-[3/2] overflow-hidden bg-mist"><Image src={image} alt={str(data.heading)} fill sizes="(min-width:768px) 640px, 100vw" className="object-cover" /></div>
            </div>
          )}
        </div>
      </Reveal>
    </Section>
  );
}
