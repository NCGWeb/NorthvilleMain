"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

export function RowActions({ collection, id, canMove, first, last, canDelete }: { collection: string; id: string; canMove: boolean; first: boolean; last: boolean; canDelete: boolean }) {
  const router = useRouter();
  async function move(dir: -1 | 1) {
    await fetch(`/api/c/${collection}/reorder`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, dir }) });
    router.refresh();
  }
  async function del() {
    if (!confirm("Delete this for good? This cannot be undone. To just hide it from the website, edit it and switch off Show on website instead.")) return;
    const res = await fetch(`/api/c/${collection}/${id}`, { method: "DELETE" });
    if (!res.ok) alert((await res.json()).error);
    router.refresh();
  }
  const b = "rounded-lg border border-line p-2 text-ink hover:border-royal hover:text-royal disabled:opacity-30";
  return (
    <div className="flex items-center gap-1.5">
      <Link href={`/${collection}/${id}`} className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:border-royal hover:text-royal">Edit</Link>
      {canMove && <><button type="button" className={b} disabled={first} onClick={() => move(-1)} aria-label="Move up"><ArrowUp size={15} /></button>
      <button type="button" className={b} disabled={last} onClick={() => move(1)} aria-label="Move down"><ArrowDown size={15} /></button></>}
      {canDelete && <button type="button" className={`${b} hover:!border-red-300 hover:!text-red-600`} onClick={del} aria-label="Delete"><Trash2 size={15} /></button>}
    </div>
  );
}
