import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { opponentUsername, stakeAmount, question, circleId } = await request.json()
  if (!opponentUsername || !stakeAmount || stakeAmount <= 0) {
    return NextResponse.json({ error: 'opponentUsername and a positive stakeAmount are required' }, { status: 400 })
  }

  const service = createServiceClient()

  const [{ data: profile }, { data: opponent }, { data: learndatMove }] = await Promise.all([
    service.from('profiles').select('mode, betdat_balance, betit_balance').eq('id', user.id).single(),
    service.from('users').select('id, username').ilike('username', opponentUsername.replace(/^@/, '')).single(),
    service.from('power_moves').select('id').eq('key', 'learndat').eq('is_active', true).single(),
  ])

  if (!opponent) return NextResponse.json({ error: 'No player found with that handle' }, { status: 404 })
  if (opponent.id === user.id) return NextResponse.json({ error: "You can't challenge yourself" }, { status: 400 })

  const currency = profile?.mode === 'real_money' ? 'betit' : 'betdat'
  const myBalance = currency === 'betit' ? profile?.betit_balance : profile?.betdat_balance
  if ((myBalance ?? 0) < stakeAmount) {
    return NextResponse.json({ error: `Not enough ${currency.toUpperCase()}` }, { status: 400 })
  }

  // Sending a LearnDat challenge spends one token from a purchased kit, same as any other power move.
  let learndatInventory: { id: string; quantity: number } | null = null
  if (learndatMove) {
    const { data: inv } = await service
      .from('user_power_moves')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('power_move_id', learndatMove.id)
      .maybeSingle()
    if (!inv || inv.quantity <= 0) {
      return NextResponse.json({ error: "You don't own a LearnDat kit. Buy one in the Arsenal first." }, { status: 400 })
    }
    learndatInventory = inv
  }

  const { data: challenge, error } = await service
    .from('learndat_challenges')
    .insert({
      circle_id: circleId ?? null,
      challenger_id: user.id,
      opponent_id: opponent.id,
      stake_amount: stakeAmount,
      currency,
      question: question || null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (learndatMove && learndatInventory) {
    await service.from('user_power_moves').update({ quantity: learndatInventory.quantity - 1 }).eq('id', learndatInventory.id)
    await service.from('power_move_usage').insert({
      user_id: user.id,
      power_move_id: learndatMove.id,
      target_user_id: opponent.id,
      cost_paid: 0,
    })
  }

  await service.from('notifications').insert({
    user_id: opponent.id,
    type: 'personal_challenge',
    title: '🧠 LearnDat Challenge',
    body: `You've been challenged to a ${stakeAmount} ${currency.toUpperCase()} LearnDat.`,
  })

  return NextResponse.json({ success: true, id: challenge.id })
}
