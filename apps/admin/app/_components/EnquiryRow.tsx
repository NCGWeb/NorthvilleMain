"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type E = { id: string; name: string; email: string; phone: string; message: string; status: string; note: string; at: string };
const LABEL: Record<string, string> = { NEW: "New", IN_PROGRESS: "In progress", DONE: "Done", SPAM: "Spam" };

export function EnquiryRow({ e, canEdit, canDelete }: { e: E; canEdit: boolean; canDelete: boolean }) {
  const router = useRouter(); const [note, setNote] = useState(e.note);
  const patch = async (body: object) => { await fetch(`/api/enquiries/${e.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); router.refresh(); };
  return (
    <li className={`card p-5 ${e.status === "NEW" ? "border-royal/50" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="font-semibold text-navy">{e.name}</p><p className="text-sm text-muted"><a className="hover:text-royal" href={`mailto:${e.email}`}>{e.email}</a>{e.phone && <> · <a className="hover:text-royal" href={`tel:${e.phone}`}>{e.phone}</a></>} · {new Date(e.at).toLocaleString("en-IN")}</p></div>
        {canEdit ? <select className="input !w-auto" value={e.status} onChange={(ev) => patch({ status: ev.target.value })}>{Object.entries(LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select> : <span className="text-sm">{LABEL[e.status]}</span>}
      </div>
      {e.message && <p className="mt-3 whitespace-pre-wrap text-[15px] text-ink/85">{e.message}</p>}
      {canEdit && <input className="input mt-3" placeholder="Private note for your team" value={note} onChange={(ev) => setNote(ev.target.value)} onBlur={() => note !== e.note && patch({ note })} />}
      {canDelete && <button className="mt-3 text-xs text-red-600" onClick={async () => { if (confirm("Delete this enquiry for good?")) { await fetch(`/api/enquiries/${e.id}`, { method: "DELETE" }); router.refresh(); } }}>Delete</button>}
    </li>
  );
}
