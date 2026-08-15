import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Check onboarding complete (age gate + mode selection)
  const { data: profile } = await supabase
    .from('profiles')
    .select('age_status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.age_status === 'unknown') redirect('/onboarding')

  // Unread notification count
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <main className="flex-1 pb-24">
        {children}
      </main>
      <BottomNav unreadCount={count ?? 0} />
    </div>
  )
}
