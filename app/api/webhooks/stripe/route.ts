import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as any
      const { circle_id, user_id, buy_in_cents, admin_fee_cents } = pi.metadata

      if (circle_id && user_id) {
        await Promise.all([
          supabase.from('transactions').insert({
            circle_id,
            user_id,
            type: 'buy_in',
            amount: parseInt(buy_in_cents) / 100,
            stripe_payment_id: pi.id,
          }),
          supabase.from('transactions').insert({
            circle_id,
            user_id,
            type: 'admin_fee',
            amount: parseInt(admin_fee_cents) / 100,
            stripe_payment_id: pi.id,
            description: 'illProvIt admin fee',
          }),
          supabase.from('circle_members')
            .update({ stripe_payment_intent_id: pi.id, paid_at: new Date().toISOString() })
            .eq('circle_id', circle_id)
            .eq('user_id', user_id),
          supabase.rpc('add_coins', {
            p_user_id: user_id,
            p_amount: 0,
            p_type: 'payment_confirmed',
          }),
        ])
      }
      break
    }

    case 'checkout.session.completed': {
      const session = event.data.object as any
      if (session.metadata?.type === 'coin_purchase') {
        const { pack_id, user_id } = session.metadata

        const { data: pack } = await supabase
          .from('coin_packs')
          .select('coins, bonus_coins')
          .eq('id', pack_id)
          .single()

        if (pack) {
          const totalCoins = pack.coins + pack.bonus_coins
          await supabase.rpc('add_coins', {
            p_user_id: user_id,
            p_amount: totalCoins,
            p_type: 'coin_purchase',
            p_description: `Purchased ${totalCoins} coins`,
          })
        }
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as any
      const { circle_id, user_id } = pi.metadata

      if (circle_id && user_id) {
        await supabase.from('notifications').insert({
          user_id,
          type: 'circle_started',
          title: 'Payment Failed',
          body: 'Your buy-in payment failed. Update your payment method to join.',
          circle_id,
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
