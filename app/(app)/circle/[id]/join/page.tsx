import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Shield, AlertTriangle } from 'lucide-react'
import JoinButton from './JoinButton'

export default async function JoinCirclePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: circle }, { data: membership }, { data: profile }] = await Promise.all([
    supabase.from('circles').select('*').eq('id', params.id).single(),
    supabase.from('circle_members').select('id').eq('circle_id', params.id).eq('user_id', user.id).maybeSingle(),
    supabase.from('users').select('stripe_customer_id, username, is_admin').eq('id', user.id).single(),
  ])

  if (!circle) notFound()
  if (membership) redirect(`/circle/${params.id}`)

  if (circle.status === 'completed' || circle.status === 'canceled') {
    return (
      <div className="min-h-dvh bg-black flex flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertTriangle size={40} className="text-[#FF003C]" />
        <div className="font-ops text-xl text-white">Circle Closed</div>
        <div className="font-oswald text-sm text-[#444]">This circle is no longer accepting members.</div>
        <Link href="/home" className="font-mono text-[10px] text-[#00FF88] tracking-widest uppercase">← Back Home</Link>
      </div>
    )
  }

  // Get member count for pot summary
  const { count: memberCount } = await supabase
    .from('circle_members')
    .select('*', { count: 'exact', head: true })
    .eq('circle_id', params.id)

  const buyInCents = Math.round(circle.buy_in_amount * 100)
  const adminFeeCents = 199
  const totalCharge = buyInCents + adminFeeCents
  const projectedMembers = (memberCount ?? 0) + 1
  const projectedPot = projectedMembers * circle.buy_in_amount
  const stripeFee = parseFloat((projectedPot * 0.029 + 0.30).toFixed(2))
  const platformFee = parseFloat((projectedPot * 0.10).toFixed(2))
  const winnerPayout = parseFloat((projectedPot - stripeFee - platformFee).toFixed(2))

  const endDate = new Date(circle.end_date)
  const startDate = new Date(circle.start_date)
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="min-h-dvh bg-black">
      <div className="flex items-center gap-4 px-5 pt-12 pb-5 border-b border-[#0f0f0f]">
        <Link href={`/circle/${params.id}`}><ChevronLeft size={22} className="text-[#333]" /></Link>
        <div>
          <h1 className="font-ops text-xl text-white">Join Circle</h1>
          <p className="font-oswald text-xs text-[#444]">{circle.name}</p>
        </div>
      </div>

      <div className="px-5 py-6 flex flex-col gap-5">
        {/* Circle info */}
        <div className="bg-[#060606] border border-[#0f0f0f] p-4">
          <div className="font-ops text-base text-white mb-1">{circle.name}</div>
          <div className="font-oswald text-sm text-[#444] mb-3">{circle.challenge}</div>
          <div className="flex gap-4">
            <div>
              <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest">Start</div>
              <div className="font-ops text-sm text-white">{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest">End</div>
              <div className="font-ops text-sm text-white">{endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest">Days Left</div>
              <div className="font-ops text-sm text-[#00FF88]">{daysLeft}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] text-[#333] uppercase tracking-widest">Players</div>
              <div className="font-ops text-sm text-white">{memberCount ?? 0}</div>
            </div>
          </div>
        </div>

        {/* Charge breakdown */}
        <div className="bg-[#060606] border border-[#0f0f0f] p-4">
          <div className="font-mono text-[10px] text-[#333] uppercase tracking-widest mb-3">What You Pay Today</div>
          <div className="flex flex-col gap-2 mb-3">
            {[
              { label: 'Buy-in',    val: `$${circle.buy_in_amount.toFixed(2)}`, color: 'text-white' },
              { label: 'Admin fee (non-refundable)', val: '+$1.99', color: 'text-[#FF003C]' },
            ].map(r => (
              <div key={r.label} className="flex justify-between">
                <span className="font-oswald text-sm text-[#555]">{r.label}</span>
                <span className={`font-ops text-sm ${r.color}`}>{r.val}</span>
              </div>
            ))}
            <div className="border-t border-[#0f0f0f] pt-2 flex justify-between">
              <span className="font-ops text-sm text-white">Total charged now</span>
              <span className="font-ops text-sm text-[#00FF88]">${(totalCharge / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Projected payout */}
        <div className="bg-[rgba(0,255,136,0.03)] border border-[rgba(0,255,136,0.15)] p-4">
          <div className="font-mono text-[10px] text-[#00FF88] uppercase tracking-widest mb-3">
            If You Win ({projectedMembers} players)
          </div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Gross pot',       val: `$${projectedPot.toFixed(2)}`,   color: 'text-white' },
              { label: 'Stripe fees',     val: `-$${stripeFee}`,                 color: 'text-[#555]' },
              { label: 'Platform 10%',   val: `-$${platformFee}`,               color: 'text-[#555]' },
            ].map(r => (
              <div key={r.label} className="flex justify-between">
                <span className="font-oswald text-xs text-[#555]">{r.label}</span>
                <span className={`font-mono text-xs ${r.color}`}>{r.val}</span>
              </div>
            ))}
            <div className="border-t border-[rgba(0,255,136,0.1)] pt-2 flex justify-between">
              <span className="font-ops text-base text-white">You'd win</span>
              <span className="font-ops text-xl text-[#00FF88] shadow-green">${winnerPayout.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Rules reminder */}
        <div className="flex items-start gap-3 bg-[#060606] border border-[#0f0f0f] p-4">
          <Shield size={16} className="text-[#00CFFF] flex-shrink-0 mt-0.5" />
          <div className="font-oswald text-xs text-[#444] leading-relaxed">
            Submit live proof daily. 3 strikes = eliminated (money stays in pot). Admin fee is non-refundable even if circle is canceled.
          </div>
        </div>

        <JoinButton
          circleId={params.id}
          circleName={circle.name}
          totalChargeCents={totalCharge}
          hasStripeCustomer={!!profile?.stripe_customer_id}
          isAdmin={!!profile?.is_admin}
        />
      </div>
    </div>
  )
}
