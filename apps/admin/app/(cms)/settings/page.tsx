import Link from "next/link";
import { SETTING_GROUPS } from "@northville/content";
import { PageHeader } from "../../_components/Chrome";
import { SavedNotice } from "../../_components/SavedNotice";
import { requireUser } from "../../_lib/session";

export default async function SettingsHome({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  await requireUser("settings:view");
  return (
    <>
      <PageHeader title="Site settings" description="Things the website repeats on every page. Change one here and it updates everywhere, so you never have to edit the same detail twice." />
      <SavedNotice show={saved === "1"} />
      <ul className="grid gap-4 md:grid-cols-2">
        {SETTING_GROUPS.map((g) => (
          <li key={g.key}><Link href={`/settings/${g.key}`} className="card block h-full p-6 hover:border-royal"><h2 className="font-semibold text-navy">{g.label}</h2><p className="mt-1.5 text-sm text-muted">{g.description}</p></Link></li>
        ))}
        <li><Link href="/offices" className="card block h-full p-6 hover:border-royal"><h2 className="font-semibold text-navy">Offices</h2><p className="mt-1.5 text-sm text-muted">Office addresses shown on the Contact page.</p></Link></li>
      </ul>
    </>
  );
}
