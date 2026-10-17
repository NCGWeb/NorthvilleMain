"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, MessageCircle, X } from "lucide-react";
import { WhatsappIcon } from "./Icons";
import { Spinner } from "./Spinner";

type Start = { title: string; greeting: string; placeholder: string; pills: string[]; whatsappNumber: string; whatsappMessage: string };
type Msg = { from: "bot" | "user"; text: string; link?: { label: string; href: string }; matched?: boolean };

/** Chat window with tap-to-ask pills. It only talks to /api/chat, so the engine behind it can change (see docs/CHATBOT.md). */
export function ChatWidget({ start }: { start: Start }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: start.greeting }]);
  const [pills, setPills] = useState<string[]>(start.pills);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const asked = useRef<string[]>([]);
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy, open]);
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(message: string) {
    const m = message.trim();
    if (!m || busy) return;
    setMsgs((x) => [...x, { from: "user", text: m }]);
    setText(""); setPills([]); setBusy(true);
    asked.current = [...asked.current, m].slice(-20);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: m, asked: asked.current }) });
      const j = await res.json();
      // A short pause makes the reply feel natural instead of instant.
      await new Promise((r) => setTimeout(r, 350));
      setMsgs((x) => [...x, { from: "bot", text: j.text ?? "Sorry, something went wrong. Please try again.", link: j.link, matched: j.matched }]);
      setPills(j.suggestions ?? []);
    } catch {
      setMsgs((x) => [...x, { from: "bot", text: "Sorry, I could not reach the server. Please try again, or contact us directly.", matched: false }]);
    } finally { setBusy(false); }
  }

  const wa = start.whatsappNumber ? `https://wa.me/${start.whatsappNumber.replace(/\D/g, "")}${start.whatsappMessage ? `?text=${encodeURIComponent(start.whatsappMessage)}` : ""}` : "";
  const lastUnmatched = msgs.length > 1 && msgs[msgs.length - 1].from === "bot" && msgs[msgs.length - 1].matched === false;

  return (
    <>
      {!open && (
        <button type="button" onClick={() => setOpen(true)} aria-label={`Open chat: ${start.title}`} className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-sm bg-royal px-4 py-3.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-navy sm:bottom-6 sm:right-6">
          <MessageCircle size={20} aria-hidden /> <span className="hidden sm:inline">{start.title}</span>
        </button>
      )}
      {open && (
        <div role="dialog" aria-label={start.title} className="chat-in fixed inset-x-0 bottom-0 z-[80] flex h-[88svh] flex-col overflow-hidden border border-line bg-white font-sans shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[34rem] sm:w-[23.5rem]">
          <div className="flex items-center justify-between bg-navy px-4 py-3.5 text-white">
            <div><p className="font-semibold">{start.title}</p><p className="text-xs text-white/70">Quick answers, any time</p></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="grid h-8 w-8 place-items-center hover:bg-white/10"><X size={18} /></button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-mist/60 p-4" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 text-[14px] leading-relaxed ${m.from === "user" ? "bg-royal text-white" : "border border-line bg-white text-ink"}`}>
                  <p className="whitespace-pre-line">{m.text}</p>
                  {m.link && <a href={m.link.href} {...(m.link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="mt-2 inline-block font-semibold text-royal underline-offset-2 hover:underline">{m.link.label} &rarr;</a>}
                </div>
              </div>
            ))}
            {busy && <div className="flex justify-start"><div className="flex items-center gap-1 border border-line bg-white px-3.5 py-3" aria-label="Typing">{[0, 1, 2].map((d) => (<span key={d} className="chat-dot h-1.5 w-1.5 rounded-full bg-muted" style={{ animationDelay: `${d * 0.15}s` }} />))}</div></div>}
            {lastUnmatched && !busy && (
              <div className="flex flex-wrap gap-2">
                <a href="/contact" className="border border-royal px-3 py-1.5 text-[13px] font-semibold text-royal hover:bg-royal hover:text-white">Send an enquiry</a>
                {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 border border-royal px-3 py-1.5 text-[13px] font-semibold text-royal hover:bg-royal hover:text-white"><WhatsappIcon size={14} /> WhatsApp us</a>}
              </div>
            )}
            <div ref={end} />
          </div>

          {pills.length > 0 && !busy && (
            <div className="flex gap-2 overflow-x-auto border-t border-line bg-white px-3 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible" role="group" aria-label="Suggested questions">
              {pills.map((p) => (<button key={p} type="button" onClick={() => send(p)} className="shrink-0 border border-line bg-white px-3 py-1.5 text-left text-[13px] font-medium text-ink transition-colors hover:border-royal hover:text-royal">{p}</button>))}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-center gap-2 border-t border-line bg-white p-3">
            <input ref={input} value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder={start.placeholder} aria-label="Your question" className="min-w-0 flex-1 border border-line px-3 py-2.5 text-[14px] outline-none focus:border-royal" />
            <button disabled={busy || !text.trim()} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center bg-royal text-white transition-colors hover:bg-navy disabled:opacity-40">{busy ? <Spinner size={16} /> : <ArrowUp size={18} />}</button>
          </form>
        </div>
      )}
    </>
  );
}
