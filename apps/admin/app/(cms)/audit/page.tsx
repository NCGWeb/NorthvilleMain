import { prisma } from "@northville/database";
import { PageHeader } from "../../_components/Chrome";
import { requireUser } from "../../_lib/session";

export default async function AuditPage() {
  await requireUser("audit:view");
  const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { user: { select: { name: true } } } });
  return (
    <>
      <PageHeader title="Activity log" description="The last 200 changes: who did what and when. Useful if something looks different and you want to know why." />
      <ul className="card divide-y divide-line">
        {rows.map((r) => (<li key={r.id} className="flex flex-wrap items-baseline justify-between gap-2 p-4 text-sm"><span><strong className="text-navy">{r.user?.name ?? "Someone"}</strong> {r.action} <span className="text-ink">{r.target}</span>{r.summary && <span className="text-muted"> ({r.summary})</span>}</span><time className="text-muted">{r.createdAt.toLocaleString("en-IN")}</time></li>))}
        {rows.length === 0 && <li className="p-10 text-center text-muted">Nothing recorded yet.</li>}
      </ul>
    </>
  );
}
