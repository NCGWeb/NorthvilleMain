import { prisma } from "@northville/database";

export async function audit(userId: string, action: string, target: string, summary = "") {
  await prisma.auditLog.create({ data: { userId, action, target, summary } }).catch(() => {});
}
