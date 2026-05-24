import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Called by Vercel Cron every 5 minutes
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Resolve expired bombs
  const { data: bombCount } = await supabase.rpc('resolve_expired_bombs')

  // Auto-start circles that have reached their start date
  const { data: startedCircles } = await supabase
    .from('circles')
    .update({ status: 'active' })
    .eq('status', 'pending')
    .lte('start_date', new Date().toISOString())
    .select('id, name')

  // Auto-complete circles that have passed end date
  const { data: endedCircles } = await supabase
    .from('circles')
    .update({ status: 'completed' })
    .eq('status', 'active')
    .lte('end_date', new Date().toISOString())
    .select('id, name, creator_id')

  // For ended circles, determine winner and notify
  if (endedCircles) {
    for (const circle of endedCircles) {
      const { data: topMember } = await supabase
        .from('circle_members')
        .select('user_id, score')
        .eq('circle_id', circle.id)
        .eq('status', 'active')
        .order('score', { ascending: false })
        .limit(1)
        .single()

      if (topMember) {
        // Set winner
        await supabase
          .from('circles')
          .update({ winner_id: topMember.user_id })
          .eq('id', circle.id)

        // Calculate payout
        const { data: payoutData } = await supabase.rpc('calculate_payout', { p_circle_id: circle.id })

        // Notify winner
        await supabase.from('notifications').insert({
          user_id: topMember.user_id,
          type: 'winner_announced',
          title: '👑 YOU WON',
          body: `You won the "${circle.name}" circle! Payout: $${payoutData?.winner_payout?.toFixed(2) ?? '—'}`,
          circle_id: circle.id,
        })

        // Update winner stats
        await supabase.rpc('add_coins', {
          p_user_id: topMember.user_id,
          p_amount: 0,
          p_type: 'circle_won',
        })

        await supabase
          .from('users')
          .update({
            total_wins: supabase.rpc('total_wins' as any, {}),
          })
          .eq('id', topMember.user_id)
      }
    }
  }

  // Issue strikes for missed proofs (active circles that started)
  const { data: activeCircles } = await supabase
    .from('circles')
    .select('id, start_date, end_date')
    .eq('status', 'active')

  if (activeCircles) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(23, 59, 59, 999)
    const dayStart = new Date(yesterday)
    dayStart.setHours(0, 0, 0, 0)

    for (const circle of activeCircles) {
      // Get active members
      const { data: activeMembers } = await supabase
        .from('circle_members')
        .select('user_id')
        .eq('circle_id', circle.id)
        .eq('status', 'active')

      if (!activeMembers) continue

      // Get who submitted yesterday
      const { data: submitted } = await supabase
        .from('proofs')
        .select('user_id')
        .eq('circle_id', circle.id)
        .gte('submitted_at', dayStart.toISOString())
        .lte('submitted_at', yesterday.toISOString())

      const submittedIds = new Set(submitted?.map(p => p.user_id) ?? [])

      // Strike members who didn't submit
      for (const member of activeMembers) {
        if (!submittedIds.has(member.user_id)) {
          await supabase.rpc('issue_strike', {
            p_circle_id: circle.id,
            p_user_id: member.user_id,
            p_reason: 'missed_proof',
            p_issued_by: 'system',
          })
        }
      }
    }
  }

  return NextResponse.json({
    ok: true,
    bombs_resolved: bombCount ?? 0,
    circles_started: startedCircles?.length ?? 0,
    circles_ended: endedCircles?.length ?? 0,
    timestamp: new Date().toISOString(),
  })
}
