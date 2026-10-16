/**
 * Starter questions and answers for every service page. They answer what buyers ask before they hire,
 * which helps long-tail search and can earn rich results in Google. General guidance only: review with
 * the team and edit in the admin under Services before relying on specifics.
 */
export const FAQS: Record<string, { question: string; answer: string }[]> = {
  "strategy-transformation": [
    { question: "What does a business strategy consultant actually do?", answer: "A strategy consultant helps leadership decide where to compete, how to win and what to prioritise. That usually means sizing the market, testing your position against competitors, and turning the answer into a plan with owners, targets and timelines." },
    { question: "When should a company look at a turnaround program?", answer: "When growth stalls, margins shrink or cash tightens and the cause is not clear. A structured program separates cuts that protect the business from cuts that damage it, and resets cash in parallel." },
    { question: "Do you help with pricing?", answer: "Yes. We rebuild pricing around customer value, review discounting and packaging, and set up pricing that scales for both B2B and B2C businesses." },
  ],
  "marketing-sales": [
    { question: "Can you run marketing and sales as one function?", answer: "Yes. Brand positioning, channels, digital marketing, the website and customer research are planned together, so what marketing promises is what sales can deliver." },
    { question: "Do you build websites as well?", answer: "We design and build websites around the customer journey and conversion path first, so visitors become leads. Design follows the goal, not the other way round." },
    { question: "How do you use AI in content?", answer: "AI helps us produce content faster, but every piece is edited against your positioning so it stays specific to your business and not generic." },
  ],
  "family-business-consulting": [
    { question: "Why do family businesses struggle at handover?", answer: "Usually because ownership, board and management roles are blurred, so decisions become personal. Clear governance and an agreed succession plan, made early, prevent most disputes." },
    { question: "What is a family charter?", answer: "A written agreement on how the family and the business relate: who can work in the business, how decisions are made, how shares are transferred and how disagreements are resolved." },
    { question: "How early should succession planning start?", answer: "As early as possible, ideally years before a handover. Early plans leave time to prepare the next generation and to adjust the plan as the business changes." },
  ],
  "cfo-services-financial-advisory": [
    { question: "What are virtual CFO services?", answer: "A virtual CFO is a senior finance professional who works with your leadership team part-time or on a retainer. You get reporting, forecasting and financial guidance without the cost of a full-time CFO." },
    { question: "What does a virtual CFO deliver every month?", answer: "Typically a monthly MIS and management report, cash flow oversight, a rolling forecast and a review meeting with leadership. Investor and board reporting can be added." },
    { question: "Do you handle bookkeeping too?", answer: "Yes. We run day-to-day accounting, reconciliations, receivables and payables, and the monthly close, so the numbers the CFO works with are reliable." },
  ],
  "fundraising-investor-services": [
    { question: "How do you prepare a startup to raise capital?", answer: "We build an investor-ready financial model and valuation view, organise the data room, shape the investment narrative and pitch deck, and then introduce you to investors who fit your stage and sector." },
    { question: "Do you work with early-stage founders?", answer: "Yes. Founders at day zero to pre-seed are guided through Founderstreet, our startup platform, and move to full fundraising support as they grow." },
    { question: "Do you help investors as well?", answer: "Yes. We run financial due diligence and risk assessment before a term sheet, and support portfolio companies after investment with reporting, governance and margin improvement." },
  ],
  "tax-compliance-assurance": [
    { question: "Which tax and compliance work do you handle?", answer: "Corporate tax, GST and TDS compliance, income tax returns for the business and its owners, tax planning and representation before tax authorities." },
    { question: "Do you advise on cross-border tax?", answer: "Yes. We structure inbound and outbound operations, set transfer pricing and treaty positions, and advise on withholding tax for cross-border payments." },
    { question: "What audits can you provide?", answer: "Statutory and tax audits, plus internal, forensic, stock and revenue audits, and diligence audits ahead of a transaction." },
  ],
  "transaction-advisory-ma": [
    { question: "What does an M&A advisor do?", answer: "An M&A advisor supports the whole deal: finding targets or buyers, valuation, due diligence, structuring and negotiation, integration planning and, on the sell side, exit preparation." },
    { question: "How is a company valued for a deal?", answer: "Using methods suited to the business and the purpose, such as discounted cash flow and market comparables. Statutory valuations follow the requirements of the relevant Indian laws." },
    { question: "When should we start preparing to sell?", answer: "Well before a sale process begins. Clean financials, a clear equity story and a prepared data room improve both the price and the speed of a deal." },
  ],
  "legal-regulatory": [
    { question: "Which contracts do businesses need first?", answer: "Customer, vendor and employment agreements, founder agreements and NDAs. Well-negotiated contracts remove most everyday legal risk." },
    { question: "What does legal due diligence cover?", answer: "Corporate records, material contracts, litigation, regulatory exposure and intellectual property, with each finding explained in terms of what it means for the deal." },
    { question: "Can legal, tax and finance be handled together?", answer: "Yes. Because our transaction, tax and legal teams work together, deal structures are designed for all three from the start instead of fixed afterwards." },
  ],
  "people-organization": [
    { question: "What is an ESOP and why design it carefully?", answer: "An employee stock option plan gives employees a stake in the company. A poorly designed or inconsistently run plan loses its value as a retention tool, so pool size, vesting and valuation need to be set deliberately." },
    { question: "Do you administer the plan after setting it up?", answer: "Yes. We handle regulatory compliance and ongoing administration so that grants, vesting and exercises are recorded correctly." },
    { question: "How is the ESOP valuation set?", answer: "Using a defensible valuation method suited to the company's stage, so grants are priced consistently and can be explained to employees and investors." },
  ],
  "data-analytics-bi": [
    { question: "What is a single source of truth?", answer: "One agreed set of numbers that every team reports from, so the same metric means the same thing in sales, finance and operations." },
    { question: "What do management dashboards show?", answer: "The few measures leadership needs to decide, such as revenue, margin, cash and pipeline, kept current and linked to the KPIs that matter for your business." },
    { question: "What is MIS reporting?", answer: "Management information system reports: regular, structured numbers on performance, with explanations of what changed and why." },
  ],
  "risk-management": [
    { question: "Why prepare a crisis plan in advance?", answer: "Because the first hours of a crisis decide how much damage follows. A ready playbook sets roles, escalation paths and communication so the team acts on day one." },
    { question: "What is credit risk management?", answer: "Managing how much you are exposed to customers and counterparties, with limits you choose and monitor, so a single default cannot threaten the business." },
    { question: "Who is risk management for?", answer: "Any growing company that extends credit, relies on a few large customers or lenders, or answers to boards and investors who expect documented controls." },
  ],
  "project-management-office": [
    { question: "What does a PMO do?", answer: "A project management office keeps programs on schedule and on budget by prioritising work, allocating people and tracking progress so slippage is caught early." },
    { question: "When is a PMO worth setting up?", answer: "When several initiatives compete for the same people and budget, or when delivery keeps slipping even though the strategy is clear." },
    { question: "Can a PMO be temporary?", answer: "Yes. Many companies set one up for a transformation or a large program and hand the practices to the team once delivery is stable." },
  ],
};
