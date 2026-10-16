import Image from "next/image";
import { SmartLink, WRAP } from "../ui";
import { str, type BlockProps } from "./types";

const TONES: Record<string, string> = {
  gold: "linear-gradient(90deg, #e4e4e4 0%, #dcdcdc 35%, #d6bf6a 100%)",
  light: "#f3f5f8",
  navy: "#00063e",
};

export function Banner({ data }: BlockProps) {
  const src = str(data.image);
  if (!src) return null;
  const img = <Image src={src} alt={str(data.alt)} width={2400} height={450} sizes="(min-width:1024px) 900px, 100vw" className="mx-auto h-auto w-full max-w-[900px]" />;
  const href = str(data.href);
  return (
    <section style={{ background: TONES[str(data.tone)] ?? TONES.gold }}>
      <div className={`${WRAP} py-1`}>{href ? <SmartLink href={href}>{img}</SmartLink> : img}</div>
    </section>
  );
}
