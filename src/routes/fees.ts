import { Router } from 'express'
import { estimateTransactionFee } from '../services/fee-estimation.js'

const router = Router()

router.get('/', async (_req, res) => {
  const estimate = await estimateTransactionFee()
  res.json(estimate)
})

export default router
