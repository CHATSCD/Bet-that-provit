import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  const { circleId } = await request.json()
  if (!circleId) return NextResponse.json({ error: 'circleId required' }, { status: 400 })

  const { data: circle } = await supabase
    .from('circles')
    .select('id, status')
    .eq('id', circleId)
    .single()

  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 })
  if (circle.status === 'completed' || circle.status === 'canceled') {
    return NextResponse.json({ error: 'Circle is no longer active' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('circle_members')
    .select('id')
    .eq('circle_id', circleId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 400 })

  const { error } = await supabase.from('circle_members').insert({
    circle_id: circleId,
    user_id: user.id,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
