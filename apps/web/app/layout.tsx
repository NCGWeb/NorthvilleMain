import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import { getOffices, getSettings } from "@northville/core";
import { Header } from "./_components/Header";
import { Footer } from "./_components/Footer";
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
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [s, offices] = await Promise.all([getSettings(), getOffices()]);
  const sameAs = Object.values(s.social).filter(Boolean);
  const org = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"], "@id": abs("/#org"), name: s.general.siteName, url: SITE_URL,
        logo: abs(s.general.logo ?? "/seed/brand/logo-white-trim.png"), description: s.seo.description, email: s.contact.email,
        telephone: s.contact.phones[0], sameAs, areaServed: ["IN", "US", "GB", "AE"],
        address: offices.map((o) => ({ "@type": "PostalAddress", streetAddress: o.address, addressLocality: o.city, addressCountry: "IN" })),
      },
      { "@type": "WebSite", "@id": abs("/#site"), url: SITE_URL, name: s.general.siteName, publisher: { "@id": abs("/#org") }, inLanguage: "en-IN" },
    ],
  };
  return (
    <html lang="en-IN" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <JsonLd data={org} />
      </body>
    </html>
  );
}
