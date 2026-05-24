import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCoinCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { packId } = await request.json()
  if (!packId) return NextResponse.json({ error: 'packId required' }, { status: 400 })

  const [{ data: pack }, { data: profile }] = await Promise.all([
    supabase.from('coin_packs').select('*').eq('id', packId).single(),
    supabase.from('users').select('stripe_customer_id').eq('id', user.id).single(),
  ])

  if (!pack) return NextResponse.json({ error: 'Pack not found' }, { status: 404 })

  const customerId = profile?.stripe_customer_id
  if (!customerId) return NextResponse.json({ error: 'No Stripe customer' }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await createCoinCheckoutSession({
    customerId,
    packId,
    priceCents: pack.price_cents,
    userId: user.id,
    successUrl: `${appUrl}/wallet?success=true`,
    cancelUrl: `${appUrl}/wallet`,
  })

  return NextResponse.json({ url: session.url })
}
