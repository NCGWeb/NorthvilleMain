"use client";
import { useEffect, useRef, type ReactNode } from "react";

type Variant = "up" | "left" | "right" | "zoom" | "fade" | "wipe";

// One observer for the whole page instead of one per element.
let observer: IntersectionObserver | null = null;
function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add("in"); observer?.unobserve(e.target); }
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  }
  return observer;
}

let sweepArmed = false;
/** Safety net: reveal anything already on screen. Runs on scroll, resize, tab focus and shortly after load. */
function armSweep() {
  if (sweepArmed || typeof window === "undefined") return;
  sweepArmed = true;
  let queued = false;
  const sweep = () => {
    queued = false;
    document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.05 && r.bottom > 0) { el.classList.add("in"); observer?.unobserve(el); }
    });
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(sweep); } };
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  window.addEventListener("hashchange", queue);
  document.addEventListener("visibilitychange", queue);
  setTimeout(sweep, 1200);
  setTimeout(sweep, 3500);
}

/** Fades content in as it scrolls into view. `delay` (ms) staggers items in a row. */
export function Reveal({ children, className = "", delay = 0, variant = "up" }: { children: ReactNode; className?: string; delay?: number; variant?: Variant }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = getObserver();
    io.observe(el);
    armSweep();
    return () => io.unobserve(el);
  }, []);
  return <div ref={ref} data-reveal={variant} className={className} style={{ "--d": `${delay}ms` } as React.CSSProperties}>{children}</div>;
}
