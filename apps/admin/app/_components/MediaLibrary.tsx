"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Trash2, Upload } from "lucide-react";

type Item = { id: string; url: string; name: string; alt: string; sizeBytes: number };

export function MediaLibrary({ canEdit, canDelete }: { canEdit: boolean; canDelete: boolean }) {
  const [items, setItems] = useState<Item[]>([]); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const load = () => fetch("/api/media").then((r) => r.json()).then((j) => setItems(j.items ?? []));
  useEffect(() => { load(); }, []);
  async function upload(files: FileList | null) {
    if (!files?.length) return; setBusy(true); setErr("");
    for (const f of Array.from(files)) { const fd = new FormData(); fd.append("file", f); const r = await fetch("/api/media", { method: "POST", body: fd }); if (!r.ok) { setErr((await r.json()).error); break; } }
    setBusy(false); load();
  }
  return (
    <div>
      {canEdit && <label className="btn btn-primary mb-6 cursor-pointer"><Upload size={16} /> {busy ? "Uploading..." : "Upload pictures"}<input type="file" hidden multiple accept="image/*" onChange={(e) => upload(e.target.files)} /></label>}
      {err && <p className="mb-4 text-sm text-red-700">{err}</p>}
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((i) => (
          <li key={i.id} className="card overflow-hidden">
            <img src={i.url} alt={i.alt || i.name} loading="lazy" className="aspect-square w-full object-cover" />
            <div className="space-y-2 p-3">
              <p className="truncate text-xs text-muted" title={i.name}>{i.name}</p>
              {canEdit && <input className="input !py-1.5 !text-xs" placeholder="Describe the picture (helps Google)" defaultValue={i.alt} onBlur={(e) => fetch("/api/media", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: i.id, alt: e.target.value }) })} />}
              {canDelete && <button className="text-xs text-red-600" onClick={async () => { if (confirm("Delete this picture? Pages already using it may show a gap.")) { await fetch("/api/media", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: i.id }) }); load(); } }}><Trash2 size={13} className="mr-1 inline" />Delete</button>}
            </div>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="card p-10 text-center text-muted">No uploads yet.</p>}
    </div>
  );
}
