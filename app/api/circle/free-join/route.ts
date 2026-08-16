import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { circleId } = await request.json()
  if (!circleId) return NextResponse.json({ error: 'circleId required' }, { status: 400 })

  const service = createServiceClient()

  const { data: circle } = await service.from('circles').select('*').eq('id', circleId).single()
  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 })
  if (circle.currency !== 'betdat') return NextResponse.json({ error: 'This circle requires real-money checkout' }, { status: 400 })
  if (circle.status !== 'pending' && circle.creator_id !== user.id) {
    return NextResponse.json({ error: 'Circle is no longer accepting members' }, { status: 400 })
  }

  const { data: existing } = await service.from('circle_members').select('id').eq('circle_id', circleId).eq('user_id', user.id).maybeSingle()
  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 400 })

  if (circle.buy_in_amount > 0) {
    const { error: debitErr } = await service.rpc('update_coin_balance', {
      p_user_id: user.id,
      p_currency: 'betdat',
      p_amount: -circle.buy_in_amount,
      p_type: 'circle_stake',
      p_reference_id: circleId,
      p_description: `Staked into ${circle.name}`,
    })
    if (debitErr) return NextResponse.json({ error: debitErr.message }, { status: 400 })
  }

  const { error: joinErr } = await service.from('circle_members').insert({
    circle_id: circleId,
    user_id: user.id,
    paid_at: new Date().toISOString(),
  })
  if (joinErr) return NextResponse.json({ error: joinErr.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
