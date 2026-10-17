"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import { buttonClass } from "./ui";

type Props = { gaId: string; text: string; accept: string; decline: string };
type Choice = "granted" | "denied" | null;

const KEY = "nv-consent";
const read = (): Choice => {
  try { const v = localStorage.getItem(KEY); return v === "granted" || v === "denied" ? v : null; } catch { return null; }
};

/** Google Analytics loads only after the visitor accepts. The choice is remembered on their device. */
export function Analytics({ gaId, text, accept, decline }: Props) {
  const [choice, setChoice] = useState<Choice>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { setChoice(read()); setReady(true); }, []);
  const save = (v: "granted" | "denied") => { try { localStorage.setItem(KEY, v); } catch { /* private mode: the choice lasts for this visit */ } setChoice(v); };

  return (
    <>
      {choice === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="lazyOnload" />
          <Script id="ga" strategy="lazyOnload">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${gaId}",{anonymize_ip:true});`}</Script>
        </>
      )}
      {ready && choice === null && (
        <div role="region" aria-label="Cookies" className="fixed inset-x-0 bottom-0 z-[85] border-t border-line bg-white font-sans sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-sm sm:border">
          <div className="p-4">
            <p className="text-sm leading-relaxed text-ink">{text}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => save("granted")} className={buttonClass("primary", "sm")}>{accept}</button>
              <button type="button" onClick={() => save("denied")} className={buttonClass("outline", "sm")}>{decline}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
