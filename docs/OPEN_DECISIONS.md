# Open decisions and follow-ups

## Needs the client
- Names for 8 logos seeded as "(rename)" (one investor, five institutional collaborators, three network firms). Rename under Logos.
- Real Privacy policy and Terms text. Seeded as clearly marked drafts (the Wix site only had template text).
- Home page numbers: 25+ investor connects was on Wix, the other three (4 countries, 12 service areas, 16 professionals) are derived. Confirm.
- Office hours: Wix showed two conflicting sets. One value is seeded (10:30 to 19:30).
- Founder LinkedIn: Achal Bhatt has none. Wix reused Asmeet's links for both.
- Blog: one sample DRAFT post. Real articles needed. Publish the first before launch so the Insights page is not empty.
- Careers email and WhatsApp number were copied from Wix. Confirm both.
- Transaction Advisory page uses a placeholder photo (the Wix photo was not retrievable).

## Needs the owner
- Resend: verify the sending domain, then tell Claude the From address (`CONTACT_FROM_EMAIL` still uses Resend's test sender). The API key was partly exposed in a terminal line on 2026-10-16 (prefix only), rotate if you want to be safe.
- Domain cutover from Wix. Keep the `Redirect` table so old Wix URLs keep their ranking. Then update `SITE_URL` and `WEB_URL`.
- Move the Vercel team from Hobby to Pro before launch (commercial use).
- Sign in to the production admin and change the owner password (`.secrets/prod.env` has the generated one).
- Team photo for MS Rehsi is a "Welcome to the team" poster that names a different person (Dr. Manmohan Singh). Send a proper headshot.
- Several team photos are inconsistent in style and crop. A matching set of headshots would lift the Our Team page.

- Chatbot: review the 17 starter answers (especially fees, which are intentionally "scope based"), then check Chat questions in the admin every few weeks for unanswered questions.

## Engineering backlog
- Rate limits are per instance (in memory). Move to Upstash if spam appears.
- Add tests (vitest) for `cleanValues`, permission checks and the enquiry route.
- Image optimisation of uploaded files (resize on upload).
- Chatbot: connect an LLM provider (see docs/CHATBOT.md) once answers have been refined from real questions.
