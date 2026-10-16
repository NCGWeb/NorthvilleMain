import type { Field } from "./fields";

/**
 * Site-wide settings. Each group is one screen in the admin. Everything the
 * website repeats on many pages (phone, socials, menus, footer) is stored here
 * once.
 */
export type SettingGroup = {
  key: string;
  label: string;
  description: string;
  fields: Field[];
};

export const SETTING_GROUPS: SettingGroup[] = [
  {
    key: "general",
    label: "Brand and basics",
    description: "Name, logo and the short blurb used in the footer.",
    fields: [
      { kind: "text", name: "siteName", label: "Company name", required: true, where: "Browser tab title, footer, emails." },
      { kind: "text", name: "tagline", label: "Tagline", where: "Footer and search results.", help: "One short line describing the firm." },
      { kind: "textarea", name: "footerBlurb", label: "Footer description", rows: 3, where: "Footer, under the logo." },
      { kind: "image", name: "logo", label: "Logo (white, for dark backgrounds)", where: "Header and footer.", help: "PNG with transparent background." },
      { kind: "ref", name: "servicePageCta", label: "Strip at the bottom of every service page", collection: "shared", where: "Bottom of every service page.", help: "Pick one of your Reusable sections, for example Contact us strip." },
      { kind: "text", name: "copyright", label: "Copyright line", where: "Very bottom of every page.", help: "The year is added automatically." },
    ],
  },
  {
    key: "announcement",
    label: "Top bar (award or announcement)",
    description: "A slim strip above the menu on every page. Good for an award, a launch or a notice. Switch it off to hide it.",
    fields: [
      { kind: "toggle", name: "enabled", label: "Show the top bar", where: "Very top of every page." },
      { kind: "image", name: "badge", label: "Small badge or icon (optional)", help: "Square picture, shown at the left.", where: "Top bar, left." },
      { kind: "text", name: "title", label: "Main text", help: "Short and bold, for example the award name.", where: "Top bar.", maxLength: 80 },
      { kind: "text", name: "text", label: "Supporting text", help: "Optional. Hidden on small phones.", where: "Top bar, after the main text.", maxLength: 140 },
      { kind: "url", name: "href", label: "Link (optional)", help: "Where the bar goes when clicked.", where: "Top bar." },
    ],
  },
  {
    key: "contact",
    label: "Contact details",
    description: "Phone numbers, emails, WhatsApp and opening hours. Change a number here and it updates everywhere.",
    fields: [
      { kind: "text", name: "email", label: "Main email", where: "Contact page, footer.", required: true },
      { kind: "text", name: "hrEmail", label: "Careers email", where: "Careers page." },
      { kind: "stringlist", name: "phones", label: "Phone numbers", itemLabel: "Phone number", where: "Contact page." },
      { kind: "text", name: "whatsappNumber", label: "WhatsApp number", help: "Digits only with country code, for example 917678558902.", where: "Every WhatsApp button on the site." },
      { kind: "text", name: "whatsappMessage", label: "WhatsApp opening message", help: "Pre-filled when someone taps a WhatsApp button.", where: "Every WhatsApp button on the site." },
      { kind: "text", name: "officeHours", label: "Opening hours", where: "Contact page.", placeholder: "Monday to Friday, 10:30 AM to 7:30 PM" },
      { kind: "text", name: "responseTime", label: "Reply promise", where: "Contact page.", placeholder: "We reply within 2 to 3 hours." },
      { kind: "text", name: "enquiryRecipient", label: "Send new enquiries to", help: "Email address that receives contact form messages.", where: "Not shown on the site." },
    ],
  },
  {
    key: "social",
    label: "Social links",
    description: "Leave a box empty to hide that icon.",
    fields: [
      { kind: "url", name: "linkedin", label: "LinkedIn", where: "Footer and follow strips." },
      { kind: "url", name: "instagram", label: "Instagram", where: "Footer and follow strips." },
      { kind: "url", name: "facebook", label: "Facebook", where: "Footer and follow strips." },
      { kind: "url", name: "x", label: "X (Twitter)", where: "Footer and follow strips." },
      { kind: "url", name: "youtube", label: "YouTube", where: "Footer and follow strips." },
    ],
  },
  {
    key: "navigation",
    label: "Menus",
    description: "The top menu and footer links. The Services menu lists your services automatically.",
    fields: [
      {
        kind: "list", name: "mainLinks", label: "Top menu links", itemLabel: "Link",
        help: "Shown in this order. The Services menu is added automatically, where you place the link named Services.",
        where: "Header on every page.",
        fields: [
          { kind: "text", name: "label", label: "Text", required: true, maxLength: 30 },
          { kind: "url", name: "href", label: "Goes to", required: true, help: "Use /services to place the Services menu here." },
        ],
      },
      { kind: "text", name: "ctaLabel", label: "Header button text", where: "Right side of the header." },
      { kind: "url", name: "ctaHref", label: "Header button link", where: "Right side of the header." },
      {
        kind: "list", name: "footerLinks", label: "Footer links", itemLabel: "Link", where: "Footer.",
        fields: [
          { kind: "text", name: "label", label: "Text", required: true, maxLength: 30 },
          { kind: "url", name: "href", label: "Goes to", required: true },
        ],
      },
      {
        kind: "list", name: "legalLinks", label: "Small print links", itemLabel: "Link", where: "Bottom of the footer.",
        fields: [
          { kind: "text", name: "label", label: "Text", required: true, maxLength: 30 },
          { kind: "url", name: "href", label: "Goes to", required: true },
        ],
      },
    ],
  },
  {
    key: "seo",
    label: "Search and sharing",
    description: "How the site appears on Google and when shared. Each page can override this in its own settings.",
    fields: [
      { kind: "text", name: "titleSuffix", label: "Title ending", help: "Added after every page title.", placeholder: "| Northville Consulting Group" },
      { kind: "textarea", name: "description", label: "Default description", rows: 3, help: "About 150 characters." },
      { kind: "image", name: "image", label: "Default sharing image", help: "1200 by 630 pixels works best." },
    ],
  },
];

export const SETTING_BY_KEY = Object.fromEntries(SETTING_GROUPS.map((g) => [g.key, g]));
