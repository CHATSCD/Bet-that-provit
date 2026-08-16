import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amountBetit } = await request.json()
  if (!amountBetit || amountBetit <= 0) {
    return NextResponse.json({ error: 'A positive amountBetit is required' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data, error } = await service.rpc('request_redemption', {
    p_user_id: user.id,
    p_amount_betit: amountBetit,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, redemptionId: data })
}
