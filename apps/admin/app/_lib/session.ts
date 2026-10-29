import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loadUser, SESSION_COOKIE, verifySessionToken, type CurrentUser } from "@northville/auth";

// Cached per request: the layout and the page both ask, but the database is read once.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const secret = process.env.ADMIN_SESSION_JWT_SECRET;
  if (!token || !secret) return null;
  const session = await verifySessionToken(token, secret);
  return session ? loadUser(session.userId, session.version) : null;
});

/** For pages: signed in and allowed, otherwise redirect. */
export async function requireUser(permission?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (permission && !user.permissions.includes(permission)) redirect("/?denied=1");
  return user;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** For API routes: throws a plain-language HttpError when not allowed. */
export async function apiUser(permission: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Please sign in again.");
  if (!user.permissions.includes(permission)) throw new HttpError(403, "You do not have permission to do that.");
  return user;
}
