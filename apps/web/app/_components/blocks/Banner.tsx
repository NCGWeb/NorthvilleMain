import Image from "next/image";
import { getMediaMeta } from "@northville/core";
import { SmartLink, WRAP } from "../ui";
import { str, type BlockProps } from "./types";

const TONES: Record<string, string> = {
  gold: "var(--nv-gold)",
  light: "#f3f5f8",
  navy: "#00063e",
};

export async function Banner({ data }: BlockProps) {
  const src = str(data.image);
  if (!src) return null;
  // Use the picture's real proportions (saved at upload) so the page never jumps when it loads.
  const meta = (await getMediaMeta()).get(src);
  const img = <Image src={src} alt={str(data.alt)} width={meta?.width ?? 2400} height={meta?.height ?? 450} sizes="(min-width:1024px) 900px, 100vw" className="mx-auto h-auto w-full max-w-[900px]" />;
  const href = str(data.href);
  return (
    <section style={{ background: TONES[str(data.tone)] ?? TONES.gold }}>
      <div className={`${WRAP} py-1`}>{href ? <SmartLink href={href}>{img}</SmartLink> : img}</div>
    </section>
  );
}
