import { getSharedBlock, slugify } from "@northville/core";
import type { BlockData } from "@northville/content";
import type { ComponentType } from "react";
import { Banner } from "./Banner";
import { BlogList } from "./BlogList";
import { CardGrid } from "./CardGrid";
import { CaseStudies } from "./CaseStudies";
import { ContactForm } from "./ContactForm";
import { CtaBand } from "./CtaBand";
import { Faq } from "./Faq";
import { Hero } from "./Hero";
import { ImageText } from "./ImageText";
import { JobList } from "./JobList";
import { LogoWall } from "./LogoWall";
import { Offices } from "./Offices";
import { ServicesOverview } from "./ServicesOverview";
import { SocialBand } from "./SocialBand";
import { Stats } from "./Stats";
import { Team } from "./Team";
import { Testimonials } from "./Testimonials";
import { TextSection } from "./TextSection";
import type { BlockProps } from "./types";

// Every block type defined in @northville/content must have a component here.
type Renderer = ComponentType<BlockProps & { category?: string }> | ((p: BlockProps) => Promise<React.ReactNode>);
const REGISTRY: Record<string, Renderer> = {
  hero: Hero, banner: Banner as Renderer, stats: Stats, textSection: TextSection, imageText: ImageText as Renderer, cardGrid: CardGrid,
  servicesOverview: ServicesOverview as Renderer, testimonials: Testimonials as Renderer, team: Team as Renderer,
  logoWall: LogoWall as Renderer, ctaBand: CtaBand as Renderer, socialBand: SocialBand as Renderer,
  contactForm: ContactForm, offices: Offices as Renderer, jobList: JobList as Renderer,
  blogList: BlogList as Renderer, faq: Faq, caseStudies: CaseStudies as Renderer,
};

export async function BlockRenderer({ blocks, category, heading, intro }: { blocks: BlockData[]; category?: string; heading?: string; intro?: string }) {
  // Reusable sections are looked up together, not one after another.
  const resolved = (await Promise.all(blocks.map(async (blk) => {
    if (blk.type !== "shared") return blk;
    const shared = await getSharedBlock(String(blk.data.sharedId ?? ""));
    return shared ? ({ ...shared, id: blk.id } as BlockData) : null;
  }))).filter((b): b is BlockData => !!b);
  // Jump-link addresses made from headings must be unique on the page.
  const used = new Map<string, number>();
  const anchor = (heading: unknown) => {
    const base = slugify(typeof heading === "string" ? heading : "");
    if (!base) return undefined;
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
  return (
    <>
      {resolved.map((blk, i) => {
        const C = REGISTRY[blk.type] as ComponentType<BlockProps & { category?: string; anchor?: string }> | undefined;
        if (!C) return null;
        return <C key={blk.id} data={category && blk.type === "blogList" ? { ...blk.data, heading: heading ?? blk.data.heading, intro: intro ?? blk.data.intro } : blk.data} first={i === 0} category={category} anchor={blk.type === "imageText" ? anchor(blk.data.heading) : undefined} />;
      })}
    </>
  );
}
