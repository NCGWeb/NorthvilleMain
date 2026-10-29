/** Case studies carried over from the shared marketing site. Text is a close rewrite of each page; screenshots live in apps/web/public/seed/case-studies. */

export const DOMAINS = [
  { slug: "web-development", name: "Web Development", blurb: "Websites designed, built and launched for clients." },
  { slug: "performance-marketing", name: "Performance Marketing", blurb: "Paid campaigns measured on leads, sign-ups and reach." },
];

type Stat = { prefix?: string; value: string; suffix?: string; label: string };
export type SeedStudy = {
  slug: string; clientName: string; industry: string; domain: string; alsoDomain?: string;
  metricValue: string; metricLabel: string; summary: string; coverUrl?: string; mobileUrl?: string; websiteUrl?: string;
  challenge: string; approach: { title: string; body: string }[]; results: string; stats: Stat[]; isFeatured?: boolean;
  seoTitle?: string; seoDescription?: string;
};

const shot = (name: string) => `/seed/case-studies/${name}.jpg`;

export const STUDIES: SeedStudy[] = [
  {
    slug: "finkhoz-partner-program", clientName: "Finkhoz", industry: "Fintech", domain: "performance-marketing", isFeatured: true,
    metricValue: "47%", metricLabel: "lower cost per lead",
    summary: "A webinar campaign lowered the cost of winning new partners and turned 10 leads into paying partners.",
    challenge: "Finkhoz wanted more partners for its partner program, but each lead cost Rs 150. At that price, growing the program was hard to justify.\n\nThere was also no clear path from first interest to signing up, so the process was ad hoc and difficult to measure.",
    approach: [
      { title: "A webinar built for likely partners", body: "We promoted a webinar aimed at the people most likely to become partners. It brought in 125 qualified leads." },
      { title: "Weekly cost-per-lead tuning", body: "Every week we tested targeting, creative and bidding. Within a month the cost per lead fell from Rs 150 to Rs 79." },
      { title: "Tracking from lead to partner", body: "We followed each lead through to sign-up, so the results were measured in partners and not just enquiries. Ten leads became active, paying partners." },
    ],
    results: "In one month, a channel that was too expensive to scale became a dependable source of new partners. Cost per lead fell by 47%, from Rs 150 to Rs 79, and the partners it produced now bring in Rs 3,00,000 a month.",
    stats: [{ value: "125", label: "Leads generated" }, { value: "10", label: "Leads turned into partners" }, { prefix: "₹", value: "300000", label: "Monthly revenue from those partners" }],
    seoDescription: "How a webinar campaign cut Finkhoz's cost per lead by 47% and turned leads into paying partners.",
  },
  {
    slug: "prerna-saas-signups", clientName: "Prerna", industry: "B2B SaaS", domain: "performance-marketing",
    metricValue: "167", metricLabel: "sign-ups generated",
    summary: "A sign-up campaign gave a good product a steady way to bring in new trial users.",
    challenge: "Prerna had a solid product but no steady way to get people to try it. Growth depended almost entirely on organic traffic and referrals, and no performance marketing was running.",
    approach: [
      { title: "Find the right people", body: "We identified the people most likely to sign up and actually use the product, rather than those who would only browse." },
      { title: "Campaigns built for qualified sign-ups", body: "We launched campaigns focused on qualified sign-ups, then tuned them for both volume and quality." },
    ],
    results: "Prerna now has a steady, measurable flow of new sign-ups from paid campaigns, with 167 generated.",
    stats: [],
  },
  {
    slug: "dr-whoof-pet-care", clientName: "Dr. Whoof", industry: "Pet Care", domain: "performance-marketing",
    metricValue: "343K+", metricLabel: "campaign impressions",
    summary: "Awareness campaigns put the brand in front of nearly 150,000 pet owners.",
    challenge: "Dr. Whoof was little known among pet owners, and awareness was low next to its competitors. It also had no real paid media presence to reach people at scale.\n\nWithout awareness, nothing further down the funnel can work, so reach had to come first.",
    approach: [
      { title: "Campaigns for reach, not clicks", body: "We built campaigns to maximise impressions and recall, rather than to chase immediate sales." },
      { title: "A wider pet owner audience", body: "We scaled targeting across pet owner audiences to reach as many relevant people as possible." },
    ],
    results: "The campaigns gave Dr. Whoof visibility among its target audience: 343,276 impressions reaching 149,812 people.",
    stats: [{ value: "343276", label: "Impressions generated" }, { value: "149812", label: "People reached" }],
  },
  {
    slug: "novelty-homes", clientName: "Novelty Homes", industry: "Interior Décor", domain: "web-development", alsoDomain: "performance-marketing", isFeatured: true,
    metricValue: "81%", metricLabel: "lower cost per lead",
    summary: "A 40-year-old Delhi business got a website in three weeks, then lead campaigns that cost far less per enquiry.",
    coverUrl: shot("novelty-homes-2"), mobileUrl: shot("novelty-homes-mobile-2"),
    challenge: "Novelty Homes has been trusted in Delhi for 40 years, but it had no website to match that reputation. Its cost per lead was Rs 625, and lead campaigns would have struggled without a proper site to send people to.",
    approach: [
      { title: "A full website in three weeks", body: "We designed and launched a complete website built to carry the brand online." },
      { title: "SEO from the start", body: "Search optimisation was set up as part of the build, not added after launch." },
      { title: "Lead campaigns on the new site", body: "Right after launch we started lead generation campaigns and kept improving them." },
    ],
    results: "Novelty Homes went from no website to a live site and a lead engine that is 81% more efficient. Cost per lead fell from Rs 625 to Rs 118.",
    stats: [{ value: "3", label: "Weeks from kickoff to live website" }, { prefix: "₹", value: "118", label: "Cost per lead, down from ₹625" }],
  },
  {
    slug: "whitestone-chambers", clientName: "Whitestone Chambers", industry: "Legal Services", domain: "web-development",
    metricValue: "7 days", metricLabel: "from kickoff to launch",
    summary: "A fast, search-ready website for a law firm, written within the advertising rules that apply to Indian lawyers.",
    coverUrl: shot("whitestone-chambers-2"), mobileUrl: shot("whitestone-chambers-mobile-2"),
    challenge: "The firm needed a credible website quickly. Indian Bar Council rules bar law firms from advertising and soliciting work, which rules out the usual marketing copy and conversion-led design.\n\nThe site had to go live within a week, load quickly and still be found in search, all inside those limits.",
    approach: [
      { title: "Neutral, informational content", body: "We wrote clear information about the firm and its practice areas, with no promotional claims and no solicitation." },
      { title: "Built for speed", body: "Performance was designed in from the start rather than fixed after launch." },
      { title: "Search-ready within the rules", body: "We structured the site for search in a way the rules allow." },
      { title: "Launched in a week", body: "The full site was delivered within seven days of kickoff." },
    ],
    results: "The site launched on time and follows the legal profession's advertising rules, with technical SEO in place from day one.",
    stats: [{ value: "Rule 36", label: "Bar Council of India advertising rule followed" }, { value: "Day 1", label: "Technical SEO in place at launch" }],
  },
  {
    slug: "activecare-physiotherapy", clientName: "ActiveCare Physiotherapy", industry: "Healthcare", domain: "web-development", isFeatured: true,
    metricValue: "4 clinics", metricLabel: "live on one website",
    summary: "One website now represents four clinics, with each location ready to be found in local search.",
    coverUrl: shot("activecare-physiotherapy-2"), mobileUrl: shot("activecare-physiotherapy-mobile-2"), websiteUrl: "https://activecarephysiotherapy.in",
    challenge: "ActiveCare ran four clinics with no shared online presence. It needed one website that represented all four, with each clinic findable in local search, and it had to be live within a week.",
    approach: [
      { title: "A page for every clinic", body: "We built a dedicated page for each of the four locations under one unified site." },
      { title: "Local SEO for each location", body: "We set up local search so every location page can appear in local results on its own." },
      { title: "Designed, built and launched in seven days", body: "The whole site went from kickoff to live in a single week." },
    ],
    results: "ActiveCare moved from four disconnected clinics to one unified website, optimised for local search, in a single week.",
    stats: [{ value: "4", label: "Clinic locations live" }, { value: "7", label: "Days from kickoff to launch" }],
  },
  {
    slug: "art-tree", clientName: "Art Tree", industry: "Arts & Culture", domain: "web-development",
    metricValue: "Full build", metricLabel: "from design to launch",
    summary: "A website that explains Indian art and culture to a wider audience.",
    coverUrl: shot("art-tree-2"), mobileUrl: shot("art-tree-mobile-2"), websiteUrl: "https://art-tree.co.in",
    challenge: "Art Tree wanted to explain Indian art and culture to a wider audience. That needs a site that helps people understand the subject, not only look at it.\n\nGeneric website templates do not represent this material well, so the site had to be built around storytelling rather than static pages.",
    approach: [
      { title: "Built for long-form storytelling", body: "We designed the site structure around cultural storytelling instead of a generic brochure layout." },
      { title: "Design through to launch", body: "We took the full website from design to launch." },
    ],
    results: "Art Tree has a website that tells its story the way it deserves. It is the real, live site, not a mockup.",
    stats: [],
  },
];
