// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentSucceeded(paymentIntent)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleRefund(charge)
        break
      }

      default:
        console.log(`Unhandled event: ${event.type}`)
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const productType = session.metadata?.product_type // 'provcoins' | 'betit' | 'betdat'
  const amount = Number(session.metadata?.coin_amount || 0)

  if (!userId || !productType || !amount) {
    throw new Error('Missing metadata on checkout session')
  }

  if (productType === 'provcoins') {
    await supabase.rpc('update_coin_balance', {
      p_user_id: userId,
      p_currency: 'provcoins',
      p_amount: amount,
      p_type: 'purchase',
      p_reference_id: session.id,
      p_description: 'ProvCoins purchase',
    })
  }

  if (productType === 'betit' || productType === 'betdat') {
    await supabase.rpc('add_soft_currency', {
      p_user_id: userId,
      p_currency: productType,
      p_amount: amount,
      p_is_bonus: true,
      p_source: 'purchase',
      p_reference_id: session.id,
    })
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata?.user_id
  const circleId = paymentIntent.metadata?.circle_id
  const type = paymentIntent.metadata?.type // 'circle_entry'

  if (type === 'circle_entry' && userId && circleId) {
    // Record $1.99 platform fee
    await supabase.from('platform_revenue').insert({
      source: 'circle_entry_fee',
      circle_id: circleId,
      user_id: userId,
      amount_cents: 199,
      description: '$1.99 Circle entry fee',
    })

    // Add buy-in to pot (everything except the $1.99)
    const buyInCents = paymentIntent.amount - 199

    await supabase.rpc('add_to_circle_pot', {
      p_circle_id: circleId,
      p_amount_cents: buyInCents,
      p_user_id: userId,
    })
  }
}

async function handleRefund(charge: Stripe.Charge) {
  // Optional: reverse coin credits if you want
  console.log('Refund received:', charge.id)
}
