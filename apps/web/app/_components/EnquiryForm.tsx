"use client";
import { useRef, useState } from "react";

export type FormLabels = { name: string; email: string; phone: string; message: string; send: string; sending: string; error: string };

export function EnquiryForm({ successMessage, labels }: { successMessage: string; labels: FormLabels }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const startedAt = useRef(Date.now());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(fd), elapsed: Date.now() - startedAt.current }),
    }).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) { setState("done"); return; }
    setError(json.error ?? labels.error);
    setState("error");
  }

  if (state === "done") {
    return <p role="status" className="rounded-none border border-royal/20 bg-mist p-8 font-sans text-2xl font-semibold text-navy">{successMessage}</p>;
  }
  const field = "w-full rounded-none border border-line bg-white px-4 py-3 text-ink outline-none transition focus:border-royal focus:ring-4 focus:ring-royal/10";
  return (
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <label className="block text-sm font-medium text-navy">{labels.name} *
        <input name="name" required autoComplete="name" className={`${field} mt-1.5`} />
      </label>
      <label className="block text-sm font-medium text-navy">{labels.email} *
        <input name="email" type="email" required autoComplete="email" className={`${field} mt-1.5`} />
      </label>
      <label className="block text-sm font-medium text-navy sm:col-span-2">{labels.phone}
        <input name="phone" type="tel" autoComplete="tel" className={`${field} mt-1.5`} />
      </label>
      <label className="block text-sm font-medium text-navy sm:col-span-2">{labels.message}
        <textarea name="message" rows={5} className={`${field} mt-1.5`} />
      </label>
      {/* Honeypot: real people never see or fill this. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="sm:col-span-2">
        <button disabled={state === "sending"} className="rounded-none bg-royal px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-bright disabled:opacity-60">
          {state === "sending" ? labels.sending : labels.send}
        </button>
        {state === "error" && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
