import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, getPlanByPriceId, PLANS } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

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
    console.error('STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
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

        // Get subscription to find the plan
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = (subscription as any).items?.data[0]?.price.id;
        const plan = priceId ? getPlanByPriceId(priceId) : 'free';
        const credits = PLANS[plan].credits;

        await supabase
          .from('profiles')
          .update({
            plan,
            stripe_subscription_id: subscriptionId,
            credits_limit: credits,
            credits_used: 0,
            plan_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          })
          .eq('user_id', userId);

        console.log(`User ${userId} upgraded to ${plan}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        // Find user by stripe customer id
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) break;

        const priceId = (subscription as any).items?.data[0]?.price.id;
        const plan = priceId ? getPlanByPriceId(priceId) : 'free';
        const credits = PLANS[plan].credits;

        const updateData: Record<string, unknown> = {
          plan,
          credits_limit: credits,
          stripe_subscription_id: subscription.id,
          plan_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        };

        // Reset credits on new billing period
        if (subscription.status === 'active') {
          updateData.credits_used = 0;
        }

        await supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', profile.user_id);

        console.log(`User ${profile.user_id} subscription updated to ${plan}`);
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

        console.log(`User ${profile.user_id} downgraded to free`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null;
        };
        const customerId = invoice.customer as string;
        const subscriptionId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id;

        if (!subscriptionId) break;

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) break;

        // Reset credits on successful recurring payment
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = (subscription as any).items?.data[0]?.price.id;
        const plan = priceId ? getPlanByPriceId(priceId) : 'free';
        const credits = PLANS[plan].credits;

        await supabase
          .from('profiles')
          .update({
            credits_used: 0,
            credits_limit: credits,
            plan_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          })
          .eq('user_id', profile.user_id);

        console.log(`User ${profile.user_id} credits reset on invoice payment`);
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}