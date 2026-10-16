import { prisma } from "@northville/database";
import { PageHeader } from "../../_components/Chrome";
import { EnquiryRow } from "../../_components/EnquiryRow";
import { requireUser } from "../../_lib/session";

export default async function EnquiriesPage() {
  const user = await requireUser("enquiries:view");
  const rows = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <>
      <PageHeader title="Enquiries" description="Messages sent through the Contact form. Each one is also emailed to the address in Site settings, Contact details. Mark them as you deal with them." where="Not shown on the website. Private." />
      <ul className="space-y-3">
        {rows.map((r) => <EnquiryRow key={r.id} canEdit={user.permissions.includes("enquiries:edit")} canDelete={user.permissions.includes("enquiries:delete")} e={{ id: r.id, name: r.name, email: r.email, phone: r.phone, message: r.message, status: r.status, note: r.note, at: r.createdAt.toISOString() }} />)}
        {rows.length === 0 && <li className="card p-10 text-center text-muted">No enquiries yet.</li>}
      </ul>
    </>
  );
}
