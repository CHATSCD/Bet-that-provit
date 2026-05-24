'use client'
import { useState } from 'react'

export default function BuyCoinButton({ packId, price, label }: { packId: string; price: number; label: string }) {
  const [loading, setLoading] = useState(false)

  async function handleBuy() {
    setLoading(true)
    const res = await fetch('/api/coins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packId }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="font-ops text-sm tracking-widest uppercase px-4 py-2.5 bg-[#00FF88] text-black active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
    >
      {loading ? <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : label}
    </button>
  )
}
