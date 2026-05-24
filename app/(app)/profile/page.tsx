import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Trophy, Zap, Target } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: badges }, { data: circleHistory }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('user_badges')
      .select('earned_at, badges(key, name, icon, color)')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false }),
    supabase.from('circle_members')
      .select('status, strike_count, score, circles(name, status, end_date)')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })
      .limit(10),
  ])

  async function signOut() {
    'use server'
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="min-h-dvh bg-black">
      {/* Header */}
      <div className="px-5 pt-12 pb-6 border-b border-[#0f0f0f]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-ops text-2xl text-[#00FF88]">
                  {profile?.username?.[0]?.toUpperCase() ?? '?'}
                </span>
              )}
            </div>
            <div>
              <div className="font-ops text-xl text-white">@{profile?.username}</div>
              <div className="font-mono text-[10px] text-[#333] tracking-widest mt-1">
                Member since {new Date(profile?.created_at ?? '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
          <form action={signOut}>
            <button type="submit" className="p-2 border border-[#0f0f0f] hover:border-[#1a1a1a] transition-colors">
              <LogOut size={16} className="text-[#333]" />
            </button>
          </form>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Trophy, label: 'Wins',    value: profile?.total_wins ?? 0,   color: '#FFD700' },
            { icon: Target, label: 'Earned',  value: `$${(profile?.total_earned ?? 0).toFixed(0)}`, color: '#00FF88' },
            { icon: Zap,    label: 'Streak',  value: `${profile?.win_streak ?? 0}🔥`, color: '#FF003C' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-[#060606] border border-[#0f0f0f] p-3 text-center">
              <div className="font-ops text-lg" style={{ color }}>{value}</div>
              <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-6">

        {/* Badges */}
        <section>
          <h2 className="font-ops text-xs tracking-widest uppercase text-[#333] mb-3">Badges</h2>
          {badges && badges.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {badges.map(ub => {
                const badge = ub.badges as any
                return (
                  <div key={badge.key} className="bg-[#060606] border border-[#0f0f0f] p-3 flex flex-col items-center gap-1 text-center">
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="font-ops text-[10px] text-white leading-tight">{badge.name}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-6 text-center border border-dashed border-[#0f0f0f]">
              <div className="font-ops text-sm text-[#333]">No badges yet.</div>
              <div className="font-oswald text-xs text-[#222] mt-1">Win a circle. Earn your first badge.</div>
            </div>
          )}
        </section>

        {/* Circle History */}
        <section>
          <h2 className="font-ops text-xs tracking-widest uppercase text-[#333] mb-3">Circle History</h2>
          {circleHistory && circleHistory.length > 0 ? (
            <div className="flex flex-col gap-2">
              {circleHistory.map((m, i) => {
                const circle = m.circles as any
                return (
                  <div key={i} className="flex items-center gap-3 bg-[#060606] border border-[#0f0f0f] p-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-ops text-sm text-white truncate">{circle?.name}</div>
                      <div className="font-mono text-[9px] text-[#333]">{circle?.status}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-ops text-sm text-white">{m.score} pts</div>
                      <div className="flex gap-0.5 justify-end mt-0.5">
                        {[0,1,2].map(j => (
                          <div key={j} className={`w-1.5 h-1.5 rounded-full ${j < m.strike_count ? 'bg-[#FF003C]' : 'bg-[#1a1a1a]'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-6 text-center border border-dashed border-[#0f0f0f]">
              <div className="font-ops text-sm text-[#333]">No circles yet.</div>
              <Link href="/circle/create" className="font-mono text-[10px] text-[#00FF88] tracking-widest uppercase mt-1 block">
                Create Your First →
              </Link>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
