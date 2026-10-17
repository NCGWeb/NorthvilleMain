import { getOffices, getSettings } from "@northville/core";
import { Section, SectionHead } from "../ui";
import { str, type BlockProps } from "./types";

export async function Offices({ data }: BlockProps) {
  const [offices, s] = await Promise.all([getOffices(), getSettings()]);
  const c = s.contact;
  return (
    <Section tone="mist">
      <SectionHead heading={str(data.heading)} intro={str(data.intro)} />
      <div className="grid gap-10 md:grid-cols-3">
        {offices.map((o) => (
          <div key={o.id} className="border-t border-navy pt-4">
            <h3 className="text-xl text-navy">{o.city}</h3>
            <address className="mt-2 text-[15px] not-italic leading-relaxed text-ink/80">{o.address}</address>
            {o.mapUrl && <a href={o.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[15px] font-semibold text-royal hover:text-navy">{s.text.officesMaps}</a>}
          </div>
        ))}
        <div className="border-t border-navy pt-4 text-[15px] text-ink/80">
          <h3 className="text-xl text-navy">{s.text.officesGetInTouch}</h3>
          <ul className="mt-2 space-y-1.5">
            {c.email && <li><a href={`mailto:${c.email}`} className="hover:text-royal">{c.email}</a></li>}
            {c.phones.map((p) => <li key={p}><a href={`tel:${p.replace(/\s/g, "")}`} className="hover:text-royal">{p}</a></li>)}
            {c.officeHours && <li className="pt-2 text-muted">{c.officeHours}</li>}
            {c.responseTime && <li className="text-muted">{c.responseTime}</li>}
          </ul>
        </div>
      </div>
    </Section>
  );
}
