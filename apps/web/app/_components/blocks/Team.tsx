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
    <Section tone={leadershipOnly ? "white" : "white"}>
      <SectionHead heading={str(data.heading)} intro={str(data.intro)} as={first ? "h1" : "h2"} />
      {leadershipOnly ? (
        <div className="grid gap-8 md:grid-cols-2">
          {people.map((p, i) => (
            <Reveal key={p.id} delay={i * 100}>
              <article className="grid h-full overflow-hidden rounded-none border border-line bg-gradient-to-br from-white to-mist sm:grid-cols-5">
                <div className="relative min-h-72 sm:col-span-2">
                  {p.photoUrl && <Image src={p.photoUrl} alt={`${p.name}, ${p.designation}`} fill sizes="(min-width:640px) 18vw, 100vw" className="object-cover object-top" />}
                </div>
                <div className="flex flex-col p-7 sm:col-span-3">
                  <h3 className="text-2xl text-navy">{p.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-royal">{p.designation}</p>
                  {p.background && <p className="mt-1 text-sm text-muted">{p.background}</p>}
                  {p.bio && <p className="mt-4 leading-relaxed text-ink/80">{p.bio}</p>}
                  {p.linkedinUrl && (
                    <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on LinkedIn`} className="mt-auto inline-flex w-fit items-center gap-2 pt-5 text-sm font-medium text-steel hover:text-royal"><LinkedinIcon size={16} /> LinkedIn</a>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {people.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 70}>
              <article>
                <div className="relative aspect-[4/5] overflow-hidden rounded-none bg-mist">
                  {p.photoUrl && <Image src={p.photoUrl} alt={`${p.name}, ${p.designation}`} fill sizes="(min-width:1024px) 22vw, (min-width:768px) 30vw, 46vw" className="object-cover object-top transition duration-500 hover:scale-105" />}
                </div>
                <h3 className="mt-4 font-sans text-base font-semibold tracking-normal text-navy">{p.name}</h3>
                <p className="text-sm font-medium text-royal">{p.designation}</p>
                {p.background && <p className="mt-0.5 text-sm text-muted">{p.background}</p>}
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}
