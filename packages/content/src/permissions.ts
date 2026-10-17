/**
 * Access control. A permission is "<area>:<action>". Roles are lists of these.
 * The Super Admin (SUPERADMIN_EMAIL) always has everything.
 */
export const AREAS = [
  { key: "pages", label: "Pages", help: "Home, About, Contact and the other pages." },
  { key: "services", label: "Services", help: "The services you offer and what each includes." },
  { key: "team", label: "Team", help: "People shown on the Our Team page." },
  { key: "testimonials", label: "Testimonials", help: "Client quotes." },
  { key: "logos", label: "Logos", help: "Clients, investors, collaborators and network firms." },
  { key: "blog", label: "Blog", help: "Insights articles and categories." },
  { key: "careers", label: "Careers", help: "Open roles." },
  { key: "media", label: "Media library", help: "Uploaded images." },
  { key: "enquiries", label: "Enquiries", help: "Messages from the contact form." },
  { key: "settings", label: "Site settings", help: "Contact details, menus, footer, offices, SEO." },
  { key: "users", label: "Users and roles", help: "Who can sign in and what they can do." },
  { key: "audit", label: "Activity log", help: "Who changed what." },
] as const;

export type AreaKey = (typeof AREAS)[number]["key"];

export const ACTIONS = [
  { key: "view", label: "See" },
  { key: "edit", label: "Edit" },
  { key: "publish", label: "Publish" },
  { key: "delete", label: "Delete" },
] as const;

export type ActionKey = (typeof ACTIONS)[number]["key"];

export const ALL_PERMISSIONS: string[] = AREAS.flatMap((a) =>
  ACTIONS.map((x) => `${a.key}:${x.key}`),
);

export const can = (permissions: string[], key: string) => permissions.includes(key);

const contentAreas = AREAS.filter((a) => !["users", "audit", "settings"].includes(a.key)).map((a) => a.key);
const grant = (areas: readonly string[], actions: readonly string[]) =>
  areas.flatMap((a) => actions.map((x) => `${a}:${x}`));

/** Roles created on first setup. Editable afterwards in Users and roles. */
export const DEFAULT_ROLES = [
  {
    name: "Admin",
    description: "Everything, including users and settings.",
    permissions: ALL_PERMISSIONS,
  },
  {
    name: "Editor",
    description: "Edits and publishes all website content. Cannot manage users or site settings.",
    permissions: [...grant(contentAreas, ["view", "edit", "publish", "delete"]), "settings:view"],
  },
  {
    name: "Blog author",
    description: "Writes and publishes blog posts and uploads images. Nothing else.",
    permissions: [...grant(["blog", "media"], ["view", "edit", "publish", "delete"])],
  },
  {
    name: "Viewer",
    description: "Can look around but not change anything.",
    permissions: grant(AREAS.map((a) => a.key), ["view"]),
  },
] as const;
