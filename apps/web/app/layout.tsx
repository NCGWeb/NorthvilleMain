import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import Script from "next/script";
import { getChatStart, getOffices, getServices, getSettings, getTeam } from "@northville/core";
import { Header } from "./_components/Header";
import { Footer } from "./_components/Footer";
import { TopBar } from "./_components/TopBar";
import { NavProgress } from "./_components/NavProgress";
import { ChatLoader } from "./_components/ChatLoader";
import { JsonLd } from "./_components/JsonLd";
import { SITE_URL, abs } from "./_lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", display: "swap", style: ["normal", "italic"] });

export const viewport: Viewport = { themeColor: "#00063e", width: "device-width", initialScale: 1 };

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${s.general.siteName} ${s.seo.titleSuffix}`.trim(), template: `%s ${s.seo.titleSuffix}` },
    description: s.seo.description,
    applicationName: s.general.siteName,
    ...(s.seo.googleVerification ? { verification: { google: s.seo.googleVerification } } : {}),
    alternates: { types: { "application/rss+xml": `${SITE_URL}/blog/feed.xml` } },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [s, offices, services, leaders, chat] = await Promise.all([getSettings(), getOffices(), getServices(), getTeam(true), getChatStart()]);
  const sameAs = Object.values(s.social).filter(Boolean);
  const REGION: Record<string, string> = { "New Delhi": "Delhi", Delhi: "Delhi", Mumbai: "Maharashtra", Bengaluru: "Karnataka", Hyderabad: "Telangana", Pune: "Maharashtra" };
  const postal = (a: string) => a.match(/(\d{6})\s*$/)?.[1];
  const phones = s.contact.phones.map((p) => p.replace(/\s/g, ""));
  const orgId = abs("/#org");
  const org = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"], "@id": orgId, name: s.general.siteName, url: SITE_URL,
        logo: abs("/icon.png"), image: abs(s.seo.image ?? "/seed/brand/og-default.png"), description: s.seo.description, email: s.contact.email,
        telephone: phones[0], sameAs, areaServed: ["IN", "US", "GB", "AE"], priceRange: "$$",
        knowsAbout: services.map((x) => x.name),
        founder: leaders.map((p) => ({ "@type": "Person", name: p.name, jobTitle: p.designation, ...(p.linkedinUrl ? { sameAs: [p.linkedinUrl] } : {}) })),
        contactPoint: [{ "@type": "ContactPoint", contactType: "customer service", email: s.contact.email, telephone: phones[0], areaServed: ["IN", "US", "GB", "AE"], availableLanguage: ["English", "Hindi"] }],
        address: offices.map((o) => ({ "@type": "PostalAddress", streetAddress: o.address.replace(new RegExp(`,?\\s*${o.city}\\s*\\d{0,6}\\s*$`), ""), addressLocality: o.city, addressRegion: REGION[o.city], postalCode: postal(o.address), addressCountry: "IN" })),
      },
      ...offices.map((o) => ({
        "@type": "ProfessionalService", "@id": abs(`/#office-${o.city.toLowerCase().replace(/[^a-z]+/g, "-")}`), name: `${s.general.siteName}, ${o.city}`, url: abs("/contact"),
        parentOrganization: { "@id": orgId }, telephone: phones[0], email: s.contact.email, image: abs(s.seo.image ?? "/seed/brand/og-default.png"),
        address: { "@type": "PostalAddress", streetAddress: o.address.replace(new RegExp(`,?\\s*${o.city}\\s*\\d{0,6}\\s*$`), ""), addressLocality: o.city, addressRegion: REGION[o.city], postalCode: postal(o.address), addressCountry: "IN" },
        ...(o.mapUrl ? { hasMap: o.mapUrl } : {}),
      })),
      { "@type": "WebSite", "@id": abs("/#site"), url: SITE_URL, name: s.general.siteName, publisher: { "@id": orgId }, inLanguage: "en-IN" },
    ],
  };
  return (
    <html lang="en-IN" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="flex min-h-screen flex-col" style={{ ["--bar-h" as string]: s.announcement.enabled && s.announcement.title ? "52px" : "0px" }}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
        <NavProgress />
        <TopBar a={s.announcement} />
        <Header barHeight={s.announcement.enabled && s.announcement.title ? 52 : 0} />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        {chat.enabled && <ChatLoader start={chat} />}
        <JsonLd data={org} />
        {/^G-[A-Z0-9]{4,}$/.test(s.seo.gaId) && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${s.seo.gaId}`} strategy="lazyOnload" />
            <Script id="ga" strategy="lazyOnload">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${s.seo.gaId}");`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
