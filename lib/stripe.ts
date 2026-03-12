import Stripe from 'stripe';

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(key, { apiVersion: '2026-02-25.clover' });
}

export const PLANS = {
  free: {
    name: 'Free',
    credits: 3,
    price: 0,
    priceId: null,
  },
  pro: {
    name: 'Pro',
    credits: 30,
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID || null,
  },
  ultra: {
    name: 'Ultra',
    credits: 999,
    price: 49,
    priceId: process.env.STRIPE_ULTRA_PRICE_ID || null,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanId {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro';
  if (priceId === process.env.STRIPE_ULTRA_PRICE_ID) return 'ultra';
  return 'free';
}