"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewPageForm() {
  const router = useRouter();
  const [title, setTitle] = useState(""); const [slug, setSlug] = useState(""); const [err, setErr] = useState("");
  async function go() {
    const res = await fetch("/api/pages", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, slug }) });
    const j = await res.json();
    if (!res.ok) return setErr(j.error);
    router.push(`/pages/${j.id}`);
  }
  return (
    <div className="card max-w-xl space-y-5 p-6">
      <div><label className="block text-sm font-semibold text-navy">Page title *</label><input className="input mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div><label className="block text-sm font-semibold text-navy">Web address</label><input className="input mt-1.5" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="made from the title if left empty" /><p className="mt-1 text-[13px] text-muted">For example &quot;case-studies&quot; gives yourwebsite.com/case-studies. Use lowercase words with dashes.</p></div>
      {err && <p className="text-sm text-red-700">{err}</p>}
      <button className="btn btn-primary" onClick={go}>Create page</button>
    </div>
  );
}
