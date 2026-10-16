import { requireUser } from "../_lib/session";
import { Sidebar } from "../_components/Chrome";

export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="min-w-0 flex-1 p-8 lg:p-10"><div className="mx-auto max-w-5xl">{children}</div></main>
    </div>
  );
}
