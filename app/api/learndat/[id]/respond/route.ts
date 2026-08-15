import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await request.json()
  if (!['accept', 'decline'].includes(action)) {
    return NextResponse.json({ error: 'action must be accept or decline' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: challenge } = await service
    .from('learndat_challenges')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!challenge) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  if (challenge.opponent_id !== user.id) return NextResponse.json({ error: 'Only the challenged player can respond' }, { status: 403 })
  if (challenge.status !== 'pending') return NextResponse.json({ error: 'Challenge already resolved' }, { status: 400 })

  if (action === 'decline') {
    await service.from('learndat_challenges').update({ status: 'declined' }).eq('id', params.id)
    return NextResponse.json({ success: true, status: 'declined' })
  }

  // Accept: verify both sides can cover the stake, then debit both.
  const currency = challenge.currency as 'betdat' | 'betit'
  const balanceCol = currency === 'betit' ? 'betit_balance' : 'betdat_balance'

  const [{ data: challengerProfile }, { data: opponentProfile }] = await Promise.all([
    service.from('profiles').select(balanceCol).eq('id', challenge.challenger_id).single(),
    service.from('profiles').select(balanceCol).eq('id', challenge.opponent_id).single(),
  ])

  if (((challengerProfile as any)?.[balanceCol] ?? 0) < challenge.stake_amount) {
    return NextResponse.json({ error: `Challenger no longer has enough ${currency.toUpperCase()}` }, { status: 400 })
  }
  if (((opponentProfile as any)?.[balanceCol] ?? 0) < challenge.stake_amount) {
    return NextResponse.json({ error: `You don't have enough ${currency.toUpperCase()}` }, { status: 400 })
  }

  const { error: challengerDebitErr } = await service.rpc('update_coin_balance', {
    p_user_id: challenge.challenger_id,
    p_currency: currency,
    p_amount: -challenge.stake_amount,
    p_type: 'learndat_stake',
    p_reference_id: challenge.id,
    p_description: 'LearnDat stake',
  })
  if (challengerDebitErr) return NextResponse.json({ error: challengerDebitErr.message }, { status: 400 })

  const { error: opponentDebitErr } = await service.rpc('update_coin_balance', {
    p_user_id: challenge.opponent_id,
    p_currency: currency,
    p_amount: -challenge.stake_amount,
    p_type: 'learndat_stake',
    p_reference_id: challenge.id,
    p_description: 'LearnDat stake',
  })
  if (opponentDebitErr) {
    // Compensate the challenger since the opponent's debit failed.
    await service.rpc('update_coin_balance', {
      p_user_id: challenge.challenger_id,
      p_currency: currency,
      p_amount: challenge.stake_amount,
      p_type: 'learndat_stake_refund',
      p_reference_id: challenge.id,
      p_description: 'LearnDat stake refund',
    })
    return NextResponse.json({ error: opponentDebitErr.message }, { status: 400 })
  }

  await service.from('learndat_challenges').update({ status: 'active' }).eq('id', params.id)
  return NextResponse.json({ success: true, status: 'active' })
}
