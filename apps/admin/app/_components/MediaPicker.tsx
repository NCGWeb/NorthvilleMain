"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import { Spinner } from "./Spinner";

type Item = { id: string; url: string; name: string; alt: string };

/** Pick an existing image or upload a new one. Used by every image field. */
export function ImageField({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {value ? (
        <div className="flex items-center gap-4">
          <img src={value} alt="" className="h-24 w-24 rounded-xl border border-line object-cover" />
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(true)}>Change image</button>
            <button type="button" className="btn btn-ghost" onClick={() => onChange(null)}>Remove</button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(true)}><ImagePlus size={16} /> Choose image</button>
      )}
      {open && <Picker onClose={() => setOpen(false)} onPick={(u) => { onChange(u); setOpen(false); }} />}
    </div>
  );
}

export function Picker({ onClose, onPick }: { onClose: () => void; onPick: (url: string, alt: string) => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = (page = 1) => fetch(`/api/media?page=${page}`).then((r) => r.json()).then((j) => { setItems((x) => (page === 1 ? j.items ?? [] : [...x, ...(j.items ?? [])])); setMore(!!j.hasMore); });
  useEffect(() => { load(); }, []);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setError("");
    for (const f of Array.from(files)) {
      const fd = new FormData(); fd.append("file", f);
      const res = await fetch("/api/media", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) { setError(j.error); break; }
    }
    await load(); setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/60 p-4" role="dialog" aria-modal="true" aria-label="Choose an image">
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line p-5">
          <div><h2 className="text-lg font-semibold text-navy">Choose an image</h2><p className="text-sm text-muted">Pick one from your library or upload a new one. JPG, PNG, WebP or GIF up to 12 MB. Large pictures are shrunk automatically.</p></div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 hover:bg-mist"><X size={18} /></button>
        </div>
        <div className="border-b border-line p-4">
          <label className="btn btn-primary cursor-pointer"><Upload size={16} /> {busy ? <><Spinner /> Uploading...</> : "Upload new image"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple hidden onChange={(e) => upload(e.target.files)} />
          </label>
          {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
        </div>
        <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-4 sm:grid-cols-4 md:grid-cols-5">
          {items.map((i) => (
            <button key={i.id} type="button" onClick={() => onPick(i.url, i.alt)} className="group overflow-hidden rounded-xl border border-line text-left hover:border-royal">
              <img src={i.url} alt={i.alt || i.name} loading="lazy" className="aspect-square w-full object-cover" />
              <span className="block truncate px-2 py-1.5 text-xs text-muted">{i.name}</span>
            </button>
          ))}
          {items.length === 0 && <p className="col-span-full py-10 text-center text-muted">No images yet. Upload your first one above.</p>}
          {more && <div className="col-span-full text-center"><button type="button" className="btn btn-ghost" onClick={() => load(Math.floor(items.length / 60) + 1)}>Show more</button></div>}
        </div>
      </div>
    </div>
  );
}
