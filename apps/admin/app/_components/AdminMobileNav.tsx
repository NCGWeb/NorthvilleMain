"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

/** Phone top bar with a button that slides the menu in. Hidden on desktop, where the menu is always visible. */
export function AdminMobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <div className="lg:hidden">
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-white px-4">
        <span className="font-semibold text-navy">Website manager</span>
        <button type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-mist"><Menu size={22} /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-navy/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col bg-white shadow-2xl">
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-lg hover:bg-mist"><X size={20} /></button>
            {children}
          </aside>
        </div>
      )}
    </div>
  );
}
