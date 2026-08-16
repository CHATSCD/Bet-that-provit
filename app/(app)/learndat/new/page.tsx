import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewLearnDatForm from './NewLearnDatForm'

export default async function NewLearnDatPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: move } = await supabase.from('power_moves').select('id').eq('key', 'learndat').eq('is_active', true).single()

  let ownedQuantity = 0
  if (move) {
    const { data: inv } = await supabase
      .from('user_power_moves')
      .select('quantity')
      .eq('user_id', user.id)
      .eq('power_move_id', move.id)
      .maybeSingle()
    ownedQuantity = inv?.quantity ?? 0
  }

  return <NewLearnDatForm ownedQuantity={ownedQuantity} />
}
