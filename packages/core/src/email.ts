import { Resend } from "resend";

type Mail = { to: string; subject: string; text: string; replyTo?: string };

export type MailResult = "sent" | "failed" | "skipped";

/** Sends through Resend. With no API key (local dev) it logs and returns "skipped". Never throws. */
export async function sendMail(mail: Mail): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email not sent: no RESEND_API_KEY]\nTo: ${mail.to}\nSubject: ${mail.subject}\n${mail.text}`);
    return "skipped";
  }
  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? "Northville Website <onboarding@resend.dev>",
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      replyTo: mail.replyTo,
    });
    if (error) console.error("Resend error", error);
    return error ? "failed" : "sent";
  } catch (e) {
    console.error("Resend error", e);
    return "failed";
  }
}
