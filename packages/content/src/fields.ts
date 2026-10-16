/**
 * One field definition format drives every editing screen in the CMS
 * (page blocks, collections, settings). Define a field here once and the admin
 * form, validation and help text all follow.
 *
 * `help` is shown under the field in plain language. `where` says what changes
 * on the website, so editors always know what they are updating.
 */
export type FieldBase = {
  name: string;
  label: string;
  help?: string;
  where?: string;
  required?: boolean;
  placeholder?: string;
};

export type Field =
  | (FieldBase & { kind: "text"; maxLength?: number })
  | (FieldBase & { kind: "textarea"; rows?: number; maxLength?: number })
  | (FieldBase & { kind: "richtext" })
  | (FieldBase & { kind: "image" })
  | (FieldBase & { kind: "url" })
  | (FieldBase & { kind: "number" })
  | (FieldBase & { kind: "toggle"; default?: boolean })
  | (FieldBase & { kind: "datetime" })
  | (FieldBase & { kind: "slug"; from: string })
  | (FieldBase & { kind: "select"; options: { value: string; label: string }[]; default?: string })
  | (FieldBase & { kind: "stringlist"; itemLabel: string })
  | (FieldBase & { kind: "list"; itemLabel: string; fields: Field[]; max?: number })
  // Pick a row from another collection (e.g. a blog post's category).
  | (FieldBase & { kind: "ref"; collection: string });

export type FieldKind = Field["kind"];

/** Default values for a fresh form. */
export function defaultsFor(fields: Field[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    switch (f.kind) {
      case "toggle": out[f.name] = f.default ?? false; break;
      case "select": out[f.name] = f.default ?? f.options[0]?.value ?? ""; break;
      case "stringlist":
      case "list": out[f.name] = []; break;
      case "number": out[f.name] = 0; break;
      case "image":
      case "ref":
      case "datetime": out[f.name] = null; break;
      default: out[f.name] = "";
    }
  }
  return out;
}
