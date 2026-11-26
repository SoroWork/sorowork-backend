import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const SOROBAN_RPC = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'
const TREASURY_CONTRACT = process.env.TREASURY_CONTRACT_ID || ''

interface TreasurySnapshot {
  contractId: string
  balance: string
  syncedAt: string
  healthy: boolean
}

export async function syncTreasuryBalance(): Promise<TreasurySnapshot> {
  try {
    const response = await fetch(SOROBAN_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getContractData',
        params: { contractId: TREASURY_CONTRACT },
      }),
    })

    const data = await response.json()

    return {
      contractId: TREASURY_CONTRACT,
      balance: data.result?.xdr || '0',
      syncedAt: new Date().toISOString(),
      healthy: response.ok,
    }
  } catch {
    return {
      contractId: TREASURY_CONTRACT,
      balance: '0',
      syncedAt: new Date().toISOString(),
      healthy: false,
    }
  }
}

export function scheduleTreasurySync(intervalMs = 300000) {
  console.log(`[treasury-sync] Scheduled every ${intervalMs / 60000} minutes`)
  setInterval(syncTreasuryBalance, intervalMs)
}
