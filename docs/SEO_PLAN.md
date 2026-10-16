# SEO plan: Northville Consulting Group

## The business, in search terms

Northville is an integrated strategy, finance and transaction advisory firm for startups and scaling businesses. Offices in New Delhi and Mumbai, clients in India, the US, the UK and the UAE. Twelve service lines, a startup platform (Founderstreet), a partner network and 100+ investor connects.

People search for the service, not the firm. The site wins by being the clearest answer to "who can do X for my company in India", so every service page targets one buyer question, and the blog answers the questions buyers ask before they hire.

## Who searches, and what for

| Buyer | Intent | Example searches | Page that answers it |
|---|---|---|---|
| Founder (day zero to Series A) | Hire fractional finance, raise money, stay compliant | virtual CFO services India, startup fundraising advisory, ESOP design India, startup GST and TDS compliance | CFO Services, Fundraising and Investor Services, People and Organisation, Tax |
| SME and family business owner | Fix finance, plan succession, buy or sell | family business succession planning India, business valuation for sale, M&A advisor India | Family Business, Transaction Advisory, Strategy |
| Investor or fund | Diligence before a cheque | financial due diligence India, portfolio value enhancement | Fundraising and Investor Services, Transaction Advisory |
| Overseas company entering India | Structure and tax | cross-border tax India, transfer pricing advisory, FDI advisory India | Tax, Legal and Regulatory |

## What is already done (technical)

- Fast, static pages: first paint about 0.5s, 114 KB per page, no layout shift. Core Web Vitals are a ranking factor.
- One H1 per page, descriptive H2s, descriptive alt text on every image.
- Unique title, description and canonical on every page. The brand ending is added only when the title still fits Google's width (about 65 characters).
- Sitemap (`/sitemap.xml`), robots, RSS feed (`/blog/feed.xml`), `lang="en-IN"`.
- Structured data: Organization and ProfessionalService (founders, services offered, contact point, countries served), one local business entry per office, WebSite, Service plus offerings on each service page, FAQ on service pages, Article and breadcrumbs on posts.
- Old Wix addresses are permanent redirects, so existing rankings and links carry over. Keep the Redirects list intact.
- Internal links: a Related Services block on every service page, services menu, footer service list.
- Editors get a Google preview, length warnings, and per-page, per-service and per-post title and description fields.
- Optional Search Console code and Google Analytics ID under Site settings, Search and sharing.

- FAQs on every service page (3 questions each, also marked up for Google). They are general starter answers: have the team review and refine them under Services, Questions and answers.
- Three starter blog drafts are already in the admin under Blog posts, written to the first rows of the content plan below: virtual CFO, data room checklist, ESOP design. Review, add real examples, then publish. The home page "Latest Insights" section appears automatically once a post is published.
- Empty blog category pages are kept out of Google and the sitemap until they have articles.
- Office name, address and phone appear in the footer on every page, matching the Contact page and the structured data, which is what local search looks for.

## Page by page targets

Keep one main phrase per page. Put it in the title, the H1 or first paragraph, and the description. Do not repeat the same phrase on several pages.

| Page | Main phrase | Supporting phrases |
|---|---|---|
| Home | strategy, finance and M&A advisory for scaling businesses in India | integrated advisory firm, extension of your team |
| Services | consulting services for startups and growing companies | twelve service lines |
| CFO Services and Financial Advisory | virtual CFO services in India | outsourced CFO, MIS reporting, FP&A, working capital |
| Fundraising and Investor Services | startup fundraising advisory India | data room, pitch deck, investor introductions |
| Transaction Advisory and M&A | M&A advisory services India | valuation, due diligence, deal structuring, exit advisory |
| Tax, Compliance and Assurance | tax and GST compliance services India | TDS, ITR, statutory audit, transfer pricing |
| Legal and Regulatory | commercial contracts and legal due diligence India | founder agreements, FDI advisory |
| People and Organisation | ESOP design and administration India | ESOP valuation, compliance |
| Marketing and Sales | marketing and sales consulting for growing brands | brand positioning, performance marketing, SEO |
| Strategy and Transformation | business strategy consulting India | pricing strategy, turnaround, market entry |
| Data, Analytics and BI | MIS and BI dashboards consulting | KPI framework |
| Risk Management | crisis and credit risk management consulting | |
| Project Management Office | PMO setup and execution tracking | |
| Family Business Consulting | family business governance and succession planning India | family charter |
| Contact | consulting firm Delhi and Mumbai | |

Title pattern for services: `<Service> in India | <benefit>` (about 55 characters). Description: what you do, who for, one proof point, a soft call to action (about 150 characters).

## Content plan (the blog is the growth engine)

Publish two articles a month. Each targets one question, is 900 to 1,500 words, links to the matching service page, and ends with a clear next step. Draft topics:

| Article | Targets | Links to |
|---|---|---|
| When does a startup need a virtual CFO? | virtual CFO for startups | CFO Services |
| Virtual CFO vs full-time CFO: cost comparison in India | CFO cost India | CFO Services |
| What investors look for in a data room | startup data room checklist | Fundraising |
| Startup valuation methods investors actually use | startup valuation India | Transaction Advisory |
| Due diligence checklist for acquiring a company in India | due diligence checklist | Transaction Advisory |
| How to design an ESOP pool for a Series A startup | ESOP pool size India | People and Organisation |
| GST and TDS compliance calendar for startups | GST compliance startups | Tax |
| Transfer pricing basics for Indian subsidiaries | transfer pricing India | Tax |
| Family business succession: 7 mistakes that cause disputes | succession planning India | Family Business |
| Pricing strategy for B2B services | B2B pricing strategy | Strategy |
| How to prepare your company for sale: an 18 month plan | sell my business India | Transaction Advisory |
| FDI rules for foreign investors entering India | FDI India | Legal |
| Working capital: five ways to release cash | working capital optimisation | CFO Services |
| MIS report format for founders | MIS report | Data, Analytics and BI |
| Startup compliance checklist from day zero to seed | startup compliance India | Fundraising, Tax |

Publishing checklist per post: keyword in title and first paragraph, a 150 character summary, a cover image with real alt text, one internal link to a service, one to a related post, author set, category set.

## Local and trust signals

1. Claim and complete a Google Business Profile for each office (Delhi and Mumbai). Use exactly the same name, address and phone as the Contact page.
2. Keep name, address and phone identical everywhere: site, LinkedIn, Google, directories. Edit them in one place (Site settings and Offices) and copy from there.
3. Ask satisfied clients for Google reviews. Add 2 or 3 real client quotes with names to the Testimonials list.
4. Add case studies as blog posts: problem, work done, result. Use real, approved numbers only.
5. Show credentials: chartered accountants, CPA, ISB, partner firms (already on the team and logo walls).

## Off-page

- Link from Founderstreet to Northville and back (same group, strong relevant link).
- LinkedIn company page and founders' profiles link to the site, post each new article.
- Listings in reputable Indian business directories and startup ecosystem pages (NASSCOM, startup communities, incubators the team already works with).
- Guest articles and quotes in finance and startup media, linking to the matching service page.
- Ask partner firms and investor connects to link to the relevant page.

## Launch and measurement

Before and on the day the domain is attached:
1. Attach the domain in Vercel, update `SITE_URL` (web) and `WEB_URL` (admin), redeploy.
2. Keep the Wix site live until DNS has moved, then confirm old Wix addresses redirect (open a few from the Redirects list).
3. Verify the domain in Google Search Console, paste the code under Site settings, Search and sharing, submit `/sitemap.xml`.
4. Add the Google Analytics ID (check privacy and consent needs for UK and EU visitors first).
5. Run the Google Rich Results Test on the home page, a service page and a post.
6. Check the Google preview for every page in the admin and shorten any red titles.

Track monthly: impressions, clicks and average position per service page (Search Console), enquiries by source (Enquiries screen), number of published articles, number of referring sites. Review keywords and refresh the weakest service page copy every quarter.

## Rules of thumb for editors

- One page, one main topic. Do not copy text between pages.
- Titles up to 60 characters, descriptions about 150.
- Write for the buyer's question. Plain words beat buzzwords.
- Never delete a page that has traffic. Hide it or add a Redirect.
- Every image needs a description in the Media library.
