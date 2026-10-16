"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Copy, ExternalLink, History, Plus, Trash2 } from "lucide-react";
import { BLOCK_BY_TYPE, BLOCKS, defaultsFor, type BlockData } from "@northville/content";
import { FieldEditor } from "./FieldEditor";
import { ImageField } from "./MediaPicker";
import { Spinner } from "./Spinner";

type PageProps = { id: string; slug: string; title: string; seoTitle: string; seoDescription: string; seoImageUrl: string | null; blocks: BlockData[]; hasUnpublishedChanges: boolean; isPublished: boolean };
type Version = { id: string; at: string; by: string; note: string };

const uid = () => crypto.randomUUID();

export function PageEditor({ page, versions, perms, pageLinks, webUrl }: { page: PageProps; versions: Version[]; perms: { edit: boolean; publish: boolean; delete: boolean }; pageLinks: string[]; webUrl: string }) {
  const router = useRouter();
  const [title, setTitle] = useState(page.title);
  const [seo, setSeo] = useState({ seoTitle: page.seoTitle, seoDescription: page.seoDescription, seoImageUrl: page.seoImageUrl });
  const [blocks, setBlocks] = useState<BlockData[]>(page.blocks);
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const change = (next: BlockData[]) => { setBlocks(next); setDirty(true); };
  const move = (i: number, d: number) => { const n = [...blocks]; [n[i], n[i + d]] = [n[i + d], n[i]]; change(n); };

  async function call(url: string, method: string, body: unknown, label: string, ok: string) {
    setBusy(label); setMsg(null);
    const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json();
    setBusy("");
    if (!res.ok) { setMsg({ ok: false, text: j.error }); return false; }
    setMsg({ ok: true, text: ok }); router.refresh(); return true;
  }
  const saveDraft = async () => { if (await call(`/api/pages/${page.id}`, "PUT", { title, ...seo, blocks }, "save", "Draft saved. Visitors do not see it yet.")) setDirty(false); };
  async function publish() {
    if (dirty && !(await call(`/api/pages/${page.id}`, "PUT", { title, ...seo, blocks }, "save", ""))) return;
    if (await call(`/api/pages/${page.id}`, "POST", { action: "publish" }, "publish", "Published. The website now shows this page.")) setDirty(false);
  }

  return (
    <div className="space-y-6">
      {pageLinks.length > 0 && <datalist id="page-links">{pageLinks.map((p) => <option key={p} value={p} />)}</datalist>}

      <div className="card p-6">
        <label className="block text-sm font-semibold text-navy">Page name</label>
        <input className="input mt-1.5 max-w-lg" value={title} onChange={(e) => { setTitle(e.target.value); setDirty(true); }} />
        <p className="mt-1 text-[13px] text-muted">Used in the admin and in the browser tab. Address on the website: {page.slug ? `/${page.slug}` : "/ (home page)"}</p>
      </div>

      <section aria-label="Sections">
        <h2 className="mb-1 text-lg font-semibold text-navy">Sections on this page</h2>
        <p className="mb-4 text-sm text-muted">Sections appear on the website from top to bottom, in this order. Use the arrows to reorder them.</p>
        <ol className="space-y-3">
          {blocks.map((b, i) => {
            const def = BLOCK_BY_TYPE[b.type];
            if (!def) return null;
            const isOpen = open === b.id;
            const headline = String(b.data.heading || b.data.heading || def.label);
            return (
              <li key={b.id} className="card overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <button type="button" className="flex flex-1 items-center gap-3 text-left" onClick={() => setOpen(isOpen ? null : b.id)} aria-expanded={isOpen}>
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <span><span className="block text-xs font-semibold uppercase tracking-wider text-royal">{def.label}</span><span className="block font-semibold text-navy">{headline}</span></span>
                  </button>
                  {perms.edit && (
                    <span className="flex gap-1.5">
                      <button type="button" className="rounded-lg border border-line p-2 hover:border-royal disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move section up"><ArrowUp size={15} /></button>
                      <button type="button" className="rounded-lg border border-line p-2 hover:border-royal disabled:opacity-30" disabled={i === blocks.length - 1} onClick={() => move(i, 1)} aria-label="Move section down"><ArrowDown size={15} /></button>
                      <button type="button" className="rounded-lg border border-line p-2 hover:border-royal" onClick={() => { const n = [...blocks]; n.splice(i + 1, 0, { ...b, id: uid(), data: structuredClone(b.data) }); change(n); }} aria-label="Duplicate section"><Copy size={15} /></button>
                      <button type="button" className="rounded-lg border border-line p-2 hover:border-red-300 hover:text-red-600" onClick={() => { if (confirm("Remove this section from the page? You can bring it back by restoring an older version.")) change(blocks.filter((x) => x.id !== b.id)); }} aria-label="Remove section"><Trash2 size={15} /></button>
                    </span>
                  )}
                </div>
                {isOpen && (
                  <div className="space-y-5 border-t border-line bg-mist/30 p-6">
                    <p className="text-sm text-muted">{def.description}</p>
                    {def.pullsFrom && <p className="rounded-lg bg-sky/40 p-3 text-[13px] text-navy">The content shown here comes from <a className="font-semibold underline" href={def.pullsFrom.href}>{def.pullsFrom.label}</a>. Change it there and it updates everywhere it is used.</p>}
                    <fieldset disabled={!perms.edit}><FieldEditor fields={def.fields} value={b.data} onChange={(d) => change(blocks.map((x) => (x.id === b.id ? { ...x, data: d } : x)))} pageLinks={pageLinks} /></fieldset>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {perms.edit && <button type="button" className="btn btn-ghost mt-4" onClick={() => setAdding(true)}><Plus size={16} /> Add a section</button>}
      </section>

      <details className="card p-6">
        <summary className="cursor-pointer text-lg font-semibold text-navy">Search engine settings</summary>
        <div className="mt-5 space-y-5">
          <div><label className="block text-sm font-semibold text-navy">Google title</label><input className="input mt-1.5" maxLength={70} value={seo.seoTitle} onChange={(e) => { setSeo({ ...seo, seoTitle: e.target.value }); setDirty(true); }} /><p className="mt-1 text-[13px] text-muted">About 60 characters. Include the main thing people would search for. Shows in Google results and the browser tab.</p></div>
          <div><label className="block text-sm font-semibold text-navy">Google description</label><textarea className="input mt-1.5" rows={3} maxLength={200} value={seo.seoDescription} onChange={(e) => { setSeo({ ...seo, seoDescription: e.target.value }); setDirty(true); }} /><p className="mt-1 text-[13px] text-muted">About 150 characters. Tells searchers why to click. {seo.seoDescription.length}/200</p></div>
          <div><label className="block text-sm font-semibold text-navy">Sharing picture</label><div className="mt-2"><ImageField value={seo.seoImageUrl} onChange={(u) => { setSeo({ ...seo, seoImageUrl: u }); setDirty(true); }} /></div><p className="mt-1 text-[13px] text-muted">Shown when the page is shared on LinkedIn, WhatsApp and similar. Empty uses the default from Site settings.</p></div>
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs font-semibold text-muted">How this page may look in Google</p>
            <p className={`mt-2 text-lg leading-snug ${(seo.seoTitle || title).length > 60 ? "text-red-700" : "text-[#1a0dab]"}`}>{seo.seoTitle || title}</p>
            <p className="text-sm text-green-800">yourwebsite.com{page.slug ? `/${page.slug}` : ""}</p>
            <p className="mt-1 text-sm text-ink/80">{seo.seoDescription || "No description yet. Google will pick some text from the page, which is usually less persuasive than your own."}</p>
            {(seo.seoTitle || title).length > 60 && <p className="mt-2 text-[13px] text-red-700">The title is longer than 60 characters, so Google may cut it off.</p>}
          </div>
        </div>
      </details>

      {versions.length > 0 && (
        <div className="card p-6">
          <button type="button" className="flex items-center gap-2 text-lg font-semibold text-navy" onClick={() => setShowHistory(!showHistory)}><History size={18} /> Earlier versions</button>
          {showHistory && (
            <ul className="mt-4 divide-y divide-line">
              {versions.map((v) => (
                <li key={v.id} className="flex items-center justify-between py-3 text-sm">
                  <span>{new Date(v.at).toLocaleString("en-IN")} <span className="text-muted">by {v.by || "unknown"}</span></span>
                  {perms.edit && <button type="button" className="btn btn-ghost" onClick={async () => { if (confirm("Load this older version into your draft? Your current draft will be replaced.")) await call(`/api/pages/${page.id}`, "POST", { action: "restore", versionId: v.id }, "restore", "Older version loaded into your draft. Review it, then publish."); router.refresh(); setTimeout(() => window.location.reload(), 300); }}>Restore as draft</button>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="sticky bottom-0 -mx-1 flex flex-wrap flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/95 p-4 backdrop-blur">
        {perms.edit && <button type="button" className="btn btn-ghost" disabled={!!busy || !dirty} onClick={saveDraft}>{busy === "save" ? <><Spinner /> Saving...</> : "Save draft"}</button>}
        {perms.publish && <button type="button" className="btn btn-primary" disabled={!!busy || (!dirty && !page.hasUnpublishedChanges && page.isPublished)} onClick={publish}>{busy === "publish" ? <><Spinner /> Publishing...</> : "Publish to website"}</button>}
        {perms.edit && page.hasUnpublishedChanges && !dirty && <button type="button" className="btn btn-ghost" onClick={async () => { if (confirm("Throw away your draft and go back to what is live?")) { await call(`/api/pages/${page.id}`, "POST", { action: "discard" }, "discard", "Draft reset to the live version."); setTimeout(() => window.location.reload(), 300); } }}>Discard draft</button>}
        {page.isPublished && <a href={`${webUrl}${page.slug ? `/${page.slug}` : ""}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><ExternalLink size={15} /> View live page</a>}
        <span className="text-sm text-muted">{dirty ? "You have unsaved changes." : page.hasUnpublishedChanges ? "Draft saved, not published yet." : "Everything is published."}</span>
        {msg && <span role="status" className={`text-sm font-medium ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.text}</span>}
        {perms.delete && !["", "blog", "contact"].includes(page.slug) && <button type="button" className="btn btn-danger ml-auto" onClick={async () => { if (confirm("Delete this page for good?")) { const res = await fetch(`/api/pages/${page.id}`, { method: "DELETE" }); if (res.ok) router.push("/pages"); else alert((await res.json()).error); } }}>Delete page</button>}
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/60 p-4" role="dialog" aria-modal="true" aria-label="Add a section">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-navy">What do you want to add?</h2><button className="btn btn-ghost" onClick={() => setAdding(false)}>Cancel</button></div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {BLOCKS.map((def) => (
                <li key={def.type}>
                  <button type="button" className="h-full w-full rounded-xl border border-line p-4 text-left hover:border-royal hover:bg-mist/50" onClick={() => { const nb = { id: uid(), type: def.type, data: defaultsFor(def.fields) }; change([...blocks, nb]); setOpen(nb.id); setAdding(false); }}>
                    <span className="block font-semibold text-navy">{def.label}</span><span className="mt-1 block text-[13px] leading-snug text-muted">{def.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
