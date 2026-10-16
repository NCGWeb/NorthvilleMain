"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

type Props = {
  links: { label: string; href: string }[];
  menu: { name: string; services: { name: string; slug: string }[] }[];
  ctaLabel: string;
  ctaHref: string;
};

export function MobileMenu({ links, menu, ctaLabel, ctaHref }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="lg:hidden">
      <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-none text-white">
        {open ? <X /> : <Menu />}
      </button>
      {open && (
        <div className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto bg-navy px-5 pb-10 pt-4">
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={close} className="block border-b border-white/10 py-3 font-serif text-2xl text-white">{l.label}</Link>
                {l.href === "/services" && (
                  <div className="pb-3 pt-1">
                    {menu.map((g) => (
                      <div key={g.name} className="mt-3">
                        <p className="text-[11px] font-semibold  text-sky">{g.name}</p>
                        {g.services.map((sv) => (
                          <Link key={sv.slug} href={`/services/${sv.slug}`} onClick={close} className="block py-1.5 text-[15px] text-white/80">{sv.name}</Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
          {ctaLabel && <Link href={ctaHref} onClick={close} className="mt-8 block rounded-none bg-royal py-3 text-center font-semibold text-white">{ctaLabel}</Link>}
        </div>
      )}
    </div>
  );
}
