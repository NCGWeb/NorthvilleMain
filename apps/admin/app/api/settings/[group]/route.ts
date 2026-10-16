import { NextResponse } from "next/server";
import { prisma } from "@northville/database";
import { refreshWebsite } from "@northville/core";
import { SETTING_BY_KEY } from "@northville/content";
import { apiUser } from "../../../_lib/session";
import { handle } from "../../../_lib/api";
import { audit } from "../../../_lib/audit";
import { cleanValues } from "../../../_lib/collection";

export const PUT = handle(async (req: Request, { params }: { params: Promise<{ group: string }> }) => {
  const group = SETTING_BY_KEY[(await params).group];
  if (!group) return NextResponse.json({ error: "That settings group does not exist." }, { status: 404 });
  const user = await apiUser("settings:edit");
  const value = cleanValues(group.fields, (await req.json()) as Record<string, unknown>);
  await prisma.siteSetting.upsert({ where: { key: group.key }, update: { value: value as object }, create: { key: group.key, value: value as object } });
  await audit(user.id, "changed settings", group.label);
  await refreshWebsite();
  return NextResponse.json({ ok: true });
});
