import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { getOffices, getSettings } from "@northville/core";
import { Section, SectionHead } from "../ui";
import { str, type BlockProps } from "./types";

export async function Offices({ data }: BlockProps) {
  const [offices, s] = await Promise.all([getOffices(), getSettings()]);
  const c = s.contact;
  return (
    <Section tone="mist">
      <SectionHead heading={str(data.heading)} intro={str(data.intro)} />
      <div className="grid gap-6 md:grid-cols-3">
        {offices.map((o) => (
          <div key={o.id} className="rounded-none border border-line bg-white p-7">
            <MapPin className="text-royal" aria-hidden />
            <h3 className="mt-4 text-2xl text-navy">{o.city}</h3>
            <address className="mt-2 not-italic leading-relaxed text-muted">{o.address}</address>
            {o.mapUrl && <a href={o.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-royal hover:underline">Open in Maps</a>}
          </div>
        ))}
        <div className="space-y-4 rounded-none bg-navy p-7 text-white">
          {c.email && <p className="flex gap-3"><Mail size={20} className="shrink-0 text-sky" aria-hidden /><a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a></p>}
          {c.phones.map((p) => (<p key={p} className="flex gap-3"><Phone size={20} className="shrink-0 text-sky" aria-hidden /><a href={`tel:${p.replace(/\s/g, "")}`} className="hover:underline">{p}</a></p>))}
          {c.officeHours && <p className="flex gap-3"><Clock size={20} className="shrink-0 text-sky" aria-hidden />{c.officeHours}</p>}
          {c.responseTime && <p className="pl-8 text-sm text-white/60">{c.responseTime}</p>}
        </div>
      </div>
    </Section>
  );
}
