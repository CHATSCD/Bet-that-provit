'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LearnDatActions({
  challengeId,
  userId,
  challengerId,
  opponentId,
  status,
  opponentName,
}: {
  challengeId: string
  userId: string
  challengerId: string
  opponentId: string
  status: string
  opponentName: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isOpponent = userId === opponentId
  const isParticipant = userId === challengerId || userId === opponentId

  async function respond(action: 'accept' | 'decline') {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/learndat/${challengeId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    const data = await res.json()
    if (data.success) router.refresh()
    else { setError(data.error ?? 'Failed'); setLoading(false) }
  }

  async function declareWinner(winnerId: string) {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/learndat/${challengeId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnerId }),
    })
    const data = await res.json()
    if (data.success) router.refresh()
    else { setError(data.error ?? 'Failed'); setLoading(false) }
  }

  if (status === 'pending' && isOpponent) {
    return (
      <div className="flex flex-col gap-2">
        {error && <p className="font-mono text-[11px] text-[#FF003C]">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={() => respond('decline')}
            disabled={loading}
            className="flex-1 py-3 border border-[#1a1a1a] font-ops text-sm tracking-widest uppercase text-[#333] hover:border-[#333] transition-colors disabled:opacity-40"
          >
            Decline
          </button>
          <button
            onClick={() => respond('accept')}
            disabled={loading}
            className="flex-1 py-3 bg-[#00FF88] font-ops text-sm tracking-widest uppercase text-black disabled:opacity-30 active:scale-95 transition-all"
          >
            {loading ? 'Accepting...' : 'Accept & Stake'}
          </button>
        </div>
      </div>
    )
  }

  if (status === 'pending' && !isOpponent) {
    return <p className="font-oswald text-sm text-[#555] text-center">Waiting for @{opponentName} to respond...</p>
  }

  if (status === 'active' && isParticipant) {
    return (
      <div className="flex flex-col gap-3">
        <div className="font-mono text-[10px] text-[#333] uppercase tracking-widest text-center">Who won?</div>
        {error && <p className="font-mono text-[11px] text-[#FF003C] text-center">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={() => declareWinner(userId)}
            disabled={loading}
            className="flex-1 py-3 bg-[#00FF88] font-ops text-sm tracking-widest uppercase text-black disabled:opacity-30 active:scale-95 transition-all"
          >
            I Won
          </button>
          <button
            onClick={() => declareWinner(userId === challengerId ? opponentId : challengerId)}
            disabled={loading}
            className="flex-1 py-3 border border-[#1a1a1a] font-ops text-sm tracking-widest uppercase text-white hover:border-[#333] transition-colors disabled:opacity-40"
          >
            @{opponentName} Won
          </button>
        </div>
        <p className="font-mono text-[9px] text-[#1a1a1a] text-center tracking-wide">
          Self-reported for now — whoever confirms first settles the pot.
        </p>
      </div>
    )
  }

  if (status === 'declined') {
    return <p className="font-oswald text-sm text-[#555] text-center">Challenge declined.</p>
  }

  return null
}
