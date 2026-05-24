'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, Shield, Bomb, Zap as StrikeBack, Eye, Flame, Target, Crown, ChevronDown } from 'lucide-react'
import Link from 'next/link'

const MOVE_ICONS: Record<string, any> = {
  strike_shield:       Shield,
  strike_bomb:         Bomb,
  strike_back:         StrikeBack,
  spy_mode:            Eye,
  double_points:       Flame,
  personal_challenge:  Target,
  crown_flex:          Crown,
}

const MOVE_COLORS: Record<string, string> = {
  strike_shield:       '#00CFFF',
  strike_bomb:         '#FF003C',
  strike_back:         '#FFD700',
  spy_mode:            '#00CFFF',
  double_points:       '#00FF88',
  personal_challenge:  '#FF003C',
  crown_flex:          '#FFD700',
}

type PowerMove = { id: string; key: string; name: string; description: string; icon: string; coin_cost: number }
type Circle    = { id: string; name: string }

export default function StoreFront({
  userId,
  coinBalance,
  powerMoves,
  activeCircles,
}: {
  userId: string
  coinBalance: number
  powerMoves: PowerMove[]
  activeCircles: Circle[]
}) {
  const supabase = createClient()
  const [balance, setBalance] = useState(coinBalance)
  const [selectedMove, setSelectedMove] = useState<PowerMove | null>(null)
  const [selectedCircle, setSelectedCircle] = useState<string>(activeCircles[0]?.id ?? '')
  const [selectedTarget, setSelectedTarget] = useState<string>('')
  const [circleMembers, setCircleMembers] = useState<{ user_id: string; username: string }[]>([])
  const [challengeText, setChallengeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2500)
  }

  async function onSelectMove(move: PowerMove) {
    setSelectedMove(move)
    setSelectedTarget('')
    setChallengeText('')

    const needsTarget = ['strike_bomb', 'spy_mode', 'personal_challenge'].includes(move.key)
    if (needsTarget && selectedCircle) {
      const { data } = await supabase
        .from('circle_leaderboard')
        .select('user_id, username')
        .eq('circle_id', selectedCircle)
        .eq('status', 'active')
        .neq('user_id', userId)
      setCircleMembers(data ?? [])
    }
  }

  async function execute() {
    if (!selectedMove) return
    setLoading(true)

    const fnMap: Record<string, () => Promise<any>> = {
      strike_shield:      () => supabase.rpc('use_strike_shield',        { p_user_id: userId, p_circle_id: selectedCircle }),
      strike_back:        () => supabase.rpc('use_strike_back',          { p_user_id: userId, p_circle_id: selectedCircle }),
      double_points:      () => supabase.rpc('spend_coins',              { p_user_id: userId, p_amount: 250, p_type: 'power_move', p_description: 'Double Points', p_circle_id: selectedCircle }),
      crown_flex:         () => supabase.rpc('spend_coins',              { p_user_id: userId, p_amount: 50,  p_type: 'power_move', p_description: 'Crown Flex',    p_circle_id: selectedCircle }),
      spy_mode:           () => supabase.rpc('spend_coins',              { p_user_id: userId, p_amount: 100, p_type: 'power_move', p_description: 'Spy Mode',      p_circle_id: selectedCircle }),
      strike_bomb:        () => supabase.rpc('use_strike_bomb',          { p_user_id: userId, p_circle_id: selectedCircle, p_target_id: selectedTarget }),
      personal_challenge: () => supabase.rpc('use_personal_challenge',   { p_user_id: userId, p_circle_id: selectedCircle, p_target_id: selectedTarget, p_challenge_text: challengeText }),
    }

    const fn = fnMap[selectedMove.key]
    if (!fn) { setLoading(false); return }

    const { data, error } = await fn()
    const res = error ? { success: false, error: error.message } : data

    if (res?.success) {
      setBalance(b => b - selectedMove.coin_cost)
      showToast(`${selectedMove.icon} ${selectedMove.name} activated!`, true)
      setSelectedMove(null)
    } else {
      showToast(res?.error ?? 'Failed', false)
    }
    setLoading(false)
  }

  const requiresTarget = selectedMove ? ['strike_bomb', 'spy_mode', 'personal_challenge'].includes(selectedMove.key) : false
  const canExecute = selectedMove
    && selectedCircle
    && (!requiresTarget || selectedTarget)
    && (selectedMove.key !== 'personal_challenge' || challengeText.trim())
    && balance >= selectedMove.coin_cost

  return (
    <div className="min-h-dvh bg-black">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 font-ops text-sm tracking-widest ${toast.ok ? 'bg-[#00FF88] text-black' : 'bg-[#FF003C] text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-12 pb-5 border-b border-[#0f0f0f]">
        <div className="font-mono text-[10px] tracking-[5px] text-[#00FF88] mb-1">POWER MOVES</div>
        <div className="flex items-center justify-between">
          <h1 className="font-ops text-2xl text-white">The Arsenal</h1>
          <Link href="/wallet" className="flex items-center gap-1.5 bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2">
            <Zap size={12} className="text-[#FFD700]" />
            <span className="font-ops text-sm text-[#FFD700]">{balance}</span>
            <span className="font-mono text-[9px] text-[#333] uppercase tracking-widest">coins</span>
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
            const Icon = MOVE_ICONS[move.key] ?? Zap
            const color = MOVE_COLORS[move.key] ?? '#00FF88'
            const isSelected = selectedMove?.key === move.key
            const canAfford = balance >= move.coin_cost

            return (
              <button
                key={move.key}
                onClick={() => onSelectMove(move)}
                disabled={!canAfford || !selectedCircle}
                className={[
                  'w-full flex items-center gap-4 p-4 border transition-all text-left active:scale-[0.98]',
                  isSelected ? 'border-[#00FF88] bg-[rgba(0,255,136,0.04)]' : 'border-[#0f0f0f] bg-[#060606]',
                  !canAfford ? 'opacity-30' : 'hover:border-[#1a1a1a]',
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
                  </div>
                  <div className="font-oswald text-xs text-[#444] mt-0.5 leading-snug">{move.description}</div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="font-ops text-base" style={{ color: canAfford ? color : '#333' }}>
                    {move.coin_cost}
                  </div>
                  <div className="font-mono text-[9px] text-[#333]">coins</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Activation panel */}
        {selectedMove && (
          <div className="bg-[#060606] border border-[#1a1a1a] p-4 flex flex-col gap-4">
            <div className="font-mono text-[10px] text-[#00FF88] uppercase tracking-widest">
              Activating: {selectedMove.name}
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
                onClick={execute}
                disabled={!canExecute || loading}
                className="flex-1 py-3 bg-[#00FF88] font-ops text-sm tracking-widest uppercase text-black disabled:opacity-30 active:scale-95 transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Activating...
                  </span>
                ) : (
                  `Fire · ${selectedMove.coin_cost}c`
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
