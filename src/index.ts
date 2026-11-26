import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import type { Request, Response, NextFunction } from 'express'

import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'
import submissionRoutes from './routes/submissions.js'
import profileRoutes from './routes/profiles.js'
import communityRoutes from './routes/communities.js'
import feedRoutes from './routes/feed.js'
import leaderboardRoutes from './routes/leaderboard.js'
import notificationRoutes from './routes/notifications.js'
import adminRoutes from './routes/admin.js'

export const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/health', async (_req, res) => {
  const { getStellarNetworkHealth } = await import('./utils/stellar-health.js')
  const stellar = await getStellarNetworkHealth()

  res.json({
    status: stellar.healthy ? 'ok' : 'degraded',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    stellar,
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/api/communities', communityRoutes)
app.use('/api/feed', feedRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin', adminRoutes)

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' })
})

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? err.message : undefined })
})

const PORT = parseInt(process.env.PORT || '3001')

app.listen(PORT, () => {
  console.log(`SoroWork API running on port ${PORT}`)
})

export default app
