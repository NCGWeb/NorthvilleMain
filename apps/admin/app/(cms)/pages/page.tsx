import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { prisma } from "@northville/database";
import { PageHeader } from "../../_components/Chrome";
import { requireUser } from "../../_lib/session";

export default async function PagesList() {
  const user = await requireUser("pages:view");
  const pages = await prisma.page.findMany({ orderBy: [{ slug: "asc" }] });
  const web = process.env.WEB_URL ?? "http://localhost:3000";
  const sorted = [...pages].sort((a, b) => (a.slug === "" ? -1 : b.slug === "" ? 1 : a.title.localeCompare(b.title)));
  return (
    <>
      <PageHeader title="Pages" description="Each page is built from sections. Open a page to change its words, pictures and the order of its sections. Nothing goes live until you press Publish."
        actions={user.permissions.includes("pages:edit") && <Link href="/pages/new" className="btn btn-primary"><Plus size={16} /> New page</Link>} />
      <ul className="card divide-y divide-line">
        {sorted.map((p) => (
          <li key={p.id} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <Link href={`/pages/${p.id}`} className="font-semibold text-navy hover:text-royal">{p.title}</Link>
              <p className="text-sm text-muted">{p.slug === "" ? "/ (home page)" : `/${p.slug}`}</p>
            </div>
            {!p.isPublished && <span className="rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-muted">Offline</span>}
            {p.hasUnpublishedChanges && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Unpublished changes</span>}
            {p.isPublished && <a href={`${web}${p.slug ? `/${p.slug}` : ""}`} target="_blank" rel="noopener noreferrer" aria-label="View on website" className="text-muted hover:text-royal"><ExternalLink size={16} /></a>}
          </li>
        ))}
      </ul>
    </>
  );
}
