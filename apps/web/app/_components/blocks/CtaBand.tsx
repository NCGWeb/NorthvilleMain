import { getSettings, whatsappUrl } from "@northville/core";
import { Button } from "../ui";
import { WhatsappIcon } from "../Icons";
import { str, type BlockProps } from "./types";

export async function CtaBand({ data }: BlockProps) {
  const s = await getSettings();
  const dark = str(data.tone) !== "light";
  const wa = !!data.showWhatsapp && !!s.contact.whatsappNumber;
  return (
    <section className={dark ? "mesh text-white" : "bg-mist"}>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-center md:justify-between md:py-20">
        <div className="max-w-2xl">
          <h2 className={`text-3xl leading-tight sm:text-4xl md:text-5xl ${dark ? "text-white" : "text-navy"}`}>{str(data.heading)}</h2>
          {str(data.text) && <p className={`mt-4 text-lg ${dark ? "text-white/75" : "text-muted"}`}>{str(data.text)}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          {str(data.primaryLabel) && <Button href={str(data.primaryHref) || "/contact"} variant={dark ? "light" : "primary"}>{str(data.primaryLabel)}</Button>}
          {wa && (
            <a href={whatsappUrl(s.contact.whatsappNumber, s.contact.whatsappMessage)} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-sm border px-6 py-3 text-sm font-semibold transition ${dark ? "border-white/30 text-white hover:bg-white/10" : "border-navy/20 text-navy hover:border-royal"}`}>
              <WhatsappIcon size={16} /> WhatsApp us
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
