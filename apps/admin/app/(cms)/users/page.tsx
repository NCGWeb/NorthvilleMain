import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@northville/database";
import { PageHeader } from "../../_components/Chrome";
import { requireUser } from "../../_lib/session";

export default async function UsersPage() {
  const me = await requireUser("users:view");
  const users = await prisma.user.findMany({ include: { role: true }, orderBy: { name: "asc" } });
  return (
    <>
      <PageHeader title="Users" description="People who can sign in to this manager. What each person can do depends on their role."
        actions={me.permissions.includes("users:edit") && <Link href="/users/new" className="btn btn-primary"><Plus size={16} /> Add user</Link>} />
      <ul className="card divide-y divide-line">
        {users.map((u) => {
          const owner = process.env.SUPERADMIN_EMAIL?.toLowerCase() === u.email.toLowerCase();
          return (
            <li key={u.id} className="flex items-center gap-4 p-4">
              <div className="flex-1"><Link href={`/users/${u.id}`} className="font-semibold text-navy hover:text-royal">{u.name}</Link><p className="text-sm text-muted">{u.email}</p></div>
              <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-navy">{owner ? "Owner" : (u.role?.name ?? "No role")}</span>
              {!u.isActive && <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">Switched off</span>}
            </li>
          );
        })}
      </ul>
    </>
  );
}
