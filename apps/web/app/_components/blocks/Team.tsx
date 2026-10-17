import Image from "next/image";
import { getSettings, getTeam } from "@northville/core";
import { LinkedinIcon } from "../Icons";
import { Reveal } from "../Reveal";
import { Section, SectionHead } from "../ui";
import { str, type BlockProps } from "./types";

type Person = Awaited<ReturnType<typeof getTeam>>[number];

function Portrait({ p, sizes, ratio = "aspect-[4/5]", quality = 75, eager = false }: { p: Person; sizes: string; ratio?: string; quality?: number; eager?: boolean }) {
  return (
    <div className={`relative ${ratio} overflow-hidden bg-mist`}>
      {p.photoUrl && <Image src={p.photoUrl} alt={`${p.name}, ${p.designation}`} fill sizes={sizes} quality={quality} loading={eager ? "eager" : "lazy"} className="zoom-img object-cover object-top" />}
    </div>
  );
}

/** Featured people: large portrait, name, role, credentials and a short bio. */
function Leaders({ people, linkedinLabel }: { people: Person[]; linkedinLabel: string }) {
  return (
    <div className="grid gap-14 md:grid-cols-2 md:gap-12">
      {people.map((p, i) => (
        <Reveal key={p.id} variant={i % 2 === 0 ? "left" : "right"} delay={i * 80}>
          <article className="group grid grid-cols-5 gap-5 md:block">
            <div className="col-span-2 md:col-span-1"><Portrait p={p} sizes="(min-width:768px) 520px, 40vw" quality={80} eager={i < 2} ratio="aspect-[4/5] md:aspect-[5/6]" /></div>
            <div className="col-span-3 border-t border-navy pt-4 md:col-span-1 md:mt-6 md:pt-5">
              <h3 className="text-xl text-navy md:text-2xl">{p.name}</h3>
              <p className="mt-1 font-medium text-royal">{p.designation}</p>
              {p.background && <p className="mt-1 text-sm text-muted">{p.background}</p>}
              {p.bio && <p className="mt-4 max-w-md leading-relaxed text-ink/80">{p.bio}</p>}
              {p.linkedinUrl && (
                <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-steel hover:text-royal">
                  <LinkedinIcon size={15} /> {linkedinLabel}<span className="sr-only">: {p.name}</span>
                </a>
              )}
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

function Members({ people }: { people: Person[] }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
        {people.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 90}>
          <article className="group">
            <Portrait p={p} eager={i < 4} sizes="(min-width:1024px) 256px, (min-width:768px) 33vw, 46vw" />
            <div className="mt-4 border-t border-line pt-3 transition-colors group-hover:border-navy">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-sans text-[1.0625rem] font-semibold tracking-normal text-navy">{p.name}</h3>
                {p.linkedinUrl && (
                  <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on LinkedIn`} className="mt-0.5 shrink-0 text-steel transition-colors hover:text-royal"><LinkedinIcon size={16} /></a>
                )}
              </div>
              <p className="mt-0.5 text-sm font-medium text-royal">{p.designation}</p>
              {p.background && <p className="mt-1.5 text-[13px] leading-snug text-muted">{p.background}</p>}
            </div>
          </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export async function Team({ data, first }: BlockProps) {
  const leadershipOnly = str(data.show) === "leadership";
  const [everyone, s] = await Promise.all([getTeam(false), getSettings()]);
  if (!everyone.length) return null;
  const leaders = everyone.filter((p) => p.isLeadership);
  const rest = everyone.filter((p) => !p.isLeadership);

  if (leadershipOnly) {
    return (
      <Section>
        <SectionHead heading={str(data.heading)} intro={str(data.intro)} as={first ? "h1" : "h2"} />
        <Leaders people={leaders} linkedinLabel={s.text.connectLinkedin} />
      </Section>
    );
  }
  return (
    <>
      <Section>
        <SectionHead heading={str(data.heading)} intro={str(data.intro)} as={first ? "h1" : "h2"} />
        {leaders.length > 0 && <Leaders people={leaders} linkedinLabel={s.text.connectLinkedin} />}
      </Section>
      {rest.length > 0 && (
        <Section tone="mist">
          <div className="mb-10 flex flex-col gap-1 border-b border-navy pb-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-[1.75rem] text-navy sm:text-[2rem]">{s.text.widerTeam}</h2>
            <p className="text-sm text-muted">{s.text.widerTeamNote.replace("{count}", String(rest.length))}</p>
          </div>
          <Members people={rest} />
        </Section>
      )}
    </>
  );
}
