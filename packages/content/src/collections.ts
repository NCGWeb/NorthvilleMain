import type { Field } from "./fields";
import type { AreaKey } from "./permissions";

/**
 * Lists of things (services, team, blog posts...). One generic admin screen
 * edits all of them from these definitions.
 */
export type CollectionDef = {
  key: string; // URL segment in the admin
  model: string; // Prisma delegate name
  area: AreaKey; // permission area
  label: string; // plural
  singular: string;
  description: string; // what this list is, in plain words
  where: string; // where it shows on the site
  titleField: string;
  subtitleField?: string;
  orderBy: Record<string, "asc" | "desc">;
  /** Field that, when switched off, hides the row from the site without deleting it. */
  visibleField?: string;
  /** Field whose row can be reordered by drag. */
  sortField?: string;
  groupBy?: string; // show list grouped by this field
  fields: Field[];
  /** Rows owned by a parent row (e.g. a service's offerings). Edited inside the parent form. */
  children?: { model: string; fk: string; field: Extract<Field, { kind: "list" }> };
  /** Public path of a row, used for the "View on site" link and cache refresh. */
  publicPath?: (row: Record<string, unknown>) => string | null;
};

const seoFields = (): Field[] => [
  { kind: "text", name: "seoTitle", label: "Google title", help: "Optional. About 60 characters. Leave empty to use the title.", where: "Google results and browser tab.", maxLength: 70 },
  { kind: "textarea", name: "seoDescription", label: "Google description", rows: 3, help: "About 150 characters. What a searcher should know before clicking.", where: "Google results and link previews.", maxLength: 200 },
];

export const COLLECTIONS: CollectionDef[] = [
  {
    key: "services", model: "service", area: "services", label: "Services", singular: "Service",
    description: "The services the firm offers. Each one has its own page, appears in the Services menu, and is summarised on the home page and Services page. Change it here and all of those update.",
    where: "Services menu, home page, Services page and the service's own page.",
    titleField: "name", subtitleField: "summary", orderBy: { sortOrder: "asc" }, visibleField: "isPublished", groupBy: "groupId",
    publicPath: (r) => `/services/${r.slug}`,
    fields: [
      { kind: "text", name: "name", label: "Service name", required: true, where: "Menu, cards and the page heading.", maxLength: 80 },
      { kind: "slug", name: "slug", label: "Page address", from: "name", help: "The end of the web address, for example virtual-cfo. Changing it later breaks existing links, so avoid it once the page is live.", where: "Web address of the page." },
      { kind: "ref", name: "groupId", label: "Theme", collection: "serviceGroups", help: "Which theme this service sits under in the menu and on the home page.", where: "Services menu and home page grouping." },
      { kind: "textarea", name: "summary", label: "One-line summary", rows: 2, required: true, help: "One or two sentences. Used on cards and in the menu, so keep it short.", where: "Home page, Services page, menu.", maxLength: 220 },
      { kind: "image", name: "imageUrl", label: "Photo", help: "Shown on cards and at the top of the service page.", where: "Cards and top of the service page." },
      { kind: "text", name: "heroHeading", label: "Page headline", help: "Large headline at the top of this service's page. Empty uses the service name.", where: "Top of the service page.", maxLength: 120 },
      { kind: "textarea", name: "heroSubtext", label: "Page intro", rows: 3, where: "Under the headline on the service page." },
      { kind: "text", name: "tagline", label: "Positioning line", help: "One sentence on what makes this service valuable.", where: "Service page, above the offerings.", maxLength: 200 },
      ...seoFields(),
      { kind: "list", name: "faqs", label: "Questions and answers", itemLabel: "Question", help: "Optional. Helps the page appear with answers in Google.", where: "Bottom of the service page.", fields: [
        { kind: "text", name: "question", label: "Question", required: true, maxLength: 160 },
        { kind: "textarea", name: "answer", label: "Answer", required: true, rows: 3 },
      ] },
      { kind: "toggle", name: "isPublished", label: "Show on website", default: true, help: "Switch off to hide this service everywhere without deleting it." },
    ],
    children: {
      model: "serviceOffering", fk: "serviceId",
      field: { kind: "list", name: "offerings", label: "What this service covers", itemLabel: "Offering", help: "Each offering appears as its own block on the service page.", where: "Service page, in this order.", fields: [
        { kind: "text", name: "title", label: "Offering name", required: true, maxLength: 100 },
        { kind: "text", name: "tagline", label: "One-line promise", maxLength: 200 },
        { kind: "textarea", name: "body", label: "Description", rows: 4 },
        { kind: "stringlist", name: "bullets", label: "What is included", itemLabel: "Item" },
        { kind: "image", name: "imageUrl", label: "Photo (optional)" },
      ] },
    },
  },
  {
    key: "serviceGroups", model: "serviceGroup", area: "services", label: "Service themes", singular: "Theme",
    description: "Themes group the services in the menu and on the home page, for example Finance and Deals.",
    where: "Services menu and home page.", titleField: "name", subtitleField: "blurb", orderBy: { sortOrder: "asc" },
    fields: [
      { kind: "text", name: "name", label: "Theme name", required: true, maxLength: 60 },
      { kind: "textarea", name: "blurb", label: "Short description", rows: 2, maxLength: 200 },
    ],
  },
  {
    key: "team", model: "teamMember", area: "team", label: "Team", singular: "Team member",
    description: "People shown on the Our Team page. Mark leadership to also feature them on the home and About pages.",
    where: "Our Team page, and home and About pages for leadership.",
    titleField: "name", subtitleField: "designation", orderBy: { sortOrder: "asc" }, visibleField: "isPublished",
    fields: [
      { kind: "text", name: "name", label: "Full name", required: true, maxLength: 80 },
      { kind: "text", name: "designation", label: "Job title", required: true, maxLength: 80 },
      { kind: "text", name: "background", label: "Qualifications or background", help: "For example CA, MBA (ISB).", maxLength: 160 },
      { kind: "textarea", name: "bio", label: "Short bio", rows: 4, help: "Shown for leadership. Optional for others." },
      { kind: "image", name: "photoUrl", label: "Photo", help: "Square or portrait headshot." },
      { kind: "url", name: "linkedinUrl", label: "LinkedIn profile", help: "Optional. Each person gets their own link." },
      { kind: "toggle", name: "isLeadership", label: "Leadership", help: "Feature on the home and About pages." },
      { kind: "toggle", name: "isPublished", label: "Show on website", default: true },
    ],
  },
  {
    key: "testimonials", model: "testimonial", area: "testimonials", label: "Testimonials", singular: "Testimonial",
    description: "What clients say about the firm.", where: "Client quotes section on any page that includes it.",
    titleField: "authorName", subtitleField: "quote", orderBy: { sortOrder: "asc" }, visibleField: "isPublished",
    fields: [
      { kind: "textarea", name: "quote", label: "Quote", required: true, rows: 5 },
      { kind: "text", name: "authorName", label: "Name", required: true },
      { kind: "text", name: "authorRole", label: "Role" },
      { kind: "text", name: "company", label: "Company" },
      { kind: "image", name: "photoUrl", label: "Photo or logo" },
      { kind: "toggle", name: "isPublished", label: "Show on website", default: true },
    ],
  },
  {
    key: "logos", model: "logoItem", area: "logos", label: "Logos", singular: "Logo",
    description: "Logos of clients, investors, collaborators and network firms.", where: "Logo wall sections.",
    titleField: "name", subtitleField: "wall", orderBy: { sortOrder: "asc" }, visibleField: "isActive", groupBy: "wall",
    fields: [
      { kind: "select", name: "wall", label: "Group", required: true, options: [{ value: "CLIENT", label: "Our clients" }, { value: "INVESTOR", label: "Investor connects" }, { value: "INSTITUTION", label: "Institutional collaborations" }, { value: "NETWORK", label: "Network firms" }], default: "CLIENT" },
      { kind: "text", name: "name", label: "Company name", required: true, help: "Also used as the image description for search engines." },
      { kind: "image", name: "imageUrl", label: "Logo", required: true },
      { kind: "url", name: "linkUrl", label: "Website (optional)" },
      { kind: "toggle", name: "isActive", label: "Show on website", default: true },
    ],
  },
  {
    key: "offices", model: "office", area: "settings", label: "Offices", singular: "Office",
    description: "Office locations.", where: "Contact page and search-engine business details.",
    titleField: "city", subtitleField: "address", orderBy: { sortOrder: "asc" }, visibleField: "isActive",
    fields: [
      { kind: "text", name: "city", label: "City", required: true },
      { kind: "textarea", name: "address", label: "Full address", required: true, rows: 3 },
      { kind: "url", name: "mapUrl", label: "Google Maps link", help: "Optional. Opens when someone clicks the address." },
      { kind: "toggle", name: "isActive", label: "Show on website", default: true },
    ],
  },
  {
    key: "jobs", model: "jobOpening", area: "careers", label: "Open roles", singular: "Role",
    description: "Jobs currently open. If there are none, the Careers page shows your 'no open roles' message.", where: "Careers page.",
    titleField: "title", subtitleField: "location", orderBy: { sortOrder: "asc" }, visibleField: "isOpen",
    fields: [
      { kind: "text", name: "title", label: "Role title", required: true },
      { kind: "text", name: "location", label: "Location" },
      { kind: "text", name: "type", label: "Type", default: "Full-Time" } as Field,
      { kind: "textarea", name: "description", label: "About the role", rows: 6 },
      { kind: "text", name: "applyEmail", label: "Apply to email", help: "Empty uses the Careers email in Site settings." },
      { kind: "toggle", name: "isOpen", label: "Accepting applications", default: true },
    ],
  },
  {
    key: "blogCategories", model: "blogCategory", area: "blog", label: "Blog categories", singular: "Category",
    description: "Topics used to organise blog posts.", where: "Blog filter and post labels.", titleField: "name", orderBy: { name: "asc" },
    fields: [
      { kind: "text", name: "name", label: "Category name", required: true, maxLength: 50 },
      { kind: "slug", name: "slug", label: "Web address", from: "name" },
    ],
  },
  {
    key: "blog", model: "blogPost", area: "blog", label: "Blog posts", singular: "Post",
    description: "Articles on the Insights section of the website. Set a post to Published to put it live, or Draft to keep working on it.",
    where: "Blog page, the post's own page, and the home page if you add a blog block.",
    titleField: "title", subtitleField: "status", orderBy: { createdAt: "desc" },
    publicPath: (r) => `/blog/${r.slug}`,
    fields: [
      { kind: "text", name: "title", label: "Title", required: true, maxLength: 120, where: "Top of the article and in Google." },
      { kind: "slug", name: "slug", label: "Web address", from: "title", help: "Created from the title. Avoid changing it after publishing." },
      { kind: "select", name: "status", label: "Status", options: [{ value: "DRAFT", label: "Draft (not visible)" }, { value: "SCHEDULED", label: "Scheduled (goes live on the date below)" }, { value: "PUBLISHED", label: "Published (live)" }], default: "DRAFT" },
      { kind: "datetime", name: "publishedAt", label: "Publish date", help: "Shown on the article. For Scheduled posts, the day it goes live." },
      { kind: "textarea", name: "excerpt", label: "Summary", rows: 3, required: true, help: "Shown on cards and as the Google description. About 150 characters.", maxLength: 220 },
      { kind: "image", name: "coverUrl", label: "Cover image", help: "Wide image, at least 1200 pixels across." },
      { kind: "ref", name: "categoryId", label: "Category", collection: "blogCategories" },
      { kind: "richtext", name: "body", label: "Article", required: true },
      { kind: "toggle", name: "isFeatured", label: "Feature this post", help: "Featured posts are highlighted at the top of the blog." },
      ...seoFields(),
    ],
  },
  {
    key: "shared", model: "sharedBlock", area: "pages", label: "Reusable sections", singular: "Reusable section",
    description: "Sections used on many pages, such as the Contact us strip. Edit one here and every page using it updates.",
    where: "Any page that includes it.", titleField: "name", subtitleField: "type", orderBy: { name: "asc" },
    fields: [],
  },
];

export const COLLECTION_BY_KEY = Object.fromEntries(COLLECTIONS.map((c) => [c.key, c]));
