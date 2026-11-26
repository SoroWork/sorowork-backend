import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params

    const user = await prisma.user.findUnique({ where: { walletAddress } })
    if (!user) return res.status(404).json({ error: 'Worker not found' })

    const approvedSubmissions = await prisma.submission.findMany({
      where: { contributorId: user.id, status: 'APPROVED' },
      include: { task: { select: { rewardAmount: true, tags: true, communityId: true, updatedAt: true } } },
    })

    const totalEarned = approvedSubmissions.reduce((sum, s) => sum + Number(s.task.rewardAmount), 0)
    const tasksByMonth: Record<string, number> = {}

    for (const sub of approvedSubmissions) {
      const month = sub.task.updatedAt.toISOString().slice(0, 7)
      tasksByMonth[month] = (tasksByMonth[month] || 0) + Number(sub.task.rewardAmount)
    }

    res.json({
      walletAddress,
      totalEarned,
      tasksCompleted: approvedSubmissions.length,
      averagePerTask: approvedSubmissions.length > 0 ? totalEarned / approvedSubmissions.length : 0,
      earningsByMonth: tasksByMonth,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch earnings' })
  }
})

export default router
