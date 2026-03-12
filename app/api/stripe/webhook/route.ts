import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getPlanByPriceId, PLANS } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const subscriptionId = session.subscription as string;

        if (!userId || !subscriptionId) break;

        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId
        )) as Stripe.Subscription;
        const currentPeriodEnd = (subscription as any)
          .current_period_end as number;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = priceId ? getPlanByPriceId(priceId) : 'free';
        const credits = PLANS[plan].credits;

        await supabase
          .from('profiles')
          .update({
            plan,
            stripe_subscription_id: subscriptionId,
            credits_limit: credits,
            credits_used: 0,
            plan_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
          })
          .eq('user_id', userId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) break;

        const priceId = subscription.items.data[0]?.price.id;
        const plan = priceId ? getPlanByPriceId(priceId) : 'free';
        const credits = PLANS[plan].credits;
        const currentPeriodEnd = (subscription as any)
          .current_period_end as number;

        const updateData: Record<string, unknown> = {
          plan,
          credits_limit: credits,
          stripe_subscription_id: subscription.id,
          plan_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
        };

        if (subscription.status === 'active') {
          updateData.credits_used = 0;
        }

        await supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', profile.user_id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) break;

        await supabase
          .from('profiles')
          .update({
            plan: 'free',
            credits_limit: PLANS.free.credits,
            stripe_subscription_id: null,
            plan_period_end: null,
          })
          .eq('user_id', profile.user_id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;
        const subscriptionId = (invoice as any).subscription as string;

        if (!subscriptionId) break;

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) break;

        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId
        )) as Stripe.Subscription;
        const currentPeriodEnd = (subscription as any)
          .current_period_end as number;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = priceId ? getPlanByPriceId(priceId) : 'free';
        const credits = PLANS[plan].credits;

        await supabase
          .from('profiles')
          .update({
            credits_used: 0,
            credits_limit: credits,
            plan_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
          })
          .eq('user_id', profile.user_id);
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}