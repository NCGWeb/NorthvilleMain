"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "./Spinner";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useReorder } from "./ReorderList";

export function RowActions({ collection, id, canMove, first, last, canDelete, canOpen = true }: { canOpen?: boolean; collection: string; id: string; canMove: boolean; first: boolean; last: boolean; canDelete: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  // Inside a ReorderList the row moves at once and saves in the background.
  const list = useReorder();
  const pos = list ? list.edge(id) : { first, last };
  async function del() {
    if (!confirm("Delete this for good? This cannot be undone. To just hide it from the website, edit it and switch off Show on website instead.")) return;
    setBusy(true);
    const res = await fetch(`/api/c/${collection}/${id}`, { method: "DELETE" });
    if (!res.ok) alert((await res.json()).error);
    router.refresh();
    setTimeout(() => setBusy(false), 400);
  }
  const b = "rounded-lg border border-line p-2 text-ink hover:border-royal hover:text-royal disabled:opacity-30";
  return (
    <div className="flex items-center gap-1.5">
      {busy && <span className="text-royal"><Spinner size={16} /></span>}
      {canOpen && <Link href={`/${collection}/${id}`} className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:border-royal hover:text-royal">Edit</Link>}
      {canMove && <><button type="button" className={b} disabled={pos.first || busy} onClick={() => list?.move(id, -1)} aria-label="Move up"><ArrowUp size={15} /></button>
      <button type="button" className={b} disabled={pos.last || busy} onClick={() => list?.move(id, 1)} aria-label="Move down"><ArrowDown size={15} /></button></>}
      {canDelete && <button type="button" className={`${b} hover:!border-red-300 hover:!text-red-600`} onClick={del} disabled={busy} aria-label="Delete"><Trash2 size={15} /></button>}
    </div>
  );
}
