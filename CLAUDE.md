# CLAUDE.md: Northville Consulting Group website

Read this before changing anything. The parent `../CLAUDE.md` rules (accounts, deploy by git push, no em dash) also apply.

## What this is

Rebuild of https://www.northvilleconsultinggroup.com (was Wix) for Northville Consulting Group, an integrated strategy, finance and transaction advisory firm (India, US, UK, UAE). Two apps in a Turborepo:

| Path | What | Local port |
|---|---|---|
| `apps/web` | Public site (Next.js 16, server rendered, ISR) | 3000 |
| `apps/admin` | CMS for a non-technical editor, role based | 3001 |
| `packages/database` | Prisma 7 schema, client, seed | |
| `packages/content` | The single source of truth for what is editable: field types, page blocks, collections, settings groups, permissions | |
| `packages/core` | Read queries for the site, uploads, email (Resend), revalidate, text helpers | |
| `packages/auth` | Password hashing, JWT session, permission lookup | |
| `packages/ui` | Brand tokens (`brand.css`) shared by both apps | |

Stack: Next.js 16, React 19, Tailwind v4, Prisma 7 + `@prisma/adapter-pg`, Postgres (local `northville_dev`, Neon in production), Vercel Blob, Resend, Tiptap (admin rich text).

## Run it

Known quirk: the Next dev server (Turbopack) sometimes misses newly added Tailwind classes. If layout looks unstyled after big edits, restart `npm run dev`, or check a production build (`npm run build` then `next start`) which is the source of truth.


```
npm install            # also runs prisma generate
npm run db:migrate     # needs local Postgres (brew services postgresql@16)
npm run db:seed        # SEED_RESET=1 reloads all content (wipes edits)
npm run dev            # web :3000, admin :3001
```

One `.env` at the repo root serves both apps (each `next.config.ts` loads it). Copy `.env.example`. Never commit `.env`.
Local sign in: `SUPERADMIN_EMAIL` and `SUPERADMIN_INITIAL_PASSWORD` from `.env`.

## Ground rules

1. **No duplicated content.** If the site shows the same fact in two places it must come from one record. Services live only in the Services collection (Home and Services page both render the `servicesOverview` block). Repeated strips (Contact us, Careers, Follow us) are Reusable sections (`SharedBlock`) placed by reference. Phone, email, socials, menus, footer live once in `SiteSetting`. Never paste copy into a component.
2. **Everything visible is editable.** No hardcoded marketing copy in `apps/web` components. If you add UI text that a visitor reads, add a field for it in `packages/content` and seed a default.
3. **Add a block or field in one place.** New page section: define it in `packages/content/src/blocks.ts`, add a component in `apps/web/app/_components/blocks/`, register it in `blocks/index.tsx`. The admin form builds itself. New list: add to `collections.ts` plus a Prisma model. Do not hand build admin screens.
4. **Plain language CMS.** Every field needs a human label, `help` text and `where` (where it appears on the site). No database words in the admin. See `.claude/skills/cms-plain-language/SKILL.md`.
5. **Draft and publish.** Pages have `draftBlocks` and `publishedBlocks`. The site reads published only. Admin writes must call `refreshWebsite()` from `@northville/core` so the site updates.
6. **Permissions.** Every admin API route calls `apiUser("<area>:<action>")`. Every admin page calls `requireUser(...)`. Areas and roles are in `packages/content/src/permissions.ts`.
7. **SEO and speed are a feature.** Keep pages statically generated with `revalidate`. One `h1` per page. Every image needs real alt text. Use `next/image` with `sizes`. No client component unless it needs state. Use `buildMetadata` and JSON-LD helpers in `apps/web/app/_lib/site.ts`. Old Wix URLs are 301 redirects from the `Redirect` table, keep them.
8. **Design: flat and editorial.** Square corners (`rounded-none`, `rounded-sm` for controls only), no shadows, no decorative circles or gradients blobs, no small uppercase letter-spaced labels. Sans headings (Inter), serif body (Newsreader). Scale (McKinsey reference): content width 1120px (`WRAP` in `ui.tsx`), section padding 72px, section headings 28 to 32px, hero 48 to 56px, body 16px. Sections are separated by hairlines and flat bands, not boxed cards. Motion: staggered hero entrance, drifting gradient and drawn curve lines, directional scroll reveals (`Reveal` with `variant` and `delay`, one shared IntersectionObserver), count-up numbers, scroll progress bar in the header, underline and image-zoom hovers. All motion is CSS or tiny client components and is disabled under prefers-reduced-motion. No animation library. Brand colors from `packages/ui/src/brand.css` only: navy `#00063E`, steel `#2B5672`, royal `#435DF8`, bright `#3D9BE9`, sky `#C9E7FF`.
9. **No em dash** anywhere (code, comments, copy, seed, docs, commits). A hook enforces it.
10. **Sanitise rich text** with `cleanHtml` before saving and before rendering.
11. Next.js 16 has breaking changes. Check `node_modules/next/dist/docs/` before using an API you are unsure of (`params` and `searchParams` are Promises, `proxy.ts` replaces middleware).

## Deployment (follows parent rules)

Live setup (created 2026-10-16):

| Thing | Value |
|---|---|
| GitHub | `NCGWeb/NorthvilleMain`, alias `github-ncgweb`, key `~/.ssh/id_ed25519_ncgweb`, repo-local `user.name` NCGWeb, email `NCGWeb@users.noreply.github.com` |
| Vercel team | slug `northville`, id `team_mRdVq9OL0sBsh0WCGG4WNezS`, Hobby plan (non-commercial per Vercel terms, move to Pro before real launch) |
| Web project | `northville-web` (`prj_OOBiyfHWSonqSZzJiqDXm4fUOSEj`), root `apps/web`, https://northville-web.vercel.app |
| Admin project | `northville-admin` (`prj_lcuCpj7NAL47o7QpuEeI7sAiiOQK`), root `apps/admin`, https://northville-admin.vercel.app |
| Database | Neon (Vercel Marketplace), Singapore. Integration injects `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` into both projects. `prisma.config.ts` reads `DIRECT_URL` then `DATABASE_URL_UNPOOLED` |
| Images | Blob store `northville-public` (public, `sin1`), connected to admin only (`BLOB_READ_WRITE_TOKEN`). Repo images live in `apps/web/public/seed` |
| Email | Resend. `RESEND_API_KEY` on the web project only (the contact form is the only sender) |

Rules:
- Deploy by pushing to `main`. Both projects build from the push. Never run a bare `vercel` command (a hook blocks it). For API or CLI work use the token: `VERCEL_TOKEN` in the root `.env`, with `--token "$VERCEL_TOKEN" --scope northville`. Parse it with `grep`, never `source .env` (the file has unquoted values with spaces). Never print secrets.
- Neon values on Vercel are marked sensitive, so they cannot be read back. For migrations and seeding use `PROD_DIRECT_URL` (unpooled Neon string) in the root `.env`:
  `cd packages/database && DIRECT_URL="$PROD" DATABASE_URL="$PROD" npx prisma migrate deploy` then `npx tsx prisma/seed.ts` (seed skips content that exists; `SEED_RESET=1` wipes content, never run that against production).
- Vercel does not run migrations. After any schema change run the migrate command above against production BEFORE pushing, because the web build reads the database during static generation.
- Production secrets live in `.secrets/prod.env` (gitignored): `ADMIN_SESSION_JWT_SECRET`, `REVALIDATE_SECRET`, `SUPERADMIN_INITIAL_PASSWORD`. The local `.env` has separate dev values.
- Production owner login: `SUPERADMIN_EMAIL` (admin@northvilleconsultinggroup.com) with the password in `.secrets/prod.env`. Change it in the admin after first sign in.
- Env split: web needs `DATABASE_URL`, `REVALIDATE_SECRET`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `SITE_URL`. Admin needs `DATABASE_URL`, `ADMIN_SESSION_JWT_SECRET`, `SUPERADMIN_EMAIL`, `REVALIDATE_SECRET`, `WEB_URL`, `BLOB_READ_WRITE_TOKEN`. After changing an env var, redeploy (env changes do not affect existing deployments).
- Domain is attached later by the owner. Then update `SITE_URL` (web) and `WEB_URL` (admin) and redeploy.
- Commit and push only when asked. Run `npm run typecheck` first. If typecheck shows `Duplicate identifier` from `.next/types/* 2.ts` files, those are stale Finder copies: delete files with " 2" or " 3" in their names under `apps/*/.next/types`.

## Chatbot

Rules-based chat window with editable answers and tap-to-ask pills. Engine is behind the `ChatProvider` interface in `packages/core/src/chat.ts` so an LLM can replace it later. How it works, how to edit it and the LLM plan: `docs/CHATBOT.md`. Answers must pull contact facts from the `{placeholders}`, never copy them.

## SEO

Strategy, keyword targets, content plan and launch checklist: `docs/SEO_PLAN.md`. Keep titles under about 65 characters with the brand ending, keep structured data in `apps/web/app/layout.tsx` and the service and blog pages in sync with the data, and never remove a page without adding a Redirect.

## Status and open items

See `docs/OPEN_DECISIONS.md`. Keep it current.
