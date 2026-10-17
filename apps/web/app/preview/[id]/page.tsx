import { notFound } from "next/navigation";
import { getPageDraft, verifyPreviewToken, getSettings } from "@northville/core";
import { BlockRenderer } from "../../_components/blocks";

// Never cached or indexed: shows the editor's saved draft, only with a valid signed link from the admin.
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false }, title: { absolute: "Draft preview" } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> };

export default async function Preview({ params, searchParams }: Props) {
  const [{ id }, { t }] = await Promise.all([params, searchParams]);
  if (!verifyPreviewToken(id, t)) notFound();
  const [page, s] = await Promise.all([getPageDraft(id), getSettings()]);
  if (!page) notFound();
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[70] bg-amber-300 px-4 py-2 text-center font-sans text-sm font-semibold text-navy">
        {s.text.previewBanner.replace("{title}", page.title)}
      </div>
      <BlockRenderer blocks={page.blocks} />
    </>
  );
}
