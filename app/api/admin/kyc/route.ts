import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: admin } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!admin?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { targetUserId, action, reason } = await request.json()
  if (!targetUserId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'targetUserId and action (approve|reject) required' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('kyc_status, age_status')
    .eq('id', targetUserId)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const newStatus = action === 'approve' ? 'full_approved' : 'rejected'
  const now = new Date().toISOString()

  const { error } = await service
    .from('profiles')
    .update({
      kyc_status: newStatus,
      can_redeem: action === 'approve',
      kyc_approved_at: action === 'approve' ? now : null,
      kyc_rejected_at: action === 'reject' ? now : null,
      kyc_rejection_reason: action === 'reject' ? (reason ?? 'Documents could not be verified') : null,
      age_status: action === 'approve' ? 'verified_18_plus' : profile.age_status,
    })
    .eq('id', targetUserId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await service.from('kyc_events').insert({
    user_id: targetUserId,
    old_status: profile.kyc_status,
    new_status: newStatus,
    provider: 'manual_review',
    notes: `${action === 'approve' ? 'Approved' : 'Rejected'} by admin ${user.id}${reason ? `: ${reason}` : ''}`,
  })

  return NextResponse.json({ success: true, status: newStatus })
}
