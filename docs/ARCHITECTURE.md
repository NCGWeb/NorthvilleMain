# Architecture

## Why one block registry

Every editable thing is described once in `packages/content`:

- `fields.ts`: field kinds (text, richtext, image, list, ref...). One format for blocks, collections and settings.
- `blocks.ts`: page sections. Each has a label, a plain explanation, and fields.
- `collections.ts`: lists (services, team, testimonials, logos, offices, jobs, blog, categories, reusable sections).
- `settings.ts`: site-wide groups (brand, contact, social, menus, SEO).
- `permissions.ts`: areas, actions, default roles.

The admin renders forms from these definitions (`FieldEditor`). The website renders blocks from the same `type` keys (`apps/web/app/_components/blocks/index.tsx`). Adding a section or field never needs a new admin screen.

## Data flow

```
Editor -> admin form -> /api route (permission check, cleanValues, audit log)
       -> Postgres (draft) -> Publish -> published blocks
       -> refreshWebsite() -> web /api/revalidate -> ISR pages rebuild
Visitor -> web (static HTML from ISR) <- packages/core queries <- Postgres
```

## Routing in web

- `[[...slug]]`: any CMS page. Unknown path checks the `Redirect` table, then 404.
- `services/[slug]`: service template built from the Service record and its offerings (not a block page, so 12 pages stay consistent).
- `blog/[slug]`, `blog/category/[slug]`: posts and filtered list (the list reuses the Blog page blocks).
- `api/enquiry`: contact form (zod, honeypot, timing check, throttle, Resend).
- `api/revalidate`: secret protected cache refresh called by the admin.
- `sitemap.ts`, `robots.ts`, JSON-LD (Organization, WebSite, Service, Article, FAQ, BreadcrumbList).

## Dedup decisions

| Fact | Single home |
|---|---|
| Service names, summaries, offerings, photos | `Service`, `ServiceOffering` |
| Service menu grouping | `ServiceGroup` (themes) |
| Menu "Services" dropdown, footer services, Home overview, Services hub | All read `getServiceGroups()` |
| Contact strip, Careers strip, Follow strip | `SharedBlock`, referenced by `shared` blocks and `General.servicePageCta` |
| Phones, emails, WhatsApp, hours, socials | `SiteSetting` groups |
| Office addresses | `Office` |
| Team and founders | `TeamMember` (`isLeadership` features on Home and About) |
| Logo walls | `LogoItem.wall` |

## Access

Roles hold permission keys (`area:action`). Super admin is the user whose email equals `SUPERADMIN_EMAIL`. Sessions are signed JWT cookies (12h), gated in `apps/admin/proxy.ts` and re-checked per route with the live DB user, so deactivating a user takes effect immediately.
