import { requireUser } from "../_lib/session";
import { AdminMobileNav } from "../_components/AdminMobileNav";
import { Sidebar, SidebarContent } from "../_components/Chrome";

export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar user={user} />
      <AdminMobileNav><SidebarContent user={user} /></AdminMobileNav>
      <main className="min-w-0 flex-1 p-4 sm:p-8 lg:p-10"><div className="mx-auto max-w-5xl">{children}</div></main>
    </div>
  );
}
