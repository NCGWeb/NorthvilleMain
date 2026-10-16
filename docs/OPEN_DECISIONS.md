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

## Needs the owner (accounts)
- Vercel account/team, two projects (web, admin). Add `orgId` to the parent CLAUDE.md when created.
- Resend: verified sending domain and `RESEND_API_KEY`.
- Neon production database, `BLOB_READ_WRITE_TOKEN`.
- Repo-local git email for `NCGWeb` (so Vercel matches the pusher).
- Domain cutover from Wix. Keep the `Redirect` table so old Wix URLs keep their ranking.

## Engineering backlog
- Set `SUPERADMIN_INITIAL_PASSWORD` to something strong in production, then change it in the admin.
- Rate limits are per instance (in memory). Move to Upstash if spam appears.
- Add tests (vitest) for `cleanValues`, permission checks and the enquiry route.
- Image optimisation of uploaded files (resize on upload).
