'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { ChevronLeft, Lock, Globe, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

const USD_BUY_IN_OPTIONS = [5, 10, 20, 25, 50, 100]
const BETDAT_BUY_IN_OPTIONS = [0, 50, 100, 250, 500, 1000]

export default function CreateCircleForm({
  mode,
  kycStatus,
  betdatBalance,
}: {
  mode: string
  kycStatus: string
  betdatBalance: number
}) {
  const router = useRouter()
  const supabase = createClient()

  const isRealMoney = mode === 'real_money'
  const isKycApproved = kycStatus === 'full_approved'

  const [name, setName] = useState('')
  const [challenge, setChallenge] = useState('')
  const [buyIn, setBuyIn] = useState(isRealMoney ? 10 : 0)
  const [isPublic, setIsPublic] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const stripeFee = parseFloat((buyIn * 0.029 + 0.30).toFixed(2))
  const platformFee = parseFloat((buyIn * 0.1).toFixed(2))
  const estimatedPayout = parseFloat((buyIn - stripeFee - platformFee).toFixed(2))

  if (isRealMoney && !isKycApproved) {
    return (
      <div className="min-h-dvh bg-black flex flex-col items-center justify-center gap-4 px-6 text-center">
        <ShieldAlert size={40} className="text-[#FFD700]" />
        <h1 className="font-ops text-xl text-white">Verification Required</h1>
        <p className="font-oswald text-sm text-[#555] max-w-xs">
          Real Money Circles need ID verification first. It only takes a couple minutes.
        </p>
        <Link href="/kyc">
          <Button size="lg">{kycStatus === 'pending' ? 'Check Verification Status' : 'Verify Now'}</Button>
        </Link>
        <Link href="/home" className="font-mono text-[10px] text-[#333] tracking-widest uppercase">← Back Home</Link>
      </div>
    )
  }

  async function handleCreate() {
    if (!name || !challenge || !startDate || !endDate) {
      setError('Fill out all fields')
      return
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date')
      return
    }
    if (!isRealMoney && buyIn > betdatBalance) {
      setError('Not enough BetDat for that stake')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data, error: dbError } = await supabase
      .from('circles')
      .insert({
        creator_id: user.id,
        name,
        challenge,
        buy_in_amount: buyIn,
        currency: isRealMoney ? 'usd' : 'betdat',
        is_public: isPublic,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
      })
      .select('id')
      .single()

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    if (!isRealMoney) {
      // Free circles have no Stripe step — stake BetDat and join immediately.
      const res = await fetch('/api/circle/free-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circleId: data.id }),
      })
      const joinData = await res.json()
      if (!joinData.success) {
        setError(joinData.error ?? 'Could not join your own circle')
        setLoading(false)
        return
      }
    } else {
      await supabase.from('circle_members').insert({ circle_id: data.id, user_id: user.id })
    }

    router.push(`/circle/${data.id}`)
  }

  return (
    <div className="min-h-dvh bg-black">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-12 pb-5 border-b border-[#0f0f0f]">
        <Link href="/home">
          <ChevronLeft size={24} className="text-[#333]" />
        </Link>
        <div>
          <h1 className="font-ops text-xl text-white">Create Circle</h1>
          <span className={`font-mono text-[9px] tracking-widest uppercase ${isRealMoney ? 'text-[#00FF88]' : 'text-[#00CFFF]'}`}>
            {isRealMoney ? 'Real Money · BetIt' : 'Free Mode · BetDat'}
          </span>
        </div>
      </div>

      <div className="px-5 py-6 flex flex-col gap-6">

        {/* Circle Name */}
        <div>
          <label className="font-mono text-[10px] tracking-widest text-[#333] uppercase block mb-2">
            Circle Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Early Risers Gang"
            maxLength={50}
            className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-ops px-4 py-3 outline-none focus:border-[#00FF88] transition-colors placeholder:text-[#1a1a1a] text-base"
          />
        </div>

        {/* Challenge */}
        <div>
          <label className="font-mono text-[10px] tracking-widest text-[#333] uppercase block mb-2">
            The Challenge
          </label>
          <textarea
            value={challenge}
            onChange={e => setChallenge(e.target.value)}
            placeholder="e.g. Wake up and post proof every day at 6am"
            maxLength={200}
            rows={3}
            className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-oswald px-4 py-3 outline-none focus:border-[#00FF88] transition-colors placeholder:text-[#1a1a1a] text-sm resize-none"
          />
        </div>

        {/* Buy-in */}
        <div>
          <label className="font-mono text-[10px] tracking-widest text-[#333] uppercase block mb-2">
            {isRealMoney ? 'Buy-In Amount' : 'BetDat Stake (optional)'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(isRealMoney ? USD_BUY_IN_OPTIONS : BETDAT_BUY_IN_OPTIONS).map(amount => (
              <button
                key={amount}
                onClick={() => setBuyIn(amount)}
                className={[
                  'py-3 border font-ops text-lg transition-all active:scale-95',
                  buyIn === amount
                    ? 'border-[#00FF88] text-[#00FF88] bg-[rgba(0,255,136,0.05)] shadow-[0_0_15px_rgba(0,255,136,0.2)]'
                    : 'border-[#1a1a1a] text-[#333] bg-[#0a0a0a] hover:border-[#333]',
                ].join(' ')}
              >
                {isRealMoney ? `$${amount}` : amount === 0 ? 'Free' : amount}
              </button>
            ))}
          </div>
          <input
            type="number"
            min={isRealMoney ? 1 : 0}
            value={buyIn}
            onChange={e => setBuyIn(Math.max(isRealMoney ? 1 : 0, parseInt(e.target.value) || 0))}
            placeholder="Custom amount"
            className="mt-2 w-full bg-[#060606] border border-[#0f0f0f] text-white font-mono px-4 py-2.5 outline-none focus:border-[#1a1a1a] transition-colors text-sm"
          />
          {!isRealMoney && (
            <p className="font-mono text-[9px] text-[#333] mt-2">Your BetDat balance: {betdatBalance}</p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[10px] tracking-widest text-[#333] uppercase block mb-2">Start</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-mono px-3 py-3 outline-none focus:border-[#00FF88] transition-colors text-sm [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-widest text-[#333] uppercase block mb-2">End</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-mono px-3 py-3 outline-none focus:border-[#00FF88] transition-colors text-sm [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Privacy */}
        <div>
          <label className="font-mono text-[10px] tracking-widest text-[#333] uppercase block mb-2">Visibility</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: false, icon: Lock, label: 'Private', desc: 'Invite code only' },
              { value: true, icon: Globe, label: 'Public', desc: 'Anyone can join' },
            ].map(({ value, icon: Icon, label, desc }) => (
              <button
                key={label}
                onClick={() => setIsPublic(value)}
                className={[
                  'flex items-center gap-3 p-3 border transition-all text-left',
                  isPublic === value
                    ? 'border-[#00FF88] bg-[rgba(0,255,136,0.05)]'
                    : 'border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#333]',
                ].join(' ')}
              >
                <Icon size={16} className={isPublic === value ? 'text-[#00FF88]' : 'text-[#333]'} />
                <div>
                  <div className={`font-ops text-sm ${isPublic === value ? 'text-[#00FF88]' : 'text-white'}`}>{label}</div>
                  <div className="font-mono text-[9px] text-[#333]">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Payout breakdown — real money only */}
        {isRealMoney && (
          <div className="bg-[#060606] border border-[#0f0f0f] p-4">
            <div className="font-mono text-[10px] tracking-widest text-[#333] uppercase mb-3">
              Per-Player Breakdown
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Buy-in',       val: `$${buyIn.toFixed(2)}`, color: 'text-white' },
                { label: 'Admin fee',    val: '+$1.99',              color: 'text-[#FF003C]' },
                { label: 'Stripe fees',  val: `-$${stripeFee}`,      color: 'text-[#555]' },
                { label: 'Platform 10%',  val: `-$${platformFee}`,   color: 'text-[#555]' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between">
                  <span className="font-mono text-xs text-[#333]">{label}</span>
                  <span className={`font-mono text-xs ${color}`}>{val}</span>
                </div>
              ))}
              <div className="border-t border-[#0f0f0f] pt-2 flex justify-between">
                <span className="font-ops text-sm text-white">Winner gets (est.)</span>
                <span className="font-ops text-sm text-[#00FF88]">~${estimatedPayout} × members</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="font-mono text-[11px] text-[#FF003C] tracking-wide">{error}</p>
        )}

        <Button onClick={handleCreate} loading={loading} fullWidth size="lg">
          Create The Arena
        </Button>
      </div>
    </div>
  )
}
