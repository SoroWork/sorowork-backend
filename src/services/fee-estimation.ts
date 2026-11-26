const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'

interface FeeEstimate {
  baseFee: string
  recommendedFee: string
  maxFee: string
  ledgerCapacityUsage: number
}

export async function estimateTransactionFee(): Promise<FeeEstimate> {
  try {
    const response = await fetch(`${HORIZON_URL}/fee_stats`)
    if (!response.ok) throw new Error('Failed to fetch fee stats')

    const stats = await response.json()

    return {
      baseFee: stats.last_ledger_base_fee || '100',
      recommendedFee: stats.fee_charged?.mode || '100',
      maxFee: stats.fee_charged?.max || '10000',
      ledgerCapacityUsage: parseFloat(stats.ledger_capacity_usage || '0'),
    }
  } catch {
    return {
      baseFee: '100',
      recommendedFee: '100',
      maxFee: '10000',
      ledgerCapacityUsage: 0,
    }
  }
}
