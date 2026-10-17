import { getSettings } from "@northville/core";
import { SOCIALS } from "../Icons";
import { Section } from "../ui";
import { str, type BlockProps } from "./types";

export async function SocialBand({ data }: BlockProps) {
  const s = await getSettings();
  const list = SOCIALS.filter((x) => s.social[x.key]);
  if (!list.length) return null;
  return (
    <Section tone="white" className="border-t border-line [&>div]:py-12 md:[&>div]:py-14">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-[1.75rem] leading-[1.2] sm:text-[2rem] text-navy">{str(data.heading)}</h2>
          {str(data.text) && <p className="mt-2 text-muted">{str(data.text)}</p>}
        </div>
        <div className="flex gap-3">
          {list.map(({ key, label, Icon }) => (
            <a key={key} href={s.social[key]} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-12 w-12 place-items-center rounded-none border border-line text-navy transition hover:border-royal hover:bg-royal hover:text-white"><Icon size={20} /></a>
          ))}
        </div>
      </div>
    </Section>
  );
}
