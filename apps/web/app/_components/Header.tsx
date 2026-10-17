import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { getServiceGroups, getSettings } from "@northville/core";
import { buttonClass, SmartLink } from "./ui";
import { MobileMenu } from "./MobileMenu";
import { HeaderShell } from "./HeaderShell";

export async function Header({ barHeight = 0 }: { barHeight?: number }) {
  const [s, groups] = await Promise.all([getSettings(), getServiceGroups()]);
  const links = s.navigation.mainLinks;
  const menu = groups.filter((g) => g.services.length > 0).map((g) => ({ name: g.name, blurb: g.blurb, services: g.services.map((x) => ({ name: x.name, slug: x.slug })) }));

  return (
    <HeaderShell barHeight={barHeight}>
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-6 lg:px-8">
        <Link href="/" aria-label={`${s.general.siteName}, home`} className="shrink-0">
          {s.general.logo && <Image src={s.general.logo} alt={s.general.siteName} width={937} height={197} priority className="h-9 w-auto" />}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map((l) =>
            l.href === "/services" ? (
              <div key={l.href} className="group relative">
                <Link href="/services" className="link-u mx-1.5 flex items-center gap-1 px-1 py-2 text-sm font-medium text-white/85 hover:text-white">
                  {l.label} <ChevronDown size={14} className="transition group-hover:rotate-180 group-focus-within:rotate-180" aria-hidden />
                </Link>
                <div className="invisible absolute left-1/2 top-full w-[860px] -translate-x-1/2 pt-3 opacity-0 transition duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <div className="grid grid-cols-2 gap-x-10 gap-y-8 rounded-none border border-line bg-white p-8 ">
                    {menu.map((g) => (
                      <div key={g.name}>
                        <p className="text-xs font-semibold  text-royal">{g.name}</p>
                        <ul className="mt-3 space-y-1">
                          {g.services.map((sv) => (
                            <li key={sv.slug}>
                              <Link href={`/services/${sv.slug}`} className="block rounded-none py-1.5 text-[15px] text-ink transition hover:text-royal">{sv.name}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <div className="col-span-2 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-line pt-4 text-sm"><Link href="/services" className="font-semibold text-royal hover:underline">{s.text.viewAllServices}</Link>{s.navigation.servicesMenuLinks.map((x) => (<SmartLink key={x.href} href={x.href} className="font-semibold text-royal hover:underline">{x.label}</SmartLink>))}</div>
                  </div>
                </div>
              </div>
            ) : (
              <SmartLink key={l.href} href={l.href} className="link-u mx-1.5 px-1 py-2 text-sm font-medium text-white/85 hover:text-white">{l.label}</SmartLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          {s.navigation.ctaLabel && (
            <SmartLink href={s.navigation.ctaHref} className={buttonClass("royal", "md", "hidden sm:inline-flex")}>{s.navigation.ctaLabel}</SmartLink>
          )}
          <MobileMenu viewAll={s.text.viewAllServices} links={links} menu={menu} extras={s.navigation.servicesMenuLinks} ctaLabel={s.navigation.ctaLabel} ctaHref={s.navigation.ctaHref} logo={s.general.logo} siteName={s.general.siteName} email={s.contact.email} phone={s.contact.phones[0] ?? ""} />
        </div>
      </div>
    </HeaderShell>
  );
}
