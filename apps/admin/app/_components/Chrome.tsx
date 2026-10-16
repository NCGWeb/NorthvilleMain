import Link from "next/link";
import { AREAS, type AreaKey } from "@northville/content";
import type { CurrentUser } from "@northville/auth";
import { LogoutButton } from "./LogoutButton";

type Item = { href: string; label: string; area: AreaKey; hint: string };
const GROUPS: { title: string; items: Item[] }[] = [
  { title: "Website pages", items: [
    { href: "/pages", label: "Pages", area: "pages", hint: "Home, About, Contact..." },
    { href: "/shared", label: "Reusable sections", area: "pages", hint: "Used on many pages" },
    { href: "/services", label: "Services", area: "services", hint: "The 12 services" },
    { href: "/serviceGroups", label: "Service themes", area: "services", hint: "Menu grouping" },
  ] },
  { title: "People and proof", items: [
    { href: "/team", label: "Team", area: "team", hint: "Our Team page" },
    { href: "/testimonials", label: "Testimonials", area: "testimonials", hint: "Client quotes" },
    { href: "/logos", label: "Logos", area: "logos", hint: "Clients, investors..." },
  ] },
  { title: "Blog", items: [
    { href: "/blog", label: "Blog posts", area: "blog", hint: "Write and publish" },
    { href: "/blogCategories", label: "Blog categories", area: "blog", hint: "Topics" },
  ] },
  { title: "Careers and enquiries", items: [
    { href: "/jobs", label: "Open roles", area: "careers", hint: "Careers page" },
    { href: "/enquiries", label: "Enquiries", area: "enquiries", hint: "Contact form messages" },
  ] },
  { title: "Site", items: [
    { href: "/media", label: "Media library", area: "media", hint: "Images" },
    { href: "/offices", label: "Offices", area: "settings", hint: "Addresses" },
    { href: "/settings", label: "Site settings", area: "settings", hint: "Contact, menus, footer" },
    { href: "/redirects", label: "Redirects", area: "settings", hint: "Old address to new page" },
  ] },
  { title: "Access", items: [
    { href: "/users", label: "Users", area: "users", hint: "Who can sign in" },
    { href: "/roles", label: "Roles", area: "users", hint: "What each role can do" },
    { href: "/audit", label: "Activity log", area: "audit", hint: "Who changed what" },
  ] },
];

/** The menu itself. Shown fixed on desktop and inside a slide-out drawer on phones. */
export function SidebarContent({ user }: { user: CurrentUser }) {
  const allowed = new Set(AREAS.filter((a) => user.permissions.includes(`${a.key}:view`)).map((a) => a.key));
  return (
    <>
      <div className="border-b border-line p-5">
        <Link href="/" className="block text-lg font-semibold text-navy">Website manager</Link>
        <p className="text-xs text-muted">Northville Consulting Group</p>
      </div>
      <nav aria-label="Sections" className="flex-1 overflow-y-auto p-3">
        {GROUPS.map((g) => {
          const items = g.items.filter((i) => allowed.has(i.area));
          if (!items.length) return null;
          return (
            <div key={g.title} className="mb-5">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{g.title}</p>
              {items.map((i) => (
                <Link key={i.href} href={i.href} className="block rounded-lg px-3 py-2.5 text-sm text-ink hover:bg-mist" title={i.hint}>{i.label}</Link>
              ))}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-line p-4 text-sm">
        <p className="font-semibold text-navy">{user.name}</p>
        <p className="text-xs text-muted">{user.roleName}</p>
        <div className="mt-3 flex items-center justify-between">
          <a href={process.env.WEB_URL ?? "http://localhost:3000"} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-royal hover:underline">View website</a>
          <LogoutButton />
        </div>
      </div>
    </>
  );
}

export function Sidebar({ user }: { user: CurrentUser }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-white lg:flex">
      <SidebarContent user={user} />
    </aside>
  );
}

export function PageHeader({ title, description, where, actions }: { title: string; description?: string; where?: string; actions?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-navy">{title}</h1>
        {description && <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{description}</p>}
        {where && <p className="mt-2 inline-block rounded-lg bg-sky/40 px-3 py-1.5 text-[13px] text-navy"><strong>Where this shows on the website:</strong> {where}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  );
}
