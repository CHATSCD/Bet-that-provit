import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { proofId } = await request.json()
  if (!proofId) return NextResponse.json({ error: 'proofId required' }, { status: 400 })

  const { data, error } = await supabase.rpc('process_bullshit_vote', {
    p_proof_id: proofId,
    p_voter_id: user.id,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
