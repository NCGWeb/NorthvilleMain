import Image from "next/image";
import { Check } from "lucide-react";
import { Reveal } from "../Reveal";
import { Button, Section } from "../ui";
import { arr, str, type BlockProps } from "./types";

export function ImageText({ data }: BlockProps) {
  const image = str(data.image);
  const left = str(data.imageSide) === "left";
  const bullets = arr<string>(data.bullets);
  return (
    <Section tone="mist">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <Reveal className={left ? "md:order-2" : ""}>
          <h2 className="text-3xl leading-tight text-navy sm:text-4xl md:text-5xl">{str(data.heading)}</h2>
          {str(data.body) && <p className="mt-5 text-lg leading-relaxed text-muted">{str(data.body)}</p>}
          {bullets.length > 0 && (
            <ul className="mt-6 space-y-3">
              {bullets.map((x, i) => (<li key={i} className="flex gap-3 text-ink"><Check size={20} className="mt-0.5 shrink-0 text-royal" aria-hidden />{x}</li>))}
            </ul>
          )}
          {str(data.ctaLabel) && <div className="mt-8"><Button href={str(data.ctaHref) || "/contact"}>{str(data.ctaLabel)}</Button></div>}
        </Reveal>
        {image && (
          <Reveal delay={120} className={left ? "md:order-1" : ""}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-none ">
              <Image src={image} alt={str(data.heading)} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-navy/30 to-transparent" />
            </div>
          </Reveal>
        )}
      </div>
    </Section>
  );
}
