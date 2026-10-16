import { prisma } from "@northville/database";
import { cleanHtml, slugify } from "@northville/core";
import { COLLECTION_BY_KEY, BLOCK_BY_TYPE, type CollectionDef, type Field } from "@northville/content";
import { HttpError } from "./session";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Delegate = any;
export const delegate = (model: string): Delegate => (prisma as unknown as Record<string, Delegate>)[model];

export function getDef(key: string): CollectionDef {
  const def = COLLECTION_BY_KEY[key];
  if (!def) throw new HttpError(404, "That list does not exist.");
  return def;
}

/** Turns raw form values into safe database values using the field definitions. */
export function cleanValues(fields: Field[], raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = raw[f.name];
    switch (f.kind) {
      case "text": case "textarea": case "url": out[f.name] = typeof v === "string" ? v.trim() : ""; break;
      case "slug": out[f.name] = slugify(typeof v === "string" ? v : ""); break;
      case "richtext": out[f.name] = cleanHtml(typeof v === "string" ? v : ""); break;
      case "number": out[f.name] = Number(v) || 0; break;
      case "toggle": out[f.name] = !!v; break;
      case "select": out[f.name] = f.options.some((o) => o.value === v) ? v : (f.default ?? f.options[0]?.value); break;
      case "image": out[f.name] = typeof v === "string" && v ? v : null; break;
      case "ref": out[f.name] = typeof v === "string" && v ? v : null; break;
      case "datetime": out[f.name] = typeof v === "string" && v ? new Date(v) : null; break;
      case "stringlist": out[f.name] = Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : []; break;
      case "list": out[f.name] = Array.isArray(v) ? v.map((it) => cleanValues(f.fields, (it ?? {}) as Record<string, unknown>)) : []; break;
    }
  }
  return out;
}

export function missingRequired(fields: Field[], values: Record<string, unknown>): string | null {
  for (const f of fields) {
    if (f.kind === "toggle" || f.kind === "list" || f.kind === "stringlist") continue;
    if (f.required && (values[f.name] === "" || values[f.name] == null)) return `Please fill in "${f.label}".`;
  }
  return null;
}

/** Rows of a collection for editing screens, with children attached. */
export async function loadRow(def: CollectionDef, id: string) {
  const include = def.children ? { [def.children.field.name]: { orderBy: { sortOrder: "asc" } } } : undefined;
  return delegate(def.model).findUnique({ where: { id }, ...(include ? { include } : {}) });
}

export function blockFieldsFor(type: string): Field[] {
  return BLOCK_BY_TYPE[type]?.fields ?? [];
}
