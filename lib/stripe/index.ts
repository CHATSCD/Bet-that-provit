import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
})

export const ADMIN_FEE_CENTS = 199 // $1.99

export async function createCustomer(email: string, userId: string) {
  return stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  })
}

export async function createConnectedAccount(email: string) {
  return stripe.accounts.create({
    type: 'express',
    email,
    capabilities: { transfers: { requested: true } },
  })
}

export async function getOnboardingLink(accountId: string, returnUrl: string, refreshUrl: string) {
  return stripe.accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: 'account_onboarding',
  })
}

export async function createPaymentIntent(
  customerId: string,
  amountCents: number,
  circleId: string,
  userId: string
) {
  return stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    customer: customerId,
    setup_future_usage: 'off_session',
    metadata: { circle_id: circleId, user_id: userId },
  })
}

export async function chargeCircleMember(params: {
  customerId: string
  paymentMethodId: string
  buyInCents: number
  circleId: string
  userId: string
}) {
  const total = params.buyInCents + ADMIN_FEE_CENTS
  return stripe.paymentIntents.create({
    amount: total,
    currency: 'usd',
    customer: params.customerId,
    payment_method: params.paymentMethodId,
    confirm: true,
    off_session: true,
    metadata: {
      circle_id: params.circleId,
      user_id: params.userId,
      buy_in_cents: params.buyInCents,
      admin_fee_cents: ADMIN_FEE_CENTS,
    },
  })
}

export async function calculatePotSummary(memberCount: number, buyInCents: number) {
  const grossPot = memberCount * buyInCents
  const stripeFee = Math.round(grossPot * 0.029 + 30)
  const platformFee = Math.round(grossPot * 0.10)
  const winnerPayout = grossPot - stripeFee - platformFee
  return { grossPot, stripeFee, platformFee, winnerPayout }
}

export async function payoutWinner(params: {
  connectedAccountId: string
  amountCents: number
  circleId: string
  winnerId: string
}) {
  return stripe.transfers.create({
    amount: params.amountCents,
    currency: 'usd',
    destination: params.connectedAccountId,
    metadata: { circle_id: params.circleId, winner_id: params.winnerId },
  })
}

export async function refundPaymentIntent(paymentIntentId: string, amountCents: number) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amountCents,
  })
}

export async function createCoinCheckoutSession(params: {
  customerId: string
  packId: string
  priceCents: number
  userId: string
  successUrl: string
  cancelUrl: string
}) {
  return stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: params.priceCents,
        product_data: { name: 'ProvCoins', description: 'illProvIt in-app currency' },
      },
      quantity: 1,
    }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { pack_id: params.packId, user_id: params.userId, type: 'coin_purchase' },
  })
}
