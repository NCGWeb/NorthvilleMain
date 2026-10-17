import { prisma } from "@northville/database";

/** Where a picture is used. Searches every place an image address can be stored, so deleting it never breaks a page. */
export async function findImageUsage(url: string): Promise<string[]> {
  const has = { contains: url };
  const [pages, shared, settings, services, offerings, team, testimonials, logos, posts, users] = await Promise.all([
    prisma.page.findMany({ select: { title: true, draftBlocks: true, publishedBlocks: true, seoImageUrl: true } }),
    prisma.sharedBlock.findMany({ select: { name: true, data: true } }),
    prisma.siteSetting.findMany({ select: { key: true, value: true } }),
    prisma.service.findMany({ where: { imageUrl: url }, select: { name: true } }),
    prisma.serviceOffering.findMany({ where: { imageUrl: url }, select: { title: true } }),
    prisma.teamMember.findMany({ where: { photoUrl: url }, select: { name: true } }),
    prisma.testimonial.findMany({ where: { photoUrl: url }, select: { authorName: true } }),
    prisma.logoItem.findMany({ where: { imageUrl: url }, select: { name: true } }),
    prisma.blogPost.findMany({ where: { OR: [{ coverUrl: url }, { body: has }] }, select: { title: true } }),
    prisma.user.findMany({ where: { photoUrl: url }, select: { name: true } }),
  ]);
  const inJson = (v: unknown) => JSON.stringify(v).includes(url);
  return [
    ...pages.filter((p) => p.seoImageUrl === url || inJson([p.draftBlocks, p.publishedBlocks])).map((p) => `Page: ${p.title}`),
    ...shared.filter((s) => inJson(s.data)).map((s) => `Reusable section: ${s.name}`),
    ...settings.filter((s) => inJson(s.value)).map((s) => `Site settings: ${s.key}`),
    ...services.map((s) => `Service: ${s.name}`),
    ...offerings.map((o) => `Service offering: ${o.title}`),
    ...team.map((t) => `Team: ${t.name}`),
    ...testimonials.map((t) => `Testimonial: ${t.authorName}`),
    ...logos.map((l) => `Logo: ${l.name}`),
    ...posts.map((p) => `Blog post: ${p.title}`),
    ...users.map((u) => `User photo: ${u.name}`),
  ];
}
