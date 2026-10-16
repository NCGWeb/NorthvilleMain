"use client";
import { useEffect, useState } from "react";

/** Transparent over the hero, solid navy once the page scrolls. Sits below the top bar and slides up to the top as it scrolls away. */
export function HeaderShell({ children, barHeight = 0 }: { children: React.ReactNode; barHeight?: number }) {
  const [y, setY] = useState(0);
  useEffect(() => {
    const on = () => setY(window.scrollY);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const solid = y > 24;
  return (
    <header style={{ top: Math.max(0, barHeight - y) }} className={`fixed inset-x-0 z-50 transition-colors duration-300 ${solid ? "border-b border-white/10 bg-navy" : "bg-gradient-to-b from-navy/70 to-transparent"}`}>
      {children}
    </header>
  );
}
