"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export type Quote = { id: string; quote: string; name: string; byline: string; photo: string | null };

/** One quote at a time, swipeable on phones, with arrows and dots. Plain scroll-snap, so it works without much script. */
export function TestimonialCarousel({ items, prev, next, goTo }: { items: Quote[]; prev: string; next: string; goTo: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const move = useCallback((to: number) => {
    const el = track.current;
    if (!el) return;
    const i = Math.max(0, Math.min(items.length - 1, to));
    el.scrollTo({ left: i * el.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [items.length]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const on = () => setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, []);

  const many = items.length > 1;
  const btn = "grid h-11 w-11 place-items-center border border-white/40 text-white transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Testimonials">
      <ul ref={track} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" tabIndex={0}>
        {items.map((t, i) => (
          <li key={t.id} className="w-full shrink-0 snap-center pr-1" aria-roledescription="slide" aria-label={`${i + 1} / ${items.length}`}>
            <figure className="max-w-3xl">
              <blockquote className="text-xl leading-relaxed text-white md:text-2xl">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-6 flex items-center gap-4">
                {t.photo && <Image src={t.photo} alt={t.name} width={48} height={48} className="h-12 w-12 object-cover" />}
                <span><span className="block font-semibold text-white">{t.name}</span><span className="text-sm text-white/65">{t.byline}</span></span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      {many && (
        <div className="mt-10 flex items-center justify-between border-t border-white/15 pt-5">
          <div className="flex gap-2" role="group" aria-label="Choose a testimonial">
            {items.map((t, i) => (
              <button key={t.id} type="button" onClick={() => move(i)} aria-label={`${goTo} ${i + 1}`} aria-current={i === index} className="grid h-8 w-8 place-items-center focus-visible:outline-2 focus-visible:outline-white">
                <span className={`block h-[3px] w-6 transition-colors ${i === index ? "bg-white" : "bg-white/30"}`} />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" className={btn} onClick={() => move(index - 1)} disabled={index === 0} aria-label={prev}><ArrowLeft size={18} aria-hidden /></button>
            <button type="button" className={btn} onClick={() => move(index + 1)} disabled={index === items.length - 1} aria-label={next}><ArrowRight size={18} aria-hidden /></button>
          </div>
        </div>
      )}
    </div>
  );
}
