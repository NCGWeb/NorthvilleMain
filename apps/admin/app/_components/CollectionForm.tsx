"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BLOCKS, defaultsFor, type CollectionDef, type Field } from "@northville/content";
import { FieldEditor, type Values } from "./FieldEditor";
import { Spinner } from "./Spinner";

type Props = { collectionKey: string; fields: Field[]; initial: Values; id?: string; canEdit: boolean; def: Pick<CollectionDef, "singular" | "label" | "key">; pageLinks: string[]; shared?: { type: string; name: string } };

/** One form for every list. Fields come from the definition in @northville/content. */
export function CollectionForm({ collectionKey, fields, initial, id, canEdit, def, pageLinks, shared }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initial);
  const [sharedType, setSharedType] = useState(shared?.type ?? "");
  const [sharedName, setSharedName] = useState(shared?.name ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const activeFields = shared ? (BLOCKS.find((b) => b.type === sharedType)?.fields ?? []) : fields;

  async function save() {
    setBusy(true); setMsg(null);
    const payload = shared !== undefined ? { name: sharedName, type: sharedType, data: values } : values;
    const res = await fetch(id ? `/api/c/${collectionKey}/${id}` : `/api/c/${collectionKey}`, { method: id ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) { setMsg({ ok: false, text: j.error }); return; }
    if (!id) { router.push(`/${collectionKey}/${j.id}`); router.refresh(); return; }
    setMsg({ ok: true, text: "Saved. The website will show this within a few seconds." });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {pageLinks.length > 0 && <datalist id="page-links">{pageLinks.map((p) => <option key={p} value={p} />)}</datalist>}
      <div className="card space-y-6 p-6 md:p-8">
        {shared !== undefined && (
          <>
            <div><label className="block text-sm font-semibold text-navy">Section name *</label><input className="input mt-1.5" value={sharedName} onChange={(e) => setSharedName(e.target.value)} /><p className="mt-1 text-[13px] text-muted">Only you see this name. It helps you pick the section when editing a page.</p></div>
            {!id && (
              <div><label className="block text-sm font-semibold text-navy">What kind of section is it? *</label>
                <select className="input mt-1.5" value={sharedType} onChange={(e) => { setSharedType(e.target.value); setValues(defaultsFor(BLOCKS.find((b) => b.type === e.target.value)?.fields ?? [])); }}>
                  <option value="">Choose...</option>{BLOCKS.filter((b) => !["shared", "contactForm", "offices"].includes(b.type)).map((b) => <option key={b.type} value={b.type}>{b.label}</option>)}
                </select></div>
            )}
          </>
        )}
        {activeFields.length > 0 && <FieldEditor fields={activeFields} value={values} onChange={setValues} pageLinks={pageLinks} />}
      </div>
      <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white/95 p-4 backdrop-blur">
        {canEdit ? <button type="button" disabled={busy} onClick={save} className="btn btn-primary">{busy ? <><Spinner /> Saving...</> : id ? "Save changes" : `Add ${def.singular.toLowerCase()}`}</button> : <p className="text-sm text-muted">You can view this but not edit it.</p>}
        <Link href={`/${def.key}`} className="btn btn-ghost">Back to {def.label.toLowerCase()}</Link>
        {msg && <p role="status" className={`text-sm font-medium ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.text}</p>}
      </div>
    </div>
  );
}
