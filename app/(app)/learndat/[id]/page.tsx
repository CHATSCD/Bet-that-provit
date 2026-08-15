import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import LearnDatActions from './LearnDatActions'

export default async function LearnDatDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: challenge } = await supabase
    .from('learndat_challenges')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!challenge) notFound()
  if (challenge.challenger_id !== user.id && challenge.opponent_id !== user.id) notFound()

  const { data: users } = await supabase
    .from('users')
    .select('id, username')
    .in('id', [challenge.challenger_id, challenge.opponent_id])

  const usernameOf = (id: string) => users?.find(u => u.id === id)?.username ?? '?'
  const isChallenger = challenge.challenger_id === user.id
  const opponentId = isChallenger ? challenge.opponent_id : challenge.challenger_id
  const opponentName = usernameOf(opponentId)

  return (
    <div className="min-h-dvh bg-black">
      <div className="flex items-center gap-4 px-5 pt-12 pb-5 border-b border-[#0f0f0f]">
        <Link href="/learndat"><ChevronLeft size={22} className="text-[#333]" /></Link>
        <h1 className="font-ops text-xl text-white">vs @{opponentName}</h1>
      </div>

      <div className="px-5 py-6 flex flex-col gap-6">
        {challenge.question && (
          <div className="bg-[#060606] border border-[#0f0f0f] p-4">
            <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest mb-2">The Question</div>
            <div className="font-oswald text-sm text-white leading-relaxed">{challenge.question}</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#060606] border border-[#0f0f0f] p-4 text-center">
            <div className="font-ops text-xl text-[#00FF88]">{challenge.stake_amount}</div>
            <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest">{challenge.currency} stake</div>
          </div>
          <div className="bg-[#060606] border border-[#0f0f0f] p-4 text-center">
            <div className="font-ops text-xl text-white uppercase">{challenge.status}</div>
            <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest">Status</div>
          </div>
        </div>

        {challenge.status === 'completed' && (
          <div className={`p-5 text-center border ${challenge.winner_id === user.id ? 'border-[#00FF88] bg-[rgba(0,255,136,0.05)]' : 'border-[#FF003C] bg-[rgba(255,0,60,0.05)]'}`}>
            <div className="font-ops text-2xl text-white mb-1">
              {challenge.winner_id === user.id ? 'You Won' : 'You Lost'}
            </div>
            {challenge.winner_id === user.id ? (
              <div className="font-ops text-lg text-[#00FF88]">+{challenge.winner_payout} {challenge.currency.toUpperCase()}</div>
            ) : (
              <div className="font-ops text-lg text-[#FF003C]">-{challenge.stake_amount} {challenge.currency.toUpperCase()}</div>
            )}
            <div className="font-mono text-[9px] text-[#333] mt-2 uppercase tracking-widest">
              Platform kept {challenge.platform_fee} · pot was {challenge.total_pot}
            </div>
          </div>
        )}

        <LearnDatActions
          challengeId={challenge.id}
          userId={user.id}
          challengerId={challenge.challenger_id}
          opponentId={challenge.opponent_id}
          status={challenge.status}
          opponentName={opponentName}
        />
      </div>
    </div>
  )
}
