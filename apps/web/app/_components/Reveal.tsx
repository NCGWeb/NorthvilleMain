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

/** Fades content in as it scrolls into view. `delay` (ms) staggers items in a row. */
export function Reveal({ children, className = "", delay = 0, variant = "up" }: { children: ReactNode; className?: string; delay?: number; variant?: Variant }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = getObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);
  return <div ref={ref} data-reveal={variant} className={className} style={{ "--d": `${delay}ms` } as React.CSSProperties}>{children}</div>;
}
