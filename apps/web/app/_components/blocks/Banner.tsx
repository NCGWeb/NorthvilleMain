import Image from "next/image";
import { SmartLink } from "../ui";
import { str, type BlockProps } from "./types";

const TONES: Record<string, string> = {
  gold: "bg-[linear-gradient(90deg,#e4e4e4_0%,#dcdcdc_35%,#d6bf6a_100%)]",
  light: "bg-mist",
  navy: "bg-navy",
};

export function Banner({ data }: BlockProps) {
  const src = str(data.image);
  if (!src) return null;
  const img = <Image src={src} alt={str(data.alt)} width={2400} height={450} sizes="(min-width:1280px) 1100px, 100vw" className="mx-auto h-auto w-full max-w-5xl" />;
  const href = str(data.href);
  return (
    <section className={TONES[str(data.tone)] ?? TONES.gold}>
      <div className="mx-auto max-w-7xl px-5 py-3 sm:px-8">{href ? <SmartLink href={href}>{img}</SmartLink> : img}</div>
    </section>
  );
}
