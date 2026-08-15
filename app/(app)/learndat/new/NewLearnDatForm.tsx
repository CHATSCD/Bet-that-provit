'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Brain } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NewLearnDatForm({ ownedQuantity }: { ownedQuantity: number }) {
  const router = useRouter()
  const [opponentUsername, setOpponentUsername] = useState('')
  const [stakeAmount, setStakeAmount] = useState(50)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setLoading(true)
    setError('')

    const res = await fetch('/api/learndat/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opponentUsername, stakeAmount, question: question || undefined }),
    })
    const data = await res.json()

    if (data.success) {
      router.push(`/learndat/${data.id}`)
    } else {
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
    }
  }

  if (ownedQuantity <= 0) {
    return (
      <div className="min-h-dvh bg-black flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Brain size={40} className="text-[#00FF88]" />
        <h1 className="font-ops text-xl text-white">You Need a LearnDat Kit</h1>
        <p className="font-oswald text-sm text-[#555] max-w-xs">
          Sending a challenge spends one LearnDat token from a kit. Grab one in the Arsenal with ProvCoins.
        </p>
        <Link href="/store"><Button size="lg">Buy a Kit</Button></Link>
        <Link href="/learndat" className="font-mono text-[10px] text-[#333] tracking-widest uppercase">← Back</Link>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-black">
      <div className="flex items-center gap-4 px-5 pt-12 pb-5 border-b border-[#0f0f0f]">
        <Link href="/learndat"><ChevronLeft size={22} className="text-[#333]" /></Link>
        <div>
          <h1 className="font-ops text-xl text-white">New LearnDat</h1>
          <p className="font-mono text-[9px] text-[#00FF88] tracking-widest uppercase">{ownedQuantity} kit token{ownedQuantity === 1 ? '' : 's'} owned</p>
        </div>
      </div>

      <div className="px-5 py-6 flex flex-col gap-6">
        <div>
          <label className="font-mono text-[10px] tracking-widest text-[#333] uppercase block mb-2">Challenge Who?</label>
          <div className="flex items-center border border-[#1a1a1a] bg-[#0a0a0a] focus-within:border-[#00FF88] transition-colors">
            <span className="font-ops text-[#00FF88] pl-4 text-lg">@</span>
            <input
              type="text"
              value={opponentUsername}
              onChange={e => setOpponentUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="theirhandle"
              className="flex-1 bg-transparent text-white font-ops text-lg px-2 py-4 outline-none placeholder:text-[#1a1a1a]"
              autoCapitalize="none"
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] tracking-widest text-[#333] uppercase block mb-2">Stake</label>
          <input
            type="number"
            min={1}
            value={stakeAmount}
            onChange={e => setStakeAmount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-ops text-lg px-4 py-3 outline-none focus:border-[#00FF88] transition-colors"
          />
          <p className="font-mono text-[9px] text-[#333] mt-2 leading-relaxed">
            Charged in your wallet's currency (BetDat in Free Mode, BetIt in Real Money Mode) once accepted. Winner takes 80% of the pot.
          </p>
        </div>

        <div>
          <label className="font-mono text-[10px] tracking-widest text-[#333] uppercase block mb-2">Question / Prompt (optional)</label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="What's the challenge about?"
            rows={3}
            maxLength={200}
            className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-oswald text-sm px-4 py-3 outline-none focus:border-[#00FF88] transition-colors resize-none placeholder:text-[#1a1a1a]"
          />
        </div>

        {error && <p className="font-mono text-[11px] text-[#FF003C] tracking-wide">{error}</p>}

        <Button onClick={submit} loading={loading} disabled={!opponentUsername || stakeAmount < 1} fullWidth size="lg">
          Send Challenge · Uses 1 Kit Token
        </Button>
      </div>
    </div>
  )
}
