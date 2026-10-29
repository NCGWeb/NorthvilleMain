/**
 * Adds the Case studies feature to a database, safely and repeatably:
 *  - gives roles that can already manage Testimonials the matching Case studies permissions
 *  - creates the two starting areas and the seven case studies carried over from the shared site (only if missing, never overwrites edits)
 *  - creates the Case Studies page (only if missing)
 *  - menus: removes Startup Advisory from the top menu (it is in the Services dropdown) and adds Case Studies after Services
 */
import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { DOMAINS, STUDIES } from "./seed-case-studies";

type Link = { label: string; href: string };

export async function applyCaseStudies(prisma: PrismaClient) {
  // Permissions
  for (const role of await prisma.role.findMany()) {
    const add = ["view", "edit", "publish", "delete"].filter((a) => role.permissions.includes(`testimonials:${a}`) && !role.permissions.includes(`caseStudies:${a}`)).map((a) => `caseStudies:${a}`);
    if (add.length) { await prisma.role.update({ where: { id: role.id }, data: { permissions: [...role.permissions, ...add] } }); console.log(`role ${role.name}: +${add.length} permissions`); }
  }

  // Areas and case studies
  const domainId: Record<string, string> = {};
  for (const [i, d] of DOMAINS.entries()) {
    const row = (await prisma.caseStudyDomain.findUnique({ where: { slug: d.slug } })) ?? (await prisma.caseStudyDomain.create({ data: { ...d, sortOrder: i } }));
    domainId[d.slug] = row.id;
  }
  for (const [i, s] of STUDIES.entries()) {
    if (await prisma.caseStudy.findUnique({ where: { slug: s.slug } })) continue;
    const { domain, alsoDomain, ...rest } = s;
    await prisma.caseStudy.create({ data: { ...rest, domainId: domainId[domain], alsoDomainId: alsoDomain ? domainId[alsoDomain] : null, sortOrder: i } });
    console.log(`case study added: ${s.clientName}`);
  }

  // Page
  if (!(await prisma.page.findUnique({ where: { slug: "case-studies" } }))) {
    const general = await prisma.siteSetting.findUnique({ where: { key: "general" } });
    const stripId = (general?.value as { servicePageCta?: string } | undefined)?.servicePageCta;
    const b = (type: string, data: Record<string, unknown>) => ({ id: randomUUID(), type, data });
    const blocks = [
      b("hero", { size: "compact", heading: "Problems We Have Solved for Businesses Like Yours", subtext: "Every project here started with a real business problem. See what we did about it, and what changed.", primaryLabel: "", primaryHref: "", secondaryLabel: "", secondaryHref: "", image: null }),
      b("caseStudies", { heading: "", intro: "", mode: "browser", count: 0 }),
      ...(stripId ? [b("shared", { sharedId: stripId })] : []),
    ];
    await prisma.page.create({
      data: {
        slug: "case-studies", title: "Case Studies", seoTitle: "Case Studies: Web, Marketing and Advisory Work",
        seoDescription: "Real projects and measurable results across web development, performance marketing and more, from the Northville team.",
        draftBlocks: blocks as object[], publishedBlocks: blocks as object[],
      },
    });
    console.log("page added: case-studies");
  }

  // Menus
  const nav = await prisma.siteSetting.findUnique({ where: { key: "navigation" } });
  if (nav) {
    const v = nav.value as Record<string, unknown>;
    const main = ((v.mainLinks as Link[]) ?? []).filter((l) => l.href !== "/services#startup-advisory");
    const addCase = (list: Link[]) => {
      if (list.some((l) => l.href === "/case-studies")) return list;
      const at = list.findIndex((l) => l.href === "/services");
      const next = [...list];
      next.splice(at >= 0 ? at + 1 : list.length, 0, { label: "Case Studies", href: "/case-studies" });
      return next;
    };
    await prisma.siteSetting.update({ where: { key: "navigation" }, data: { value: { ...v, mainLinks: addCase(main), footerLinks: addCase((v.footerLinks as Link[]) ?? []) } } });
    console.log("menus updated");
  }
}
