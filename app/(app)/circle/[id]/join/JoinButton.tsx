'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinButton({
  circleId,
  circleName,
  totalChargeCents,
  hasStripeCustomer,
  isAdmin,
}: {
  circleId: string
  circleName: string
  totalChargeCents: number
  hasStripeCustomer: boolean
  isAdmin?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleAdminJoin() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ circleId }),
    })
    const data = await res.json()
    if (data.success) {
      router.push(`/circle/${circleId}?joined=true`)
    } else {
      setError(data.error ?? 'Join failed.')
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!hasStripeCustomer) {
      setError('Connect a payment method in your wallet first.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/stripe/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ circleId }),
    })
    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      setError(data.error ?? 'Payment setup failed. Try again.')
      setLoading(false)
    }
  }

  if (isAdmin) {
    return (
      <div className="flex flex-col gap-2">
        {error && <p className="font-mono text-[11px] text-[#FF003C] tracking-wide">{error}</p>}
        <button
          onClick={handleAdminJoin}
          disabled={loading}
          className="w-full py-4 bg-[#00CFFF] font-ops text-base tracking-widest uppercase text-black active:scale-95 transition-all disabled:opacity-40 shadow-[0_0_20px_rgba(0,207,255,0.3)]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Joining...
            </span>
          ) : (
            '⚡ Admin Join — Free'
          )}
        </button>
        <p className="font-mono text-[9px] text-[#1a1a1a] text-center tracking-wide">
          Admin bypass — no payment required.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="font-mono text-[11px] text-[#FF003C] tracking-wide">{error}</p>}
      <button
        onClick={handleJoin}
        disabled={loading}
        className="w-full py-4 bg-[#00FF88] font-ops text-base tracking-widest uppercase text-black active:scale-95 transition-all disabled:opacity-40 shadow-[0_0_20px_rgba(0,255,136,0.3)]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            Setting Up Payment...
          </span>
        ) : (
          `Pay $${(totalChargeCents / 100).toFixed(2)} · #BetThat`
        )}
      </button>
      <p className="font-mono text-[9px] text-[#1a1a1a] text-center tracking-wide">
        Secure payment via Stripe. Buy-in held in escrow until winner is determined.
      </p>
    </div>
  )
}
