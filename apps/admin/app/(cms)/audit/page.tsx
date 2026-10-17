import Link from "next/link";
import { prisma } from "@northville/database";
import { PageHeader } from "../../_components/Chrome";
import { requireUser } from "../../_lib/session";

const PAGE_SIZE = 50;

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireUser("audit:view");
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, include: { user: { select: { name: true } } } }),
    prisma.auditLog.count(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <>
      <PageHeader title="Activity log" description="Who did what and when, newest first. The last 12 months are kept. Useful if something looks different and you want to know why." />
      <ul className="card divide-y divide-line">
        {rows.map((r) => (<li key={r.id} className="flex flex-wrap items-baseline justify-between gap-2 p-4 text-sm"><span><strong className="text-navy">{r.user?.name ?? "Someone"}</strong> {r.action} <span className="text-ink">{r.target}</span>{r.summary && <span className="text-muted"> ({r.summary})</span>}</span><time className="text-muted">{r.createdAt.toLocaleString("en-IN")}</time></li>))}
        {rows.length === 0 && <li className="p-10 text-center text-muted">Nothing recorded yet.</li>}
      </ul>
      {pages > 1 && (
        <nav aria-label="Pages" className="mt-6 flex items-center justify-between text-sm text-muted">
          <span>Page {page} of {pages}</span>
          <span className="flex gap-2">{page > 1 && <Link href={`/audit?page=${page - 1}`} className="btn btn-ghost">Previous</Link>}{page < pages && <Link href={`/audit?page=${page + 1}`} className="btn btn-ghost">Next</Link>}</span>
        </nav>
      )}
    </>
  );
}
