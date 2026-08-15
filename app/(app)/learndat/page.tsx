import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Brain, Plus } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  pending:   '#FFD700',
  active:    '#00CFFF',
  completed: '#00FF88',
  declined:  '#333',
}

export default async function LearnDatListPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: challenges } = await supabase
    .from('learndat_challenges')
    .select('*')
    .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const userIds = Array.from(new Set((challenges ?? []).flatMap(c => [c.challenger_id, c.opponent_id])))
  const { data: users } = userIds.length
    ? await supabase.from('users').select('id, username').in('id', userIds)
    : { data: [] }
  const usernameOf = (id: string) => users?.find(u => u.id === id)?.username ?? '?'

  return (
    <div className="min-h-dvh bg-black">
      <div className="px-5 pt-12 pb-5 border-b border-[#0f0f0f] flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-[5px] text-[#00FF88] mb-1">1V1</div>
          <h1 className="font-ops text-2xl text-white">LearnDat</h1>
        </div>
        <Link href="/learndat/new" className="flex items-center gap-2 bg-[#00FF88] text-black px-4 py-2.5 font-ops text-xs tracking-widest uppercase">
          <Plus size={14} /> Challenge
        </Link>
      </div>

      <div className="px-5 py-5 flex flex-col gap-2">
        {!challenges || challenges.length === 0 ? (
          <div className="bg-[#060606] border border-dashed border-[#1a1a1a] p-8 text-center">
            <Brain size={28} className="text-[#333] mx-auto mb-2" />
            <div className="font-ops text-sm text-[#333]">No challenges yet.</div>
            <Link href="/learndat/new" className="font-mono text-[10px] text-[#00FF88] tracking-widest uppercase mt-2 block">
              Challenge someone →
            </Link>
          </div>
        ) : (
          challenges.map(c => {
            const isChallenger = c.challenger_id === user.id
            const opponentName = usernameOf(isChallenger ? c.opponent_id : c.challenger_id)
            const won = c.status === 'completed' && c.winner_id === user.id
            const lost = c.status === 'completed' && c.winner_id !== user.id

            return (
              <Link key={c.id} href={`/learndat/${c.id}`} className="flex items-center gap-3 bg-[#060606] border border-[#0f0f0f] p-4 active:scale-[0.98] transition-transform">
                <div className="w-10 h-10 rounded-full bg-[#111] border border-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                  <span className="font-ops text-sm text-[#00FF88]">{opponentName[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-ops text-sm text-white truncate">vs @{opponentName}</div>
                  <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest">
                    {c.stake_amount} {c.currency.toUpperCase()} stake
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-[9px] uppercase tracking-widest" style={{ color: STATUS_COLOR[c.status] ?? '#333' }}>
                    {c.status}
                  </div>
                  {won && <div className="font-ops text-xs text-[#00FF88]">+{c.winner_payout}</div>}
                  {lost && <div className="font-ops text-xs text-[#FF003C]">-{c.stake_amount}</div>}
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
