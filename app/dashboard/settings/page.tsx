'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCurrentUser, getProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Loader2, Check, ExternalLink, Zap, Crown,
} from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '\$0',
    period: '',
    features: ['3 videos / month', '720p export', 'Watermarked'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '\$19',
    period: '/mo',
    features: ['30 videos / month', '1080p Full HD', 'No watermark', 'Priority render'],
    badge: 'Popular',
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: '\$49',
    period: '/mo',
    features: ['Unlimited videos', '4K export', 'Voice cloning', 'API access'],
  },
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) return;
      setEmail(user.email || '');

      const p = await getProfile();
      if (p) {
        setProfile(p);
        setDisplayName(p.display_name || '');
      }
      setLoading(false);
    }
    load();
  }, []);

  // Handle billing redirect
  useEffect(() => {
    const billing = searchParams.get('billing');
    if (billing === 'success') {
      toast.success('Subscription activated! Your plan has been upgraded.');
      // Reload profile to get updated plan
      setTimeout(async () => {
        const user = await getCurrentUser();
        if (user) {
          const p = await getProfile();
          if (p) {
            setProfile(p);
            setDisplayName(p.display_name || '');
          }
        }
      }, 2000);
    } else if (billing === 'cancelled') {
      toast('Checkout cancelled');
    }
  }, [searchParams]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to save');
    } else {
      toast.success('Settings saved');
    }
    setSaving(false);
  };

  const handleUpgrade = async (planId: string) => {
    setCheckingOut(planId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Not authenticated');
        return;
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to start checkout');
      }
    } catch {
      toast.error('Failed to start checkout');
    } finally {
      setCheckingOut(null);
    }
  };

  const handleManageBilling = async () => {
    setOpeningPortal(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to open billing portal');
      }
    } catch {
      toast.error('Failed to open billing portal');
    } finally {
      setOpeningPortal(false);
    }
  };

  const creditsUsed = profile?.credits_used || 0;
  const creditsLimit = profile?.credits_limit || 3;
  const creditsPercent = Math.min((creditsUsed / creditsLimit) * 100, 100);
  const currentPlan = profile?.plan || 'free';
  const isPaid = currentPlan !== 'free';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-64 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Settings</h1>
        <p className="text-[13px] text-zinc-500 mt-0.5">Manage your account, plan, and billing.</p>
      </div>

      {/* Profile */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Profile</h2>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-500 cursor-not-allowed"
            />
          </div>
          <div className="pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Save changes
            </button>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Subscription</h2>
          {isPaid && (
            <button
              onClick={handleManageBilling}
              disabled={openingPortal}
              className="inline-flex items-center gap-1.5 text-[12px] text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-50"
            >
              {openingPortal ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ExternalLink className="h-3 w-3" />
              )}
              Manage billing
            </button>
          )}
        </div>
        <div className="px-5 py-5 space-y-5">
          {/* Current plan info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-md flex items-center justify-center ${
                isPaid ? 'bg-purple-100 dark:bg-purple-500/10' : 'bg-zinc-100 dark:bg-zinc-800'
              }`}>
                {isPaid ? (
                  <Crown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Zap className="h-4 w-4 text-zinc-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">{currentPlan} plan</p>
                <p className="text-[12px] text-zinc-500">
                  {creditsUsed} of {creditsLimit} videos used
                  {profile?.plan_period_end && (
                    <> • Renews {new Date(profile.plan_period_end).toLocaleDateString()}</>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Usage bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] text-zinc-500">Monthly usage</span>
              <span className="text-[12px] text-zinc-400">{creditsPercent.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  creditsPercent >= 90 ? 'bg-red-500' : creditsPercent >= 70 ? 'bg-amber-500' : 'bg-purple-500'
                }`}
                style={{ width: `${creditsPercent}%` }}
              />
            </div>
          </div>

          {/* Plan cards */}
          <div>
            <p className="text-[12px] font-medium text-zinc-500 uppercase tracking-wider mb-3">
              {isPaid ? 'Change plan' : 'Upgrade'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PLANS.map((plan) => {
                const isCurrent = plan.id === currentPlan;
                const isDowngrade =
                  (currentPlan === 'ultra' && plan.id !== 'ultra') ||
                  (currentPlan === 'pro' && plan.id === 'free');

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-lg border p-4 ${
                      isCurrent
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-500/[0.05]'
                        : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-2 right-3 text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-2 py-0.5 rounded-full">
                        {plan.badge}
                      </span>
                    )}

                    <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-0.5">{plan.name}</p>
                    <div className="flex items-baseline gap-0.5 mb-3">
                      <span className="text-xl font-bold text-zinc-900 dark:text-white">{plan.price}</span>
                      {plan.period && <span className="text-[12px] text-zinc-400">{plan.period}</span>}
                    </div>

                    <div className="space-y-1.5 mb-4">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-center gap-1.5">
                          <Check className={`h-3 w-3 flex-shrink-0 ${isCurrent ? 'text-purple-500' : 'text-zinc-400'}`} />
                          <span className="text-[12px] text-zinc-500">{f}</span>
                        </div>
                      ))}
                    </div>

                    {isCurrent ? (
                      <div className="text-[12px] font-medium text-purple-600 dark:text-purple-400 text-center py-1.5">
                        Current plan
                      </div>
                    ) : plan.id === 'free' ? (
                      isPaid ? (
                        <button
                          onClick={handleManageBilling}
                          disabled={openingPortal}
                          className="w-full text-[12px] font-medium text-zinc-500 text-center py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          Downgrade
                        </button>
                      ) : null
                    ) : isDowngrade ? (
                      <button
                        onClick={handleManageBilling}
                        disabled={openingPortal}
                        className="w-full text-[12px] font-medium text-zinc-500 text-center py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        Change plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={checkingOut === plan.id}
                        className="w-full text-[12px] font-medium text-white bg-purple-600 hover:bg-purple-500 text-center py-1.5 rounded-md transition-colors disabled:opacity-50"
                      >
                        {checkingOut === plan.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                        ) : (
                          `Upgrade to ${plan.name}`
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Account</h2>
        </div>
        <div className="px-5 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-zinc-500">Account ID</span>
            <span className="text-[12px] text-zinc-400 font-mono">{profile?.id?.slice(0, 8)}...</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-zinc-500">Member since</span>
            <span className="text-[13px] text-zinc-400">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
            </span>
          </div>
          {profile?.stripe_customer_id && (
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-zinc-500">Billing ID</span>
              <span className="text-[12px] text-zinc-400 font-mono">{profile.stripe_customer_id.slice(0, 12)}...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={(
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-zinc-400 animate-spin" />
        </div>
      )}
    >
      <SettingsContent />
    </Suspense>
  );
}