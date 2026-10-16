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
  const [service, settings] = await Promise.all([getService(slug), getSettings()]);
  const contactStrip = settings.general.servicePageCta ? await getSharedBlock(settings.general.servicePageCta) : null;
  if (!service) notFound();
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
      <section className="mesh relative overflow-hidden text-white">
        {service.imageUrl && <Image src={service.imageUrl} alt="" fill priority sizes="100vw" className="object-cover opacity-25 mix-blend-luminosity" />}
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/30" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/60">
            <Link href="/" className="hover:text-white">Home</Link> / <Link href="/services" className="hover:text-white">Services</Link>
            {service.group && <> / <span>{service.group.name}</span></>}
          </nav>
          <h1 className="max-w-4xl text-balance text-4xl leading-[1.05] sm:text-5xl md:text-6xl">{service.heroHeading || service.name}</h1>
          {(service.heroSubtext || service.summary) && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">{service.heroSubtext || service.summary}</p>}
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/contact">Discuss this service</Button>
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-sm border border-white/30 px-6 py-3 text-sm font-semibold hover:bg-white/10"><WhatsappIcon size={16} /> WhatsApp us</a>}
          </div>
        </div>
      </section>

      {service.tagline && (
        <Section tone="white" className="[&>div]:py-12 md:[&>div]:py-16">
          <p className="max-w-4xl font-sans text-2xl font-medium leading-snug tracking-tight text-navy sm:text-3xl md:text-4xl">{service.tagline}</p>
        </Section>
      )}

      <Section tone="mist">
        <div className="space-y-6">
          {service.offerings.map((o, i) => (
            <Reveal key={o.id}>
              <article className="grid gap-8 rounded-none border border-line bg-white p-7 md:grid-cols-12 md:p-10">
                <div className="md:col-span-5">
                  <p className="font-sans font-semibold tracking-tight text-4xl text-royal/30">{String(i + 1).padStart(2, "0")}</p>
                  <h2 className="mt-2 text-3xl text-navy">{o.title}</h2>
                  {o.tagline && <p className="mt-3 text-lg text-steel">{o.tagline}</p>}
                </div>
                <div className="md:col-span-7">
                  {o.body && <p className="text-lg leading-relaxed text-ink/80">{o.body}</p>}
                  {o.bullets.length > 0 && (
                    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                      {o.bullets.map((b) => (<li key={b} className="flex gap-3 text-[15px] text-ink"><Check size={18} className="mt-0.5 shrink-0 text-royal" aria-hidden />{b}</li>))}
                    </ul>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <FaqList items={faqs} heading="Frequently asked questions" />
      {contactStrip && <BlockRenderer blocks={[{ id: "s", type: contactStrip.type, data: contactStrip.data }]} />}
      <JsonLd data={ld} />
    </>
  );
}
