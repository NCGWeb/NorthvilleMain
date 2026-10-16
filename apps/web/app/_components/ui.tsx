import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

export const isExternal = (href: string) => /^https?:\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");

export function SmartLink({ href, className, children, ...rest }: { href: string; className?: string; children: ReactNode } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
 if (isExternal(href)) {
 return <a href={href} className={className} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>{children}</a>;
 }
 return <Link href={href} className={className} {...rest}>{children}</Link>;
}

const base = "inline-flex items-center gap-2 rounded-sm px-6 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2";
const variants = {
 primary: "bg-royal text-white hover:bg-bright focus-visible:outline-royal",
 light: "bg-white text-navy hover:bg-sky focus-visible:outline-white",
 ghost: "border border-white/30 text-white hover:bg-white/10 focus-visible:outline-white",
 outline: "border border-navy/20 text-navy hover:border-royal hover:text-royal focus-visible:outline-royal",
} as const;

export function Button({ href, variant = "primary", children, arrow = true }: { href: string; variant?: keyof typeof variants; children: ReactNode; arrow?: boolean }) {
 return (
 <SmartLink href={href} className={`${base} ${variants[variant]}`}>
 {children}
 {arrow && <ArrowUpRight size={16} aria-hidden />}
 </SmartLink>
 );
}

export function Section({ children, tone = "white", className = "", id }: { children: ReactNode; tone?: "white" | "mist" | "navy"; className?: string; id?: string }) {
 const bg = tone === "mist" ? "bg-mist" : tone === "navy" ? "mesh text-white" : "bg-white";
 return (
 <section id={id} className={`${bg} ${className}`}>
 <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">{children}</div>
 </section>
 );
}

export function SectionHead({ heading, intro, tone = "light", as: Tag = "h2", center }: { heading?: string; intro?: string; tone?: "light" | "dark"; as?: "h1" | "h2"; center?: boolean }) {
 if (!heading && !intro) return null;
 return (
 <div className={`mb-8 max-w-3xl md:mb-12 ${center ? "mx-auto text-center" : ""}`}>
 {heading && <Tag className={`text-3xl leading-[1.1] sm:text-4xl md:text-[2.75rem] ${tone === "dark" ? "text-white" : "text-navy"}`}>{heading}</Tag>}
 {intro && <p className={`mt-4 text-lg leading-relaxed ${tone === "dark" ? "text-white/75" : "text-muted"}`}>{intro}</p>}
 </div>
 );
}
