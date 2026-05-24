import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, ADMIN_FEE_CENTS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { circleId } = await request.json()
  if (!circleId) return NextResponse.json({ error: 'circleId required' }, { status: 400 })

  const [{ data: circle }, { data: profile }] = await Promise.all([
    supabase.from('circles').select('*').eq('id', circleId).single(),
    supabase.from('users').select('stripe_customer_id, username').eq('id', user.id).single(),
  ])

  if (!circle) return NextResponse.json({ error: 'Circle not found' }, { status: 404 })
  if (circle.status === 'completed' || circle.status === 'canceled') {
    return NextResponse.json({ error: 'Circle is no longer active' }, { status: 400 })
  }

  // Check not already a member
  const { data: existing } = await supabase
    .from('circle_members')
    .select('id')
    .eq('circle_id', circleId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 400 })

  let customerId = profile?.stripe_customer_id

  // Auto-create Stripe customer if needed
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const buyInCents = Math.round(circle.buy_in_amount * 100)
  const totalCents = buyInCents + ADMIN_FEE_CENTS
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: buyInCents,
          product_data: { name: `${circle.name} — Buy-In`, description: circle.challenge },
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          unit_amount: ADMIN_FEE_CENTS,
          product_data: { name: 'illProvIt Admin Fee', description: 'Non-refundable platform fee' },
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/circle/${circleId}?joined=true`,
    cancel_url: `${appUrl}/circle/${circleId}/join`,
    metadata: {
      type: 'circle_join',
      circle_id: circleId,
      user_id: user.id,
      buy_in_cents: buyInCents,
      admin_fee_cents: ADMIN_FEE_CENTS,
    },
  })

  // Pre-insert circle_member record (will be confirmed via webhook)
  await supabase.from('circle_members').insert({
    circle_id: circleId,
    user_id: user.id,
    stripe_payment_intent_id: session.payment_intent as string,
  })

  return NextResponse.json({ url: session.url })
}
