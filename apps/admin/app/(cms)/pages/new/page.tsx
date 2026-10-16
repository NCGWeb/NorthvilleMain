import { PageHeader } from "../../../_components/Chrome";
import { NewPageForm } from "../../../_components/NewPageForm";
import { requireUser } from "../../../_lib/session";

export default async function NewPage() {
  await requireUser("pages:edit");
  return (<><PageHeader title="New page" description="Give it a title and web address. You will add sections on the next screen. The page stays offline until you publish it." /><NewPageForm /></>);
}
