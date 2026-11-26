const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'
const SOROBAN_RPC_URL = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'

interface NetworkStatus {
  horizon: { reachable: boolean; latencyMs: number | null }
  sorobanRpc: { reachable: boolean; latencyMs: number | null }
  healthy: boolean
}

async function checkEndpoint(url: string, path: string): Promise<{ reachable: boolean; latencyMs: number | null }> {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const response = await fetch(`${url}${path}`, { signal: controller.signal })
    clearTimeout(timeout)
    return { reachable: response.ok, latencyMs: Date.now() - start }
  } catch {
    return { reachable: false, latencyMs: null }
  }
}

export async function getStellarNetworkHealth(): Promise<NetworkStatus> {
  const [horizon, sorobanRpc] = await Promise.all([
    checkEndpoint(HORIZON_URL, '/'),
    checkEndpoint(SOROBAN_RPC_URL, '/'),
  ])

  return {
    horizon,
    sorobanRpc,
    healthy: horizon.reachable && sorobanRpc.reachable,
  }
}
