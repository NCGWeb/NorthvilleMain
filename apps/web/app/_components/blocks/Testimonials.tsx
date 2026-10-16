import Image from "next/image";
import { getTestimonials } from "@northville/core";
import { Section } from "../ui";
import { str, type BlockProps } from "./types";

export async function Testimonials({ data }: BlockProps) {
  const items = await getTestimonials();
  if (!items.length) return null;
  return (
    <Section tone="navy">
      <h2 className="mb-10 text-[1.75rem] text-white sm:text-[2rem]">{str(data.heading) || "What they say about us"}</h2>
      <div className="space-y-12">
        {items.map((t) => (
          <figure key={t.id} className="max-w-3xl">
            <blockquote className="text-xl leading-relaxed text-white md:text-2xl">&ldquo;{t.quote}&rdquo;</blockquote>
            <figcaption className="mt-6 flex items-center gap-4">
              {t.photoUrl && <Image src={t.photoUrl} alt={t.authorName} width={48} height={48} className="h-12 w-12 object-cover" />}
              <span><span className="block font-semibold text-white">{t.authorName}</span><span className="text-sm text-white/65">{[t.authorRole, t.company].filter(Boolean).join(", ")}</span></span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
