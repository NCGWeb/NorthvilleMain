import { prisma } from "@northville/database";
import { PageHeader } from "../../_components/Chrome";
import { RolesEditor } from "../../_components/RolesEditor";
import { requireUser } from "../../_lib/session";

export default async function RolesPage() {
  const me = await requireUser("users:view");
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { users: true } } } });
  return (
    <>
      <PageHeader title="Roles" description="A role decides what a person can see and change. Tick the boxes for each area of the website. The owner account always has full access." />
      <RolesEditor canEdit={me.permissions.includes("users:edit")} canDelete={me.permissions.includes("users:delete")} roles={roles.map((r) => ({ id: r.id, name: r.name, description: r.description, permissions: r.permissions, users: r._count.users }))} />
    </>
  );
}
