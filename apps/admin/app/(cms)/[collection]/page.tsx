import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, ExternalLink } from "lucide-react";
import { COLLECTION_BY_KEY } from "@northville/content";
import { PageHeader } from "../../_components/Chrome";
import { RowActions } from "../../_components/RowActions";
import { ReorderList } from "../../_components/ReorderList";
import { SavedNotice } from "../../_components/SavedNotice";
import { delegate } from "../../_lib/collection";
import { requireUser } from "../../_lib/session";

export default async function ListPage({ params, searchParams }: { params: Promise<{ collection: string }>; searchParams: Promise<{ saved?: string; q?: string; page?: string }> }) {
  const { collection } = await params;
  const { saved, q = "", page: pageRaw } = await searchParams;
  const def = COLLECTION_BY_KEY[collection];
  if (!def) notFound();
  const user = await requireUser(`${def.area}:view`);
  const canEdit = user.permissions.includes(`${def.area}:edit`) && !def.readOnly;
  const canDelete = user.permissions.includes(`${def.area}:delete`);
  // Long lists (chat questions, blog posts) are searched and shown 50 at a time.
  const PAGE_SIZE = 50;
  const page = Math.max(1, Number(pageRaw) || 1);
  const where = q.trim() ? { [def.titleField]: { contains: q.trim(), mode: "insensitive" } } : undefined;
  const [rows, total]: [Record<string, unknown>[], number] = await Promise.all([
    delegate(def.model).findMany({ where, orderBy: [def.orderBy, { id: "asc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    delegate(def.model).count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) => `/${def.key}?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;
  const web = process.env.WEB_URL ?? "http://localhost:3000";
  const sortable = ("sortOrder" in (rows[0] ?? {}) || def.orderBy.sortOrder !== undefined) && !q;
  const groupLabel = (r: Record<string, unknown>) => (def.groupBy ? String(r[def.groupBy] ?? "") : "");

  return (
    <>
      <PageHeader title={def.label} description={def.description} where={def.where}
        actions={canEdit && <Link href={`/${def.key}/new`} className="btn btn-primary"><Plus size={16} /> Add {def.singular.toLowerCase()}</Link>} />
      <SavedNotice show={saved === "1"} />
      {(total > PAGE_SIZE || q) && (
        <form className="mb-4 flex gap-2" role="search">
          <input name="q" defaultValue={q} className="input max-w-sm" placeholder={`Search ${def.label.toLowerCase()}`} aria-label={`Search ${def.label.toLowerCase()}`} />
          <button className="btn btn-ghost">Search</button>
          {q && <Link href={`/${def.key}`} className="btn btn-ghost">Clear</Link>}
        </form>
      )}
      {rows.length === 0 ? (
        <div className="card p-10 text-center text-muted">{q ? "Nothing matches that search." : "Nothing here yet."}{!q && canEdit && <> <Link href={`/${def.key}/new`} className="font-semibold text-royal">Add the first one.</Link></>}{canEdit && <> <Link href={`/${def.key}/new`} className="font-semibold text-royal">Add the first one.</Link></>}</div>
      ) : (
        <ReorderList collection={def.key} offset={(page - 1) * PAGE_SIZE} total={total} rows={rows.map((r, i) => {
            const hidden = def.visibleField ? !r[def.visibleField] : false;
            const path = def.publicPath?.(r);
            return { id: String(r.id), group: groupLabel(r), node: (
              <li className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                <div className="min-w-0 flex-1">
                  {def.readOnly ? <span className="font-semibold text-navy">{String(r[def.titleField] ?? "")}</span> : <Link href={`/${def.key}/${r.id}`} className="font-semibold text-navy hover:text-royal">{String(r[def.titleField] ?? "Untitled")}</Link>}
                  {def.subtitleField && <p className="truncate text-sm text-muted">{r[def.subtitleField] instanceof Date ? (r[def.subtitleField] as Date).toLocaleString("en-IN") : String(r[def.subtitleField] ?? "").slice(0, 110)}</p>}
                  {def.groupBy && groupLabel(r) && def.key === "logos" && <span className="mt-1 inline-block rounded bg-mist px-2 py-0.5 text-xs text-muted">{groupLabel(r)}</span>}
                </div>
                {hidden && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Hidden on site</span>}
                {def.key === "blog" && <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.status === "PUBLISHED" ? "bg-green-100 text-green-800" : r.status === "SCHEDULED" ? "bg-sky/60 text-navy" : "bg-mist text-muted"}`}>{r.status === "PUBLISHED" ? "Live" : r.status === "SCHEDULED" ? "Scheduled" : "Draft"}</span>}
                {path && !hidden && <a href={`${web}${path}`} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-royal" aria-label="View on website"><ExternalLink size={16} /></a>}
                {def.key === "chatQuestions" && <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.answered ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{r.answered ? "Answered" : "Not answered"}</span>}
                {(canEdit || (def.readOnly && canDelete)) && <RowActions collection={def.key} id={String(r.id)} canMove={sortable && def.key !== "blog" && !def.readOnly} canOpen={!def.readOnly} first={(page - 1) * PAGE_SIZE + i === 0} last={(page - 1) * PAGE_SIZE + i === total - 1} canDelete={user.permissions.includes(`${def.area}:delete`)} />}
              </li>
            ) };
          })} />
      )}
      {pages > 1 && (
        <nav aria-label="Pages" className="mt-6 flex items-center justify-between text-sm text-muted">
          <span>Page {page} of {pages} ({total} in all)</span>
          <span className="flex gap-2">
            {page > 1 && <Link href={href(page - 1)} className="btn btn-ghost">Previous</Link>}
            {page < pages && <Link href={href(page + 1)} className="btn btn-ghost">Next</Link>}
          </span>
        </nav>
      )}
    </>
  );
}
