import Image from "next/image";
import { Button, SmartLink } from "../ui";
import type { BlockProps } from "./types";
import { str } from "./types";

/** Flowing brand-blue gradient hero. Sits under the transparent header, copy anchored bottom left. */
export function Hero({ data, first }: BlockProps) {
  const large = str(data.size) === "large";
  const image = str(data.image);
  const p = str(data.primaryLabel), s = str(data.secondaryLabel);
  const H = first ? "h1" : "h2";
  return (
    <section className={`mesh relative flex flex-col justify-end overflow-hidden pt-16 text-white`} style={{ minHeight: large ? "calc(100svh - var(--bar-h, 0px))" : "44svh" }}>
      {image && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-30 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/40 to-transparent" />
        </>
      )}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" fill="none" stroke="white">
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M ${520 + i * 34} 0 C ${760 + i * 22} 240, ${1080 - i * 10} 360, 1440 ${120 + i * 26}`} strokeOpacity={0.07} />
        ))}
      </svg>
      <div className={`relative mx-auto w-full max-w-[1120px] px-6 lg:px-8 ${large ? "pb-14 pt-24 md:pb-20" : "pb-10 pt-16 md:pb-14"}`}>
        <H className={`text-balance leading-[1.05] ${large ? "max-w-5xl" : "max-w-3xl"} ${large ? "text-5xl sm:text-6xl lg:text-[4.5rem]" : "text-3xl sm:text-4xl md:text-5xl"}`}>{str(data.heading)}</H>
        {str(data.subtext) && <p className={`mt-6 leading-relaxed text-white/85 ${large ? "max-w-2xl text-lg md:text-[1.375rem]" : "max-w-xl text-[1.0625rem] md:text-lg"}`}>{str(data.subtext)}</p>}
        {(p || s) && (
          <div className="mt-8 flex flex-wrap gap-3">
            {p && <Button href={str(data.primaryHref) || "/contact"} variant="light">{p}</Button>}
            {s && <SmartLink href={str(data.secondaryHref) || "/"} className="inline-flex items-center rounded-sm border border-white/50 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">{s}</SmartLink>}
          </div>
        )}
      </div>
    </section>
  );
}
