import { prisma } from "@northville/database";
import { PageHeader } from "../../../_components/Chrome";
import { UserForm } from "../../../_components/UserForm";
import { requireUser } from "../../../_lib/session";

export default async function NewUser() {
  await requireUser("users:edit");
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, description: true } });
  return (<><PageHeader title="Add user" description="Create their account and choose a role. Share the password with them privately. Ask them to change it after first sign in." /><UserForm roles={roles} /></>);
}
