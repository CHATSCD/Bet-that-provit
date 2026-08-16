'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { betitToUsdCents, formatUsdCents } from '@/lib/currency'

export default function RedeemForm({
  betitBalance,
  betitEarned,
  minimumBetit,
  averagePotCents,
}: {
  betitBalance: number
  betitEarned: number
  minimumBetit: number
  averagePotCents: number
}) {
  const router = useRouter()
  const maxRedeemable = Math.min(betitBalance, betitEarned)
  const [amount, setAmount] = useState(minimumBetit)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function submit() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/redemption/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountBetit: amount }),
    })
    const data = await res.json()
    if (data.success) {
      setSuccess(true)
      router.refresh()
    } else {
      setError(data.error ?? 'Request failed')
    }
    setLoading(false)
  }

  const belowMinimum = amount < minimumBetit
  const overBalance = amount > maxRedeemable

  if (success) {
    return (
      <div className="bg-[rgba(0,255,136,0.05)] border border-[rgba(0,255,136,0.2)] p-5 text-center">
        <div className="font-ops text-lg text-[#00FF88] mb-1">Request Submitted</div>
        <div className="font-oswald text-sm text-[#555]">We'll process your redemption shortly.</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#060606] border border-[#0f0f0f] p-4">
        <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest mb-1">Current Minimum</div>
        <div className="font-ops text-2xl text-[#00FF88]">{minimumBetit.toLocaleString()} BetIt</div>
        <div className="font-mono text-[10px] text-[#555] mt-1">
          Average pot × 2 ({formatUsdCents(averagePotCents)} × 2 = {formatUsdCents(averagePotCents * 2)})
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#060606] border border-[#0f0f0f] p-3 text-center">
          <div className="font-ops text-lg text-white">{betitBalance.toLocaleString()}</div>
          <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest">Balance</div>
        </div>
        <div className="bg-[#060606] border border-[#0f0f0f] p-3 text-center">
          <div className="font-ops text-lg text-white">{betitEarned.toLocaleString()}</div>
          <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest">Earned (redeemable)</div>
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] tracking-widest text-[#333] uppercase block mb-2">Amount to Redeem</label>
        <input
          type="number"
          min={minimumBetit}
          max={maxRedeemable}
          value={amount}
          onChange={e => setAmount(parseInt(e.target.value) || 0)}
          className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-ops text-lg px-4 py-3 outline-none focus:border-[#00FF88] transition-colors"
        />
        <div className="font-mono text-[10px] text-[#555] mt-2">≈ {formatUsdCents(betitToUsdCents(amount))}</div>
        {belowMinimum && <p className="font-mono text-[11px] text-[#FF003C] mt-2">Below the {minimumBetit.toLocaleString()} minimum</p>}
        {overBalance && <p className="font-mono text-[11px] text-[#FF003C] mt-2">More than your redeemable balance</p>}
      </div>

      {error && <p className="font-mono text-[11px] text-[#FF003C]">{error}</p>}

      <Button
        onClick={submit}
        loading={loading}
        disabled={belowMinimum || overBalance || amount <= 0 || maxRedeemable < minimumBetit}
        fullWidth
        size="lg"
      >
        Request Redemption
      </Button>

      {maxRedeemable < minimumBetit && (
        <p className="font-mono text-[10px] text-[#333] text-center">
          Keep earning BetIt in Circles — you need {minimumBetit.toLocaleString()} to hit the current minimum.
        </p>
      )}
    </div>
  )
}
