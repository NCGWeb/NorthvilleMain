import Image from "next/image";
import Link from "next/link";
import { getServiceGroups, getSettings, whatsappUrl } from "@northville/core";
import { SmartLink } from "./ui";
import { SOCIALS, WhatsappIcon } from "./Icons";

export async function Footer() {
  const [s, groups] = await Promise.all([getSettings(), getServiceGroups()]);
  const services = groups.flatMap((g) => g.services);
  const social = SOCIALS.filter((x) => s.social[x.key]);
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-12">
        <div className="md:col-span-4">
          {s.general.logo && <Image src={s.general.logo} alt={s.general.siteName} width={937} height={197} className="h-10 w-auto" />}
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/70">{s.general.footerBlurb}</p>
          <div className="mt-6 flex gap-3">
            {social.map(({ key, label, Icon }) => (
              <a key={key} href={s.social[key]} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-none border border-white/20 text-white/80 transition hover:border-sky hover:text-white"><Icon /></a>
            ))}
            {s.contact.whatsappNumber && (
              <a href={whatsappUrl(s.contact.whatsappNumber, s.contact.whatsappMessage)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-10 w-10 place-items-center rounded-none border border-white/20 text-white/80 transition hover:border-sky hover:text-white"><WhatsappIcon /></a>
            )}
          </div>
        </div>
        <nav aria-label="Footer" className="md:col-span-2">
          <p className="text-xs font-semibold  text-sky">Company</p>
          <ul className="mt-4 space-y-2.5 text-[15px] text-white/75">
            {s.navigation.footerLinks.map((l) => (<li key={l.href}><SmartLink href={l.href} className="transition hover:text-white">{l.label}</SmartLink></li>))}
          </ul>
        </nav>
        <nav aria-label="Services" className="md:col-span-3">
          <p className="text-xs font-semibold  text-sky">Services</p>
          <ul className="mt-4 space-y-2.5 text-[15px] text-white/75">
            {services.slice(0, 8).map((sv) => (<li key={sv.slug}><Link href={`/services/${sv.slug}`} className="transition hover:text-white">{sv.name}</Link></li>))}
            <li><Link href="/services" className="font-medium text-white">All services</Link></li>
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="text-xs font-semibold  text-sky">Get in touch</p>
          <ul className="mt-4 space-y-2.5 text-[15px] text-white/75">
            {s.contact.email && <li><a href={`mailto:${s.contact.email}`} className="hover:text-white">{s.contact.email}</a></li>}
            {s.contact.phones.map((p) => (<li key={p}><a href={`tel:${p.replace(/\s/g, "")}`} className="hover:text-white">{p}</a></li>))}
            {s.contact.officeHours && <li className="text-white/55">{s.contact.officeHours}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} {s.general.copyright}. All rights reserved.</p>
          <ul className="flex gap-6">
            {s.navigation.legalLinks.map((l) => (<li key={l.href}><SmartLink href={l.href} className="hover:text-white">{l.label}</SmartLink></li>))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
