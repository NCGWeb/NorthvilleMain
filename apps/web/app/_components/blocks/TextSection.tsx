import { cleanHtml } from "@northville/core";
import { Section, SectionHead } from "../ui";
import { str, type BlockProps } from "./types";

export function TextSection({ data }: BlockProps) {
  const center = str(data.align) === "center";
  return (
    <Section>
      <div className={`mx-auto max-w-3xl ${center ? "text-center" : ""}`}>
        <SectionHead heading={str(data.heading)} center={center} />
        <div className="prose-nv" dangerouslySetInnerHTML={{ __html: cleanHtml(str(data.body)) }} />
      </div>
    </Section>
  );
}
