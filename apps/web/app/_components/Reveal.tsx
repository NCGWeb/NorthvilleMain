"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** A quiet fade in as content scrolls into view. No stagger, no big movement. */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} data-reveal className={className}>{children}</div>;
}
