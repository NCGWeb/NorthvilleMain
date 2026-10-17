import Link from "next/link";
import { prisma } from "@northville/database";
import { PageHeader } from "../../_components/Chrome";
import { EnquiryRow } from "../../_components/EnquiryRow";
import { requireUser } from "../../_lib/session";

const PAGE_SIZE = 30;
const STATUSES = ["NEW", "IN_PROGRESS", "DONE", "SPAM"] as const;
type Status = (typeof STATUSES)[number];

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const user = await requireUser("enquiries:view");
  const { q = "", status, page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const st = STATUSES.find((x) => x === status) as Status | undefined;
  const term = q.trim();
  const where = {
    ...(st ? { status: st } : {}),
    ...(term ? { OR: [{ name: { contains: term, mode: "insensitive" as const } }, { email: { contains: term, mode: "insensitive" as const } }, { message: { contains: term, mode: "insensitive" as const } }] } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.enquiry.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.enquiry.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) => `/enquiries?${new URLSearchParams({ ...(term ? { q: term } : {}), ...(st ? { status: st } : {}), page: String(p) })}`;
  return (
    <>
      <PageHeader title="Enquiries" description="Messages sent through the Contact form. Each one is also emailed to the address in Site settings, Contact details. Enquiries marked Email not sent were saved here but the email did not go out, so please follow them up." where="Not shown on the website. Private." />
      <form className="mb-4 flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={term} className="input max-w-sm" placeholder="Search name, email or message" aria-label="Search enquiries" />
        <select name="status" defaultValue={st ?? ""} className="input !w-auto" aria-label="Filter by status"><option value="">Every status</option><option value="NEW">New</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option><option value="SPAM">Spam</option></select>
        <button className="btn btn-ghost">Search</button>
        {(term || st) && <Link href="/enquiries" className="btn btn-ghost">Clear</Link>}
      </form>
      <ul className="space-y-3">
        {rows.map((r) => <EnquiryRow key={r.id} canEdit={user.permissions.includes("enquiries:edit")} canDelete={user.permissions.includes("enquiries:delete")} e={{ id: r.id, name: r.name, email: r.email, phone: r.phone, message: r.message, status: r.status, note: r.note, emailStatus: r.emailStatus, at: r.createdAt.toISOString() }} />)}
        {rows.length === 0 && <li className="card p-10 text-center text-muted">{term || st ? "No enquiries match." : "No enquiries yet."}</li>}
      </ul>
      {pages > 1 && (
        <nav aria-label="Pages" className="mt-6 flex items-center justify-between text-sm text-muted">
          <span>Page {page} of {pages} ({total} in all)</span>
          <span className="flex gap-2">{page > 1 && <Link href={href(page - 1)} className="btn btn-ghost">Previous</Link>}{page < pages && <Link href={href(page + 1)} className="btn btn-ghost">Next</Link>}</span>
        </nav>
      )}
    </>
  );
}
