import { getSettings } from "@northville/core";
import { Section, SectionHead } from "../ui";
import { str, type BlockProps } from "./types";
import { EnquiryForm } from "../EnquiryForm";

export async function ContactForm({ data }: BlockProps) {
  const { text } = await getSettings();
  return (
    <Section tone="white">
      <div className="mx-auto max-w-3xl">
        <SectionHead heading={str(data.heading)} intro={str(data.intro)} />
        <EnquiryForm successMessage={str(data.successMessage) || text.formSuccess} labels={{ name: text.formName, email: text.formEmail, phone: text.formPhone, message: text.formMessage, send: text.formSend, sending: text.formSending, error: text.formError }} />
      </div>
    </Section>
  );
}
