import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { targetUserId, amount } = await request.json()
  if (!targetUserId || !amount || amount <= 0) {
    return NextResponse.json({ error: 'targetUserId and positive amount required' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: target, error: fetchErr } = await service
    .from('users')
    .select('id, username, coin_balance')
    .eq('id', targetUserId)
    .single()

  if (fetchErr || !target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { error } = await service
    .from('users')
    .update({ coin_balance: target.coin_balance + amount })
    .eq('id', targetUserId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await service.from('coin_transactions').insert({
    user_id: targetUserId,
    amount,
    type: 'admin_grant',
    description: `Admin grant by ${user.id}`,
  })

  return NextResponse.json({ success: true, newBalance: target.coin_balance + amount })
}
