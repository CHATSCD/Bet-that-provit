import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Camera, Zap } from 'lucide-react'
import RealtimeLeaderboard from '@/components/circle/RealtimeLeaderboard'
import ProofCard from '@/components/circle/ProofCard'
import CircleActions from './CircleActions'
import CopyButton from '@/components/circle/CopyButton'
import CircleModeBadge from '@/components/circle/CircleModeBadge'

export default async function CirclePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: circle }, { data: membership }, { data: leaderboard }, { data: proofs }] = await Promise.all([
    supabase.from('circles').select('*').eq('id', params.id).single(),
    supabase.from('circle_members').select('*').eq('circle_id', params.id).eq('user_id', user.id).single(),
    supabase.from('circle_leaderboard').select('*').eq('circle_id', params.id).order('rank'),
    supabase.from('proofs')
      .select('*, users(username, avatar_url)')
      .eq('circle_id', params.id)
      .order('submitted_at', { ascending: false })
      .limit(20),
  ])

  if (!circle) notFound()

  const isMember = !!membership
  const isActive = membership?.status === 'active'
  const now = new Date()
  const endDate = new Date(circle.end_date)
  const startDate = new Date(circle.start_date)
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  const hasStarted = now >= startDate

  const activeMemberCount = leaderboard?.filter(m => m.status === 'active').length ?? 0

  const myMember = leaderboard?.find(m => m.user_id === user.id)
  const [{ data: activeBombs }, { data: powerMoves }, { data: inventory }] = await Promise.all([
    supabase.from('strike_bombs')
      .select('*')
      .eq('circle_id', params.id)
      .eq('target_id', user.id)
      .eq('status', 'active'),
    supabase.from('power_moves').select('id, key').eq('is_active', true),
    supabase.from('user_power_moves').select('power_move_id, quantity').eq('user_id', user.id),
  ])
  const ownedByKey = Object.fromEntries(
    (powerMoves ?? []).map(m => [m.key, inventory?.find(i => i.power_move_id === m.id)?.quantity ?? 0])
  )

  const calloutText = `${myMember?.username ?? 'Someone'} just wagered $${circle.buy_in_amount} on a "${circle.name}" arena and called you out. You have until ${startDate.toLocaleDateString()} to match the buy-in or openly admit you're soft. Lock in at illprovit.app using access code: ${circle.invite_code} #BetThat`

  return (
    <div className="min-h-dvh bg-black">
      {/* Active bomb alert */}
      {activeBombs && activeBombs.length > 0 && (
        <div className="animate-bomb bg-[#FF003C] px-5 py-3 flex items-center gap-3">
          <span className="text-lg">💣</span>
          <div className="flex-1">
            <div className="font-ops text-sm text-white">BOMB INCOMING</div>
            <div className="font-mono text-[10px] text-white opacity-70">
              Submit proof now or take a strike in {activeBombs.length} active threat{activeBombs.length > 1 ? 's' : ''}
            </div>
          </div>
          <Link href={`/proof/${params.id}`}>
            <span className="font-ops text-xs text-white uppercase tracking-widest border border-white px-3 py-1.5">
              #ProvIt
            </span>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-8 pb-4 border-b border-[#0f0f0f]">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/home"><ChevronLeft size={22} className="text-[#333]" /></Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="font-ops text-xl text-white truncate">{circle.name}</h1>
              <CircleModeBadge currency={circle.currency} />
            </div>
            <p className="font-oswald text-xs text-[#444] truncate">{circle.challenge}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="font-ops text-lg text-[#00FF88]">
              {circle.currency === 'usd' ? `$${circle.buy_in_amount}` : `${circle.buy_in_amount} BD`}
            </div>
            <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest">{daysLeft}d left</div>
          </div>
        </div>

        {/* Pot summary */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Pot', value: circle.currency === 'usd' ? `$${(circle.buy_in_amount * (leaderboard?.length ?? 0)).toFixed(0)}` : `${circle.buy_in_amount * (leaderboard?.length ?? 0)} BD` },
            { label: 'Players', value: activeMemberCount },
            { label: 'Status', value: circle.status.toUpperCase() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#060606] border border-[#0f0f0f] p-3 text-center">
              <div className="font-ops text-base text-[#00FF88]">{value}</div>
              <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Proof CTA */}
      {isMember && isActive && hasStarted && circle.status === 'active' && (
        <div className="px-5 py-3 border-b border-[#0f0f0f]">
          <Link href={`/proof/${params.id}`}>
            <div className="flex items-center gap-3 bg-[#00FF88] p-4 active:scale-[0.98] transition-transform">
              <Camera size={20} className="text-black" />
              <div className="flex-1">
                <div className="font-ops text-base text-black">Submit Today's Proof</div>
                <div className="font-mono text-[10px] text-black opacity-60">Live camera only · Midnight deadline</div>
              </div>
              <span className="font-ops text-sm text-black">#ProvIt →</span>
            </div>
          </Link>
        </div>
      )}

      {/* Not a member — join CTA */}
      {!isMember && circle.status === 'pending' && (
        <div className="px-5 py-3 border-b border-[#0f0f0f]">
          <Link href={`/circle/${params.id}/join`}>
            <div className="flex items-center gap-3 bg-[#00FF88] p-4 active:scale-[0.98] transition-transform">
              <div className="flex-1">
                <div className="font-ops text-base text-black">Join This Circle</div>
                <div className="font-mono text-[10px] text-black opacity-60">
                  {circle.currency === 'usd'
                    ? `$${circle.buy_in_amount} buy-in + $1.99 admin fee`
                    : circle.buy_in_amount > 0 ? `${circle.buy_in_amount} BetDat stake` : 'Free to join'}
                </div>
              </div>
              <span className="font-ops text-sm text-black">#BetThat →</span>
            </div>
          </Link>
        </div>
      )}

      <div className="px-5 py-4 flex flex-col gap-6">

        {/* Leaderboard */}
        <section>
          <h2 className="font-ops text-xs tracking-widest uppercase text-[#333] mb-3">Leaderboard</h2>
          <RealtimeLeaderboard circleId={params.id} initialMembers={leaderboard ?? []} currentUserId={user.id} />
        </section>

        {/* Power Moves */}
        {isMember && <CircleActions circleId={params.id} userId={user.id} members={leaderboard ?? []} membership={membership} ownedByKey={ownedByKey} />}

        {/* Invite */}
        {isMember && (
          <section>
            <h2 className="font-ops text-xs tracking-widest uppercase text-[#333] mb-3">Call Out Your Crew</h2>
            <div className="bg-[#060606] border border-[#0f0f0f] p-4">
              <div className="font-mono text-[11px] text-[#444] leading-relaxed mb-3">
                {calloutText}
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-2.5 flex items-center">
                  <span className="font-ops text-xl text-[#00FF88] tracking-widest">{circle.invite_code}</span>
                </div>
                <CopyButton text={calloutText} />
              </div>
            </div>
          </section>
        )}

        {/* Proof Feed */}
        <section>
          <h2 className="font-ops text-xs tracking-widest uppercase text-[#333] mb-3">Proof Feed</h2>
          {proofs && proofs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {proofs.map(proof => (
                <ProofCard
                  key={proof.id}
                  proof={{ ...proof, username: (proof.users as any)?.username ?? 'unknown', avatar_url: (proof.users as any)?.avatar_url }}
                  currentUserId={user.id}
                  activeMemberCount={activeMemberCount}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#060606] border border-dashed border-[#0f0f0f] p-8 text-center">
              <div className="font-ops text-sm text-[#333]">No proof yet.</div>
              <div className="font-oswald text-xs text-[#222] mt-1">Be the first to #ProvIt.</div>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
