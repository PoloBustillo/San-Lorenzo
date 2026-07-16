'use server'

import { prisma } from '@/lib/prisma'

export async function logAudit(params: {
  userId: string
  action: string
  entity: string
  entityId?: string
  details?: Record<string, unknown>
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details as Record<string, string> ?? undefined,
      },
    })
  } catch {
    // Silent fail — audit logging should never block operations
  }
}
