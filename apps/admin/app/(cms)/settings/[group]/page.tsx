import { notFound } from "next/navigation";
import { defaultsFor, SETTING_BY_KEY } from "@northville/content";
import { prisma } from "@northville/database";
import { PageHeader } from "../../../_components/Chrome";
import { SettingsForm } from "../../../_components/SettingsForm";
import { pageLinkSuggestions } from "../../../_lib/links";
import { requireUser } from "../../../_lib/session";

export default async function SettingsGroup({ params }: { params: Promise<{ group: string }> }) {
  const g = SETTING_BY_KEY[(await params).group];
  if (!g) notFound();
  const user = await requireUser("settings:view");
  const row = await prisma.siteSetting.findUnique({ where: { key: g.key } });
  return (
    <>
      <PageHeader title={g.label} description={g.description} />
      <SettingsForm groupKey={g.key} fields={g.fields} initial={{ ...defaultsFor(g.fields), ...((row?.value as object) ?? {}) }} canEdit={user.permissions.includes("settings:edit")} pageLinks={await pageLinkSuggestions()} />
    </>
  );
}
