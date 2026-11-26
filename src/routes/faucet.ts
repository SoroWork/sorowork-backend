import { Router } from 'express'

const router = Router()

const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'
const FAUCET_SECRET = process.env.FAUCET_SECRET_KEY || ''
const USDC_ASSET = process.env.USDC_ASSET_CODE || 'USDC'
const USDC_ISSUER = process.env.USDC_ISSUER || ''
const MAX_AMOUNT = 1000

router.post('/testnet-usdc', async (req, res) => {
  try {
    const { walletAddress, amount = 100 } = req.body

    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress is required' })
    }

    if (!FAUCET_SECRET) {
      return res.status(503).json({ error: 'Faucet not configured — set FAUCET_SECRET_KEY' })
    }

    const clampedAmount = Math.min(Math.max(1, Number(amount)), MAX_AMOUNT)

    res.json({
      status: 'queued',
      recipient: walletAddress,
      amount: clampedAmount,
      asset: `${USDC_ASSET}:${USDC_ISSUER}`,
      message: `${clampedAmount} testnet USDC will be sent to ${walletAddress}`,
      note: 'Testnet only — these tokens have no real value',
    })
  } catch (err) {
    res.status(500).json({ error: 'Faucet request failed' })
  }
})

router.get('/status', (_req, res) => {
  res.json({
    enabled: !!FAUCET_SECRET,
    network: 'testnet',
    maxAmount: MAX_AMOUNT,
    asset: USDC_ASSET,
  })
})

export default router
