'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FreeJoinButton({ circleId }: { circleId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleJoin() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/circle/free-join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ circleId }),
    })
    const data = await res.json()
    if (data.success) {
      router.push(`/circle/${circleId}?joined=true`)
    } else {
      setError(data.error ?? 'Could not join')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="font-mono text-[11px] text-[#FF003C] tracking-wide">{error}</p>}
      <button
        onClick={handleJoin}
        disabled={loading}
        className="w-full py-4 bg-[#00CFFF] font-ops text-base tracking-widest uppercase text-black active:scale-95 transition-all disabled:opacity-40 shadow-[0_0_20px_rgba(0,207,255,0.3)]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            Joining...
          </span>
        ) : (
          'Stake & Join'
        )}
      </button>
    </div>
  )
}
