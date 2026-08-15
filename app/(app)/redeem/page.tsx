import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ShieldAlert } from 'lucide-react'
import Button from '@/components/ui/Button'
import RedeemForm from './RedeemForm'

export default async function RedeemPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: minimum }, { data: history }] = await Promise.all([
    supabase.from('profiles').select('mode, kyc_status, can_redeem, betit_balance, betit_earned').eq('id', user.id).single(),
    supabase.from('current_redemption_minimum').select('*').single(),
    supabase.from('redemption_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
  ])

  const eligible = profile?.mode === 'real_money' && profile?.kyc_status === 'full_approved' && profile?.can_redeem

  if (!eligible) {
    return (
      <div className="min-h-dvh bg-black flex flex-col items-center justify-center gap-4 px-6 text-center">
        <ShieldAlert size={40} className="text-[#FFD700]" />
        <h1 className="font-ops text-xl text-white">Redemption Locked</h1>
        <p className="font-oswald text-sm text-[#555] max-w-xs leading-relaxed">
          Cashing out BetIt needs Real Money Mode and full ID verification.
        </p>
        <Link href="/kyc"><Button size="lg">Verify Your Identity</Button></Link>
        <Link href="/wallet" className="font-mono text-[10px] text-[#333] tracking-widest uppercase">← Back to Wallet</Link>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-black">
      <div className="flex items-center gap-4 px-5 pt-12 pb-5 border-b border-[#0f0f0f]">
        <Link href="/wallet"><ChevronLeft size={22} className="text-[#333]" /></Link>
        <h1 className="font-ops text-xl text-white">Redeem BetIt</h1>
      </div>

      <div className="px-5 py-6 flex flex-col gap-6">
        <RedeemForm
          betitBalance={profile?.betit_balance ?? 0}
          betitEarned={profile?.betit_earned ?? 0}
          minimumBetit={minimum?.minimum_redemption_betit ?? 0}
          averagePotCents={minimum?.average_pot_cents ?? 0}
        />

        {history && history.length > 0 && (
          <section>
            <h2 className="font-ops text-xs tracking-widest uppercase text-[#333] mb-3">History</h2>
            <div className="flex flex-col gap-2">
              {history.map(r => (
                <div key={r.id} className="flex items-center justify-between bg-[#060606] border border-[#0f0f0f] p-3">
                  <div>
                    <div className="font-ops text-sm text-white">{r.amount_betit} BetIt</div>
                    <div className="font-mono text-[9px] text-[#333]">
                      {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${(r.amount_usd_cents / 100).toFixed(2)}
                    </div>
                  </div>
                  <span
                    className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 border"
                    style={{
                      color: r.status === 'completed' ? '#00FF88' : r.status === 'rejected' ? '#FF003C' : '#FFD700',
                      borderColor: r.status === 'completed' ? 'rgba(0,255,136,0.4)' : r.status === 'rejected' ? 'rgba(255,0,60,0.4)' : 'rgba(255,215,0,0.4)',
                    }}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
