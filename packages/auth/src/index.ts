import { prisma } from "@northville/database";
import { ALL_PERMISSIONS } from "@northville/content";
import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "northville_admin_session";
const encoder = new TextEncoder();

export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

/** `version` is the user's sessionVersion. Raising it in the database ends every older sign in. */
export async function createSessionToken(userId: string, secret: string, version = 0, expiresIn = "12h") {
  return new SignJWT({ userId, v: version })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encoder.encode(secret));
}

/** Edge-safe check (no DB): is this a validly signed, unexpired token? */
export async function verifySessionToken(token: string, secret: string): Promise<{ userId: string; version: number } | null> {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    return typeof payload.userId === "string" ? { userId: payload.userId, version: typeof payload.v === "number" ? payload.v : 0 } : null;
  } catch {
    return null;
  }
}

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  roleName: string;
  isSuperAdmin: boolean;
  permissions: string[];
};

/** Loads the user and everything they are allowed to do. Null if inactive or missing. */
export async function loadUser(userId: string, version = 0): Promise<CurrentUser | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!user || !user.isActive || user.sessionVersion !== version) return null;
  const isSuperAdmin = !!process.env.SUPERADMIN_EMAIL && user.email.toLowerCase() === process.env.SUPERADMIN_EMAIL.toLowerCase();
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roleName: isSuperAdmin ? "Super Admin" : (user.role?.name ?? "No role"),
    isSuperAdmin,
    permissions: isSuperAdmin ? ALL_PERMISSIONS : (user.role?.permissions ?? []),
  };
}

export const hasPermission = (u: CurrentUser, key: string) => u.permissions.includes(key);
