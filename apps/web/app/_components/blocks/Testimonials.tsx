import { getSettings, getTestimonials } from "@northville/core";
import { TestimonialCarousel } from "../TestimonialCarousel";
import { Section } from "../ui";
import { str, type BlockProps } from "./types";

export async function Testimonials({ data }: BlockProps) {
  const [items, s] = await Promise.all([getTestimonials(), getSettings()]);
  if (!items.length) return null;
  return (
    <Section tone="navy">
      <h2 className="mb-10 text-[1.75rem] text-white sm:text-[2rem]">{str(data.heading) || s.text.testimonialsHeading}</h2>
      <TestimonialCarousel
        prev={s.text.testimonialPrev} next={s.text.testimonialNext} goTo={s.text.testimonialGoTo}
        items={items.map((t) => ({ id: t.id, quote: t.quote, name: t.authorName, byline: [t.authorRole, t.company].filter(Boolean).join(", "), photo: t.photoUrl }))}
      />
    </Section>
  );
}
