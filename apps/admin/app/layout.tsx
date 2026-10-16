import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavProgress } from "./_components/NavProgress";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
export const metadata: Metadata = { title: "Northville Website Manager", robots: { index: false, follow: false } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className={inter.variable}><body><NavProgress />{children}</body></html>);
}
