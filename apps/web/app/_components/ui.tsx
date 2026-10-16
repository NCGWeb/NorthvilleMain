import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { LinkPending } from "./LinkPending";

export const isExternal = (href: string) => /^https?:\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");

/** One content width for the whole site. */
export const WRAP = "mx-auto w-full max-w-[1120px] px-6 lg:px-8";

export function SmartLink({ href, className, children, ...rest }: { href: string; className?: string; children: ReactNode } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  if (isExternal(href)) {
    return <a href={href} className={className} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>{children}</a>;
  }
  return <Link href={href} className={className} {...rest}>{children}</Link>;
}

const base = "group lift inline-flex items-center gap-2 rounded-sm px-5 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2";
const variants = {
  primary: "bg-royal text-white hover:bg-navy focus-visible:outline-royal",
  light: "bg-white text-navy hover:bg-sky focus-visible:outline-white",
  ghost: "border border-white/50 text-white hover:bg-white/10 focus-visible:outline-white",
  outline: "border border-navy/25 text-navy hover:border-royal hover:text-royal focus-visible:outline-royal",
} as const;

export function Button({ href, variant = "primary", children, arrow = true }: { href: string; variant?: keyof typeof variants; children: ReactNode; arrow?: boolean }) {
  return (
    <SmartLink href={href} className={`${base} ${variants[variant]}`}>
      {children}
      <LinkPending />
      {arrow && <ArrowRight size={15} aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5" />}
    </SmartLink>
  );
}

/** Text link with an arrow, the main way to point somewhere inside copy. */
export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <SmartLink href={href} className="group inline-flex items-center gap-1.5 text-[15px] font-semibold text-royal hover:text-navy">
      {children}<LinkPending /><ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
    </SmartLink>
  );
}

export function Section({ children, tone = "white", className = "", id }: { children: ReactNode; tone?: "white" | "mist" | "navy"; className?: string; id?: string }) {
  const bg = tone === "mist" ? "bg-mist" : tone === "navy" ? "bg-navy text-white" : "bg-white";
  return (
    <section id={id} className={`${bg} scroll-mt-20 ${className}`}>
      <div className={`${WRAP} py-14 md:py-[72px]`}>{children}</div>
    </section>
  );
}

export function SectionHead({ heading, intro, tone = "light", as: Tag = "h2", center }: { heading?: string; intro?: string; tone?: "light" | "dark"; as?: "h1" | "h2"; center?: boolean }) {
  if (!heading && !intro) return null;
  return (
    <div className={`mb-10 max-w-2xl md:mb-12 ${center ? "mx-auto text-center" : ""}`}>
      {heading && <Tag className={`text-[1.75rem] leading-[1.2] sm:text-[2rem] ${tone === "dark" ? "text-white" : "text-navy"}`}>{heading}</Tag>}
      {intro && <p className={`mt-4 text-[1.0625rem] leading-relaxed ${tone === "dark" ? "text-white/75" : "text-muted"}`}>{intro}</p>}
    </div>
  );
}
