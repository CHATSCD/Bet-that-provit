'use client'
import { Shield, Bomb, Crown } from 'lucide-react'

type Member = {
  user_id: string
  username: string
  avatar_url: string | null
  score: number
  strike_count: number
  status: string
  has_shield: boolean
  rank: number
}

export default function Leaderboard({
  members,
  currentUserId,
}: {
  members: Member[]
  currentUserId: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {members.map((m, i) => {
        const isEliminated = m.status === 'eliminated_spectator'
        const isCurrentUser = m.user_id === currentUserId
        const rankColor = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#333'

        return (
          <div
            key={m.user_id}
            className={[
              'flex items-center gap-3 p-3 border transition-all',
              isCurrentUser ? 'bg-[rgba(0,255,136,0.05)] border-[rgba(0,255,136,0.15)]' : 'bg-[#0a0a0a] border-[#111]',
              isEliminated ? 'opacity-40' : '',
            ].join(' ')}
          >
            {/* Rank */}
            <div className="w-7 text-center">
              <span className="font-mono text-sm font-bold" style={{ color: rankColor }}>
                {i === 0 ? '👑' : `#${m.rank}`}
              </span>
            </div>

            {/* Avatar */}
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#111] border border-[#1a1a1a] flex items-center justify-center overflow-hidden">
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt={m.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-ops text-sm text-[#00FF88]">{m.username[0].toUpperCase()}</span>
                )}
              </div>
              {isEliminated && (
                <div className="absolute inset-0 rounded-full bg-[#FF003C] bg-opacity-30 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#FF003C]">✗</span>
                </div>
              )}
            </div>

            {/* Name + Status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-ops text-sm truncate ${isCurrentUser ? 'text-[#00FF88]' : 'text-white'}`}>
                  {m.username}
                  {isCurrentUser && <span className="ml-1 text-[10px] text-[#00FF88] opacity-60">YOU</span>}
                </span>
                {m.has_shield && <Shield size={12} className="text-[#00CFFF] flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {/* Strikes */}
                <div className="flex gap-0.5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i < m.strike_count ? 'bg-[#FF003C]' : 'bg-[#1a1a1a]'}`}
                    />
                  ))}
                </div>
                {isEliminated && (
                  <span className="font-mono text-[9px] text-[#FF003C] tracking-widest uppercase">Spectator</span>
                )}
              </div>
            </div>

            {/* Score */}
            <div className="text-right flex-shrink-0">
              <span className={`font-ops text-lg ${isCurrentUser ? 'text-[#00FF88]' : 'text-white'}`}>
                {m.score}
              </span>
              <div className="font-mono text-[9px] text-[#333] tracking-widest uppercase">pts</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
