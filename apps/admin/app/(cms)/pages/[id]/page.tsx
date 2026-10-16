import { notFound } from "next/navigation";
import { prisma } from "@northville/database";
import { PageHeader } from "../../../_components/Chrome";
import { PageEditor } from "../../../_components/PageEditor";
import { pageLinkSuggestions } from "../../../_lib/links";
import { requireUser } from "../../../_lib/session";

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("pages:view");
  const page = await prisma.page.findUnique({ where: { id }, include: { versions: { orderBy: { createdAt: "desc" }, take: 15 } } });
  if (!page) notFound();
  const can = (a: string) => user.permissions.includes(`pages:${a}`);
  return (
    <>
      <PageHeader title={page.title} description="Change the sections below, then press Save draft to keep your work. Press Publish when you want visitors to see it." />
      <PageEditor
        page={{ id: page.id, slug: page.slug, title: page.title, seoTitle: page.seoTitle, seoDescription: page.seoDescription, seoImageUrl: page.seoImageUrl, blocks: page.draftBlocks as never, hasUnpublishedChanges: page.hasUnpublishedChanges, isPublished: page.isPublished }}
        versions={page.versions.map((v) => ({ id: v.id, at: v.createdAt.toISOString(), by: v.createdBy, note: v.note }))}
        perms={{ edit: can("edit"), publish: can("publish"), delete: can("delete") }}
        pageLinks={await pageLinkSuggestions()}
        webUrl={process.env.WEB_URL ?? "http://localhost:3000"}
      />
    </>
  );
}
