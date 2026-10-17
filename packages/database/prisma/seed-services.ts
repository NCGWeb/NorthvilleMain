// Service content copied from the Wix site, lightly tightened. Slugs are keyword-led for search.
// `oldSlugs` feed the redirect table so old Wix links keep their Google ranking.

export type SeedOffering = { title: string; tagline: string; body: string; bullets: string[] };
export type SeedService = {
  slug: string;
  name: string;
  group: string;
  summary: string;
  image: string;
  tagline: string;
  seoTitle: string;
  seoDescription: string;
  oldSlugs: string[];
  offerings: SeedOffering[];
  faqs?: { question: string; answer: string }[];
};

export const GROUPS = [
  { name: "Strategy and Growth", blurb: "Where to play, how to win and how to grow the brand." },
  { name: "Finance and Capital", blurb: "Finance leadership, tax and the capital to scale." },
  { name: "Deals and Legal", blurb: "Buying, selling and structuring, with the legal work done alongside." },
  { name: "Operations and Risk", blurb: "People, data, delivery and the controls that keep growth safe." },
];

export const SERVICES: SeedService[] = [
  {
    slug: "strategy-transformation", name: "Strategy & Transformation", group: "Strategy and Growth",
    summary: "Growth strategy, corporate strategy, pricing and turnaround programs that maximise shareholder value.",
    image: "/seed/services/strategy.jpg",
    tagline: "Focused on maximising shareholder value for your business, from the boardroom decision to the operational rollout.",
    seoTitle: "Business Strategy and Transformation Consulting",
    seoDescription: "Growth strategy, corporate strategy, pricing and turnaround consulting for scaling businesses across India, the US, UK and UAE.",
    oldSlugs: ["company-incorporation-page"],
    offerings: [
      { title: "Business & Growth Strategy", tagline: "Focusing on maximising shareholder value for your business.", body: "We size value pools, stress-test your market position and build a growth agenda you can execute.", bullets: ["Unit economics", "Competitive benchmarking and positioning", "Business model design", "Market entry and go-to-market strategy", "New product and service development", "Innovation"] },
      { title: "Corporate Strategy", tagline: "The logic behind what you build, buy or exit, and how you tell that story to the market.", body: "We help leadership decide where to deploy capital, review the portfolio and align investors and the board.", bullets: ["Business planning", "Diversification and M&A agenda", "Investor relations"] },
      { title: "Pricing & Revenue Management", tagline: "The fastest profit lever most companies never pull.", body: "We rebuild pricing around customer value and design pricing architecture that scales.", bullets: ["B2B pricing", "B2C pricing", "Revenue growth management"] },
      { title: "Business Transformation & Turnaround", tagline: "Structured programs for when performance stalls or cash tightens.", body: "Time-bound programs that separate protective cuts from harmful ones, paired with a cash reset.", bullets: ["Cost optimisation", "Operational transformation", "AI and digital transformation", "Working capital management"] },
    ],
  },
  {
    slug: "marketing-sales", name: "Marketing & Sales", group: "Strategy and Growth",
    summary: "Brand, channels, digital marketing, web development, research and loyalty in one team.",
    image: "/seed/services/marketing.jpg",
    tagline: "Everything your brand needs to grow, all in one place.",
    seoTitle: "Marketing and Sales Consulting for Growing Brands",
    seoDescription: "Brand positioning, channel strategy, SEO, performance marketing, web development and customer research for scaling businesses.",
    oldSlugs: ["copy-of-people-organization"],
    offerings: [
      { title: "Brand Strategy & Positioning", tagline: "Define what you stand for and why you win.", body: "We identify positioning tied to your real competitive edge, find the markets where it wins most and build messaging that stays consistent.", bullets: ["Brand positioning and messaging", "Targeting the right customer segments"] },
      { title: "Channel Strategy", tagline: "The right product in the wrong channel still fails.", body: "We select channels that suit the customer and the economics, and manage conflict when several channels run at once.", bullets: ["Identify the right channels of distribution", "Maximise channel performance", "Optimise customer experience across channels", "Manage channels and resolve channel conflict"] },
      { title: "Digital Marketing & AI-Led Content", tagline: "Stand out in a crowded market.", body: "SEO, social, paid performance and influencer marketing run as one connected system, with AI-assisted content that stays specific.", bullets: ["SEO", "Social media marketing", "Performance marketing", "Influencer marketing", "Advertisements"] },
      { title: "Web & Product Development", tagline: "Engineered to convert.", body: "We design around the customer journey and conversion path first, so visitors become leads and leads become customers.", bullets: ["Website design and development"] },
      { title: "Customer & Market Research", tagline: "Evidence before investment.", body: "We size markets, segment customers and run competitor and customer research so big growth decisions rest on evidence.", bullets: ["Market sizing and segmentation", "Competitor and voice-of-customer research"] },
      { title: "Loyalty & Customer Experience", tagline: "Turn buyers into repeat customers.", body: "We map the full customer journey to find where people are lost, then build interventions that bring them back.", bullets: ["Trace the customer journey to find loopholes", "Maximise customer happiness"] },
    ],
  },
  {
    slug: "family-business-consulting", name: "Family Business Consulting", group: "Strategy and Growth",
    summary: "Governance structures and succession plans that protect the business across generations.",
    image: "/seed/services/family.jpg",
    tagline: "Family businesses rarely fail at handover because of strategy. They fail because of governance.",
    seoTitle: "Family Business Governance and Succession Consulting",
    seoDescription: "Governance structures that separate ownership from management, and clear succession plans for family-owned businesses in India.",
    oldSlugs: ["copy-of-project-management-office"],
    offerings: [
      { title: "Governance Structure", tagline: "Separating ownership, board and management roles clearly.", body: "We build governance that separates ownership from management so decisions are made by the right people.", bullets: ["Ownership, board and management roles", "Family charter and decision rights"] },
      { title: "Succession Planning", tagline: "A clear, agreed plan for the next generation to take over.", body: "We design succession plans clear enough to prevent disputes before they start.", bullets: ["Designing the succession plan", "Preparing the next generation"] },
    ],
  },
  {
    slug: "cfo-services-financial-advisory", name: "CFO Services & Financial Advisory", group: "Finance and Capital",
    summary: "Virtual CFO, bookkeeping and treasury, FP&A, and cost and working capital optimisation.",
    image: "/seed/services/cfo.jpg",
    tagline: "CFO-level thinking at a fraction of the cost of a full-time hire.",
    seoTitle: "Virtual CFO and Financial Advisory Services in India",
    seoDescription: "Virtual CFO, bookkeeping, FP&A, MIS and working capital optimisation for startups and growing businesses in India.",
    oldSlugs: ["virtual-cfo-accounting-services"],
    offerings: [
      { title: "Virtual CFO & Management Reporting", tagline: "A CFO who owns the reporting cadence.", body: "Virtual CFOs own your reporting cadence and flag issues early, so leadership decides with current numbers.", bullets: ["Monthly MIS and board reporting", "Investor reporting and cash flow oversight"] },
      { title: "Bookkeeping, AR/AP & Treasury", tagline: "Clean books, closed on time.", body: "Day-to-day accounting, reconciliations and a disciplined monthly close.", bullets: ["Day-to-day accounting and reconciliations", "Receivables and payables management", "Treasury operations"] },
      { title: "Financial Planning & Analysis", tagline: "See ahead, not just back.", body: "Rolling forecasts, scenario models and variance analysis that show where the business is heading.", bullets: ["Budgets and rolling forecasts", "Scenario and sensitivity modelling", "Variance analysis"] },
      { title: "Cost & Working Capital Optimisation", tagline: "Release cash already inside the business.", body: "We review the cost base and working capital, renegotiate vendor terms and reset payment terms.", bullets: ["Structured cost base reviews", "Vendor renegotiation", "Receivables, payables and inventory cycles"] },
    ],
    faqs: [
      { question: "What is a virtual CFO?", answer: "A virtual CFO is a senior finance professional who works with your leadership team part-time or on a retainer. You get reporting, forecasting and financial guidance without the cost of a full-time CFO." },
      { question: "Who is a virtual CFO service right for?", answer: "Startups and growing businesses that have outgrown basic bookkeeping but are not ready for a full-time CFO, especially those preparing to raise capital." },
    ],
  },
  {
    slug: "fundraising-investor-services", name: "Fundraising & Investor Services", group: "Finance and Capital",
    summary: "Fundraising readiness, due diligence for investors and portfolio value enhancement.",
    image: "/seed/services/fundraising.jpeg",
    tagline: "Both sides of the capital table: companies raising, and investors deploying.",
    seoTitle: "Fundraising and Investor Services for Startups",
    seoDescription: "Fundraising readiness, investor introductions, due diligence and portfolio value enhancement for startups and investors.",
    oldSlugs: ["essential-legal-services"],
    offerings: [
      { title: "Fundraising Readiness & Investor Connects", tagline: "Raise from a position of strength.", body: "We prepare investor-ready financials and documents, shape your pitch narrative and make curated investor introductions. Early-stage founders are routed to Founderstreet.", bullets: ["Financial model, valuation and data room", "Investment narrative and pitch deck", "Curated investor introductions", "Early-stage founder referral to Founderstreet"] },
      { title: "Due Diligence for Investors", tagline: "Validate before the term sheet.", body: "Financial due diligence and risk assessment before you commit capital.", bullets: ["Financial due diligence", "Risk assessment"] },
      { title: "Portfolio Value Enhancement", tagline: "An embedded finance and strategy partner after you invest.", body: "Post-investment support that lifts reporting, governance and margins and prepares portfolio companies for the next round or exit.", bullets: ["Reporting and governance professionalisation", "Margin improvement programs", "Next-round and exit preparation"] },
    ],
  },
  {
    slug: "tax-compliance-assurance", name: "Tax, Compliance & Assurance", group: "Finance and Capital",
    summary: "Direct and indirect tax, cross-border tax, audit and assurance, and internal controls.",
    image: "/seed/services/tax.jpg",
    tagline: "Compliant across every filing and forum, optimised within every rule.",
    seoTitle: "Tax, GST, Audit and Compliance Services in India",
    seoDescription: "Corporate tax, GST, TDS, cross-border tax, statutory audit and internal controls for businesses in India.",
    oldSlugs: ["investor-funding-support-services"],
    offerings: [
      { title: "Direct & Indirect Taxation", tagline: "End-to-end tax management and representation.", body: "Tax touches nearly every transaction, and the cost of getting it wrong compounds. We manage corporate tax, GST and TDS compliance end to end, handle ITRs and represent you before tax authorities.", bullets: ["Corporate tax, GST and TDS compliance", "Business and individual ITRs", "Tax planning and authority representation"] },
      { title: "Cross-Border & International Tax", tagline: "Efficient and defensible across jurisdictions.", body: "We structure inbound and outbound operations, set transfer pricing and treaty positions built to hold, and advise on withholding tax.", bullets: ["Inbound and outbound structuring", "Transfer pricing and treaty positions", "Withholding tax advisory"] },
      { title: "Audit & Assurance", tagline: "A full suite of assurance services.", body: "Statutory, tax, internal, forensic, stock and revenue audits, plus diligence audits ahead of transactions, built into your operating rhythm.", bullets: ["Statutory and tax audits", "Internal, forensic, stock and revenue audits", "Due diligence audits"] },
      { title: "Enterprise Risk & Internal Controls", tagline: "Risk management that boards and investors trust.", body: "Informal controls that worked at ten people quietly stop working at a hundred. We design and test controls and build the risk registers and governance frameworks boards expect.", bullets: ["Internal control design and testing", "Risk registers and governance frameworks"] },
    ],
  },
  {
    slug: "transaction-advisory-ma", name: "Transaction Advisory & M&A", group: "Deals and Legal",
    summary: "The full deal lifecycle: sourcing, valuation, diligence, structuring, integration and exit.",
    image: "/seed/services/fundraising.jpeg",
    tagline: "Full deal lifecycle, with financial, tax and legal expertise in one integrated team.",
    seoTitle: "Transaction Advisory and M&A Services in India",
    seoDescription: "Deal sourcing, valuation, due diligence, structuring, post-merger integration and exit advisory from one integrated team.",
    oldSlugs: ["marketing"],
    offerings: [
      { title: "Target Identification & Deal Sourcing", tagline: "Build an acquisition pipeline instead of waiting for one.", body: "Proactive target sourcing against defined criteria, rather than relying on the deals brokers bring you.", bullets: ["Acquisition criteria and market mapping", "Target screening and shortlisting", "Initial approach support"] },
      { title: "Valuation & Financial Modelling", tagline: "Defensible valuations, built to be challenged.", body: "Valuations for deals, fundraising and statutory purposes, including under Indian tax and company law.", bullets: ["Transaction and fundraising valuations", "Statutory valuations (Income Tax Act and Companies Act)", "Investor- and auditor-grade models"] },
      { title: "Due Diligence", tagline: "Know exactly what you are buying, or what you are selling.", body: "Review beyond standard checks, covering earnings quality, tax exposure and commercial and legal risks.", bullets: ["Financial and quality of earnings diligence", "Tax exposure review", "Commercial and legal diligence"] },
      { title: "Deal Structuring & Negotiation", tagline: "Structure determines how much value you keep.", body: "We structure domestic and cross-border deals and support negotiations.", bullets: ["Domestic and cross-border structuring", "M&A, PE, JV, IPO", "Divestitures", "Term sheet drafting and negotiation support"] },
      { title: "Post-Merger Integration", tagline: "Make the value you paid for actually materialise.", body: "Early integration planning for systems, teams and reporting, with tracking of the synergies behind the deal.", bullets: ["Integration planning", "Systems and people alignment", "Creating synergies"] },
      { title: "Exit & Sell-Side Advisory", tagline: "A successful exit is built years before the sale.", body: "We prepare the business for sale well in advance, then run a competitive buyer process.", bullets: ["Exit readiness and equity story", "Buyer outreach and data room management", "Negotiation"] },
    ],
  },
  {
    slug: "legal-regulatory", name: "Legal & Regulatory", group: "Deals and Legal",
    summary: "Commercial contracts, deal structuring and legal due diligence, designed with tax and finance.",
    image: "/seed/services/legal.jpg",
    tagline: "Legal architecture that holds under pressure: commercial, not just cautious.",
    seoTitle: "Commercial Contracts and Legal Due Diligence",
    seoDescription: "Commercial contracts, M&A and PE legal structuring, FDI advisory and legal due diligence from an integrated advisory team.",
    oldSlugs: ["copy-of-virtual-cfo-accounting-serv"],
    offerings: [
      { title: "Commercial Contracts", tagline: "The essential contracts your business runs on.", body: "Most legal risk comes from contracts that were not negotiated well. We draft and negotiate the agreements a business uses daily so signed documents actually protect you.", bullets: ["Customer, vendor and employment agreements", "Founder agreements and NDAs", "Term sheets"] },
      { title: "Transaction & Investment Structuring", tagline: "Structure, tax and law designed together.", body: "We work with our transaction team to design legal structuring for M&A, private equity, joint ventures, restructurings and FDI from the outset.", bullets: ["M&A and PE legal structuring", "JVs, restructuring and slump sales", "FDI advisory"] },
      { title: "Legal Due Diligence", tagline: "Findings translated into deal implications.", body: "We review corporate records, contracts, litigation, regulatory exposure and IP, and explain what each finding means for the deal.", bullets: ["Corporate records and material contracts", "Litigation and regulatory exposure", "IP review"] },
    ],
  },
  {
    slug: "people-organization", name: "People & Organisation", group: "Operations and Risk",
    summary: "ESOP design and administration that retains the people you cannot afford to lose.",
    image: "/seed/services/people.jpeg",
    tagline: "The organisation your next stage requires.",
    seoTitle: "ESOP Design and Administration Services in India",
    seoDescription: "ESOP scheme design, valuation, compliance and administration that keeps key employees invested.",
    oldSlugs: ["copy-of-legal-regulatory"],
    offerings: [
      { title: "ESOP Design & Administration", tagline: "Equity structured to actually retain.", body: "A poorly designed or inconsistently run ESOP loses its value as a retention tool. We design schemes on defensible valuations, then handle compliance and administration.", bullets: ["Scheme design and valuation", "Regulatory compliance and administration"] },
    ],
  },
  {
    slug: "data-analytics-bi", name: "Data, Analytics & BI", group: "Operations and Risk",
    summary: "Dashboards, KPI frameworks and MIS that give leadership one reliable view of performance.",
    image: "/seed/services/data.jpeg",
    tagline: "One reliable view of performance for leadership.",
    seoTitle: "Business Intelligence, Dashboards and MIS Consulting",
    seoDescription: "Management dashboards, KPI frameworks and MIS reporting built on a single source of truth.",
    oldSlugs: ["copy-of-marketing-sales"],
    offerings: [
      { title: "Dashboards, KPIs & MIS", tagline: "Trusted numbers, kept current.", body: "Most businesses lack trusted data, not data itself. We build dashboards and KPI frameworks tied to a single source of truth, kept current through disciplined MIS.", bullets: ["Management dashboards", "KPI metrics and frameworks", "MIS preparation and analysis"] },
    ],
  },
  {
    slug: "risk-management", name: "Risk Management", group: "Operations and Risk",
    summary: "Crisis playbooks and credit risk frameworks built before something goes wrong.",
    image: "/seed/services/risk.jpeg",
    tagline: "Risk management should be built in before something goes wrong.",
    seoTitle: "Crisis and Credit Risk Management Consulting",
    seoDescription: "Crisis management protocols and credit risk frameworks that keep exposure within limits you choose.",
    oldSlugs: ["copy-of-data-analytics-bi"],
    offerings: [
      { title: "Crisis Management", tagline: "A clear playbook ready before a crisis hits, not during one.", body: "We put crisis management protocols in place so the team knows what to do on day one.", bullets: ["Crisis playbooks", "Roles and escalation paths"] },
      { title: "Credit Risk Management", tagline: "Exposure kept within limits you control.", body: "We design credit risk frameworks that keep exposure to customers and counterparties within limits you choose, not limits discovered after a default.", bullets: ["Credit policy and limits", "Counterparty monitoring"] },
    ],
  },
  {
    slug: "project-management-office", name: "Project Management Office", group: "Operations and Risk",
    summary: "Resource allocation and execution tracking that flag slippage early enough to fix it.",
    image: "/seed/services/pmo.jpg",
    tagline: "Ambitious programs, on schedule and on budget.",
    seoTitle: "Project Management Office (PMO) Services",
    seoDescription: "PMO setup, resource prioritisation and execution tracking for ambitious programs.",
    oldSlugs: ["copy-of-risk-management"],
    offerings: [
      { title: "Our Core Services", tagline: "Execution discipline over strategy alone.", body: "Turning a plan into a finished product depends more on execution discipline than on strategy. We set up tracking that flags slippage early.", bullets: ["Resource allocation and prioritisation", "Execution tracking and workflow streamlining"] },
    ],
  },
];
