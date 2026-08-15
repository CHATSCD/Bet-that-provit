// app/api/stripe/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const PACKAGES = {
  provcoins_50:   { coins: 50,   price: 499,  type: 'provcoins' },
  provcoins_220:  { coins: 220,  price: 1999, type: 'provcoins' },
  provcoins_600:  { coins: 600,  price: 4999, type: 'provcoins' },
  betit_2500:     { coins: 2500, price: 499,  type: 'betit' },
  betit_12000:    { coins: 12000,price: 1999, type: 'betit' },
  betit_40000:    { coins: 40000,price: 4999, type: 'betit' },
} as const

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { packageId } = await req.json()
  const pkg = PACKAGES[packageId as keyof typeof PACKAGES]

  if (!pkg) {
    return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: pkg.type === 'provcoins' ? `\( {pkg.coins} ProvCoins` : ` \){pkg.coins} BetIt Coins`,
          },
          unit_amount: pkg.price,
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
      product_type: pkg.type,
      coin_amount: pkg.coins.toString(),
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?canceled=1`,
  })

  return NextResponse.json({ url: session.url })
}
