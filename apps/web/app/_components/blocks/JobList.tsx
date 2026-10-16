import { getJobs, getSettings } from "@northville/core";
import { Button, Section, SectionHead } from "../ui";
import { str, type BlockProps } from "./types";

export async function JobList({ data }: BlockProps) {
  const [jobs, s] = await Promise.all([getJobs(), getSettings()]);
  return (
    <Section>
      <SectionHead heading={str(data.heading)} />
      {jobs.length === 0 ? (
        <div className="max-w-2xl rounded-none border border-line bg-mist p-8">
          <p className="text-lg leading-relaxed text-ink/80">{str(data.emptyText)}</p>
          {s.contact.hrEmail && <div className="mt-6"><Button href={`mailto:${s.contact.hrEmail}`}>{s.contact.hrEmail}</Button></div>}
        </div>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {jobs.map((j) => (
            <li key={j.id} className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl text-navy">{j.title}</h3>
                <p className="mt-1 text-sm text-muted">{[j.location, j.type].filter(Boolean).join(" · ")}</p>
                {j.description && <p className="mt-3 max-w-2xl text-ink/80">{j.description}</p>}
              </div>
              <Button href={`mailto:${j.applyEmail || s.contact.hrEmail}?subject=${encodeURIComponent(`Application: ${j.title}`)}`}>Apply</Button>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
