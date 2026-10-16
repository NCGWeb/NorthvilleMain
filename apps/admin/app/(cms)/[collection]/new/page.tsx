import { notFound } from "next/navigation";
import { COLLECTION_BY_KEY, defaultsFor } from "@northville/content";
import { PageHeader } from "../../../_components/Chrome";
import { CollectionForm } from "../../../_components/CollectionForm";
import { pageLinkSuggestions } from "../../../_lib/links";
import { requireUser } from "../../../_lib/session";

export default async function NewPage({ params }: { params: Promise<{ collection: string }> }) {
  const def = COLLECTION_BY_KEY[(await params).collection];
  if (!def) notFound();
  await requireUser(`${def.area}:edit`);
  return (
    <>
      <PageHeader title={`Add ${def.singular.toLowerCase()}`} description={def.description} where={def.where} />
      <CollectionForm collectionKey={def.key} fields={def.fields} initial={defaultsFor(def.fields)} canEdit def={{ singular: def.singular, label: def.label, key: def.key }} pageLinks={await pageLinkSuggestions()} shared={def.key === "shared" ? { type: "", name: "" } : undefined} />
    </>
  );
}
