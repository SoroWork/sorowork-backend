const SOROBAN_RPC = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'
const ESCROW_CONTRACT = process.env.BOUNTY_CONTRACT_ID || ''

interface ContractEvent {
  type: string
  ledger: number
  contractId: string
  topic: string[]
  value: any
}

export async function getLatestEvents(startLedger?: number): Promise<ContractEvent[]> {
  try {
    const body: any = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getEvents',
      params: {
        filters: [{ type: 'contract', contractIds: [ESCROW_CONTRACT] }],
        pagination: { limit: 20 },
      },
    }

    if (startLedger) body.params.startLedger = startLedger

    const response = await fetch(SOROBAN_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return (data.result?.events || []).map((e: any) => ({
      type: e.type,
      ledger: e.ledger,
      contractId: e.contractId,
      topic: e.topic || [],
      value: e.value,
    }))
  } catch {
    return []
  }
}

export function startEventPolling(intervalMs = 10000) {
  let lastLedger = 0
  console.log(`[event-listener] Polling escrow events every ${intervalMs / 1000}s`)

  setInterval(async () => {
    const events = await getLatestEvents(lastLedger || undefined)
    for (const event of events) {
      console.log(`[event] ${event.type} at ledger ${event.ledger}`)
      if (event.ledger > lastLedger) lastLedger = event.ledger
    }
  }, intervalMs)
}
