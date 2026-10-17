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
    key: "chatbot",
    label: "Chatbot",
    description: "The chat window in the corner of the website. Edit its answers under Chatbot answers.",
    fields: [
      { kind: "toggle", name: "enabled", label: "Show the chatbot", default: true, where: "Corner of every page." },
      { kind: "text", name: "title", label: "Window title", where: "Top of the chat window.", placeholder: "Ask Northville", maxLength: 40 },
      { kind: "textarea", name: "greeting", label: "Opening message", rows: 3, where: "First message in the chat window.", maxLength: 300 },
      { kind: "textarea", name: "fallback", label: "Message when the bot has no answer", rows: 3, help: "Point people to a human. The contact buttons are added automatically.", where: "Chat window.", maxLength: 300 },
      { kind: "text", name: "placeholder", label: "Typing box hint", where: "Chat window.", placeholder: "Type your question", maxLength: 60 },
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
      {
        kind: "list", name: "servicesMenuLinks", label: "Extra links in the Services dropdown", itemLabel: "Link",
        help: "Shown at the bottom of the Services dropdown, next to View all services. Good for things that are not one of the services, such as Startup Advisory.",
        where: "Services dropdown in the header, and the phone menu.",
        fields: [
          { kind: "text", name: "label", label: "Text", required: true, maxLength: 30 },
          { kind: "url", name: "href", label: "Goes to", required: true },
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
      { kind: "text", name: "shortSuffix", label: "Short title ending", help: "Used when the full ending would make a title too long for Google (over about 65 characters). Keep it brief.", placeholder: "| Northville", maxLength: 20, where: "Page titles in Google results and browser tabs." },
      { kind: "textarea", name: "description", label: "Default description", rows: 3, help: "About 150 characters." },
      { kind: "image", name: "image", label: "Default sharing image", help: "1200 by 630 pixels works best." },
      { kind: "text", name: "googleVerification", label: "Google Search Console code", help: "Paste only the code from Google's verification tag (the content value). Lets you see how the site performs in Google search.", where: "Hidden in the page code, not visible to visitors." },
      { kind: "text", name: "gaId", label: "Google Analytics ID", help: "Looks like G-XXXXXXXXXX. Leave empty to switch visitor statistics off.", where: "Loads Google Analytics only after a visitor accepts the cookie notice.", placeholder: "G-XXXXXXXXXX" },
    ],
  },
];

export const SETTING_BY_KEY: Record<string, SettingGroup> = Object.fromEntries(SETTING_GROUPS.map((g) => [g.key, g]));

/**
 * Small pieces of wording the website shows (buttons, footer headings, form labels).
 * Every one is editable under Site settings, Wording, so nothing visible is hard-coded.
 */
export const UI_TEXT: { name: string; label: string; where: string; default: string }[] = [
  { name: "footerCompany", label: "Footer: first column heading", where: "Footer, links column.", default: "Company" },
  { name: "footerServices", label: "Footer: services column heading", where: "Footer, services column.", default: "Services" },
  { name: "footerContact", label: "Footer: contact column heading", where: "Footer, contact column.", default: "Get in Touch" },
  { name: "footerAllServices", label: "Footer: link to all services", where: "Footer, services column.", default: "All Services" },
  { name: "footerRights", label: "Footer: rights line", where: "Very bottom of every page, after the year and company name.", default: "All rights reserved." },
  { name: "seeAllServices", label: "Link under the services overview", where: "Home page services section.", default: "See All Services" },
  { name: "learnMore", label: "Learn more link", where: "Services page, under each service.", default: "Learn More" },
  { name: "crumbHome", label: "Breadcrumb: Home", where: "Top of service pages.", default: "Home" },
  { name: "crumbServices", label: "Breadcrumb: Services", where: "Top of service pages.", default: "Services" },
  { name: "relatedServices", label: "Service page: related services heading", where: "Service pages, below the offerings.", default: "Related Services" },
  { name: "whatWeDo", label: "Service page: offerings heading", where: "Service pages, above the list of offerings.", default: "What We Do" },
  { name: "discussService", label: "Service page: main button", where: "Top of service pages.", default: "Discuss This Service" },
  { name: "whatsappUs", label: "WhatsApp button text", where: "Service pages and contact strips.", default: "WhatsApp Us" },
  { name: "faqHeading", label: "Questions and answers heading on service pages", where: "Bottom of service pages.", default: "Frequently Asked Questions" },
  { name: "widerTeam", label: "Our Team page: second heading", where: "Our Team page, above the full team.", default: "The Wider Team" },
  { name: "widerTeamNote", label: "Our Team page: line beside the second heading", where: "Our Team page. Use {count} for the number of people.", default: "{count} specialists across finance, strategy, marketing and legal" },
  { name: "connectLinkedin", label: "Leadership: LinkedIn link text", where: "Our Team page and About page.", default: "Connect on LinkedIn" },
  { name: "blogAll", label: "Blog: show everything filter", where: "Blog page, category filter.", default: "All" },
  { name: "blogEmpty", label: "Blog: message when there are no posts", where: "Blog page.", default: "New articles are on the way. Check back soon." },
  { name: "blogInsights", label: "Blog: breadcrumb to the blog", where: "Top of every blog post.", default: "Insights" },
  { name: "blogMinRead", label: "Blog: reading time word", where: "Top of every blog post, after the number of minutes.", default: "min read" },
  { name: "blogWrittenBy", label: "Blog: author label", where: "Bottom of every blog post.", default: "Written By" },
  { name: "blogKeepReading", label: "Blog: related posts heading", where: "Bottom of every blog post.", default: "Keep Reading" },
  { name: "blogAllInsights", label: "Blog: link back to all posts", where: "Bottom of every blog post.", default: "All Insights" },
  { name: "formName", label: "Contact form: name label", where: "Contact page.", default: "Your Name" },
  { name: "formEmail", label: "Contact form: email label", where: "Contact page.", default: "Email" },
  { name: "formPhone", label: "Contact form: phone label", where: "Contact page.", default: "Phone" },
  { name: "formMessage", label: "Contact form: message label", where: "Contact page.", default: "How Can We Help?" },
  { name: "formSend", label: "Contact form: send button", where: "Contact page.", default: "Send Enquiry" },
  { name: "formSending", label: "Contact form: button while sending", where: "Contact page.", default: "Sending..." },
  { name: "formError", label: "Contact form: error message", where: "Contact page, if sending fails.", default: "Something went wrong. Please try again or email us." },
  { name: "officesGetInTouch", label: "Offices: contact box heading", where: "Contact page.", default: "Get in Touch" },
  { name: "officesMaps", label: "Offices: map link text", where: "Contact page, under each address.", default: "Open in Maps" },
  { name: "jobApply", label: "Careers: apply button", where: "Careers page, next to each open role.", default: "Apply" },
  { name: "chatSubtitle", label: "Chat window: line under the title", where: "Top of the chat window.", default: "Quick answers, any time" },
  { name: "chatClose", label: "Chat window: close button label", where: "Chat window, for screen readers.", default: "Close chat" },
  { name: "chatSend", label: "Chat window: send button label", where: "Chat window, for screen readers.", default: "Send" },
  { name: "chatEnquiry", label: "Chat window: enquiry button", where: "Chat window, when the bot has no answer.", default: "Send an enquiry" },
  { name: "chatWhatsapp", label: "Chat window: WhatsApp button", where: "Chat window, when the bot has no answer.", default: "WhatsApp us" },
  { name: "chatServerError", label: "Chat window: message when something goes wrong", where: "Chat window.", default: "Sorry, something went wrong. Please try again." },
  { name: "chatOffline", label: "Chat window: message when the connection fails", where: "Chat window.", default: "Sorry, I could not reach the server. Please try again, or contact us directly." },
  { name: "viewAllServices", label: "Services menu: link to all services", where: "Bottom of the Services dropdown and the phone menu.", default: "View all services" },
  { name: "insightsHeading", label: "Insights: fallback heading", where: "Insights page, if the heading is left blank.", default: "Insights" },
  { name: "testimonialsHeading", label: "Testimonials: fallback heading", where: "Testimonials section, if its heading is left blank.", default: "What they say about us" },
  { name: "testimonialPrev", label: "Testimonials: previous button label", where: "Testimonials carousel, for screen readers.", default: "Previous testimonial" },
  { name: "testimonialNext", label: "Testimonials: next button label", where: "Testimonials carousel, for screen readers.", default: "Next testimonial" },
  { name: "testimonialGoTo", label: "Testimonials: dot label", where: "Testimonials carousel, for screen readers. The number is added after it.", default: "Show testimonial" },
  { name: "formSuccess", label: "Contact form: fallback thank you message", where: "Contact form, if the thank you message is left blank.", default: "Thank you. We will be in touch shortly." },
  { name: "servicesAll", label: "Services page: show everything filter", where: "Services page, theme filter.", default: "All" },
  { name: "servicesFilterLabel", label: "Services page: filter label for screen readers", where: "Services page, theme filter.", default: "Filter services by theme" },
  { name: "categoryHeadingPrefix", label: "Blog category page: fallback heading start", where: "Blog category pages, if the category has no heading.", default: "Insights on" },
  { name: "consentText", label: "Cookie notice: message", where: "Cookie notice at the bottom of the page (only when Google Analytics is on).", default: "We use cookies to understand how the site is used. You can accept or decline." },
  { name: "consentAccept", label: "Cookie notice: accept button", where: "Cookie notice.", default: "Accept" },
  { name: "consentDecline", label: "Cookie notice: decline button", where: "Cookie notice.", default: "Decline" },
  { name: "skipToContent", label: "Skip link (for keyboard and screen reader users)", where: "Hidden link at the very top of every page, shown when tabbed to.", default: "Skip to content" },
  { name: "previewBanner", label: "Draft preview: banner", where: "Bottom of the private draft preview. Use {title} for the page name.", default: "Draft preview of {title}. Visitors cannot see this." },
  { name: "notFoundHeading", label: "Page not found: heading", where: "The page shown for a wrong address.", default: "This Page Has Moved or Does Not Exist" },
  { name: "notFoundText", label: "Page not found: text", where: "The page shown for a wrong address.", default: "Try the home page or tell us what you were looking for." },
  { name: "notFoundHome", label: "Page not found: home button", where: "The page shown for a wrong address.", default: "Back Home" },
  { name: "notFoundContact", label: "Page not found: contact button", where: "The page shown for a wrong address.", default: "Contact Us" },
];

export const UI_TEXT_DEFAULTS: Record<string, string> = Object.fromEntries(UI_TEXT.map((t) => [t.name, t.default]));

SETTING_GROUPS.push({
  key: "text",
  label: "Wording (buttons, headings and small text)",
  description: "The small pieces of text around the website: footer headings, button labels, form labels and the page-not-found message. Leave a box empty to use the standard wording.",
  fields: UI_TEXT.map((t) => ({ kind: "text" as const, name: t.name, label: t.label, where: t.where, placeholder: t.default })),
});
SETTING_BY_KEY.text = SETTING_GROUPS[SETTING_GROUPS.length - 1];
