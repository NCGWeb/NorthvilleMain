import { notFound } from "next/navigation";
import { prisma } from "@northville/database";
import { PageHeader } from "../../../_components/Chrome";
import { UserForm } from "../../../_components/UserForm";
import { requireUser } from "../../../_lib/session";

export default async function EditUser({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("users:view");
  const u = await prisma.user.findUnique({ where: { id: (await params).id } });
  if (!u) notFound();
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, description: true } });
  return (<><PageHeader title={u.name} description={u.email} /><UserForm roles={roles} user={{ id: u.id, name: u.name, email: u.email, roleId: u.roleId, isActive: u.isActive }} /></>);
}
