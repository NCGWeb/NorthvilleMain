import { getSharedBlock } from "@northville/core";
import type { BlockData } from "@northville/content";
import type { ComponentType } from "react";
import { Banner } from "./Banner";
import { BlogList } from "./BlogList";
import { CardGrid } from "./CardGrid";
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
  hero: Hero, banner: Banner, stats: Stats, textSection: TextSection, imageText: ImageText, cardGrid: CardGrid,
  servicesOverview: ServicesOverview as Renderer, testimonials: Testimonials as Renderer, team: Team as Renderer,
  logoWall: LogoWall as Renderer, ctaBand: CtaBand as Renderer, socialBand: SocialBand as Renderer,
  contactForm: ContactForm, offices: Offices as Renderer, jobList: JobList as Renderer,
  blogList: BlogList as Renderer, faq: Faq,
};

export async function BlockRenderer({ blocks, category }: { blocks: BlockData[]; category?: string }) {
  const resolved: BlockData[] = [];
  for (const blk of blocks) {
    if (blk.type === "shared") {
      const shared = await getSharedBlock(String(blk.data.sharedId ?? ""));
      if (shared) resolved.push({ ...shared, id: blk.id });
    } else resolved.push(blk);
  }
  return (
    <>
      {resolved.map((blk, i) => {
        const C = REGISTRY[blk.type] as ComponentType<BlockProps & { category?: string }> | undefined;
        if (!C) return null;
        return <C key={blk.id} data={blk.data} first={i === 0} category={category} />;
      })}
    </>
  );
}
