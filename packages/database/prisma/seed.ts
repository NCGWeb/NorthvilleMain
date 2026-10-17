/**
 * Loads the content crawled from the old Wix site. Safe to re-run: it upserts
 * by natural key and never overwrites pages an editor has already changed
 * (use SEED_RESET=1 to force a full reset of content).
 */
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEFAULT_ROLES } from "../../content/src/permissions";
import { CHATBOT_SETTINGS, CHAT_ANSWERS } from "./seed-chat";
import { FAQS } from "./seed-faqs";
import { POSTS } from "./seed-posts";
import { GROUPS, SERVICES } from "./seed-services";

try {
  process.loadEnvFile(new URL("../../../.env", import.meta.url));
} catch {
  // real env
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const RESET = process.env.SEED_RESET === "1";

type Block = { id: string; type: string; data: Record<string, unknown> };
const b = (type: string, data: Record<string, unknown>): Block => ({ id: randomUUID(), type, data });

async function main() {
  // ---- Access: roles and the first super admin
  for (const r of DEFAULT_ROLES) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: RESET ? { permissions: [...r.permissions], description: r.description } : {},
      create: { name: r.name, description: r.description, permissions: [...r.permissions], isSystem: true },
    });
  }
  const adminEmail = (process.env.SUPERADMIN_EMAIL ?? "admin@northvilleconsultinggroup.com").toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!exists) {
    await prisma.user.create({
      data: { email: adminEmail, name: "Site Owner", passwordHash: await bcrypt.hash(process.env.SUPERADMIN_INITIAL_PASSWORD ?? "change-me-now", 12) },
    });
  }

  const hasContent = (await prisma.page.count()) > 0;
  if (hasContent && !RESET) {
    console.log("Content already present. Skipping (set SEED_RESET=1 to reload).");
    return;
  }
  if (RESET) {
    await prisma.$transaction([
      prisma.pageVersion.deleteMany(), prisma.page.deleteMany(), prisma.sharedBlock.deleteMany(),
      prisma.serviceOffering.deleteMany(), prisma.service.deleteMany(), prisma.serviceGroup.deleteMany(),
      prisma.teamMember.deleteMany(), prisma.testimonial.deleteMany(), prisma.logoItem.deleteMany(),
      prisma.blogPost.deleteMany(), prisma.blogCategory.deleteMany(), prisma.office.deleteMany(), prisma.redirect.deleteMany(), prisma.siteSetting.deleteMany(),
    ]);
  }

  // ---- Settings
  const settings: Record<string, object> = {
    general: {
      siteName: "Northville Consulting Group",
      tagline: "Integrated strategy, finance and transaction advisory",
      footerBlurb: "Northville Consulting Group helps businesses grow, backed by dedicated experts across finance, legal, marketing and strategy. Think of us as an extension of your team.",
      logo: "/seed/brand/logo-white-trim.png",
      copyright: "Northville Consulting Group",
    },
    contact: {
      email: "hello@northvilleconsultinggroup.com",
      hrEmail: "hr@northvilleconsultinggroup.com",
      phones: ["+91 97176 86404", "+91 76785 58902"],
      whatsappNumber: "917678558902",
      whatsappMessage: "Hi Northville, I would like to discuss a project.",
      officeHours: "Monday to Friday, 10:30 AM to 7:30 PM",
      responseTime: "We reply within 2 to 3 hours on working days.",
      enquiryRecipient: "hello@northvilleconsultinggroup.com",
    },
    social: {
      linkedin: "https://www.linkedin.com/company/northville-consulting",
      instagram: "https://www.instagram.com/northville.consulting/",
      facebook: "https://www.facebook.com/profile.php?id=61565932647487",
      x: "", youtube: "",
    },
    navigation: {
      mainLinks: [
        { label: "About", href: "/about" },
        { label: "Services", href: "/services" },
        { label: "Startup Advisory", href: "/services#startup-advisory" },
        { label: "Our Team", href: "/team" },
        { label: "Insights", href: "/blog" },
        { label: "Careers", href: "/careers" },
      ],
      servicesMenuLinks: [{ label: "Startup Advisory", href: "/services#startup-advisory" }],
      ctaLabel: "Contact Us",
      ctaHref: "/contact",
      footerLinks: [
        { label: "About", href: "/about" },
        { label: "Services", href: "/services" },
        { label: "Startup Advisory", href: "/services#startup-advisory" },
        { label: "Our Team", href: "/team" },
        { label: "Insights", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
      ],
      legalLinks: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms and Conditions", href: "/terms-conditions" },
      ],
    },
    announcement: {
      enabled: true, badge: "/seed/brand/award-badge.png", title: "India Finance Outlook Spotlight Award 2025",
      text: "Recognised as one of the most prominent virtual CFO service providers", href: "",
    },
    seo: {
      titleSuffix: "| Northville Consulting Group",
      description: "Northville Consulting Group is an integrated strategy, finance and transaction advisory partner for established and scaling businesses in India, the US, the UK and the UAE.",
      image: "/seed/brand/og-default.png",
    },
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  // ---- Chatbot
  await prisma.siteSetting.upsert({ where: { key: "chatbot" }, update: { value: CHATBOT_SETTINGS }, create: { key: "chatbot", value: CHATBOT_SETTINGS } });
  await prisma.chatAnswer.deleteMany();
  await prisma.chatAnswer.createMany({ data: CHAT_ANSWERS.map((a, i) => ({ question: a.question, keywords: a.keywords, answer: a.answer, linkLabel: a.linkLabel ?? "", linkHref: a.linkHref ?? "", showAsPill: a.showAsPill ?? true, sortOrder: i })) });

  // ---- Offices
  await prisma.office.createMany({
    data: [
      { city: "New Delhi", address: "A-151, Defence Colony, New Delhi 110024", sortOrder: 0 },
      { city: "Mumbai", address: "301A, Bhoomi Tower, Gurunarayan Road, Santacruz East, Mumbai 400055", sortOrder: 1 },
    ],
  });

  // ---- Services
  const groupIds: Record<string, string> = {};
  for (const [i, g] of GROUPS.entries()) {
    groupIds[g.name] = (await prisma.serviceGroup.create({ data: { ...g, sortOrder: i } })).id;
  }
  const redirects: { fromPath: string; toPath: string }[] = [];
  for (const [i, s] of SERVICES.entries()) {
    await prisma.service.create({
      data: {
        slug: s.slug, name: s.name, group: { connect: { id: groupIds[s.group] } }, summary: s.summary, imageUrl: s.image,
        heroHeading: s.name, heroSubtext: s.summary, tagline: s.tagline, seoTitle: s.seoTitle, seoDescription: s.seoDescription,
        faqs: s.faqs ?? FAQS[s.slug] ?? [], sortOrder: i,
        offerings: { create: s.offerings.map((o, j) => ({ ...o, sortOrder: j })) },
      },
    });
    for (const old of s.oldSlugs) redirects.push({ fromPath: `/${old}`, toPath: `/services/${s.slug}` });
  }
  redirects.push(
    { fromPath: "/what-we-do", toPath: "/services" },
    { fromPath: "/who-we-are", toPath: "/team" },
    { fromPath: "/career", toPath: "/careers" },
    { fromPath: "/donation-thank-you-page", toPath: "/" },
    { fromPath: "/donation-thank-you-page-1", toPath: "/" },
  );
  await prisma.redirect.createMany({ data: redirects });

  // ---- Team (founders first, then the team list supplied by the client)
  const team: { name: string; designation: string; background: string; bio?: string; photo: string; lead?: boolean; linkedin?: string }[] = [
    { name: "Asmeet Bhatia", designation: "Founder and Managing Director", background: "CA, MBA (ISB), B.Com (Hons)", bio: "Chartered Accountant with an MBA from ISB. Previously at EY and Deloitte.", photo: "asmeet-bhatia.jpg", lead: true, linkedin: "https://www.linkedin.com/in/asmeetbhatia/" },
    { name: "Achal Bhatt", designation: "Director, Marketing", background: "CPA, MSc Accounting (UIUC)", bio: "CPA with seven years at PwC in New York City. Focuses on financial analysis and strategic planning.", photo: "achal-bhatt.jpg", lead: true },
    { name: "MS Rehsi", designation: "Senior Strategy Consultant", background: "Ex-CMO of Aircel", photo: "01_MS_Rehsi.jpeg" },
    { name: "Vishi Agarwal", designation: "Senior Marketing Consultant", background: "CA, MBA (S.P. Jain), MSc (University of Houston)", photo: "02_Vishi_Agarwal.jpeg" },
    { name: "Priya Arora", designation: "Finance Consultant", background: "Chartered Accountant", photo: "03_Priya_Arora.jpeg" },
    { name: "Thiru Venkat R", designation: "Marketing Consultant", background: "B.E, MBA (pursuing)", photo: "04_Thiru_Venkat_R.png" },
    { name: "Ritesh Anand", designation: "External Legal Counsel", background: "Corporate Attorney, LLB (Amity Law). Ex-DSK Legal", photo: "05_Ritesh_Anand.jpeg" },
    { name: "Sharlin Dsilva", designation: "HR Consultant", background: "", photo: "06_Sharlin_Dsilva.png" },
    { name: "Tamanna Sharma", designation: "Finance Associate", background: "", photo: "07_Tamanna_Sharma.jpeg" },
    { name: "Kritika Grover", designation: "Graphic Designer", background: "BBA (MJPRU), MAAC South Ex", photo: "08_Kritika_Grover.png" },
    { name: "Chanpreet Gujral", designation: "Strategy Associate", background: "BMS (SGGSCC)", photo: "09_Chanpreet_Gujral.png" },
    { name: "Shruti Meharia", designation: "Finance Associate", background: "B.Com (SRCC), ACCA (pursuing)", photo: "10_Shruti_Meharia.jpeg" },
    { name: "Tanupreet Kaur", designation: "Finance Associate", background: "B.Com (PU Chandigarh), US CPA (pursuing)", photo: "11_Tanupreet_Kaur.jpeg" },
    { name: "Vinayak Sharma", designation: "IB Intern", background: "B.Com (KNC)", photo: "12_Vinayak_Sharma.jpeg" },
    { name: "Mohammad Areeb", designation: "Strategy Intern", background: "B.Com (Hons), SBSC", photo: "13_Mohammad_Areeb.jpeg" },
    { name: "Priyal Kanungo", designation: "Strategy Intern", background: "Economics (Hons), SGGSCC", photo: "14_Priyal_Kanungo.png" },
  ];
  const LINKEDIN: Record<string, string> = {
    "Sharlin Dsilva": "https://www.linkedin.com/in/sharlin-doris-dsilva-27891ba2",
    "Thiru Venkat R": "https://www.linkedin.com/in/thiru-venkat-r-748328251",
    "Asmeet Bhatia": "https://www.linkedin.com/in/asmeetbhatia",
    "Mohammad Areeb": "https://www.linkedin.com/in/mohammadareeb3007",
    "Priya Arora": "https://www.linkedin.com/in/priya-arora111",
    "Kritika Grover": "https://www.linkedin.com/in/kritika-grover-954b541b8",
    "Priyal Kanungo": "https://www.linkedin.com/in/priyal-kanungo-b08539282",
  };
  await prisma.teamMember.createMany({
    data: team.map((t, i) => ({
      name: t.name, designation: t.designation, background: t.background, bio: t.bio ?? "", photoUrl: `/seed/team/${t.photo}`,
      linkedinUrl: t.linkedin ?? LINKEDIN[t.name] ?? "", isLeadership: !!t.lead, sortOrder: i,
    })),
  });

  // ---- Testimonial
  await prisma.testimonial.create({
    data: {
      quote: "The team at Northville Consulting Group has been incredibly professional and has significantly helped us organize our accounting system. Today, we rely on them for a comprehensive suite of services, including bookkeeping, financial analysis, and taxation including filing of our GST, TDS, and ITR returns. Their expertise has streamlined our operations and given us peace of mind.",
      authorName: "706 Pictures", authorRole: "Client", photoUrl: "/seed/team/706-pictures.jpg",
    },
  });

  // ---- Logos. Names read from the images; entries marked (rename) need a real name.
  const logos: [string, string, string][] = [
    ["CLIENT", "The Strutt Store", "client-1.png"], ["CLIENT", "Kaidoo Kids", "client-2.png"], ["CLIENT", "Gravid", "client-3.png"],
    ["CLIENT", "CropZenith", "client-4.png"], ["CLIENT", "Nila", "client-5.png"],
    ["INVESTOR", "ICICI", "investor-icici.png"], ["INVESTOR", "Aavishkaar Capital", "investor-8.png"], ["INVESTOR", "RPSG Ventures", "investor-1.png"],
    ["INVESTOR", "Faad Network", "investor-2.png"], ["INVESTOR", "Tomorrow Capital", "investor-3.png"], ["INVESTOR", "Makia Capital", "investor-4.png"],
    ["INVESTOR", "Amity Capital Ventures", "investor-5.png"], ["INVESTOR", "Inflexor Ventures", "investor-6.png"], ["INVESTOR", "Investor partner (rename)", "investor-7.png"],
    ["INSTITUTION", "Indian School of Business", "institution-1.png"], ["INSTITUTION", "NMIMS", "institution-2.png"],
    ["INSTITUTION", "SDA Bocconi Asia Center", "institution-3.png"], ["INSTITUTION", "IIM Kashipur", "institution-4.png"],
    ["INSTITUTION", "Vivekanand Education Society Business School", "institution-5.png"],
    ["NETWORK", "White Stone (confirm name)", "network-1.png"], ["NETWORK", "Network firm 2 (rename)", "network-2.png"], ["NETWORK", "A Salwan & Associates", "network-3.png"],
  ];
  await prisma.logoItem.createMany({
    data: logos.map(([wall, name, file], i) => ({ wall: wall as "CLIENT", name, imageUrl: `/seed/logos/${file}`, sortOrder: i })),
  });

  // ---- Blog
  const cats = await Promise.all(
    [["Finance", "finance"], ["Strategy", "strategy"], ["Deals and Fundraising", "deals-and-fundraising"], ["Tax and Compliance", "tax-and-compliance"]].map(([name, slug]) =>
      prisma.blogCategory.create({ data: { name, slug } }),
    ),
  );
  const author = await prisma.user.findUnique({ where: { email: adminEmail } });
  for (const p of POSTS) {
    const cat = cats.find((c) => c.slug === p.category);
    await prisma.blogPost.create({ data: { slug: p.slug, title: p.title, status: "DRAFT", excerpt: p.excerpt, seoDescription: p.seoDescription, body: p.body, categoryId: cat?.id, authorId: author?.id } });
  }

  // ---- Shared sections (written once, used on many pages)
  const sharedContact = await prisma.sharedBlock.create({
    data: { name: "Contact Us Strip", type: "ctaBand", data: { heading: "Contact Us for Enquiries", text: "Tell us what you are working on. We reply within a few hours on working days.", primaryLabel: "Get in Touch", primaryHref: "/contact", showWhatsapp: true, tone: "dark" } },
  });
  const sharedCareers = await prisma.sharedBlock.create({
    data: { name: "Careers Strip", type: "ctaBand", data: { heading: "Be a Part of the Team", text: "We are building a diverse team of talented professionals across finance, law, marketing and strategy.", primaryLabel: "Say Hi", primaryHref: "/careers", showWhatsapp: false, tone: "light" } },
  });
  const sharedFollow = await prisma.sharedBlock.create({
    data: { name: "Follow Us Strip", type: "socialBand", data: { heading: "Want Updates About Us?", text: "Follow us on social media for insights and news from the team." } },
  });
  const g = await prisma.siteSetting.findUniqueOrThrow({ where: { key: "general" } });
  await prisma.siteSetting.update({ where: { key: "general" }, data: { value: { ...(g.value as object), servicePageCta: sharedContact.id } } });
  const shared = (id: string) => b("shared", { sharedId: id });

  // ---- Pages
  const pages: { slug: string; title: string; seoTitle: string; seoDescription: string; blocks: Block[]; footer?: boolean }[] = [
    {
      slug: "", title: "Home",
      seoTitle: "Northville Consulting Group | Strategy, CFO and M&A Advisory",
      seoDescription: "Northville Consulting Group is an integrated strategy, finance and transaction advisory partner for scaling businesses in India, the US, the UK and the UAE.",
      blocks: [
        b("hero", { size: "large", heading: "Your Success Is the Only Metric That Matters to Us.", subtext: "An integrated strategy, finance and transaction advisory partner for established and scaling businesses across India, the US, the UK and the UAE. Senior expertise, embedded with your leadership team.", primaryLabel: "Talk to Us", primaryHref: "/contact", secondaryLabel: "Explore Services", secondaryHref: "/services", image: null }),
        b("stats", { heading: "Our Impact in Numbers", items: [{ value: "834", suffix: "+", label: "Projects" }, { value: "15", suffix: "+", label: "Industries" }, { value: "100", suffix: "+", label: "Investor Connects" }] }),
        b("servicesOverview", { heading: "One Team Across Strategy, Finance, Deals, Tax and Law", intro: "Our experts in finance, taxation, law, marketing and strategy act as an extension of your team, so you get the right expertise without building it all in-house.", layout: "compact" }),
        b("team", { heading: "Meet the Founders", intro: "", show: "leadership" }),
        b("testimonials", { heading: "What They Say About Us" }),
        b("blogList", { heading: "Latest Insights", count: 3, showFilters: false }),
        b("logoWall", { heading: "Our Clients", wall: "CLIENT" }),
        b("logoWall", { heading: "Our Top Investor Connects", wall: "INVESTOR" }),
        b("logoWall", { heading: "Institutional Collaborations", wall: "INSTITUTION" }),
        b("logoWall", { heading: "Network Firms", wall: "NETWORK" }),
        shared(sharedContact.id), shared(sharedCareers.id), shared(sharedFollow.id),
      ],
    },
    {
      slug: "about", title: "About Us",
      seoTitle: "About Us",
      seoDescription: "An integrated strategy, finance and transaction advisory partner working embedded with leadership across strategy, finance, transactions, tax, legal and marketing.",
      blocks: [
        b("hero", { size: "compact", heading: "Who Are We?", subtext: "Northville Consulting Group is an integrated strategy, finance and transaction advisory partner for established and scaling businesses.", primaryLabel: "", primaryHref: "", secondaryLabel: "", secondaryHref: "", image: null }),
        b("imageText", { heading: "Senior Expertise Without the Cost of a Large In-House Function", body: "We work embedded with leadership across strategy, finance, transactions, tax, legal and marketing. One accountable team, so advice on a deal, a tax position and a contract is designed together instead of handed between firms.", bullets: [], image: "/seed/services/people.jpeg", imageSide: "right", ctaLabel: "See Our Services", ctaHref: "/services" }),
        b("cardGrid", { heading: "Mission and Vision", intro: "", items: [{ title: "Our Mission", body: "Turning strategic vision into real-world performance, and helping business leaders solve challenges and drive sustained growth." }, { title: "Our Vision", body: "Empower. Enable. Innovate. We empower our clients, enable their growth and drive innovative solutions." }] }),
        b("team", { heading: "The People Behind the Firm", intro: "", show: "leadership" }),
        shared(sharedContact.id), shared(sharedCareers.id),
      ],
    },
    {
      slug: "services", title: "Services",
      seoTitle: "Consulting Services: Strategy, CFO, M&A, Tax, Legal and More",
      seoDescription: "Twelve service lines under one roof: strategy, CFO services, transaction advisory, fundraising, tax, legal, people, marketing, data, risk, PMO and family business.",
      blocks: [
        b("hero", { size: "compact", heading: "Crafting Your Business's Future", subtext: "Personalised consulting to help businesses launch, scale and transact, with a focus on startups and growing companies.", primaryLabel: "Talk to Us", primaryHref: "/contact", secondaryLabel: "", secondaryHref: "", image: null }),
        b("servicesOverview", { heading: "Everything Under One Roof", intro: "Pick a service to see exactly what we cover.", layout: "detailed" }),
        b("imageText", { heading: "Startup Advisory", body: "Founderstreet is our platform for early-stage founders, from day zero to pre-seed. If you are just getting started, begin there and we will point you to the right support.", bullets: ["Built for founders at day zero to pre-seed", "Guidance and services for early-stage startups in India", "An AI assistant for founders"], image: "/seed/services/family.jpg", imageSide: "right", ctaLabel: "Visit Founderstreet", ctaHref: "https://founderstreet.in" }),
        shared(sharedContact.id), shared(sharedCareers.id),
      ],
    },
    {
      slug: "team", title: "Our Team",
      seoTitle: "Our Team: Chartered Accountants, Lawyers and Strategists",
      seoDescription: "Meet the multidisciplinary Northville team: chartered accountants, company secretaries, corporate lawyers, valuation experts, analysts and digital strategists.",
      blocks: [
        b("hero", { size: "compact", heading: "Meet the Team", subtext: "A multidisciplinary group spanning law, finance, management and digital strategy, focused on measurable results for clients.", primaryLabel: "", primaryHref: "", secondaryLabel: "", secondaryHref: "", image: null }),
        b("team", { heading: "The People You Will Work With", intro: "Chartered accountants, company secretaries, corporate lawyers, valuation experts, financial analysts and digital marketing strategists. Responsive, detail-oriented and tailored to your business.", show: "everyone" }),
        shared(sharedCareers.id), shared(sharedContact.id),
      ],
    },
    {
      slug: "careers", title: "Careers",
      seoTitle: "Careers",
      seoDescription: "Join a diverse team of finance, legal, marketing and strategy professionals. See open roles or send us your CV.",
      blocks: [
        b("hero", { size: "compact", heading: "Be a Part of the Team", subtext: "Join a diverse team of talented professionals building the finance, legal, marketing and strategy partner growing businesses rely on.", primaryLabel: "Say Hi", primaryHref: "/contact", secondaryLabel: "", secondaryHref: "", image: null }),
        b("jobList", { heading: "Open Roles", emptyText: "There are no open roles right now, but we always like to hear from strong people. Email your CV to the address below and tell us how you would like to contribute." }),
        shared(sharedFollow.id),
      ],
    },
    {
      slug: "contact", title: "Contact",
      seoTitle: "Contact Us",
      seoDescription: "Start a conversation with our team. Offices in New Delhi and Mumbai. Call, email, WhatsApp or send an enquiry.",
      blocks: [
        b("hero", { size: "compact", heading: "Let's Begin a Conversation", subtext: "Tell us about your business and what you need. A senior member of the team will reply.", primaryLabel: "", primaryHref: "", secondaryLabel: "", secondaryHref: "", image: null }),
        b("contactForm", { heading: "Send Us an Enquiry", intro: "Share a few details and we will come back to you.", successMessage: "Thank you. We will get back to you shortly." }),
        b("offices", { heading: "Visit Us", intro: "" }),
      ],
    },
    {
      slug: "blog", title: "Insights",
      seoTitle: "Insights on Finance, Strategy, M&A and Tax",
      seoDescription: "Practical articles from the Northville team on finance, strategy, deals, fundraising, tax and compliance.",
      blocks: [
        b("hero", { size: "compact", heading: "Ideas for Growing Businesses", subtext: "Practical thinking on finance, strategy, deals and compliance from the Northville team.", primaryLabel: "", primaryHref: "", secondaryLabel: "", secondaryHref: "", image: null }),
        b("blogList", { heading: "", count: 0, showFilters: true }),
        shared(sharedContact.id),
      ],
    },
    {
      slug: "privacy-policy", title: "Privacy Policy", footer: true,
      seoTitle: "Privacy Policy", seoDescription: "How Northville Consulting Group collects, uses and protects personal information.",
      blocks: [
        b("hero", { size: "compact", heading: "Privacy Policy", subtext: "", primaryLabel: "", primaryHref: "", secondaryLabel: "", secondaryHref: "", image: null }),
        b("textSection", { heading: "", align: "left", body: "<p><strong>Draft for legal review.</strong> The Wix site carried only a template here. Replace this with your reviewed policy.</p><h2>Information We Collect</h2><p>When you contact us through the website we collect the name, email address, phone number and message you provide. We also collect standard, anonymous usage data to understand how the site is used.</p><h2>How We Use It</h2><p>We use your details only to respond to your enquiry and to provide our services. We do not sell personal information.</p><h2>Sharing</h2><p>We share information only with service providers who help us run the website and email, and where the law requires.</p><h2>Your Choices</h2><p>You can ask us to access, correct or delete the information we hold about you by emailing hello@northvilleconsultinggroup.com.</p>" }),
      ],
    },
    {
      slug: "terms-conditions", title: "Terms and Conditions", footer: true,
      seoTitle: "Terms and Conditions", seoDescription: "The terms that apply when you use the Northville Consulting Group website.",
      blocks: [
        b("hero", { size: "compact", heading: "Terms and Conditions", subtext: "", primaryLabel: "", primaryHref: "", secondaryLabel: "", secondaryHref: "", image: null }),
        b("textSection", { heading: "", align: "left", body: "<p><strong>Draft for legal review.</strong> The Wix site carried only a template here. Replace this with your reviewed terms.</p><h2>Use of This Website</h2><p>The content on this site is general information, not professional advice. Engagements are governed by a written agreement between you and Northville Consulting Group.</p><h2>Intellectual Property</h2><p>All content, logos and design on this site belong to Northville Consulting Group or its licensors and may not be reused without permission.</p><h2>Liability</h2><p>We take care to keep the site accurate but give no warranty that it is complete or current.</p>" }),
      ],
    },
  ];
  for (const p of pages) {
    await prisma.page.create({
      data: {
        slug: p.slug, title: p.title, seoTitle: p.seoTitle, seoDescription: p.seoDescription,
        draftBlocks: p.blocks as object[], publishedBlocks: p.blocks as object[], showInFooter: !!p.footer,
      },
    });
  }
  console.log("Seed complete.");
}

main().finally(() => prisma.$disconnect());
