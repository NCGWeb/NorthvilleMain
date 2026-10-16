import { notFound } from "next/navigation";
import { COLLECTION_BY_KEY, BLOCK_BY_TYPE } from "@northville/content";
import { PageHeader } from "../../../_components/Chrome";
import { CollectionForm } from "../../../_components/CollectionForm";
import { loadRow } from "../../../_lib/collection";
import { pageLinkSuggestions } from "../../../_lib/links";
import { requireUser } from "../../../_lib/session";

export default async function EditPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  const def = COLLECTION_BY_KEY[collection];
  if (!def) notFound();
  const user = await requireUser(`${def.area}:view`);
  const row = await loadRow(def, id);
  if (!row) notFound();

  const fields = def.children ? [...def.fields, def.children.field] : def.fields;
  const isShared = def.key === "shared";
  const initial: Record<string, unknown> = isShared ? { ...(row.data as object) } : { ...row };
  if (def.children) initial[def.children.field.name] = row[def.children.field.name];
  for (const k of Object.keys(initial)) if (initial[k] instanceof Date) initial[k] = (initial[k] as Date).toISOString();

  return (
    <>
      <PageHeader title={isShared ? row.name : String(row[def.titleField] ?? def.singular)} description={isShared ? `${BLOCK_BY_TYPE[row.type]?.label}. ${BLOCK_BY_TYPE[row.type]?.description}` : def.description} where={def.where} />
      <CollectionForm collectionKey={def.key} fields={fields} initial={initial} id={id} canEdit={user.permissions.includes(`${def.area}:edit`)} def={{ singular: def.singular, label: def.label, key: def.key }} pageLinks={await pageLinkSuggestions()} shared={isShared ? { type: row.type, name: row.name } : undefined} />
    </>
  );
}
