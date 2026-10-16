import Image from "next/image";
import { getTeam } from "@northville/core";
import { LinkedinIcon } from "../Icons";
import { Reveal } from "../Reveal";
import { Section, SectionHead } from "../ui";
import { str, type BlockProps } from "./types";

export async function Team({ data, first }: BlockProps) {
  const leadershipOnly = str(data.show) === "leadership";
  const people = await getTeam(leadershipOnly);
  if (!people.length) return null;
  return (
    <Section>
      <SectionHead heading={str(data.heading)} intro={str(data.intro)} as={first ? "h1" : "h2"} />
      {leadershipOnly ? (
        <div className="grid gap-12 md:grid-cols-2">
          {people.map((p) => (
            <Reveal key={p.id}>
              <article className="grid gap-6 sm:grid-cols-5">
                <div className="relative aspect-[4/5] overflow-hidden bg-mist sm:col-span-2">
                  {p.photoUrl && <Image src={p.photoUrl} alt={`${p.name}, ${p.designation}`} fill sizes="(min-width:640px) 200px, 100vw" className="object-cover object-top" />}
                </div>
                <div className="flex flex-col sm:col-span-3">
                  <h3 className="text-xl text-navy">{p.name}</h3>
                  <p className="mt-1 text-[15px] font-medium text-royal">{p.designation}</p>
                  {p.background && <p className="mt-0.5 text-sm text-muted">{p.background}</p>}
                  {p.bio && <p className="mt-4 text-[15px] leading-relaxed text-ink/80">{p.bio}</p>}
                  {p.linkedinUrl && <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on LinkedIn`} className="mt-auto inline-flex w-fit items-center gap-2 pt-4 text-sm font-medium text-steel hover:text-royal"><LinkedinIcon size={15} /> LinkedIn</a>}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {people.map((p) => (
              <article key={p.id}>
                <div className="relative aspect-[4/5] overflow-hidden bg-mist">
                  {p.photoUrl && <Image src={p.photoUrl} alt={`${p.name}, ${p.designation}`} fill sizes="(min-width:768px) 260px, 46vw" className="object-cover object-top" />}
                </div>
                <h3 className="mt-3 font-sans text-base font-semibold tracking-normal text-navy">{p.name}</h3>
                <p className="text-sm text-royal">{p.designation}</p>
                {p.background && <p className="mt-0.5 text-sm text-muted">{p.background}</p>}
              </article>
            ))}
          </div>
        </Reveal>
      )}
    </Section>
  );
}
