import Link from "next/link";
import { prisma } from "@northville/database";
import { PageHeader } from "../_components/Chrome";
import { requireUser } from "../_lib/session";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const can = (k: string) => user.permissions.includes(k);
  const [newEnquiries, unpublished, drafts] = await Promise.all([
    can("enquiries:view") ? prisma.enquiry.count({ where: { status: "NEW" } }) : 0,
    can("pages:view") ? prisma.page.findMany({ where: { hasUnpublishedChanges: true }, select: { id: true, title: true } }) : [],
    can("blog:view") ? prisma.blogPost.count({ where: { status: "DRAFT" } }) : 0,
  ]);
  const tiles = [
    { show: can("pages:view"), href: "/pages", title: "Edit a page", text: "Home, About, Contact and more." },
    { show: can("services:view"), href: "/services", title: "Edit a service", text: "Descriptions, offerings, photos." },
    { show: can("blog:edit"), href: "/blog/new", title: "Write a blog post", text: "Share an insight with visitors." },
    { show: can("team:view"), href: "/team", title: "Update the team", text: "Add or change people." },
    { show: can("settings:view"), href: "/settings", title: "Contact details and menus", text: "Phone, email, footer, social links." },
  ].filter((t) => t.show);
  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} description="Pick what you want to change. Every screen explains where its content appears on the website." />
      {sp.denied && <p className="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">You do not have access to that area. Ask the site owner if you need it.</p>}
      {(newEnquiries > 0 || unpublished.length > 0 || drafts > 0) && (
        <div className="card mb-8 divide-y divide-line">
          {newEnquiries > 0 && <Link href="/enquiries" className="flex justify-between p-4 text-sm hover:bg-mist/50"><span><strong>{newEnquiries}</strong> new {newEnquiries === 1 ? "enquiry" : "enquiries"} waiting for a reply</span><span className="font-semibold text-royal">Open</span></Link>}
          {unpublished.map((p) => <Link key={p.id} href={`/pages/${p.id}`} className="flex justify-between p-4 text-sm hover:bg-mist/50"><span><strong>{p.title}</strong> has changes that are not published yet</span><span className="font-semibold text-royal">Review</span></Link>)}
          {drafts > 0 && <Link href="/blog" className="flex justify-between p-4 text-sm hover:bg-mist/50"><span><strong>{drafts}</strong> blog {drafts === 1 ? "draft" : "drafts"} in progress</span><span className="font-semibold text-royal">Open</span></Link>}
        </div>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (<li key={t.href}><Link href={t.href} className="card block h-full p-6 hover:border-royal"><h2 className="font-semibold text-navy">{t.title}</h2><p className="mt-1.5 text-sm text-muted">{t.text}</p></Link></li>))}
      </ul>
    </>
  );
}
