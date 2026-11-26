import type { Request, Response, NextFunction } from 'express'

const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'

export async function checkWalletBalance(req: Request, res: Response, next: NextFunction) {
  const { walletAddress, rewardAmount } = req.body

  if (!walletAddress || !rewardAmount) return next()

  try {
    const response = await fetch(`${HORIZON_URL}/accounts/${walletAddress}`)
    if (!response.ok) {
      return res.status(400).json({ error: 'Could not verify wallet balance' })
    }

    const account = await response.json()
    const nativeBalance = account.balances?.find(
      (b: any) => b.asset_type === 'native',
    )

    if (!nativeBalance || parseFloat(nativeBalance.balance) < 1) {
      return res.status(400).json({
        error: 'Insufficient XLM balance for transaction fees',
        minimumRequired: '1 XLM',
        currentBalance: nativeBalance?.balance || '0',
      })
    }

    next()
  } catch {
    next()
  }
}
