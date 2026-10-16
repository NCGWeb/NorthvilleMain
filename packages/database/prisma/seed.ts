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
      footerBlurb: "Northville Consulting Group helps businesses grow, backed by dedicated experts across Finance, Legal, Marketing and Strategy. Think of us as an extension of your team.",
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
        { label: "Our team", href: "/team" },
        { label: "Insights", href: "/blog" },
        { label: "Careers", href: "/careers" },
      ],
      ctaLabel: "Contact us",
      ctaHref: "/contact",
      footerLinks: [
        { label: "About", href: "/about" },
        { label: "Services", href: "/services" },
        { label: "Our team", href: "/team" },
        { label: "Insights", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
      ],
      legalLinks: [
        { label: "Privacy policy", href: "/privacy-policy" },
        { label: "Terms and conditions", href: "/terms-conditions" },
      ],
    },
    seo: {
      titleSuffix: "| Northville Consulting Group",
      description: "Northville Consulting Group is an integrated strategy, finance and transaction advisory partner for established and scaling businesses in India, the US, the UK and the UAE.",
      image: "/seed/brand/logo-white-trim.png",
    },
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

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
        faqs: s.faqs ?? [], sortOrder: i,
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
    { name: "Asmeet Bhatia", designation: "Founder and Managing Director", background: "CA, MBA (ISB), B.Com (Hons)", bio: "Chartered Accountant with an MBA from ISB. Previously at EY and Deloitte.", photo: "asmeet-bhatia.png", lead: true, linkedin: "https://www.linkedin.com/in/asmeetbhatia/" },
    { name: "Achal Bhatt", designation: "Director, Marketing", background: "CPA, MSc Accounting (UIUC)", bio: "CPA with seven years at PwC in New York City. Focuses on financial analysis and strategic planning.", photo: "achal-bhatt.png", lead: true },
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
  await prisma.teamMember.createMany({
    data: team.map((t, i) => ({
      name: t.name, designation: t.designation, background: t.background, bio: t.bio ?? "", photoUrl: `/seed/team/${t.photo}`,
      linkedinUrl: t.linkedin ?? "", isLeadership: !!t.lead, sortOrder: i,
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
    ["INVESTOR", "ICICI", "investor-icici.webp"], ["INVESTOR", "Aavishkaar Capital", "investor-8.png"], ["INVESTOR", "RPSG Ventures", "investor-1.png"],
    ["INVESTOR", "Faad Network", "investor-2.png"], ["INVESTOR", "Tomorrow Capital", "investor-3.png"], ["INVESTOR", "Makia Capital", "investor-4.png"],
    ["INVESTOR", "Amity Capital Ventures", "investor-5.png"], ["INVESTOR", "Inflexor Ventures", "investor-6.png"], ["INVESTOR", "Investor partner (rename)", "investor-7.png"],
    ["INSTITUTION", "Institutional collaborator 1 (rename)", "institution-1.jpg"], ["INSTITUTION", "Institutional collaborator 2 (rename)", "institution-2.jpg"],
    ["INSTITUTION", "Institutional collaborator 3 (rename)", "institution-3.jpg"], ["INSTITUTION", "Institutional collaborator 4 (rename)", "institution-4.jpg"],
    ["INSTITUTION", "Institutional collaborator 5 (rename)", "institution-5.png"],
    ["NETWORK", "Network firm 1 (rename)", "network-1.png"], ["NETWORK", "Network firm 2 (rename)", "network-2.png"], ["NETWORK", "Network firm 3 (rename)", "network-3.png"],
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
  await prisma.blogPost.create({
    data: {
      slug: "when-does-a-startup-need-a-virtual-cfo", title: "When does a startup need a virtual CFO?", status: "DRAFT",
      excerpt: "Bookkeeping keeps you compliant. A virtual CFO helps you decide. Here is how to tell when it is time to add one.",
      categoryId: cats[0].id, authorId: author?.id,
      body: "<h2>The signs</h2><p>Founders usually add finance leadership later than they should. Three signals say it is time: you cannot answer how much runway you have without opening a spreadsheet, investors ask for numbers you assemble by hand, or pricing and hiring decisions are made on instinct.</p><h2>What a virtual CFO does</h2><p>A virtual CFO owns the reporting cadence, builds the forecast, watches cash and gives leadership a clear view before decisions are made. It is the same thinking as a full-time CFO at a fraction of the cost.</p><p><em>This is a sample draft. Replace it with your own article before publishing.</em></p>",
    },
  });

  // ---- Shared sections (written once, used on many pages)
  const sharedContact = await prisma.sharedBlock.create({
    data: { name: "Contact us strip", type: "ctaBand", data: { heading: "Contact us for enquiries", text: "Tell us what you are working on. We reply within a few hours on working days.", primaryLabel: "Get in touch", primaryHref: "/contact", showWhatsapp: true, tone: "dark" } },
  });
  const sharedCareers = await prisma.sharedBlock.create({
    data: { name: "Careers strip", type: "ctaBand", data: { heading: "Be a part of the team", text: "We are building a diverse team of talented professionals across finance, law, marketing and strategy.", primaryLabel: "Say hi", primaryHref: "/careers", showWhatsapp: false, tone: "light" } },
  });
  const sharedFollow = await prisma.sharedBlock.create({
    data: { name: "Follow us strip", type: "socialBand", data: { heading: "Want updates about us?", text: "Follow us on social media for insights and news from the team." } },
  });
  const g = await prisma.siteSetting.findUniqueOrThrow({ where: { key: "general" } });
  await prisma.siteSetting.update({ where: { key: "general" }, data: { value: { ...(g.value as object), servicePageCta: sharedContact.id } } });
  const shared = (id: string) => b("shared", { sharedId: id });

  // ---- Pages
  const pages: { slug: string; title: string; seoTitle: string; seoDescription: string; blocks: Block[]; footer?: boolean }[] = [
    {
      slug: "", title: "Home",
      seoTitle: "Strategy, CFO, M&A and Tax Advisory for Scaling Businesses",
      seoDescription: "Northville Consulting Group is an integrated strategy, finance and transaction advisory partner for scaling businesses in India, the US, the UK and the UAE.",
      blocks: [
        b("hero", { size: "large", heading: "Your success is the only metric that matters to us.", subtext: "An integrated strategy, finance and transaction advisory partner for established and scaling businesses across India, the U.S., the UK and the UAE. Senior expertise, embedded with your leadership team.", primaryLabel: "Talk to us", primaryHref: "/contact", secondaryLabel: "Explore services", secondaryHref: "/services", image: null }),
        b("banner", { image: "/seed/brand/award-finance-outlook.png", alt: "India Finance Outlook Spotlight Award 2025, for being recognised as one of the most prominent virtual CFO service providers", href: "", tone: "gold" }),
        b("stats", { heading: "", items: [{ value: "25", suffix: "+", label: "Investor connects" }, { value: "4", suffix: "", label: "Countries served" }, { value: "12", suffix: "", label: "Service areas" }, { value: "16", suffix: "", label: "Professionals" }] }),
        b("servicesOverview", { heading: "One team across strategy, finance, deals, tax and law", intro: "Our experts in finance, taxation, law, marketing and strategy act as an extension of your team, so you get the right expertise without building it all in-house.", layout: "compact" }),
        b("team", { heading: "Meet the founders", intro: "", show: "leadership" }),
        b("testimonials", { heading: "What they say about us" }),
        b("logoWall", { heading: "Our clients", wall: "CLIENT" }),
        b("logoWall", { heading: "Our top investor connects", wall: "INVESTOR" }),
        b("logoWall", { heading: "Institutional collaborations", wall: "INSTITUTION" }),
        b("logoWall", { heading: "Network firms", wall: "NETWORK" }),
        shared(sharedContact.id), shared(sharedCareers.id), shared(sharedFollow.id),
      ],
    },
    {
      slug: "about", title: "About us",
      seoTitle: "About Northville Consulting Group",
      seoDescription: "An integrated strategy, finance and transaction advisory partner working embedded with leadership across strategy, finance, transactions, tax, legal and marketing.",
      blocks: [
        b("hero", { size: "compact", heading: "Who are we?", subtext: "Northville Consulting Group is an integrated strategy, finance and transaction advisory partner for established and scaling businesses.", primaryLabel: "", primaryHref: "", secondaryLabel: "", secondaryHref: "", image: null }),
        b("imageText", { heading: "Senior expertise without the cost of a large in-house function", body: "We work embedded with leadership across strategy, finance, transactions, tax, legal and marketing. One accountable team, so advice on a deal, a tax position and a contract is designed together instead of handed between firms.", bullets: [], image: "/seed/services/people.jpeg", imageSide: "right", ctaLabel: "See our services", ctaHref: "/services" }),
        b("cardGrid", { heading: "Mission and vision", intro: "", items: [{ title: "Our mission", body: "Turning strategic vision into real-world performance, and helping business leaders solve challenges and drive sustained growth." }, { title: "Our vision", body: "Empower. Enable. Innovate. We empower our clients, enable their growth and drive innovative solutions." }] }),
        b("team", { heading: "The people behind the firm", intro: "", show: "leadership" }),
        shared(sharedContact.id), shared(sharedCareers.id),
      ],
    },
    {
      slug: "services", title: "Services",
      seoTitle: "Consulting Services: Strategy, CFO, M&A, Tax, Legal and More",
      seoDescription: "Twelve service lines under one roof: strategy, CFO services, transaction advisory, fundraising, tax, legal, people, marketing, data, risk, PMO and family business.",
      blocks: [
        b("hero", { size: "compact", heading: "Crafting your business's future", subtext: "Personalised consulting to help businesses launch, scale and transact, with a focus on startups and growing companies.", primaryLabel: "Talk to us", primaryHref: "/contact", secondaryLabel: "", secondaryHref: "", image: null }),
        b("servicesOverview", { heading: "Everything under one roof", intro: "Pick a service to see exactly what we cover.", layout: "detailed" }),
        shared(sharedContact.id), shared(sharedCareers.id),
      ],
    },
    {
      slug: "team", title: "Our team",
      seoTitle: "Our Team: Chartered Accountants, Lawyers and Strategists",
      seoDescription: "Meet the multidisciplinary Northville team: chartered accountants, company secretaries, corporate lawyers, valuation experts, analysts and digital strategists.",
      blocks: [
        b("hero", { size: "compact", heading: "Meet the team", subtext: "A multidisciplinary group spanning law, finance, management and digital strategy, focused on measurable results for clients.", primaryLabel: "", primaryHref: "", secondaryLabel: "", secondaryHref: "", image: null }),
        b("team", { heading: "The people you will work with", intro: "Chartered accountants, company secretaries, corporate lawyers, valuation experts, financial analysts and digital marketing strategists. Responsive, detail-oriented and tailored to your business.", show: "everyone" }),
        shared(sharedCareers.id), shared(sharedContact.id),
      ],
    },
    {
      slug: "careers", title: "Careers",
      seoTitle: "Careers at Northville Consulting Group",
      seoDescription: "Join a diverse team of finance, legal, marketing and strategy professionals. See open roles or send us your CV.",
      blocks: [
        b("hero", { size: "compact", heading: "Be a part of the team", subtext: "Join a diverse team of talented professionals building the finance, legal, marketing and strategy partner growing businesses rely on.", primaryLabel: "Say hi", primaryHref: "/contact", secondaryLabel: "", secondaryHref: "", image: null }),
        b("jobList", { heading: "Open roles", emptyText: "There are no open roles right now, but we always like to hear from strong people. Email your CV to the address below and tell us how you would like to contribute." }),
        shared(sharedFollow.id),
      ],
    },
    {
      slug: "contact", title: "Contact",
      seoTitle: "Contact Northville Consulting Group",
      seoDescription: "Start a conversation with our team. Offices in New Delhi and Mumbai. Call, email, WhatsApp or send an enquiry.",
      blocks: [
        b("hero", { size: "compact", heading: "Let's begin a conversation", subtext: "Tell us about your business and what you need. A senior member of the team will reply.", primaryLabel: "", primaryHref: "", secondaryLabel: "", secondaryHref: "", image: null }),
        b("contactForm", { heading: "Send us an enquiry", intro: "Share a few details and we will come back to you.", successMessage: "Thank you. We will get back to you shortly." }),
        b("offices", { heading: "Visit us", intro: "" }),
      ],
    },
    {
      slug: "blog", title: "Insights",
      seoTitle: "Insights on Finance, Strategy, M&A and Tax",
      seoDescription: "Practical articles from the Northville team on finance, strategy, deals, fundraising, tax and compliance.",
      blocks: [
        b("hero", { size: "compact", heading: "Ideas for growing businesses", subtext: "Practical thinking on finance, strategy, deals and compliance from the Northville team.", primaryLabel: "", primaryHref: "", secondaryLabel: "", secondaryHref: "", image: null }),
        b("blogList", { heading: "", count: 0, showFilters: true }),
        shared(sharedContact.id),
      ],
    },
    {
      slug: "privacy-policy", title: "Privacy policy", footer: true,
      seoTitle: "Privacy Policy", seoDescription: "How Northville Consulting Group collects, uses and protects personal information.",
      blocks: [
        b("hero", { size: "compact", heading: "Privacy policy", subtext: "", primaryLabel: "", primaryHref: "", secondaryLabel: "", secondaryHref: "", image: null }),
        b("textSection", { heading: "", align: "left", body: "<p><strong>Draft for legal review.</strong> The Wix site carried only a template here. Replace this with your reviewed policy.</p><h2>Information we collect</h2><p>When you contact us through the website we collect the name, email address, phone number and message you provide. We also collect standard, anonymous usage data to understand how the site is used.</p><h2>How we use it</h2><p>We use your details only to respond to your enquiry and to provide our services. We do not sell personal information.</p><h2>Sharing</h2><p>We share information only with service providers who help us run the website and email, and where the law requires.</p><h2>Your choices</h2><p>You can ask us to access, correct or delete the information we hold about you by emailing hello@northvilleconsultinggroup.com.</p>" }),
      ],
    },
    {
      slug: "terms-conditions", title: "Terms and conditions", footer: true,
      seoTitle: "Terms and Conditions", seoDescription: "The terms that apply when you use the Northville Consulting Group website.",
      blocks: [
        b("hero", { size: "compact", heading: "Terms and conditions", subtext: "", primaryLabel: "", primaryHref: "", secondaryLabel: "", secondaryHref: "", image: null }),
        b("textSection", { heading: "", align: "left", body: "<p><strong>Draft for legal review.</strong> The Wix site carried only a template here. Replace this with your reviewed terms.</p><h2>Use of this website</h2><p>The content on this site is general information, not professional advice. Engagements are governed by a written agreement between you and Northville Consulting Group.</p><h2>Intellectual property</h2><p>All content, logos and design on this site belong to Northville Consulting Group or its licensors and may not be reused without permission.</p><h2>Liability</h2><p>We take care to keep the site accurate but give no warranty that it is complete or current.</p>" }),
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
