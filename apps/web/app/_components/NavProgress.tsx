"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

/** Shows a small spinner on the exact link that was clicked, so even tiny links give feedback. */
function markPending(a: HTMLAnchorElement) {
  clearPending();
  const cs = getComputedStyle(a);
  const inline = cs.display.startsWith("inline") && cs.flexDirection !== "column";
  a.setAttribute("data-pending", inline ? "inline" : "overlay");
}
function clearPending() {
  document.querySelectorAll("a[data-pending]").forEach((el) => el.removeAttribute("data-pending"));
}

/** Thin bar at the very top that shows while a page is loading after a click on an internal link. */
function Bar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The address changed, so the new page has arrived.
  useEffect(() => {
    clearPending();
    setState((s) => (s === "loading" ? "done" : s));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 450);
    return () => clearTimeout(timer.current);
  }, [pathname, search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page or #anchor
      markPending(a);
      setState("loading");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => { setState("idle"); clearPending(); }, 10000); // never hang
    };
    // Capture phase: runs before the framework handles the click, which otherwise marks it as already handled.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (state === "idle") return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[3px]">
      <div
        className="h-full bg-bright"
        style={{ width: state === "done" ? "100%" : "85%", opacity: state === "done" ? 0 : 1, transition: state === "done" ? "width .2s ease-out, opacity .35s ease .15s" : "width 8s cubic-bezier(.1,.6,.2,1)" }}
      />
    </div>
  );
}

export function NavProgress() {
  return <Suspense fallback={null}><Bar /></Suspense>;
}
