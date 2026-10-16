"use client";
import { useState } from "react";
import type { Field } from "@northville/content";
import { FieldEditor, type Values } from "./FieldEditor";
import { Spinner } from "./Spinner";

export function SettingsForm({ groupKey, fields, initial, canEdit, pageLinks }: { groupKey: string; fields: Field[]; initial: Values; canEdit: boolean; pageLinks: string[] }) {
  const [v, setV] = useState<Values>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function save() {
    setBusy(true); setMsg(null);
    const res = await fetch(`/api/settings/${groupKey}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(v) });
    const j = await res.json(); setBusy(false);
    setMsg(res.ok ? { ok: true, text: "Saved. The website updates within a few seconds." } : { ok: false, text: j.error });
  }
  return (
    <div className="space-y-6">
      {pageLinks.length > 0 && <datalist id="page-links">{pageLinks.map((p) => <option key={p} value={p} />)}</datalist>}
      <fieldset disabled={!canEdit} className="card p-6 md:p-8"><FieldEditor fields={fields} value={v} onChange={setV} pageLinks={pageLinks} /></fieldset>
      <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white/95 p-4 backdrop-blur">
        {canEdit ? <button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? <><Spinner /> Saving...</> : "Save changes"}</button> : <p className="text-sm text-muted">You can view this but not edit it.</p>}
        {msg && <p role="status" className={`text-sm font-medium ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.text}</p>}
      </div>
    </div>
  );
}
