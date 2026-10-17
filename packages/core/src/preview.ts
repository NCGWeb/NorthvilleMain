import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed, short-lived links that let an editor see an unpublished draft on the real website.
 * Both apps share REVALIDATE_SECRET, so the admin can sign and the website can check without a database lookup.
 */
const secret = () => process.env.REVALIDATE_SECRET ?? "";
const mac = (id: string, exp: number) => createHmac("sha256", secret()).update(`${id}.${exp}`).digest("hex");

export function signPreviewToken(pageId: string, minutes = 120): string {
  const exp = Date.now() + minutes * 60_000;
  return `${exp}.${mac(pageId, exp)}`;
}

export function verifyPreviewToken(pageId: string, token: string | undefined): boolean {
  if (!token || !secret()) return false;
  const [expRaw, sig = ""] = token.split(".");
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const want = Buffer.from(mac(pageId, exp));
  const got = Buffer.from(sig);
  return want.length === got.length && timingSafeEqual(want, got);
}
