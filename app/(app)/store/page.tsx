import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StoreFront from './StoreFront'

export default async function StorePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: powerMoves }, { data: myCircles }] = await Promise.all([
    supabase.from('profiles').select('provcoins_balance').eq('id', user.id).single(),
    supabase.from('power_moves').select('*').eq('is_active', true).order('coin_cost'),
    supabase.from('circle_members')
      .select('circle_id, circles(id, name, status)')
      .eq('user_id', user.id)
      .eq('status', 'active'),
  ])

  const activeCircles = myCircles
    ?.filter(m => (m.circles as any)?.status === 'active')
    .map(m => ({ id: m.circle_id, name: (m.circles as any)?.name })) ?? []

  return (
    <StoreFront
      userId={user.id}
      provcoinsBalance={profile?.provcoins_balance ?? 0}
      powerMoves={powerMoves ?? []}
      activeCircles={activeCircles}
    />
  )
}
