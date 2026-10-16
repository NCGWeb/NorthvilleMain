import Image from "next/image";
import { SmartLink, WRAP } from "./ui";
import type { Settings } from "@northville/core";

/** Slim announcement strip above the menu. Edited under Site settings, Top bar. */
export function TopBar({ a }: { a: Settings["announcement"] }) {
  if (!a.enabled || !a.title) return null;
  const inner = (
    <div className={`${WRAP} flex h-[52px] items-center justify-center gap-4 text-sm text-ink`}>
      {a.badge && <Image src={a.badge} alt="" width={40} height={40} priority className="h-9 w-9 shrink-0" />}
      <p className="truncate font-sans"><strong className="font-semibold text-navy">{a.title}</strong>{a.text && <span className="hidden sm:inline"> <span className="text-ink/50">|</span> {a.text}</span>}</p>
    </div>
  );
  return (
    <div className="relative z-40 h-[52px]" style={{ background: "linear-gradient(90deg, #e4e4e4 0%, #dcdcdc 40%, #d6bf6a 100%)" }}>
      {a.href ? <SmartLink href={a.href} className="block">{inner}</SmartLink> : inner}
    </div>
  );
}
