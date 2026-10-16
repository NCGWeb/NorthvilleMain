"use client";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { defaultsFor, type Field } from "@northville/content";
import { ImageField } from "./MediaPicker";
import { RichText } from "./RichText";

export type Values = Record<string, unknown>;

/** Internal links offered as suggestions in every link box. */
export function FieldEditor({ fields, value, onChange, pageLinks = [] }: { fields: Field[]; value: Values; onChange: (v: Values) => void; pageLinks?: string[] }) {
  const set = (name: string, v: unknown) => onChange({ ...value, [name]: v });
  return (
    <div className="space-y-6">
      {fields.map((f) => (
        <FieldRow key={f.name} field={f} value={value[f.name]} onChange={(v) => set(f.name, v)} parent={value} pageLinks={pageLinks} />
      ))}
    </div>
  );
}

function FieldRow({ field: f, value, onChange, parent, pageLinks }: { field: Field; value: unknown; onChange: (v: unknown) => void; parent: Values; pageLinks: string[] }) {
  const id = `f-${f.name}-${Math.random().toString(36).slice(2, 7)}`;
  const label = (
    <label htmlFor={id} className="block text-sm font-semibold text-navy">
      {f.label}{f.required && <span className="text-red-600"> *</span>}
    </label>
  );
  const help = (f.help || f.where) && (
    <p className="mt-1 text-[13px] leading-snug text-muted">
      {f.help}{f.help && f.where ? " " : ""}{f.where && <span className="text-royal/80">Shows on: {f.where.replace(/\.$/, "")}.</span>}
    </p>
  );
  const str = typeof value === "string" ? value : value == null ? "" : String(value);

  switch (f.kind) {
    case "text":
    case "slug":
      return (<div>{label}<input id={id} className="input mt-1.5" value={str} maxLength={f.kind === "text" ? f.maxLength : 90} placeholder={f.placeholder} onChange={(e) => onChange(f.kind === "slug" ? e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") : e.target.value)} />
        {f.kind === "slug" && !str && typeof parent[f.from] === "string" && parent[f.from] ? <button type="button" className="mt-1 text-xs font-semibold text-royal" onClick={() => onChange(String(parent[f.from]).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))}>Create from {f.from === "name" ? "the name" : "the title"}</button> : null}
        {f.kind === "text" && f.maxLength && str.length > f.maxLength * 0.8 && <span className="float-right mt-1 text-xs text-muted">{str.length}/{f.maxLength}</span>}
        {help}</div>);
    case "url":
      return (<div>{label}<input id={id} className="input mt-1.5" value={str} placeholder={f.placeholder ?? "/contact or https://..."} list={pageLinks.length ? "page-links" : undefined} onChange={(e) => onChange(e.target.value)} />{help}</div>);
    case "textarea":
      return (<div>{label}<textarea id={id} className="input mt-1.5" rows={f.rows ?? 4} value={str} maxLength={f.maxLength} onChange={(e) => onChange(e.target.value)} />{help}</div>);
    case "number":
      return (<div>{label}<input id={id} type="number" className="input mt-1.5 max-w-40" value={Number(value ?? 0)} onChange={(e) => onChange(Number(e.target.value))} />{help}</div>);
    case "datetime":
      return (<div>{label}<input id={id} type="datetime-local" className="input mt-1.5 max-w-64" value={value ? toLocal(String(value)) : ""} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} />{help}</div>);
    case "toggle":
      return (<div className="flex items-start gap-3"><input id={id} type="checkbox" className="mt-1 h-4 w-4 accent-[#435df8]" checked={!!value} onChange={(e) => onChange(e.target.checked)} /><div><label htmlFor={id} className="text-sm font-semibold text-navy">{f.label}</label>{help}</div></div>);
    case "select":
      return (<div>{label}<select id={id} className="input mt-1.5 max-w-sm" value={str || f.default || ""} onChange={(e) => onChange(e.target.value)}>{f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{help}</div>);
    case "image":
      return (<div>{label}<div className="mt-2"><ImageField value={(value as string) || null} onChange={onChange} /></div>{help}</div>);
    case "richtext":
      return (<div>{label}<div className="mt-1.5"><RichText value={str} onChange={onChange} /></div>{help}</div>);
    case "ref":
      return <RefField field={f} value={(value as string) || ""} onChange={onChange} label={label} help={help} id={id} />;
    case "stringlist": {
      const items = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>{label}{help}
          <ul className="mt-2 space-y-2">
            {items.map((it, i) => (
              <li key={i} className="flex gap-2">
                <input className="input" value={it} aria-label={`${f.itemLabel} ${i + 1}`} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
                <IconBtn label="Move up" disabled={i === 0} onClick={() => onChange(move(items, i, -1))}><ArrowUp size={15} /></IconBtn>
                <IconBtn label="Move down" disabled={i === items.length - 1} onClick={() => onChange(move(items, i, 1))}><ArrowDown size={15} /></IconBtn>
                <IconBtn label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 size={15} /></IconBtn>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-ghost mt-2" onClick={() => onChange([...items, ""])}><Plus size={15} /> Add {f.itemLabel.toLowerCase()}</button>
        </div>
      );
    }
    case "list": {
      const items = Array.isArray(value) ? (value as Values[]) : [];
      const full = f.max !== undefined && items.length >= f.max;
      return (
        <div>{label}{help}
          <ol className="mt-3 space-y-3">
            {items.map((it, i) => (
              <li key={i} className="rounded-xl border border-line bg-mist/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">{f.itemLabel} {i + 1}</span>
                  <span className="flex gap-1">
                    <IconBtn label="Move up" disabled={i === 0} onClick={() => onChange(move(items, i, -1))}><ArrowUp size={15} /></IconBtn>
                    <IconBtn label="Move down" disabled={i === items.length - 1} onClick={() => onChange(move(items, i, 1))}><ArrowDown size={15} /></IconBtn>
                    <IconBtn label={`Remove ${f.itemLabel.toLowerCase()}`} onClick={() => { if (confirm(`Remove this ${f.itemLabel.toLowerCase()}?`)) onChange(items.filter((_, j) => j !== i)); }}><Trash2 size={15} /></IconBtn>
                  </span>
                </div>
                <FieldEditor fields={f.fields} value={it} onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))} pageLinks={pageLinks} />
              </li>
            ))}
          </ol>
          <button type="button" disabled={full} className="btn btn-ghost mt-3" onClick={() => onChange([...items, defaultsFor(f.fields)])}><Plus size={15} /> Add {f.itemLabel.toLowerCase()}</button>
        </div>
      );
    }
  }
}

function RefField({ field, value, onChange, label, help, id }: { field: Extract<Field, { kind: "ref" }>; value: string; onChange: (v: unknown) => void; label: React.ReactNode; help: React.ReactNode; id: string }) {
  const [options, setOptions] = useState<{ id: string; title: string }[]>([]);
  useEffect(() => { fetch(`/api/c/${field.collection}?options=1`).then((r) => r.json()).then((j) => setOptions(j.items ?? [])); }, [field.collection]);
  return (<div>{label}<select id={id} className="input mt-1.5 max-w-sm" value={value} onChange={(e) => onChange(e.target.value || null)}><option value="">None</option>{options.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}</select>{help}</div>);
}

function IconBtn({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return <button type="button" title={label} aria-label={label} disabled={disabled} onClick={onClick} className="rounded-lg border border-line bg-white p-2 text-ink hover:border-royal hover:text-royal disabled:opacity-30">{children}</button>;
}

function move<T>(arr: T[], i: number, d: number): T[] {
  const j = i + d; const next = [...arr]; [next[i], next[j]] = [next[j], next[i]]; return next;
}
function toLocal(iso: string) {
  const d = new Date(iso); const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
