'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, Bomb, Zap, Eye, Flame, Target, Crown } from 'lucide-react'

type Member = { user_id: string; username: string; status: string }

const MOVES = [
  { key: 'strike_shield',  icon: Shield, cost: 300, label: 'Shield',   color: '#00CFFF', desc: 'Block next strike/bomb' },
  { key: 'strike_bomb',    icon: Bomb,   cost: 500, label: 'Bomb',     color: '#FF003C', desc: 'Force 2hr proof window', requiresTarget: true },
  { key: 'strike_back',    icon: Zap,    cost: 200, label: 'Strike ⚡', color: '#FFD700', desc: 'Remove 1 strike' },
  { key: 'spy_mode',       icon: Eye,    cost: 100, label: 'Spy',      color: '#00CFFF', desc: 'See submission times', requiresTarget: true },
  { key: 'double_points',  icon: Flame,  cost: 250, label: '2x PTS',   color: '#00FF88', desc: '2x points 24hrs' },
  { key: 'personal_challenge', icon: Target, cost: 150, label: 'Challenge', color: '#FF003C', desc: 'Force mini-challenge', requiresTarget: true },
  { key: 'crown_flex',     icon: Crown,  cost: 50,  label: 'Crown 👑', color: '#FFD700', desc: 'Crown on next proof' },
]

export default function CircleActions({
  circleId,
  userId,
  members,
  membership,
}: {
  circleId: string
  userId: string
  members: Member[]
  membership: any
}) {
  const supabase = createClient()
  const [selectedMove, setSelectedMove] = useState<string | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [challengeText, setChallengeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const activeMembers = members.filter(m => m.status === 'active' && m.user_id !== userId)
  const move = MOVES.find(m => m.key === selectedMove)

  async function executeMove() {
    if (!selectedMove) return
    setLoading(true)
    setResult(null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rpc = (fn: string, args: Record<string, unknown>) => (supabase.rpc as any)(fn, args)
    const fnMap: Record<string, () => PromiseLike<any>> = {
      strike_shield: () => rpc('use_strike_shield', { p_user_id: userId, p_circle_id: circleId }),
      strike_back:   () => rpc('use_strike_back',   { p_user_id: userId, p_circle_id: circleId }),
      double_points: () => rpc('spend_coins', { p_user_id: userId, p_amount: 250, p_type: 'power_move', p_description: 'Double Points', p_circle_id: circleId }),
      crown_flex:    () => rpc('spend_coins', { p_user_id: userId, p_amount: 50,  p_type: 'power_move', p_description: 'Crown Flex',    p_circle_id: circleId }),
      spy_mode:      () => rpc('spend_coins', { p_user_id: userId, p_amount: 100, p_type: 'power_move', p_description: 'Spy Mode',      p_circle_id: circleId }),
      strike_bomb:   () => rpc('use_strike_bomb', { p_user_id: userId, p_circle_id: circleId, p_target_id: selectedTarget }),
      personal_challenge: () => rpc('use_personal_challenge', { p_user_id: userId, p_circle_id: circleId, p_target_id: selectedTarget, p_challenge_text: challengeText }),
    }

    const fn = fnMap[selectedMove]
    if (!fn) { setLoading(false); return }

    const { data, error } = await fn()
    const res = error ? { success: false, error: error.message } : data

    setResult({
      success: res?.success ?? false,
      message: res?.success
        ? `${move?.label} activated!`
        : res?.error ?? 'Something went wrong',
    })
    setLoading(false)
    if (res?.success) {
      setTimeout(() => { setSelectedMove(null); setResult(null) }, 2000)
    }
  }

  return (
    <section>
      <h2 className="font-ops text-xs tracking-widest uppercase text-[#333] mb-3">Power Moves</h2>

      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {MOVES.map(({ key, icon: Icon, cost, label, color }) => (
          <button
            key={key}
            onClick={() => setSelectedMove(selectedMove === key ? null : key)}
            className={[
              'flex flex-col items-center gap-1 p-2.5 border transition-all active:scale-90',
              selectedMove === key
                ? 'bg-[rgba(0,255,136,0.05)] border-[#00FF88]'
                : 'bg-[#060606] border-[#0f0f0f] hover:border-[#1a1a1a]',
            ].join(' ')}
          >
            <Icon size={16} style={{ color }} />
            <span className="font-ops text-[9px] text-white tracking-widest text-center leading-tight">{label}</span>
            <span className="font-mono text-[8px] text-[#333]">{cost}c</span>
          </button>
        ))}
      </div>

      {/* Move detail panel */}
      {selectedMove && move && (
        <div className="bg-[#060606] border border-[#1a1a1a] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-ops text-sm text-white">{move.label}</div>
              <div className="font-oswald text-xs text-[#444]">{move.desc}</div>
            </div>
            <div className="font-ops text-lg" style={{ color: move.color }}>{move.cost}c</div>
          </div>

          {/* Target selector */}
          {move.requiresTarget && (
            <div>
              <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest mb-2">Select Target</div>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                {activeMembers.map(m => (
                  <button
                    key={m.user_id}
                    onClick={() => setSelectedTarget(m.user_id)}
                    className={[
                      'flex items-center gap-2 px-3 py-2 border text-left transition-all',
                      selectedTarget === m.user_id
                        ? 'border-[#FF003C] bg-[rgba(255,0,60,0.05)]'
                        : 'border-[#0f0f0f] hover:border-[#1a1a1a]',
                    ].join(' ')}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#111] border border-[#1a1a1a] flex items-center justify-center">
                      <span className="font-ops text-[10px] text-[#00FF88]">{m.username[0].toUpperCase()}</span>
                    </div>
                    <span className="font-ops text-sm text-white">{m.username}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Challenge text input */}
          {selectedMove === 'personal_challenge' && (
            <textarea
              value={challengeText}
              onChange={e => setChallengeText(e.target.value)}
              placeholder="Write the challenge for your target..."
              rows={2}
              maxLength={150}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-oswald text-sm px-3 py-2 outline-none focus:border-[#FF003C] transition-colors resize-none placeholder:text-[#1a1a1a]"
            />
          )}

          {result && (
            <div className={`font-mono text-[11px] tracking-wide ${result.success ? 'text-[#00FF88]' : 'text-[#FF003C]'}`}>
              {result.message}
            </div>
          )}

          <button
            onClick={executeMove}
            disabled={loading || (!!move.requiresTarget && !selectedTarget) || (selectedMove === 'personal_challenge' && !challengeText)}
            className="w-full py-3 font-ops text-sm tracking-widest uppercase text-black bg-[#00FF88] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            {loading ? 'Executing...' : `Activate · ${move.cost} Coins`}
          </button>
        </div>
      )}
    </section>
  )
}
