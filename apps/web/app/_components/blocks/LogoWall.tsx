import Image from "next/image";
import { getLogos } from "@northville/core";
import { Section } from "../ui";
import { str, type BlockProps } from "./types";

type Wall = "CLIENT" | "INVESTOR" | "INSTITUTION" | "NETWORK";

export async function LogoWall({ data }: BlockProps) {
  const logos = await getLogos((str(data.wall) || "CLIENT") as Wall);
  if (!logos.length) return null;
  return (
    <Section tone="white" className="[&>div]:py-12 md:[&>div]:py-16">
      <h2 className="mb-8 text-center text-sm font-semibold  text-muted">{str(data.heading)}</h2>
      <ul className="flex flex-wrap justify-center gap-4">
        {logos.map((l) => {
          const img = (
            <div className="grid h-24 w-40 place-items-center rounded-none border border-line bg-white p-4 grayscale transition duration-300 hover:border-royal/30 hover:grayscale-0 sm:h-28 sm:w-48">
              <Image src={l.imageUrl} alt={l.name} width={160} height={90} className="max-h-full w-auto max-w-full object-contain" />
            </div>
          );
          return <li key={l.id}>{l.linkUrl ? <a href={l.linkUrl} target="_blank" rel="noopener noreferrer" aria-label={l.name}>{img}</a> : img}</li>;
        })}
      </ul>
    </Section>
  );
}
