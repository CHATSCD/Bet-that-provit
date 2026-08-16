export type CurrencyCode = 'betdat' | 'betit' | 'provcoins'

export const CURRENCY_META: Record<CurrencyCode, { label: string; short: string; color: string }> = {
  betdat:    { label: 'BetDat',    short: 'BD', color: '#00CFFF' },
  betit:     { label: 'BetIt',     short: 'BI', color: '#00FF88' },
  provcoins: { label: 'ProvCoins', short: 'PC', color: '#FFD700' },
}

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  return `${amount.toLocaleString('en-US')} ${CURRENCY_META[currency].short}`
}

export function formatUsdCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

// BetIt redeems at a fixed 15 BetIt = 1 cent (1500 BetIt = $1.00).
// Mirrors the rate baked into the request_redemption() RPC (p_amount_betit * 100 / 1500).
export const BETIT_PER_USD_CENT = 15

export function betitToUsdCents(betit: number): number {
  return Math.floor(betit / BETIT_PER_USD_CENT)
}
