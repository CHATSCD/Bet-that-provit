import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Users, DollarSign, Zap } from 'lucide-react'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: profile }, { data: myCircles }, { data: publicCircles }] = await Promise.all([
    supabase.from('users').select('username, coin_balance, total_wins, total_earned').eq('id', user.id).single(),
    supabase.from('circle_members')
      .select('circle_id, status, strike_count, circles(id, name, challenge, status, end_date, buy_in_amount)')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })
      .limit(10),
    supabase.from('circles')
      .select('id, name, challenge, buy_in_amount, end_date, status')
      .eq('is_public', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const activeCircles = myCircles?.filter(m => (m.circles as any)?.status === 'active') ?? []
  const now = new Date()

  return (
    <div className="min-h-dvh bg-black">
      {/* Header */}
      <div className="px-5 pt-12 pb-5 border-b border-[#0f0f0f]">
        <div className="font-mono text-[10px] tracking-[5px] text-[#00FF88] mb-1">@illprovit</div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-ops text-2xl text-white">
              {profile?.username ?? 'Arena'}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono text-xs text-[#333]">
                {profile?.total_wins ?? 0} wins · ${(profile?.total_earned ?? 0).toFixed(2)} earned
              </span>
            </div>
          </div>
          <Link
            href="/wallet"
            className="flex items-center gap-1.5 bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2"
          >
            <Zap size={12} className="text-[#FFD700]" />
            <span className="font-ops text-sm text-[#FFD700]">{profile?.coin_balance ?? 0}</span>
            <span className="font-mono text-[9px] text-[#333] uppercase tracking-widest">coins</span>
          </Link>
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-6">

        {/* My Active Circles */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-ops text-sm tracking-widest uppercase text-[#333]">My Circles</h2>
            <Link href="/circle/create" className="flex items-center gap-1 font-mono text-[10px] text-[#00FF88] tracking-widest uppercase">
              <Plus size={10} />
              Create
            </Link>
          </div>

          {activeCircles.length === 0 ? (
            <Link href="/circle/create" className="block">
              <div className="border border-dashed border-[#1a1a1a] p-6 flex flex-col items-center gap-3 hover:border-[#00FF88] hover:bg-[rgba(0,255,136,0.02)] transition-all">
                <Plus size={24} className="text-[#333]" />
                <div className="text-center">
                  <div className="font-ops text-sm text-white">Start a Circle</div>
                  <div className="font-oswald text-xs text-[#333] mt-1">Call out your crew. Put money on it.</div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              {activeCircles.map(m => {
                const circle = m.circles as any
                const endDate = new Date(circle.end_date)
                const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

                return (
                  <Link key={m.circle_id} href={`/circle/${m.circle_id}`}>
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 hover:border-[#00FF88] transition-all active:scale-[0.98]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-ops text-base text-white truncate">{circle.name}</div>
                          <div className="font-oswald text-xs text-[#555] mt-0.5 truncate">{circle.challenge}</div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="font-ops text-sm text-[#00FF88]">${circle.buy_in_amount}</div>
                          <div className="font-mono text-[9px] text-[#333]">{daysLeft}d left</div>
                        </div>
                      </div>
                      {/* Strike dots */}
                      {m.status === 'active' && (
                        <div className="flex items-center gap-1 mt-3">
                          {[0,1,2].map(i => (
                            <div
                              key={i}
                              className={`w-2.5 h-2.5 rounded-full ${i < m.strike_count ? 'bg-[#FF003C] shadow-[0_0_6px_#FF003C]' : 'bg-[#1a1a1a]'}`}
                            />
                          ))}
                          <span className="font-mono text-[9px] text-[#333] ml-1 tracking-widest uppercase">
                            {m.strike_count}/3 strikes
                          </span>
                        </div>
                      )}
                      {m.status === 'eliminated_spectator' && (
                        <div className="mt-2">
                          <span className="font-mono text-[9px] text-[#FF003C] tracking-widest uppercase">
                            Eliminated — Spectating
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Public Circles */}
        {publicCircles && publicCircles.length > 0 && (
          <section>
            <h2 className="font-ops text-sm tracking-widest uppercase text-[#333] mb-3">Open Arenas</h2>
            <div className="flex flex-col gap-2">
              {publicCircles.map(c => {
                const endDate = new Date(c.end_date)
                const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
                return (
                  <Link key={c.id} href={`/circle/${c.id}`}>
                    <div className="bg-[#060606] border border-[#0f0f0f] p-4 flex items-center gap-3 hover:border-[#1a1a1a] transition-all active:scale-[0.98]">
                      <div className="flex-1 min-w-0">
                        <div className="font-ops text-sm text-white truncate">{c.name}</div>
                        <div className="font-oswald text-xs text-[#444] truncate">{c.challenge}</div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="font-ops text-sm text-[#00FF88]">${c.buy_in_amount}</div>
                        <div className="font-mono text-[9px] text-[#333]">{daysLeft}d left</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
