"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = { id: string; name: string; description: string };
type U = { id: string; name: string; email: string; roleId: string | null; isActive: boolean };

export function UserForm({ roles, user }: { roles: Role[]; user?: U }) {
  const router = useRouter();
  const [f, setF] = useState({ name: user?.name ?? "", email: user?.email ?? "", roleId: user?.roleId ?? "", isActive: user?.isActive ?? true, password: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function save() {
    const res = await fetch(user ? `/api/users/${user.id}` : "/api/users", { method: user ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...f, password: f.password || undefined }) });
    const j = await res.json();
    if (!res.ok) return setMsg({ ok: false, text: j.error });
    if (!user) return router.push(`/users/${j.id}`);
    setF({ ...f, password: "" }); setMsg({ ok: true, text: "Saved." }); router.refresh();
  }
  const role = roles.find((r) => r.id === f.roleId);
  return (
    <div className="card max-w-xl space-y-5 p-6">
      <div><label className="block text-sm font-semibold text-navy">Full name</label><input className="input mt-1.5" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
      <div><label className="block text-sm font-semibold text-navy">Email (used to sign in)</label><input className="input mt-1.5" disabled={!!user} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
      <div><label className="block text-sm font-semibold text-navy">Role</label>
        <select className="input mt-1.5" value={f.roleId} onChange={(e) => setF({ ...f, roleId: e.target.value })}><option value="">No access</option>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
        {role && <p className="mt-1 text-[13px] text-muted">{role.description}</p>}</div>
      <div><label className="block text-sm font-semibold text-navy">{user ? "Reset password (leave empty to keep)" : "Password"}</label><input type="password" autoComplete="new-password" className="input mt-1.5" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /><p className="mt-1 text-[13px] text-muted">At least 10 characters.</p></div>
      {user && <label className="flex items-center gap-3 text-sm font-semibold text-navy"><input type="checkbox" className="h-4 w-4 accent-[#435df8]" checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} /> Can sign in <span className="font-normal text-muted">(switch off to block access without deleting the person)</span></label>}
      <div className="flex items-center gap-3"><button className="btn btn-primary" onClick={save}>{user ? "Save changes" : "Add user"}</button>{msg && <span role="status" className={`text-sm font-medium ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.text}</span>}</div>
    </div>
  );
}
