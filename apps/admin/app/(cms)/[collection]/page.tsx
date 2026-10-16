import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, ExternalLink } from "lucide-react";
import { COLLECTION_BY_KEY } from "@northville/content";
import { PageHeader } from "../../_components/Chrome";
import { RowActions } from "../../_components/RowActions";
import { delegate } from "../../_lib/collection";
import { requireUser } from "../../_lib/session";

export default async function ListPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const def = COLLECTION_BY_KEY[collection];
  if (!def) notFound();
  const user = await requireUser(`${def.area}:view`);
  const canEdit = user.permissions.includes(`${def.area}:edit`);
  const rows: Record<string, unknown>[] = await delegate(def.model).findMany({ orderBy: def.orderBy });
  const web = process.env.WEB_URL ?? "http://localhost:3000";
  const sortable = "sortOrder" in (rows[0] ?? {}) || (def.orderBy.sortOrder !== undefined);
  const groupLabel = (r: Record<string, unknown>) => (def.groupBy ? String(r[def.groupBy] ?? "") : "");

  return (
    <>
      <PageHeader title={def.label} description={def.description} where={def.where}
        actions={canEdit && <Link href={`/${def.key}/new`} className="btn btn-primary"><Plus size={16} /> Add {def.singular.toLowerCase()}</Link>} />
      {rows.length === 0 ? (
        <div className="card p-10 text-center text-muted">Nothing here yet.{canEdit && <> <Link href={`/${def.key}/new`} className="font-semibold text-royal">Add the first one.</Link></>}</div>
      ) : (
        <ul className="card divide-y divide-line">
          {rows.map((r, i) => {
            const hidden = def.visibleField ? !r[def.visibleField] : false;
            const path = def.publicPath?.(r);
            return (
              <li key={String(r.id)} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/${def.key}/${r.id}`} className="font-semibold text-navy hover:text-royal">{String(r[def.titleField] ?? "Untitled")}</Link>
                  {def.subtitleField && <p className="truncate text-sm text-muted">{String(r[def.subtitleField] ?? "").slice(0, 110)}</p>}
                  {def.groupBy && groupLabel(r) && def.key === "logos" && <span className="mt-1 inline-block rounded bg-mist px-2 py-0.5 text-xs text-muted">{groupLabel(r)}</span>}
                </div>
                {hidden && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Hidden on site</span>}
                {def.key === "blog" && <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.status === "PUBLISHED" ? "bg-green-100 text-green-800" : r.status === "SCHEDULED" ? "bg-sky/60 text-navy" : "bg-mist text-muted"}`}>{r.status === "PUBLISHED" ? "Live" : r.status === "SCHEDULED" ? "Scheduled" : "Draft"}</span>}
                {path && !hidden && <a href={`${web}${path}`} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-royal" aria-label="View on website"><ExternalLink size={16} /></a>}
                {canEdit && <RowActions collection={def.key} id={String(r.id)} canMove={sortable && def.key !== "blog"} first={i === 0} last={i === rows.length - 1} canDelete={user.permissions.includes(`${def.area}:delete`)} />}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
