import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/community/:communityId/completion', async (req, res) => {
  try {
    const { communityId } = req.params
    const { from, to } = req.query

    const where: any = { communityId, status: 'APPROVED' }
    if (from || to) {
      where.updatedAt = {}
      if (from) where.updatedAt.gte = new Date(from as string)
      if (to) where.updatedAt.lte = new Date(to as string)
    }

    const tasks = await prisma.task.findMany({ where })
    const totalTasks = tasks.length
    const totalReward = tasks.reduce((sum, t) => sum + Number(t.rewardAmount), 0)
    const uniqueWorkers = new Set(
      (await prisma.submission.findMany({
        where: { taskId: { in: tasks.map(t => t.id) }, status: 'APPROVED' },
        select: { contributorId: true },
      })).map(s => s.contributorId)
    ).size

    res.json({
      communityId,
      period: { from: from || null, to: to || null },
      completedTasks: totalTasks,
      totalRewardDistributed: totalReward,
      uniqueWorkers,
      averageRewardPerTask: totalTasks > 0 ? totalReward / totalTasks : 0,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate report' })
  }
})

export default router
