import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getService, getServices, getSettings, whatsappUrl, getSharedBlock } from "@northville/core";
import { BlockRenderer } from "../../_components/blocks";
import { FaqList } from "../../_components/blocks/Faq";
import { JsonLd } from "../../_components/JsonLd";
import { Reveal } from "../../_components/Reveal";
import { WhatsappIcon } from "../../_components/Icons";
import { Button, Section } from "../../_components/ui";
import { abs, breadcrumbLd, buildMetadata } from "../../_lib/site";

export const revalidate = 3600;
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const s = await getService((await params).slug);
  if (!s) return {};
  return buildMetadata({ title: s.seoTitle || s.name, description: s.seoDescription || s.summary, path: `/services/${s.slug}`, image: s.imageUrl });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [service, settings, all] = await Promise.all([getService(slug), getSettings(), getServices()]);
  const contactStrip = settings.general.servicePageCta ? await getSharedBlock(settings.general.servicePageCta) : null;
  if (!service) notFound();
  // Internal links help visitors and search engines: same theme first, then fill up from the rest.
  const related = service ? [...all.filter((x) => x.id !== service.id && x.groupId === service.groupId), ...all.filter((x) => x.id !== service.id && x.groupId !== service.groupId)].slice(0, 3) : [];
  const faqs = (service.faqs as { question: string; answer: string }[]) ?? [];
  const wa = settings.contact.whatsappNumber
    ? whatsappUrl(settings.contact.whatsappNumber, `Hi Northville, I would like to know more about ${service.name}.`)
    : "";
  const ld = [
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: service.name, path: `/services/${service.slug}` }]),
    {
      "@context": "https://schema.org", "@type": "Service", name: service.name, description: service.seoDescription || service.summary,
      provider: { "@id": abs("/#org") }, areaServed: ["IN", "US", "GB", "AE"], url: abs(`/services/${service.slug}`),
      hasOfferCatalog: { "@type": "OfferCatalog", name: service.name, itemListElement: service.offerings.map((o) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: o.title, description: o.tagline } })) },
    },
  ];

  return (
    <>
      <section className="mesh relative flex flex-col justify-end overflow-hidden pt-16 text-white" style={{ minHeight: "46svh" }}>
        {service.imageUrl && <Image src={service.imageUrl} alt="" fill priority sizes="100vw" className="object-cover opacity-25 mix-blend-luminosity" />}
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/30" />
        <div className="hero-in relative mx-auto w-full max-w-[1120px] px-6 pb-12 pt-14 lg:px-8 md:pb-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/60">
            <Link href="/" className="hover:text-white">{settings.text.crumbHome}</Link> / <Link href="/services" className="hover:text-white">{settings.text.crumbServices}</Link>
            {service.group && <> / <span>{service.group.name}</span></>}
          </nav>
          <h1 className="max-w-4xl text-balance text-3xl leading-[1.1] sm:text-4xl md:text-5xl">{service.heroHeading || service.name}</h1>
          {(service.heroSubtext || service.summary) && <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-white/80">{service.heroSubtext || service.summary}</p>}
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/contact">{settings.text.discussService}</Button>
            {wa && <Button href={wa} variant="ghost" arrow={false} icon={<WhatsappIcon size={15} />}>{settings.text.whatsappUs}</Button>}
          </div>
        </div>
      </section>

      {service.tagline && (
        <Section tone="mist" className="[&>div]:py-10 md:[&>div]:py-12">
          <p className="max-w-3xl text-xl font-medium leading-snug text-navy md:text-2xl">{service.tagline}</p>
        </Section>
      )}

      <Section>
        <h2 className="mb-2 border-b border-navy pb-3 text-[1.75rem] leading-[1.2] sm:text-[2rem] text-navy">{settings.text.whatWeDo}</h2>
        <ol className="divide-y divide-line">
          {service.offerings.map((o) => (
            <li key={o.id}>
              <Reveal>
                <article className="grid gap-4 py-8 md:grid-cols-12 md:gap-10">
                  <div className="md:col-span-4">
                    <h3 className="text-xl text-navy">{o.title}</h3>
                    {o.tagline && <p className="mt-2 text-[15px] text-steel">{o.tagline}</p>}
                  </div>
                  <div className="md:col-span-8">
                    {o.body && <p className="leading-relaxed text-ink/85">{o.body}</p>}
                    {o.bullets.length > 0 && (
                      <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                        {o.bullets.map((b) => (<li key={b} className="flex gap-3 text-[15px]"><Check size={17} className="mt-0.5 shrink-0 text-royal" aria-hidden />{b}</li>))}
                      </ul>
                    )}
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      {related.length > 0 && (
        <Section tone="mist">
          <h2 className="mb-6 border-b border-navy pb-3 text-[1.75rem] leading-[1.2] sm:text-[2rem] text-navy">{settings.text.relatedServices}</h2>
          <ul className="grid gap-8 md:grid-cols-3">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/services/${r.slug}`} className="group block">
                  <h3 className="text-xl text-navy group-hover:text-royal">{r.name}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{r.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-semibold text-royal">{settings.text.learnMore} &rarr;</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <FaqList items={faqs} heading={settings.text.faqHeading} />
      {contactStrip && <BlockRenderer blocks={[{ id: "s", type: contactStrip.type, data: contactStrip.data }]} />}
      <JsonLd data={ld} />
    </>
  );
}
