"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

type Props = { viewAll: string;
  links: { label: string; href: string }[];
  menu: { name: string; services: { name: string; slug: string }[] }[];
  extras: { label: string; href: string }[];
  ctaLabel: string;
  ctaHref: string;
  logo: string | null;
  siteName: string;
  email: string;
  phone: string;
};

/** Full-screen phone menu: big tappable rows, Services opens like an accordion, contact details at the bottom. */
export function MobileMenu({ viewAll, links, menu, extras, ctaLabel, ctaHref, logo, siteName, email, phone }: Props) {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); setServicesOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);

  const close = () => setOpen(false);
  const row = "flex w-full items-center justify-between border-b border-white/15 py-4 text-left font-sans text-xl font-semibold text-white";

  return (
    <div className="lg:hidden">
      <button type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center text-white">
        <Menu />
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-navy">
          <div className="flex h-16 shrink-0 items-center justify-between px-6">
            <Link href="/" onClick={close} aria-label={`${siteName}, home`}>
              {logo && <Image src={logo} alt={siteName} width={937} height={197} className="h-9 w-auto" />}
            </Link>
            <button type="button" aria-label="Close menu" onClick={close} className="grid h-10 w-10 place-items-center text-white"><X /></button>
          </div>

          <nav aria-label="Mobile" className="flex-1 px-6 pb-6 pt-4">
            <ul>
              {links.map((l) =>
                l.href === "/services" ? (
                  <li key={l.href}>
                    <button type="button" className={row} aria-expanded={servicesOpen} onClick={() => setServicesOpen(!servicesOpen)}>
                      {l.label}
                      <ChevronDown size={22} className={`transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} aria-hidden />
                    </button>
                    {servicesOpen && (
                      <div className="border-b border-white/15 pb-5 pt-2">
                        {menu.map((g) => (
                          <div key={g.name} className="mt-4">
                            <p className="font-sans text-sm font-semibold text-sky">{g.name}</p>
                            <ul className="mt-1">
                              {g.services.map((sv) => (
                                <li key={sv.slug}><Link href={`/services/${sv.slug}`} onClick={close} className="block py-2 font-sans text-[17px] text-white/90">{sv.name}</Link></li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-sans text-[15px] font-semibold text-sky">
                          <Link href="/services" onClick={close}>{viewAll}</Link>
                          {extras.map((x) => (<Link key={x.href} href={x.href} onClick={close}>{x.label}</Link>))}
                        </div>
                      </div>
                    )}
                  </li>
                ) : (
                  <li key={l.href}><Link href={l.href} onClick={close} className={row}>{l.label}</Link></li>
                ),
              )}
            </ul>
          </nav>

          <div className="shrink-0 border-t border-white/15 px-6 pb-8 pt-6">
            {ctaLabel && <Link href={ctaHref} onClick={close} className="block rounded-sm bg-royal py-3.5 text-center font-sans text-base font-semibold text-white">{ctaLabel}</Link>}
            <div className="mt-5 space-y-1.5 font-sans text-[15px] text-white/75">
              {email && <p><a href={`mailto:${email}`}>{email}</a></p>}
              {phone && <p><a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
