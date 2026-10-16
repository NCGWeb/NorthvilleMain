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
8. **Design: flat and editorial.** Square corners (`rounded-none`, `rounded-sm` for controls only), no shadows, no decorative circles or gradients blobs, no small uppercase letter-spaced labels. Sans headings (Inter), serif body (Newsreader). Brand colors from `packages/ui/src/brand.css` only: navy `#00063E`, steel `#2B5672`, royal `#435DF8`, bright `#3D9BE9`, sky `#C9E7FF`.
9. **No em dash** anywhere (code, comments, copy, seed, docs, commits). A hook enforces it.
10. **Sanitise rich text** with `cleanHtml` before saving and before rendering.
11. Next.js 16 has breaking changes. Check `node_modules/next/dist/docs/` before using an API you are unsure of (`params` and `searchParams` are Promises, `proxy.ts` replaces middleware).

## Deployment (follows parent rules)

- GitHub: `NCGWeb/NorthvilleMain` via SSH alias `github-ncgweb` (key `~/.ssh/id_ed25519_ncgweb`). Remote is `git@github-ncgweb:NCGWeb/NorthvilleMain.git`. Repo-local `user.name` is `NCGWeb`. Never push from another account.
- Two Vercel projects from this one repo (new Vercel account, not yet created): `web` (root `apps/web`) and `admin` (root `apps/admin`). Deploy by pushing to `main`. Never run a bare `vercel` command. A hook blocks it.
- Vercel does not run migrations. After a schema change run `npm run db:deploy --workspace=@northville/database` against the production `DIRECT_URL`.
- Production env vars: `DATABASE_URL`, `DIRECT_URL`, `ADMIN_SESSION_JWT_SECRET`, `SUPERADMIN_EMAIL`, `SUPERADMIN_INITIAL_PASSWORD`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `REVALIDATE_SECRET`, `SITE_URL`, `WEB_URL` (admin only), plus the same `DATABASE_URL`/`REVALIDATE_SECRET` on both.
- Domain is attached later by the owner in Vercel.
- Commit and push only when asked. Run `npm run typecheck` first.

## Status and open items

See `docs/OPEN_DECISIONS.md`. Keep it current.
