import Image from "next/image";
import { Button, SmartLink } from "../ui";
import type { BlockProps } from "./types";
import { str } from "./types";

export function Hero({ data, first }: BlockProps) {
  const large = str(data.size) === "large";
  const image = str(data.image);
  const p = str(data.primaryLabel), s = str(data.secondaryLabel);
  const H = first ? "h1" : "h2";
  return (
    <section className={`mesh relative overflow-hidden text-white ${large ? "" : ""}`}>
      {image && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-30 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent" />
        </>
      )}
      <div className={`relative mx-auto max-w-7xl px-5 sm:px-8 ${large ? "py-20 md:py-28" : "py-14 md:py-20"}`}>
        <H className={`max-w-4xl text-balance leading-[1.05] ${large ? "text-5xl sm:text-6xl md:text-[4.25rem]" : "text-4xl sm:text-5xl md:text-[3.25rem]"}`}>{str(data.heading)}</H>
        {str(data.subtext) && <p className={`mt-6 max-w-2xl text-lg leading-relaxed text-white/75 ${large ? "md:text-xl" : ""}`}>{str(data.subtext)}</p>}
        {(p || s) && (
          <div className="mt-9 flex flex-wrap gap-3">
            {p && <Button href={str(data.primaryHref) || "/contact"}>{p}</Button>}
            {s && <SmartLink href={str(data.secondaryHref) || "/"} className="inline-flex items-center rounded-sm border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">{s}</SmartLink>}
          </div>
        )}
      </div>
    </section>
  );
}
