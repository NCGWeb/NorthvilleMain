import Image from "next/image";
import { getLogos } from "@northville/core";
import { Section } from "../ui";
import { str, type BlockProps } from "./types";

type Wall = "CLIENT" | "INVESTOR" | "INSTITUTION" | "NETWORK";

export async function LogoWall({ data }: BlockProps) {
  const logos = await getLogos((str(data.wall) || "CLIENT") as Wall);
  if (!logos.length) return null;
  return (
    <Section className="[&>div]:py-10 md:[&>div]:py-12">
      <h2 className="mb-6 text-lg text-navy">{str(data.heading)}</h2>
      <ul className="grid grid-cols-2 border-l border-t border-line sm:grid-cols-3 lg:grid-cols-5">
        {logos.map((l) => {
          const img = (
            <div className="relative h-24 border-b border-r border-line bg-white">
              <Image src={l.imageUrl} alt={l.name} fill sizes="(min-width:1024px) 220px, 45vw" className="object-contain p-5" />
            </div>
          );
          return <li key={l.id}>{l.linkUrl ? <a href={l.linkUrl} target="_blank" rel="noopener noreferrer" aria-label={l.name}>{img}</a> : img}</li>;
        })}
      </ul>
    </Section>
  );
}
