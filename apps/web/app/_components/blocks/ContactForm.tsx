import { Section, SectionHead } from "../ui";
import { str, type BlockProps } from "./types";
import { EnquiryForm } from "../EnquiryForm";

export function ContactForm({ data }: BlockProps) {
  return (
    <Section tone="white">
      <div className="mx-auto max-w-3xl">
        <SectionHead heading={str(data.heading)} intro={str(data.intro)} />
        <EnquiryForm successMessage={str(data.successMessage) || "Thank you. We will get back to you shortly."} />
      </div>
    </Section>
  );
}
