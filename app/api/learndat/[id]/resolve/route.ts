import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { winnerId } = await request.json()
  if (!winnerId) return NextResponse.json({ error: 'winnerId required' }, { status: 400 })

  const service = createServiceClient()
  const { data: challenge } = await service
    .from('learndat_challenges')
    .select('challenger_id, opponent_id, status')
    .eq('id', params.id)
    .single()

  if (!challenge) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  if (challenge.challenger_id !== user.id && challenge.opponent_id !== user.id) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
  }
  if (![challenge.challenger_id, challenge.opponent_id].includes(winnerId)) {
    return NextResponse.json({ error: 'Winner must be a participant' }, { status: 400 })
  }

  const { error } = await service.rpc('resolve_learndat', {
    p_learndat_id: params.id,
    p_winner_id: winnerId,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
