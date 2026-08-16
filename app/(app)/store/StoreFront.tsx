'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Gem, Shield, Bomb, Zap, Eye, Sparkles, Target, Crown, Search, Dice5, Flame, ChevronDown, Brain, Package } from 'lucide-react'
import Link from 'next/link'

const MOVE_ICONS: Record<string, any> = {
  strike_shield:      Shield,
  strike_bomb:        Bomb,
  strike_back:        Zap,
  spy_mode:           Eye,
  spy_reveal:         Search,
  double_points:      Sparkles,
  double_intensity:   Flame,
  personal_challenge: Target,
  crown_flex:         Crown,
  force_dare:         Dice5,
  learndat:           Brain,
}

const MOVE_COLORS: Record<string, string> = {
  strike_shield:      '#00CFFF',
  strike_bomb:        '#FF003C',
  strike_back:        '#FFD700',
  spy_mode:           '#00CFFF',
  spy_reveal:         '#00CFFF',
  double_points:      '#00FF88',
  double_intensity:   '#FF003C',
  personal_challenge: '#FF003C',
  crown_flex:         '#FFD700',
  force_dare:         '#FF003C',
  learndat:           '#00FF88',
}

const TIERS: { qty: number; discount: number }[] = [
  { qty: 1, discount: 1 },
  { qty: 5, discount: 0.9 },
  { qty: 10, discount: 0.8 },
]

const TARGET_REQUIRED = new Set(['spy_mode', 'spy_reveal', 'personal_challenge', 'strike_bomb', 'force_dare'])
const CIRCLE_REQUIRED = new Set(['strike_bomb', 'strike_shield', 'strike_back', 'personal_challenge', 'crown_flex', 'double_points'])

type PowerMove = { id: string; key: string; name: string; description: string; icon: string; coin_cost: number }
type Circle    = { id: string; name: string }

export default function StoreFront({
  userId,
  provcoinsBalance,
  powerMoves,
  ownedByMoveId,
  activeCircles,
}: {
  userId: string
  provcoinsBalance: number
  powerMoves: PowerMove[]
  ownedByMoveId: Record<string, number>
  activeCircles: Circle[]
}) {
  const supabase = createClient()
  const [balance, setBalance] = useState(provcoinsBalance)
  const [owned, setOwned] = useState(ownedByMoveId)
  const [buyingMove, setBuyingMove] = useState<PowerMove | null>(null)
  const [buyLoading, setBuyLoading] = useState(false)

  const [selectedMove, setSelectedMove] = useState<PowerMove | null>(null)
  const [selectedCircle, setSelectedCircle] = useState<string>(activeCircles[0]?.id ?? '')
  const [selectedTarget, setSelectedTarget] = useState<string>('')
  const [circleMembers, setCircleMembers] = useState<{ user_id: string; username: string }[]>([])
  const [challengeText, setChallengeText] = useState('')
  const [fireLoading, setFireLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function buyKit(tierQty: number) {
    if (!buyingMove) return
    setBuyLoading(true)
    const res = await fetch('/api/power-moves/buy-kit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moveKey: buyingMove.key, tier: tierQty }),
    })
    const data = await res.json()
    if (data.success) {
      setBalance(b => b - data.pricePaid)
      setOwned(o => ({ ...o, [buyingMove.id]: data.quantity }))
      showToast(`Bought ${tierQty}x ${buyingMove.name}!`, true)
      setBuyingMove(null)
    } else {
      showToast(data.error ?? 'Purchase failed', false)
    }
    setBuyLoading(false)
  }

  async function onSelectMove(move: PowerMove) {
    if (move.key === 'learndat') return // handled via its own link
    setSelectedMove(move)
    setSelectedTarget('')
    setChallengeText('')

    if (TARGET_REQUIRED.has(move.key) && selectedCircle) {
      const { data } = await supabase
        .from('circle_leaderboard')
        .select('user_id, username')
        .eq('circle_id', selectedCircle)
        .eq('status', 'active')
        .neq('user_id', userId)
      setCircleMembers(data ?? [])
    }
  }

  async function fire() {
    if (!selectedMove) return
    setFireLoading(true)

    const res = await fetch('/api/power-moves/fire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moveKey: selectedMove.key,
        circleId: selectedCircle || undefined,
        targetUserId: selectedTarget || undefined,
        challengeText: challengeText || undefined,
      }),
    })
    const data = await res.json()

    if (data.success) {
      setOwned(o => ({ ...o, [selectedMove.id]: data.remainingQuantity }))
      let msg = `${selectedMove.icon} ${selectedMove.name} activated!`
      if (selectedMove.key === 'spy_mode') {
        msg = data.lastSubmittedAt ? `Last seen ${new Date(data.lastSubmittedAt).toLocaleString()}` : 'No submissions yet.'
      }
      if (selectedMove.key === 'spy_reveal') {
        msg = data.targetBalance != null ? `Balance: ${data.targetBalance} ${data.targetCurrency?.toUpperCase()}` : 'No data.'
      }
      showToast(msg, true)
      setSelectedMove(null)
    } else {
      showToast(data?.error ?? 'Failed', false)
    }
    setFireLoading(false)
  }

  const requiresTarget = selectedMove ? TARGET_REQUIRED.has(selectedMove.key) : false
  const requiresCircle = selectedMove ? CIRCLE_REQUIRED.has(selectedMove.key) : false
  const canFire = selectedMove
    && (!requiresCircle || selectedCircle)
    && (!requiresTarget || selectedTarget)
    && (selectedMove.key !== 'personal_challenge' || challengeText.trim())

  return (
    <div className="min-h-dvh bg-black">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 font-ops text-sm tracking-widest text-center ${toast.ok ? 'bg-[#00FF88] text-black' : 'bg-[#FF003C] text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-12 pb-5 border-b border-[#0f0f0f]">
        <div className="font-mono text-[10px] tracking-[5px] text-[#00FF88] mb-1">POWER MOVES</div>
        <div className="flex items-center justify-between">
          <h1 className="font-ops text-2xl text-white">The Arsenal</h1>
          <Link href="/wallet" className="flex items-center gap-1.5 bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2">
            <Gem size={12} className="text-[#FFD700]" />
            <span className="font-ops text-sm text-[#FFD700]">{balance}</span>
            <span className="font-mono text-[9px] text-[#333] uppercase tracking-widest">provcoins</span>
          </Link>
        </div>
      </div>

      <div className="px-5 py-5 flex flex-col gap-5">
        {/* Circle selector */}
        {activeCircles.length > 0 && (
          <div>
            <div className="font-mono text-[10px] text-[#333] uppercase tracking-widest mb-2">Select Circle</div>
            <div className="relative">
              <select
                value={selectedCircle}
                onChange={e => setSelectedCircle(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-ops text-sm px-4 py-3 outline-none appearance-none focus:border-[#00FF88] transition-colors [color-scheme:dark]"
              >
                {activeCircles.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#333] pointer-events-none" />
            </div>
          </div>
        )}

        {activeCircles.length === 0 && (
          <div className="bg-[#060606] border border-dashed border-[#1a1a1a] p-6 text-center">
            <div className="font-ops text-sm text-[#333] mb-1">No active circles.</div>
            <Link href="/circle/create" className="font-mono text-[10px] text-[#00FF88] tracking-widest uppercase">
              Create one first →
            </Link>
          </div>
        )}

        {/* Move grid */}
        <div className="flex flex-col gap-2">
          {powerMoves.map(move => {
            const Icon = MOVE_ICONS[move.key] ?? Gem
            const color = MOVE_COLORS[move.key] ?? '#00FF88'
            const isSelected = selectedMove?.key === move.key
            const isLearnDat = move.key === 'learndat'
            const qty = owned[move.id] ?? 0

            return (
              <div
                key={move.key}
                className={[
                  'flex items-center gap-4 p-4 border transition-all',
                  isSelected ? 'border-[#00FF88] bg-[rgba(0,255,136,0.04)]' : 'border-[#0f0f0f] bg-[#060606]',
                ].join(' ')}
              >
                <div
                  className="w-12 h-12 flex-shrink-0 flex items-center justify-center border"
                  style={{ borderColor: isSelected ? '#00FF88' : '#111', background: `${color}10` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-ops text-base text-white">{move.icon} {move.name}</span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 border border-[#1a1a1a] text-[#555] uppercase tracking-widest">
                      Owned {qty}
                    </span>
                  </div>
                  <div className="font-oswald text-xs text-[#444] mt-0.5 leading-snug">{move.description}</div>
                </div>
                <div className="flex-shrink-0 flex flex-col gap-1.5 items-stretch">
                  <button
                    onClick={() => setBuyingMove(move)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-[#1a1a1a] font-mono text-[9px] tracking-widest uppercase text-[#00FF88] hover:border-[#00FF88] transition-colors"
                  >
                    <Package size={10} /> Buy Kit
                  </button>
                  {isLearnDat ? (
                    <Link
                      href="/learndat/new"
                      className="text-center px-3 py-1.5 bg-[#00FF88] font-mono text-[9px] tracking-widest uppercase text-black"
                    >
                      Challenge
                    </Link>
                  ) : (
                    <button
                      onClick={() => onSelectMove(move)}
                      disabled={qty <= 0 || (CIRCLE_REQUIRED.has(move.key) && !selectedCircle)}
                      className="px-3 py-1.5 bg-[#00FF88] font-mono text-[9px] tracking-widest uppercase text-black disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      Fire
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Buy kit panel */}
        {buyingMove && (
          <div className="bg-[#060606] border border-[#1a1a1a] p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[10px] text-[#00FF88] uppercase tracking-widest">
                Buy {buyingMove.name} Kit
              </div>
              <button onClick={() => setBuyingMove(null)} className="font-mono text-[9px] text-[#333] uppercase tracking-widest">Cancel</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TIERS.map(t => {
                const price = Math.round(buyingMove.coin_cost * t.qty * t.discount)
                const canAfford = balance >= price
                return (
                  <button
                    key={t.qty}
                    onClick={() => buyKit(t.qty)}
                    disabled={buyLoading || !canAfford}
                    className="flex flex-col items-center gap-1 py-3 border border-[#1a1a1a] hover:border-[#00FF88] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="font-ops text-lg text-white">{t.qty}x</span>
                    {t.discount < 1 && <span className="font-mono text-[8px] text-[#00FF88]">{Math.round((1 - t.discount) * 100)}% off</span>}
                    <span className="font-mono text-[10px] text-[#FFD700]">{price}pc</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Activation panel */}
        {selectedMove && (
          <div className="bg-[#060606] border border-[#1a1a1a] p-4 flex flex-col gap-4">
            <div className="font-mono text-[10px] text-[#00FF88] uppercase tracking-widest">
              Activating: {selectedMove.name} · {owned[selectedMove.id] ?? 0} owned
            </div>

            {requiresTarget && (
              <div>
                <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest mb-2">Target</div>
                {circleMembers.length === 0 ? (
                  <div className="font-oswald text-xs text-[#444]">No active opponents in this circle.</div>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto">
                    {circleMembers.map(m => (
                      <button
                        key={m.user_id}
                        onClick={() => setSelectedTarget(m.user_id)}
                        className={[
                          'flex items-center gap-3 px-3 py-2.5 border text-left transition-all',
                          selectedTarget === m.user_id
                            ? 'border-[#FF003C] bg-[rgba(255,0,60,0.05)]'
                            : 'border-[#111] hover:border-[#1a1a1a]',
                        ].join(' ')}
                      >
                        <div className="w-7 h-7 rounded-full bg-[#111] border border-[#1a1a1a] flex items-center justify-center">
                          <span className="font-ops text-[11px] text-[#00FF88]">{m.username[0].toUpperCase()}</span>
                        </div>
                        <span className="font-ops text-sm text-white">{m.username}</span>
                        {selectedTarget === m.user_id && (
                          <span className="ml-auto font-mono text-[9px] text-[#FF003C] tracking-widest">TARGETED</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedMove.key === 'personal_challenge' && (
              <div>
                <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest mb-2">Challenge Text</div>
                <textarea
                  value={challengeText}
                  onChange={e => setChallengeText(e.target.value)}
                  placeholder="What do they have to prove? Be specific."
                  rows={3}
                  maxLength={150}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-oswald text-sm px-3 py-2.5 outline-none focus:border-[#FF003C] transition-colors resize-none placeholder:text-[#1a1a1a]"
                />
                <div className="font-mono text-[9px] text-[#333] mt-1 text-right">{challengeText.length}/150</div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedMove(null)}
                className="flex-1 py-3 border border-[#1a1a1a] font-ops text-sm tracking-widest uppercase text-[#333] hover:border-[#333] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={fire}
                disabled={!canFire || fireLoading}
                className="flex-1 py-3 bg-[#00FF88] font-ops text-sm tracking-widest uppercase text-black disabled:opacity-30 active:scale-95 transition-all"
              >
                {fireLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Activating...
                  </span>
                ) : (
                  'Fire · Free'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Get more coins CTA */}
        <div className="text-center">
          <Link href="/wallet" className="font-mono text-[10px] text-[#333] tracking-widest uppercase hover:text-[#00FF88] transition-colors">
            Need more coins? → Get ProvCoins
          </Link>
        </div>
      </div>
    </div>
  )
}
