"use client";
import { createContext, Fragment, useContext, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type Row = { id: string; group: string; node: ReactNode };
type Ctx = { move: (id: string, dir: -1 | 1) => void; edge: (id: string) => { first: boolean; last: boolean } };
const ReorderCtx = createContext<Ctx | null>(null);
export const useReorder = () => useContext(ReorderCtx);

/**
 * A list whose rows move on screen the moment an arrow is pressed. Saves run one after another in
 * the background, and the list reloads from the server only if a save fails.
 */
export function ReorderList({ collection, rows, offset, total }: { collection: string; rows: Row[]; offset: number; total: number }) {
  const router = useRouter();
  const [order, setOrder] = useState(() => rows.map((r) => r.id));
  const [error, setError] = useState("");
  const queue = useRef<Promise<void>>(Promise.resolve());
  const byId = new Map(rows.map((r) => [r.id, r]));
  // Rows can change after an edit or delete elsewhere, so keep the local order in step with them.
  const ids = rows.map((r) => r.id).join();
  const [seen, setSeen] = useState(ids);
  if (seen !== ids) { setSeen(ids); setOrder(rows.map((r) => r.id)); }

  // Moves swap with the nearest row in the same group (logos on the same wall), as the server does.
  const neighbour = (list: string[], i: number, dir: -1 | 1) => {
    const g = byId.get(list[i])?.group;
    for (let j = i + dir; j >= 0 && j < list.length; j += dir) if (byId.get(list[j])?.group === g) return j;
    return -1;
  };

  function move(id: string, dir: -1 | 1) {
    const i = order.indexOf(id), j = neighbour(order, i, dir);
    if (i < 0 || j < 0) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    setError("");
    queue.current = queue.current.then(async () => {
      const res = await fetch(`/api/c/${collection}/reorder`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, dir }) }).catch(() => null);
      if (!res?.ok) { setError("That move could not be saved. The list has been reloaded."); router.refresh(); }
    });
  }

  function edge(id: string) {
    const i = order.indexOf(id);
    const grouped = rows.some((r) => r.group);
    if (grouped) return { first: neighbour(order, i, -1) < 0, last: neighbour(order, i, 1) < 0 };
    return { first: offset + i === 0, last: offset + i === total - 1 };
  }

  return (
    <ReorderCtx.Provider value={{ move, edge }}>
      {error && <p role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      <ul className="card divide-y divide-line">{order.map((id) => <Fragment key={id}>{byId.get(id)?.node}</Fragment>)}</ul>
    </ReorderCtx.Provider>
  );
}
