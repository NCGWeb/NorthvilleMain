import { prisma } from "@northville/database";

export async function audit(userId: string, action: string, target: string, summary = "") {
  await prisma.auditLog.create({ data: { userId, action, target, summary } }).catch(() => {});
  // Keep 12 months. Pruning on a small share of writes avoids needing a scheduled job.
  if (Math.random() < 0.02) await prisma.auditLog.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 365 * 86400_000) } } }).catch(() => {});
}
