import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const TARGET_REQUIRED = new Set(['spy_mode', 'spy_reveal', 'personal_challenge', 'strike_bomb', 'force_dare'])

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { moveKey, circleId, targetUserId, challengeText } = await request.json()
  if (!moveKey) return NextResponse.json({ error: 'moveKey required' }, { status: 400 })

  const service = createServiceClient()

  const { data: move } = await service
    .from('power_moves')
    .select('*')
    .eq('key', moveKey)
    .eq('is_active', true)
    .single()
  if (!move) return NextResponse.json({ error: 'Power move not found' }, { status: 404 })

  if (TARGET_REQUIRED.has(moveKey)) {
    if (!targetUserId) return NextResponse.json({ error: 'This move needs a target' }, { status: 400 })
    if (targetUserId === user.id) return NextResponse.json({ error: 'Cannot target yourself' }, { status: 400 })
  }
  if (['strike_bomb', 'strike_shield', 'strike_back', 'personal_challenge', 'crown_flex', 'double_points'].includes(moveKey) && !circleId) {
    return NextResponse.json({ error: 'This move needs a circle' }, { status: 400 })
  }

  // Firing is free — the ProvCoins cost is paid up front when the kit is bought.
  // It just consumes one unit from inventory.
  const { data: inventory } = await service
    .from('user_power_moves')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('power_move_id', move.id)
    .maybeSingle()
  if (!inventory || inventory.quantity <= 0) {
    return NextResponse.json({ error: `You don't own any ${move.name}. Buy a kit first.` }, { status: 400 })
  }

  // Move-specific eligibility checks BEFORE charging
  let currentStrikeCount: number | undefined
  if (circleId && ['strike_bomb', 'strike_shield', 'strike_back', 'personal_challenge'].includes(moveKey)) {
    const { data: membership } = await service
      .from('circle_members')
      .select('*')
      .eq('circle_id', circleId)
      .eq('user_id', user.id)
      .single()
    if (!membership || membership.status !== 'active') {
      return NextResponse.json({ error: 'Not an active member of this circle' }, { status: 400 })
    }

    if (moveKey === 'strike_shield' && membership.has_shield) {
      return NextResponse.json({ error: 'Shield already active' }, { status: 400 })
    }
    if (moveKey === 'strike_back' && membership.strike_count <= 0) {
      return NextResponse.json({ error: 'No strikes to remove' }, { status: 400 })
    }
    currentStrikeCount = membership.strike_count
    if (moveKey === 'strike_bomb') {
      const { data: circle } = await service.from('circles').select('end_date').eq('id', circleId).single()
      if (circle && new Date(circle.end_date).getTime() - Date.now() < 24 * 60 * 60 * 1000) {
        return NextResponse.json({ error: 'Strike Bomb disabled in the final 24 hours' }, { status: 400 })
      }
      const { data: targetMember } = await service
        .from('circle_members').select('status').eq('circle_id', circleId).eq('user_id', targetUserId).single()
      if (!targetMember || targetMember.status !== 'active') {
        return NextResponse.json({ error: 'Target not found or eliminated' }, { status: 400 })
      }
    }
    if (moveKey === 'personal_challenge' && !challengeText?.trim()) {
      return NextResponse.json({ error: 'Challenge text required' }, { status: 400 })
    }
  }

  // Consume one unit of inventory — already paid for at kit-purchase time.
  const { error: consumeErr } = await service
    .from('user_power_moves')
    .update({ quantity: inventory.quantity - 1 })
    .eq('id', inventory.id)
  if (consumeErr) return NextResponse.json({ error: consumeErr.message }, { status: 400 })

  await service.from('power_move_usage').insert({
    user_id: user.id,
    power_move_id: move.id,
    circle_id: circleId ?? null,
    target_user_id: targetUserId ?? null,
    cost_paid: 0,
  })

  const result: Record<string, unknown> = { success: true, name: move.name, remainingQuantity: inventory.quantity - 1 }

  switch (moveKey) {
    case 'strike_shield': {
      await service.from('circle_members').update({ has_shield: true }).eq('circle_id', circleId).eq('user_id', user.id)
      break
    }
    case 'strike_back': {
      const { data: m } = await service.from('circle_members')
        .update({ strike_count: (currentStrikeCount ?? 1) - 1 })
        .eq('circle_id', circleId).eq('user_id', user.id).select('strike_count').single()
      result.newStrikeCount = m?.strike_count
      break
    }
    case 'strike_bomb': {
      const { data: bomb } = await service.from('strike_bombs').insert({
        circle_id: circleId, attacker_id: user.id, target_id: targetUserId,
      }).select('id').single()
      result.bombId = bomb?.id
      await service.from('notifications').insert({
        user_id: targetUserId, type: 'bomb_incoming', title: '💣 INCOMING BOMB',
        body: 'You have 2 hours to submit proof or take a strike!', circle_id: circleId,
      })
      break
    }
    case 'personal_challenge': {
      await service.from('personal_challenges').insert({
        circle_id: circleId, challenger_id: user.id, target_id: targetUserId, challenge_text: challengeText,
      })
      await service.from('notifications').insert({
        user_id: targetUserId, type: 'personal_challenge', title: "🎯 You've Been Challenged!",
        body: challengeText, circle_id: circleId,
      })
      break
    }
    case 'force_dare': {
      if (circleId) {
        await service.from('notifications').insert({
          user_id: targetUserId, type: 'personal_challenge', title: '🎲 Force Dare',
          body: 'Someone forced you into a Dare instead of a Truth.', circle_id: circleId,
        })
      }
      break
    }
    case 'spy_mode': {
      let query = service.from('proofs').select('submitted_at').eq('user_id', targetUserId).order('submitted_at', { ascending: false }).limit(1)
      if (circleId) query = query.eq('circle_id', circleId)
      const { data: lastProof } = await query.maybeSingle()
      result.lastSubmittedAt = lastProof?.submitted_at ?? null
      break
    }
    case 'spy_reveal': {
      const { data: targetProfile } = await service.from('profiles').select('mode, betdat_balance, betit_balance').eq('id', targetUserId).single()
      result.targetBalance = targetProfile?.mode === 'real_money' ? targetProfile.betit_balance : targetProfile?.betdat_balance
      result.targetCurrency = targetProfile?.mode === 'real_money' ? 'betit' : 'betdat'
      break
    }
    case 'crown_flex':
    case 'double_points':
    case 'double_intensity':
      // Cosmetic / self-buff moves — charge + usage log above is the full effect.
      break
  }

  return NextResponse.json(result)
}
