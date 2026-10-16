import type { Field } from "./fields";

/**
 * Page building blocks. Every page is an ordered list of these. Each block is
 * defined once here: the admin builds its form from `fields`, and apps/web
 * renders it with the component registered under the same `type`.
 *
 * Blocks that show repeating content (services, team, logos...) do not copy it.
 * They read it from the matching collection, so it is edited in one place.
 */
export type BlockDef = {
  type: string;
  label: string;
  /** Plain-language explanation shown when adding the block. */
  description: string;
  /** Where the editor goes to change the content this block pulls in. */
  pullsFrom?: { label: string; href: string };
  fields: Field[];
};

const cta = (prefix: string, label: string): Field[] => [
  { kind: "text", name: `${prefix}Label`, label: `${label} text`, help: "Text on the button. Leave empty to hide the button.", maxLength: 40 },
  { kind: "url", name: `${prefix}Href`, label: `${label} link`, help: "Where the button goes. Use /contact for a page on this site, or paste a full web address.", placeholder: "/contact" },
];

export const BLOCKS: BlockDef[] = [
  {
    type: "hero",
    label: "Hero banner",
    description: "The big opening section at the top of a page: headline, short text and buttons.",
    fields: [
      { kind: "select", name: "size", label: "Size", help: "Large is for the home page. Compact is for inner pages.", options: [{ value: "large", label: "Large" }, { value: "compact", label: "Compact" }], default: "compact" },
      { kind: "text", name: "heading", label: "Headline", required: true, help: "The main sentence visitors read first.", maxLength: 140 },
      { kind: "textarea", name: "subtext", label: "Supporting text", help: "One or two sentences under the headline.", rows: 3, maxLength: 320 },
      ...cta("primary", "Main button"),
      ...cta("secondary", "Second button"),
      { kind: "image", name: "image", label: "Background or side image", help: "Optional. If empty, the hero uses the brand blue gradient." },
    ],
  },
  {
    type: "stats",
    label: "Impact numbers",
    description: "Big figures with captions, for example 834+ projects. Add as many as you like (up to 6). The layout adjusts by itself, and the numbers count up when a visitor scrolls to them.",
    fields: [
      { kind: "text", name: "heading", label: "Heading", default: "Our Impact in Numbers", help: "Optional line above the numbers.", maxLength: 100 } as Field,
      {
        kind: "list", name: "items", label: "Numbers", itemLabel: "Number", max: 6,
        help: "Use Add number to include another one. Use the arrows to change the order.",
        fields: [
          { kind: "text", name: "prefix", label: "Before the number", help: "Optional, for example a currency sign.", maxLength: 4 },
          { kind: "text", name: "value", label: "Number", required: true, help: "Digits only, for example 834. A decimal such as 2.5 also works.", maxLength: 10 },
          { kind: "text", name: "suffix", label: "After the number", help: "Optional, for example + or % or M.", maxLength: 4 },
          { kind: "text", name: "label", label: "Caption", required: true, help: "What the number means, for example Projects.", maxLength: 50 },
        ],
      },
    ],
  },
  {
    type: "textSection",
    label: "Text section",
    description: "A heading with free text. Use it for intros, policies and long copy.",
    fields: [
      { kind: "text", name: "heading", label: "Heading", maxLength: 140 },
      { kind: "richtext", name: "body", label: "Text", help: "Use the toolbar for bold, lists and links." },
      { kind: "select", name: "align", label: "Alignment", options: [{ value: "left", label: "Left" }, { value: "center", label: "Centered" }], default: "left" },
    ],
  },
  {
    type: "imageText",
    label: "Image and text",
    description: "A picture on one side and a heading, text and bullet points on the other.",
    fields: [
      { kind: "text", name: "heading", label: "Heading", required: true, maxLength: 140 },
      { kind: "textarea", name: "body", label: "Text", rows: 5 },
      { kind: "stringlist", name: "bullets", label: "Bullet points", itemLabel: "Bullet", help: "Optional short points shown as a list." },
      { kind: "image", name: "image", label: "Image" },
      { kind: "select", name: "imageSide", label: "Image position", options: [{ value: "right", label: "Right" }, { value: "left", label: "Left" }], default: "right" },
      ...cta("cta", "Button"),
    ],
  },
  {
    type: "banner",
    label: "Award or recognition banner",
    description: "A wide strip showing one picture, such as an award badge. Good for press mentions and recognitions.",
    fields: [
      { kind: "image", name: "image", label: "Banner picture", required: true, help: "Wide image, ideally with a transparent background. About 2400 pixels across." },
      { kind: "text", name: "alt", label: "Describe the picture", required: true, help: "Read aloud by screen readers and used by Google. For example: India Finance Outlook Spotlight Award 2025.", maxLength: 160 },
      { kind: "url", name: "href", label: "Link (optional)", help: "Where the banner goes when clicked, for example the article about the award." },
      { kind: "select", name: "tone", label: "Background", options: [{ value: "gold", label: "Gold (for awards)" }, { value: "light", label: "Light grey" }, { value: "navy", label: "Dark blue" }], default: "gold" },
    ],
  },
  {
    type: "cardGrid",
    label: "Cards",
    description: "A set of short cards, each with a title and a few lines. Good for mission, vision and values.",
    fields: [
      { kind: "text", name: "heading", label: "Heading", maxLength: 100 },
      { kind: "textarea", name: "intro", label: "Intro text", rows: 2 },
      {
        kind: "list", name: "items", label: "Cards", itemLabel: "Card", max: 8,
        fields: [
          { kind: "text", name: "title", label: "Card title", required: true, maxLength: 60 },
          { kind: "textarea", name: "body", label: "Card text", rows: 3 },
        ],
      },
    ],
  },
  {
    type: "servicesOverview",
    label: "Services overview",
    description: "Shows the services as themed groups with links to each service page.",
    pullsFrom: { label: "Services", href: "/services" },
    fields: [
      { kind: "text", name: "heading", label: "Heading", required: true, maxLength: 120 },
      { kind: "textarea", name: "intro", label: "Intro text", rows: 3 },
      { kind: "select", name: "layout", label: "Layout", help: "Compact shows each theme with service names. Detailed also shows each service summary and what it covers. The text always comes from the Services list, so it is never typed twice.", options: [{ value: "compact", label: "Compact (for the home page)" }, { value: "detailed", label: "Detailed (for the Services page)" }], default: "compact" },
    ],
  },
  {
    type: "shared",
    label: "Reusable section",
    description: "Drops in a section that is written once and used on many pages, such as the Contact us strip. Edit it under Reusable sections and every page using it updates.",
    pullsFrom: { label: "Reusable sections", href: "/shared" },
    fields: [
      { kind: "ref", name: "sharedId", label: "Which section", collection: "shared", required: true },
    ],
  },
  {
    type: "faq",
    label: "Questions and answers",
    description: "Common questions with answers. Also helps the page show up in Google search results.",
    fields: [
      { kind: "text", name: "heading", label: "Heading", default: "Frequently Asked Questions", maxLength: 100 } as Field,
      {
        kind: "list", name: "items", label: "Questions", itemLabel: "Question",
        fields: [
          { kind: "text", name: "question", label: "Question", required: true, maxLength: 160 },
          { kind: "textarea", name: "answer", label: "Answer", required: true, rows: 4, help: "Plain text. Keep it direct, two to four sentences." },
        ],
      },
    ],
  },
  {
    type: "testimonials",
    label: "Client quotes",
    description: "Shows what clients say about the firm.",
    pullsFrom: { label: "Testimonials", href: "/testimonials" },
    fields: [
      { kind: "text", name: "heading", label: "Heading", default: "What They Say About Us", maxLength: 100 } as Field,
    ],
  },
  {
    type: "team",
    label: "Team",
    description: "Shows people from the Team list.",
    pullsFrom: { label: "Team", href: "/team" },
    fields: [
      { kind: "text", name: "heading", label: "Heading", required: true, maxLength: 100 },
      { kind: "textarea", name: "intro", label: "Intro text", rows: 3 },
      { kind: "select", name: "show", label: "Who to show", help: "Leadership shows only the people marked as leadership. Everyone shows the full team.", options: [{ value: "leadership", label: "Leadership only" }, { value: "everyone", label: "Everyone" }], default: "everyone" },
    ],
  },
  {
    type: "logoWall",
    label: "Logo wall",
    description: "A grid of logos: clients, investors, collaborators or network firms.",
    pullsFrom: { label: "Logos", href: "/logos" },
    fields: [
      { kind: "text", name: "heading", label: "Heading", required: true, maxLength: 100 },
      { kind: "select", name: "wall", label: "Which logos", help: "Each group is managed under Logos.", options: [{ value: "CLIENT", label: "Our clients" }, { value: "INVESTOR", label: "Investor connects" }, { value: "INSTITUTION", label: "Institutional collaborations" }, { value: "NETWORK", label: "Network firms" }], default: "CLIENT" },
    ],
  },
  {
    type: "ctaBand",
    label: "Call to action band",
    description: "A full-width strip with a short message and one or two buttons.",
    fields: [
      { kind: "text", name: "heading", label: "Heading", required: true, maxLength: 120 },
      { kind: "textarea", name: "text", label: "Text", rows: 2 },
      ...cta("primary", "Main button"),
      { kind: "toggle", name: "showWhatsapp", label: "Add a WhatsApp button", help: "Uses the WhatsApp number in Site settings." },
      { kind: "select", name: "tone", label: "Style", options: [{ value: "dark", label: "Dark blue" }, { value: "light", label: "Light" }], default: "dark" },
    ],
  },
  {
    type: "socialBand",
    label: "Follow us strip",
    description: "A line inviting visitors to follow the firm, with social icons.",
    pullsFrom: { label: "Site settings, Social links", href: "/settings/social" },
    fields: [
      { kind: "text", name: "heading", label: "Heading", required: true, maxLength: 100 },
      { kind: "textarea", name: "text", label: "Text", rows: 2 },
    ],
  },
  {
    type: "contactForm",
    label: "Contact form",
    description: "The enquiry form. Messages appear under Enquiries and are emailed to the team.",
    pullsFrom: { label: "Enquiries", href: "/enquiries" },
    fields: [
      { kind: "text", name: "heading", label: "Heading", required: true, maxLength: 100 },
      { kind: "textarea", name: "intro", label: "Intro text", rows: 3 },
      { kind: "text", name: "successMessage", label: "Message after sending", default: "Thank you. We will get back to you shortly.", maxLength: 200 } as Field,
    ],
  },
  {
    type: "offices",
    label: "Offices and hours",
    description: "Office addresses, phone numbers, email and opening hours.",
    pullsFrom: { label: "Site settings, Contact details and Offices", href: "/settings/contact" },
    fields: [
      { kind: "text", name: "heading", label: "Heading", required: true, maxLength: 100 },
      { kind: "textarea", name: "intro", label: "Intro text", rows: 2 },
    ],
  },
  {
    type: "jobList",
    label: "Open roles",
    description: "Lists current job openings.",
    pullsFrom: { label: "Careers", href: "/careers" },
    fields: [
      { kind: "text", name: "heading", label: "Heading", required: true, maxLength: 100 },
      { kind: "textarea", name: "emptyText", label: "Text when there are no open roles", rows: 2, help: "Shown when nothing is listed under Careers." },
    ],
  },
  {
    type: "blogList",
    label: "Blog articles",
    description: "Shows the latest published blog posts.",
    pullsFrom: { label: "Blog posts", href: "/blog" },
    fields: [
      { kind: "text", name: "heading", label: "Heading", maxLength: 100 },
      { kind: "number", name: "count", label: "How many posts", help: "Use 0 to show all posts with paging.", default: undefined } as unknown as Field,
      { kind: "toggle", name: "showFilters", label: "Show category filter", default: true },
    ],
  },
];

export const BLOCK_BY_TYPE: Record<string, BlockDef> = Object.fromEntries(BLOCKS.map((b) => [b.type, b]));

export type BlockData = { id: string; type: string; data: Record<string, unknown> };
