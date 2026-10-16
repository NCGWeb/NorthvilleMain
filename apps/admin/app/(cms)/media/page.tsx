import { PageHeader } from "../../_components/Chrome";
import { MediaLibrary } from "../../_components/MediaLibrary";
import { requireUser } from "../../_lib/session";

export default async function MediaPage() {
  const user = await requireUser("media:view");
  return (<><PageHeader title="Media library" description="All pictures you have uploaded. You will also be able to pick from here whenever a page, service or blog post asks for an image." /><MediaLibrary canEdit={user.permissions.includes("media:edit")} canDelete={user.permissions.includes("media:delete")} /></>);
}
