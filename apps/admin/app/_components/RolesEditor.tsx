"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIONS, AREAS } from "@northville/content";

type Role = { id: string; name: string; description: string; permissions: string[]; users: number };

export function RolesEditor({ roles, canEdit, canDelete }: { roles: Role[]; canEdit: boolean; canDelete: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<Record<string, string[]>>(Object.fromEntries(roles.map((r) => [r.id, r.permissions])));
  const [msg, setMsg] = useState("");
  const toggle = (id: string, key: string) => setState((s) => ({ ...s, [id]: s[id].includes(key) ? s[id].filter((k) => k !== key) : [...s[id], key] }));
  async function save(id: string) {
    const res = await fetch(`/api/roles/${id}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ permissions: state[id] }) });
    setMsg(res.ok ? "Saved." : (await res.json()).error); router.refresh();
  }
  async function add() {
    const name = prompt("Name for the new role (for example: Marketing team)"); if (!name) return;
    const res = await fetch("/api/roles", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) });
    if (res.ok) router.refresh(); else alert((await res.json()).error);
  }
  return (
    <div className="space-y-6">
      {msg && <p role="status" className="text-sm font-medium text-green-700">{msg}</p>}
      {roles.map((r) => (
        <section key={r.id} className="card overflow-x-auto p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-lg font-semibold text-navy">{r.name}</h2><p className="text-sm text-muted">{r.description || "No description."} {r.users} {r.users === 1 ? "person has" : "people have"} this role.</p></div>
            <div className="flex gap-2">
              {canEdit && <button className="btn btn-primary" onClick={() => save(r.id)}>Save {r.name}</button>}
              {canDelete && !r.users && <button className="btn btn-danger" onClick={async () => { if (confirm(`Delete the role ${r.name}?`)) { const res = await fetch(`/api/roles/${r.id}`, { method: "DELETE" }); if (res.ok) router.refresh(); else alert((await res.json()).error); } }}>Delete</button>}
            </div>
          </div>
          <table className="w-full min-w-[520px] text-sm">
            <thead><tr className="text-left text-muted"><th className="py-2 font-semibold">Area</th>{ACTIONS.map((a) => <th key={a.key} className="py-2 text-center font-semibold">{a.label}</th>)}</tr></thead>
            <tbody>
              {AREAS.map((a) => (
                <tr key={a.key} className="border-t border-line">
                  <td className="py-2.5 pr-4"><span className="font-medium text-navy">{a.label}</span><span className="block text-xs text-muted">{a.help}</span></td>
                  {ACTIONS.map((x) => { const key = `${a.key}:${x.key}`; return (<td key={x.key} className="text-center"><input type="checkbox" aria-label={`${r.name}: ${x.label} ${a.label}`} disabled={!canEdit} checked={state[r.id].includes(key)} onChange={() => toggle(r.id, key)} className="h-4 w-4 accent-[#435df8]" /></td>); })}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
      {canEdit && <button className="btn btn-ghost" onClick={add}>Add a role</button>}
    </div>
  );
}
