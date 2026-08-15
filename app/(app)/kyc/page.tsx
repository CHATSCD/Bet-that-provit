import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import KycFlow from './KycFlow'

export default async function KycPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('mode, kyc_status, kyc_rejection_reason, kyc_submitted_at')
    .eq('id', user.id)
    .single()

  return (
    <KycFlow
      userId={user.id}
      mode={profile?.mode ?? 'free'}
      kycStatus={profile?.kyc_status ?? 'none'}
      rejectionReason={profile?.kyc_rejection_reason ?? null}
      submittedAt={profile?.kyc_submitted_at ?? null}
    />
  )
}
