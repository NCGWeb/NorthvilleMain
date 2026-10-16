import { getSettings, whatsappUrl } from "@northville/core";
import { Button, WRAP } from "../ui";
import { WhatsappIcon } from "../Icons";
import { str, type BlockProps } from "./types";

export async function CtaBand({ data }: BlockProps) {
  const s = await getSettings();
  const dark = str(data.tone) !== "light";
  const wa = !!data.showWhatsapp && !!s.contact.whatsappNumber;
  return (
    <section className={dark ? "bg-navy text-white" : "bg-mist"}>
      <div className={`${WRAP} flex flex-col gap-8 py-14 md:flex-row md:items-center md:justify-between md:py-16`}>
        <div className="max-w-xl">
          <h2 className={`text-[1.75rem] leading-[1.2] sm:text-[2rem] ${dark ? "text-white" : "text-navy"}`}>{str(data.heading)}</h2>
          {str(data.text) && <p className={`mt-3 text-[1.0625rem] ${dark ? "text-white/75" : "text-muted"}`}>{str(data.text)}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          {str(data.primaryLabel) && <Button href={str(data.primaryHref) || "/contact"} variant={dark ? "light" : "primary"}>{str(data.primaryLabel)}</Button>}
          {wa && (
            <a href={whatsappUrl(s.contact.whatsappNumber, s.contact.whatsappMessage)} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-sm border px-5 py-2.5 text-sm font-semibold transition-colors ${dark ? "border-white/50 text-white hover:bg-white/10" : "border-navy/25 text-navy hover:border-royal"}`}>
              <WhatsappIcon size={15} /> {s.text.whatsappUs}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
