import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { idDocPath, selfiePath } = await request.json()
  if (!idDocPath || !selfiePath) {
    return NextResponse.json({ error: 'idDocPath and selfiePath required' }, { status: 400 })
  }
  // Uploaded paths must live under this user's own folder in the private bucket.
  if (!idDocPath.startsWith(`${user.id}/`) || !selfiePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: 'Invalid document path' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('kyc_status, kyc_attempts')
    .eq('id', user.id)
    .single()

  if (profile?.kyc_status === 'full_approved') {
    return NextResponse.json({ error: 'Already verified' }, { status: 400 })
  }

  const referenceId = randomUUID()
  const oldStatus = profile?.kyc_status ?? 'none'

  const { error: updateErr } = await service
    .from('profiles')
    .update({
      kyc_status: 'pending',
      kyc_level: 'full',
      kyc_provider: 'manual_review',
      kyc_reference_id: referenceId,
      kyc_submitted_at: new Date().toISOString(),
      kyc_attempts: (profile?.kyc_attempts ?? 0) + 1,
      kyc_rejection_reason: null,
    })
    .eq('id', user.id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  await service.from('kyc_events').insert({
    user_id: user.id,
    old_status: oldStatus,
    new_status: 'pending',
    provider: 'manual_review',
    reference_id: referenceId,
    notes: `Submitted ID (${idDocPath}) and selfie (${selfiePath})`,
  })

  return NextResponse.json({ success: true })
}
