'use client'
import { useState } from 'react'
import { ThumbsDown, Crown, CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Proof = {
  id: string
  user_id: string
  username: string
  avatar_url: string | null
  image_url: string
  watermark_text: string
  status: string
  bullshit_votes_count: number
  has_crown_flex: boolean
  submitted_at: string
  points_awarded: number
}

export default function ProofCard({
  proof,
  currentUserId,
  activeMemberCount,
}: {
  proof: Proof
  currentUserId: string
  activeMemberCount: number
}) {
  const [votes, setVotes] = useState(proof.bullshit_votes_count)
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(false)
  const isOwn = proof.user_id === currentUserId
  const threshold = Math.ceil(activeMemberCount * 0.51)

  const submitTime = new Date(proof.submitted_at)
  const timeStr = submitTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  async function handleBullshitVote() {
    if (hasVoted || isOwn || loading) return
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.rpc('process_bullshit_vote', {
      p_proof_id: proof.id,
      p_voter_id: currentUserId,
    })
    if (data?.success) {
      setVotes(v => v + 1)
      setHasVoted(true)
    }
    setLoading(false)
  }

  return (
    <div className={[
      'relative bg-[#0a0a0a] border overflow-hidden',
      proof.status === 'invalidated' ? 'border-[#FF003C] opacity-60' : 'border-[#1a1a1a]',
      proof.has_crown_flex ? 'border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.2)]' : '',
    ].join(' ')}>

      {/* Crown */}
      {proof.has_crown_flex && (
        <div className="absolute top-2 right-2 z-10 bg-[#FFD700] px-2 py-0.5 flex items-center gap-1">
          <Crown size={10} className="text-black" />
          <span className="font-ops text-[9px] text-black tracking-widest">CROWN FLEX</span>
        </div>
      )}

      {/* Invalidated overlay */}
      {proof.status === 'invalidated' && (
        <div className="absolute inset-0 z-10 bg-[rgba(255,0,60,0.1)] flex items-center justify-center">
          <div className="flex items-center gap-2 bg-[#FF003C] px-4 py-2">
            <XCircle size={16} className="text-white" />
            <span className="font-ops text-sm text-white tracking-widest">INVALIDATED</span>
          </div>
        </div>
      )}

      {/* User header */}
      <div className="flex items-center gap-3 p-3 border-b border-[#111]">
        <div className="w-8 h-8 rounded-full bg-[#111] border border-[#1a1a1a] flex items-center justify-center overflow-hidden flex-shrink-0">
          {proof.avatar_url ? (
            <img src={proof.avatar_url} alt={proof.username} className="w-full h-full object-cover" />
          ) : (
            <span className="font-ops text-sm text-[#00FF88]">{proof.username[0].toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1">
          <span className="font-ops text-sm text-white">{proof.username}</span>
          <div className="font-mono text-[10px] text-[#333]">{timeStr}</div>
        </div>
        <div className="flex items-center gap-1 bg-[rgba(0,255,136,0.08)] px-2 py-1 border border-[rgba(0,255,136,0.15)]">
          <span className="font-ops text-xs text-[#00FF88]">+{proof.points_awarded}</span>
          <span className="font-mono text-[9px] text-[#00FF88] opacity-60">PTS</span>
        </div>
      </div>

      {/* Image */}
      <div className="relative aspect-[4/3] bg-[#050505]">
        <img
          src={proof.image_url}
          alt="Proof"
          className="w-full h-full object-cover"
        />
        {/* Watermark */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1">
          <span className="font-mono text-[9px] text-[#00FF88] opacity-80">{proof.watermark_text}</span>
        </div>
      </div>

      {/* Actions */}
      {!isOwn && proof.status !== 'invalidated' && (
        <div className="flex border-t border-[#111]">
          <button
            onClick={handleBullshitVote}
            disabled={hasVoted || loading}
            className={[
              'flex-1 flex items-center justify-center gap-2 py-3 transition-all',
              hasVoted ? 'text-[#FF003C] bg-[rgba(255,0,60,0.05)]' : 'text-[#333] hover:text-[#FF003C] hover:bg-[rgba(255,0,60,0.05)]',
              loading ? 'opacity-40' : '',
            ].join(' ')}
          >
            <ThumbsDown size={14} strokeWidth={hasVoted ? 2.5 : 1.5} />
            <span className="font-ops text-xs tracking-widest uppercase">
              #Bullshit {votes > 0 && `(${votes}/${threshold})`}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
