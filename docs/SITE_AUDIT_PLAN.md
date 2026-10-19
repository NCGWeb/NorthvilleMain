# Site audit plan (17 October 2026)

Status: shipped 2026-10-17 (commits 71411ad, a774ff1, 7103b5e). Production migration `audit_fixes` and `apply-audit-fixes.ts` already run. Item 3 done (admin CNAME live). Follow-ups after the audit: header Contact button hidden on phones again, testimonials became a carousel (counter instead of dots on phones), Team shows initials and Services show the brand gradient when a photo is missing.

Source: audit artifact https://claude.ai/artifact/ASrepRs8aXxmQhfZXwDb2u. Tick items as they ship. Keep `OPEN_DECISIONS.md` in sync.

Baseline: Lighthouse mobile Home 94, Team 93. A11y, SEO, best practices 100. LCP 3.1 to 3.3s (target under 2.5s). Old Wix links and 404s take 2.3 to 3.6s. CLS 0, 0 npm vulns, 0 type errors.

## Sprint 1: launch blockers, redirects, titles (1 to 2 days)

- [x] 1. Slow Wix redirects and 404s. Resolve in `proxy.ts` from a cached map, or build into `redirects()` in `next.config`.
- [x] 2. Placeholder content live and indexed: privacy "Draft for legal review", two logo alts ending "(rename)", empty Insights in sitemap. Noindex until real content exists, or publish real content.
- [x] 3. Admin domain: CNAME added at GoDaddy, https://admin.northvilleconsultinggroup.com works. Add `admin` CNAME at GoDaddy (`49bd17ff462ba8e1.vercel-dns-017.com.`).
- [x] 4. Auto-create a redirect when a service/post URL changes or an item is deleted.
- [x] 5. Media delete: block while image in use, and remove the stored Blob file too.
- [x] 13. Service page titles drop the brand (over 65 chars). Fall back to short ending "| Northville", editable in CMS.
- [x] 14. About and Services descriptions are 163 chars. Trim to 155 or fewer.
- [ ] 16. Old Wix `/post/<slug>` URLs now redirect to `/blog/<slug>` by rule (`resolveRedirect`). Still to do: pull the old Wix sitemap and add explicit redirects for slugs that differ, before cutover.

## Sprint 2: speed and security (2 days)

- [x] 6. LCP render delay: hero text starts at opacity 0. Animate position only. Try inlining critical CSS.
- [x] 7. Leader portraits ~4x oversized. Hint 520px, quality 80, eager load first row only.
- [x] 8. Settings read 6 to 10 times per page. Wrap queries in React `cache()`, load reusable sections in parallel.
- [x] 9. Header re-renders on every scroll. Update progress bar and offset directly, re-render only on transparent/solid switch.
- [x] 10. Hero gradient repaints constantly. Own layer, animate `transform`.
- [x] 15. Alt text: image+text section uses heading, blog inline images have none, media library alt unused. Add fields, prefill from library.
- [x] 25. Admin sign-in: per-IP limit stored centrally (Upstash). End sessions on password change or user disable.
- [x] 26. SVG uploads allowed. Reject or sanitise.

## Sprint 3: editor tools (2 to 3 days)

- [x] 28. Unbounded lists (chat questions, activity log, list screens). Add search and paging, retain 12 months of chat questions.
- [x] 29. Draft preview link from the page editor.
- [x] 30. Google preview: show real URL and exact title the site will use.
- [x] 31. Unsaved-changes warning on list item forms (services, team, blog, etc).
- [x] 35. Enquiry email failures are silent. Record send status, show in admin.

## Sprint 4: design polish and hygiene (2 days)

- [x] 11. Banner assumes 2400x450. Store real image width and height at upload.
- [x] 12. Resize and compress on upload.
- [x] 19. Six hand-styled buttons. Add outline and WhatsApp variants to shared button.
- [x] 20. Section heading sizes vary (18 to 20px vs 28 to 32px). Two levels everywhere.
- [x] 21. Gold gradient outside brand palette (top bar, banner). Add to brand or remove.
- [x] 22. Chat window shadow, glowing loader, boxed cards (related posts, author box, empty states). Flatten to hairline rows.
- [x] 23. Hardcoded visitor text: chat window strings and errors, "View all services", Insights/Testimonials/contact fallbacks, services filter "All". Move to CMS fields.
- [x] 24. Markup bugs: numbers section label order, dead hover on related posts, anchor id clashes, LinkedIn aria-label mismatch.
- [x] 27. Validate all admin requests with zod (enquiry status, reorder).
- [x] 32. Logo reorder renumbers across all walls. Scope to its own wall.
- [x] 34. Tests (form cleaning, permissions, enquiry and chat routes, redirects) and CI (typecheck, build, em dash check).

## Unscheduled

- [x] 17. Redirect `northville-web.vercel.app` to www.
- [x] 18. Remove hidden site name text on blog posts. Editable blog category title and description. Drop `Host` from robots.txt.
- [x] 33. Decide if Editor should reach offices, chatbot answers, redirects. Remove "The 12 services" from menu hints and role text. Soft refresh on restore/discard draft.
- [x] 36. Analytics consent position (DPDP Act, UK GDPR) before Google Analytics goes live.

## Needed from client

- [ ] A. Names for the 8 logos marked "(rename)".
- [ ] B. Final privacy policy and terms text.
- [ ] C. Matching team headshots, including a proper photo for MS Rehsi.
- [ ] D. First published Insights articles.

## What was decided

- 2: pages marked "Hide this page from Google" (new tickbox in Search engine settings) are noindex and out of the sitemap. Privacy and Terms are flagged by `apply-audit-fixes.ts`; Insights hides itself until it has an article.
- 1: `apps/web/proxy.ts` answers redirects from an in-memory list refreshed every 60s. Old address now ~70ms, 404 ~30ms.
- 25: sign-in limits are stored in Postgres (`LoginAttempt`), 8 per email and 20 per IP per 15 min. No Upstash needed. Password change or switching a user off ends their sessions (`sessionVersion`).
- 21: the gold gradient is now a brand token (`--nv-gold` in `brand.css`).
- 33: Offices, Chatbot answers, Chat questions and Redirects now sit under the Pages permission, so the Editor role can manage them. Site settings stay Admin only.
- 36: Google Analytics loads only after a visitor accepts a cookie notice (wording editable under Wording). No GA ID, no banner.
- 13: titles use the full ending if they fit in 65 characters, else a short ending ("| Northville", editable), else none. Three service titles were shortened so the short ending fits.
- 34: vitest (53 tests) and a GitHub Actions workflow (typecheck, tests, em dash check). The build is not run in CI because it reads the database.

## Rollout (done 2026-10-17, kept as the pattern for future schema changes)

1. Migrate production BEFORE pushing: `cd packages/database && DIRECT_URL="$PROD" DATABASE_URL="$PROD" npx prisma migrate deploy` (migration `audit_fixes`).
2. Fix production data once: same env, `npx tsx prisma/apply-audit-fixes.ts`.
3. Commit and push to `main`. Both Vercel projects build.
4. Check both builds shipped on the right projects, then try: an old Wix address, a draft preview, a picture upload, and the cookie notice (after a GA ID is set).
5. Owner: add the `admin` CNAME at GoDaddy (item 3). Done.
