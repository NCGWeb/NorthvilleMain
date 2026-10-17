"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Transparent over the hero, solid navy once the page scrolls. Sits below the top bar and slides up to the top as it scrolls away.
 * Scrolling moves the bar, its offset and the progress line directly on the element. React only re-renders when the header
 * switches between transparent and solid, so scrolling stays smooth.
 */
export function HeaderShell({ children, barHeight = 0 }: { children: React.ReactNode; barHeight?: number }) {
  const [solid, setSolid] = useState(false);
  const header = useRef<HTMLElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const solidRef = useRef(false);

  useEffect(() => {
    let frame = 0;
    const apply = () => {
      frame = 0;
      const y = window.scrollY;
      if (header.current) header.current.style.top = `${Math.max(0, barHeight - y)}px`;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (line.current) line.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      const next = y > 24;
      if (next !== solidRef.current) { solidRef.current = next; setSolid(next); }
    };
    const on = () => { if (!frame) frame = requestAnimationFrame(apply); };
    apply();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (frame) cancelAnimationFrame(frame); };
  }, [barHeight]);

  return (
    <header ref={header} style={{ top: barHeight }} className={`fixed inset-x-0 z-50 transition-colors duration-300 ${solid ? "border-b border-white/10 bg-navy" : "bg-gradient-to-b from-navy/70 to-transparent"}`}>
      {children}
      <div ref={line} aria-hidden className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-bright transition-opacity duration-300" style={{ transform: "scaleX(0)", opacity: solid ? 1 : 0 }} />
    </header>
  );
}
