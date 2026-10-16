import Image from "next/image";
import { getTestimonials } from "@northville/core";
import { Section } from "../ui";
import { str, type BlockProps } from "./types";

export async function Testimonials({ data }: BlockProps) {
  const items = await getTestimonials();
  if (!items.length) return null;
  return (
    <Section tone="navy">
      <p className="mb-10 text-xs font-semibold  text-sky">{str(data.heading) || "What they say about us"}</p>
      <div className="grid gap-12">
        {items.map((t) => (
          <figure key={t.id} className="grid items-start gap-8 md:grid-cols-12">
            <blockquote className="font-serif text-2xl leading-snug text-white sm:text-3xl md:col-span-9 md:text-4xl">
              <span aria-hidden className="mr-1 text-sky">&ldquo;</span>{t.quote}<span aria-hidden className="text-sky">&rdquo;</span>
            </blockquote>
            <figcaption className="flex items-center gap-4 md:col-span-3">
              {t.photoUrl && <Image src={t.photoUrl} alt={t.authorName} width={56} height={56} className="h-14 w-14 rounded-none object-cover ring-2 ring-white/20" />}
              <span><span className="block font-semibold text-white">{t.authorName}</span><span className="text-sm text-white/60">{[t.authorRole, t.company].filter(Boolean).join(", ")}</span></span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
