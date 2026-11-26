import { Router } from 'express'

const router = Router()

const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'

router.get('/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params
    const { limit = '10', cursor, order = 'desc' } = req.query

    const params = new URLSearchParams({
      limit: String(limit),
      order: String(order),
    })
    if (cursor) params.set('cursor', String(cursor))

    const response = await fetch(
      `${HORIZON_URL}/accounts/${accountId}/transactions?${params}`,
    )

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch from Horizon' })
    }

    const data = await response.json()
    const transactions = data._embedded?.records?.map((tx: any) => ({
      id: tx.id,
      hash: tx.hash,
      ledger: tx.ledger,
      createdAt: tx.created_at,
      sourceAccount: tx.source_account,
      operationCount: tx.operation_count,
      feeCharged: tx.fee_charged,
      successful: tx.successful,
    })) || []

    res.json({
      transactions,
      cursor: transactions.length > 0 ? transactions[transactions.length - 1].id : null,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transaction history' })
  }
})

export default router
