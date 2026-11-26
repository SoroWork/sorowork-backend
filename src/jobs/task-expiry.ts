import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const EXPIRY_DAYS = parseInt(process.env.TASK_EXPIRY_DAYS || '30', 10)

export async function expireOldTasks() {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - EXPIRY_DAYS)

  const expired = await prisma.task.updateMany({
    where: {
      status: 'OPEN',
      createdAt: { lt: cutoff },
    },
    data: { status: 'CANCELLED' },
  })

  if (expired.count > 0) {
    console.log(`[task-expiry] Expired ${expired.count} tasks older than ${EXPIRY_DAYS} days`)
  }

  return expired.count
}

export function scheduleTaskExpiry(intervalMs = 3600000) {
  console.log(`[task-expiry] Scheduled every ${intervalMs / 60000} minutes`)
  setInterval(expireOldTasks, intervalMs)
  expireOldTasks()
}
