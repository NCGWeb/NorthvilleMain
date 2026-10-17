import { prisma } from "@northville/database";

const WINDOW_MS = 15 * 60_000;

/** True when this key has already failed `max` times in the last 15 minutes. Stored in the database so every server shares one count. */
export async function isRateLimited(key: string, max: number): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);
  return (await prisma.loginAttempt.count({ where: { key, createdAt: { gte: since } } })) >= max;
}

export async function recordFailure(keys: string[]): Promise<void> {
  await prisma.loginAttempt.createMany({ data: keys.map((key) => ({ key })) });
  // Housekeeping: drop rows older than a day now and then.
  if (Math.random() < 0.05) await prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 3600_000) } } }).catch(() => {});
}

export async function clearFailures(keys: string[]): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { key: { in: keys } } }).catch(() => {});
}
