import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// Bundle discounts: buying more at once costs less per unit.
const TIERS: Record<number, number> = { 1: 1, 5: 0.9, 10: 0.8 }

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { moveKey, tier } = await request.json()
  if (!moveKey || !TIERS[tier]) {
    return NextResponse.json({ error: 'moveKey and a valid tier (1, 5, or 10) are required' }, { status: 400 })
  }

  const service = createServiceClient()

  const { data: move } = await service.from('power_moves').select('*').eq('key', moveKey).eq('is_active', true).single()
  if (!move) return NextResponse.json({ error: 'Power move not found' }, { status: 404 })

  const price = Math.round(move.coin_cost * tier * TIERS[tier])

  const { data: profile } = await service.from('profiles').select('provcoins_balance').eq('id', user.id).single()
  if (!profile || profile.provcoins_balance < price) {
    return NextResponse.json({ error: 'Not enough ProvCoins' }, { status: 400 })
  }

  const { error: chargeErr } = await service.rpc('update_coin_balance', {
    p_user_id: user.id,
    p_currency: 'provcoins',
    p_amount: -price,
    p_type: 'power_move_kit_purchase',
    p_reference_id: move.id,
    p_description: `${tier}x ${move.name} Kit`,
  })
  if (chargeErr) return NextResponse.json({ error: chargeErr.message }, { status: 400 })

  const { data: existing } = await service
    .from('user_power_moves')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('power_move_id', move.id)
    .maybeSingle()

  let newQuantity: number
  if (existing) {
    newQuantity = existing.quantity + tier
    await service.from('user_power_moves').update({ quantity: newQuantity }).eq('id', existing.id)
  } else {
    newQuantity = tier
    await service.from('user_power_moves').insert({ user_id: user.id, power_move_id: move.id, quantity: newQuantity })
  }

  return NextResponse.json({ success: true, quantity: newQuantity, pricePaid: price })
}
