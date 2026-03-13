'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  User,
  CreditCard,
  Shield,
  Save,
  Loader2,
  Crown,
  Zap,
  Check,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUser, getProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'account', label: 'Account', icon: Shield },
] as const;

type TabId = (typeof TABS)[number]['id'];

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const billing = searchParams.get('billing');
    if (billing === 'success') {
      toast.success('Subscription updated successfully!');
      setActiveTab('subscription');
    } else if (billing === 'cancelled') {
      toast.info('Billing update cancelled.');
      setActiveTab('subscription');
    }
  }, [searchParams]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }
        const profileData = await getProfile();
        if (profileData) {
          setProfile(profileData);
          setDisplayName(profileData.display_name || '');
          setEmail(user.email || '');
        }
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName, updated_at: new Date().toISOString() })
        .eq('id', profile.id);
      if (error) throw error;
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error(data.error || 'Failed to start checkout');
    } catch {
      toast.error('Failed to start checkout');
    }
  };

  const handleManageBilling = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error(data.error || 'Failed to open billing portal');
    } catch {
      toast.error('Failed to open billing portal');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-zinc-400 animate-spin" />
      </div>
    );
  }

  const plan = profile?.plan || 'free';
  const creditsUsed = profile?.credits_used || 0;
  const creditsLimit = profile?.credits_limit || 3;
  const usagePercent = creditsLimit > 0 ? Math.round((creditsUsed / creditsLimit) * 100) : 0;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Settings</h1>
        <p className="text-[13px] text-zinc-500 mt-1">Manage your account, plan, and billing.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-[1px] ${
                isActive
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30">
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Profile</h2>
          </div>
          <div className="px-5 py-5 space-y-4">
            <div>
              <label className="text-[13px] font-medium text-zinc-900 dark:text-white block mb-1.5">
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-[14px] text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-zinc-900 dark:text-white block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 text-[14px] text-zinc-500 cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-9 rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-[13px] font-medium px-4 flex items-center gap-2 transition-colors"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save changes
            </button>
          </div>
        </div>
      )}

      {/* Subscription tab */}
      {activeTab === 'subscription' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30">
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Subscription</h2>
              {plan !== 'free' && (
                <button
                  onClick={handleManageBilling}
                  className="text-[12px] text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" /> Manage billing
                </button>
              )}
            </div>
            <div className="px-5 py-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    plan === 'free'
                      ? 'bg-zinc-100 dark:bg-zinc-800'
                      : 'bg-purple-100 dark:bg-purple-900/30'
                  }`}
                >
                  {plan === 'free' ? (
                    <Zap className="h-5 w-5 text-zinc-500" />
                  ) : (
                    <Crown className="h-5 w-5 text-purple-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white capitalize">
                    {plan} Plan
                  </p>
                  <p className="text-[12px] text-zinc-500">
                    {creditsUsed} of {creditsLimit === -1 ? 'unlimited' : creditsLimit} videos used
                  </p>
                </div>
              </div>
              <div className="mb-1.5 flex justify-between">
                <span className="text-[12px] text-zinc-500">Monthly usage</span>
                <span className="text-[12px] text-zinc-500">{usagePercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    usagePercent > 90
                      ? 'bg-red-500'
                      : usagePercent > 70
                      ? 'bg-amber-500'
                      : 'bg-purple-600'
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              {profile?.plan_period_end && (
                <p className="text-[11px] text-zinc-400 mt-2">
                  Renews {new Date(profile.plan_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Plan cards */}
          <div>
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide mb-3">
              Change Plan
            </p>
            <div className="grid grid-cols-3 gap-3">
              {/* Free */}
              <div
                className={`rounded-lg border p-4 ${
                  plan === 'free'
                    ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-900/10'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30'
                }`}
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Free</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                  $0
                </p>
                <ul className="mt-3 space-y-1.5">
                  <li className="text-[12px] text-zinc-500 flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-zinc-400" /> 3 videos / month
                  </li>
                  <li className="text-[12px] text-zinc-500 flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-zinc-400" /> 720p export
                  </li>
                  <li className="text-[12px] text-zinc-500 flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-zinc-400" /> Watermarked
                  </li>
                </ul>
                {plan === 'free' ? (
                  <p className="text-[12px] text-purple-600 font-medium mt-4 text-center">
                    Current plan
                  </p>
                ) : (
                  <button className="w-full h-8 mt-4 rounded-md border border-zinc-200 dark:border-zinc-700 text-[12px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    Downgrade
                  </button>
                )}
              </div>

              {/* Pro */}
              <div
                className={`rounded-lg border p-4 relative ${
                  plan === 'pro'
                    ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-900/10'
                    : 'border-purple-200 dark:border-purple-800 bg-white dark:bg-zinc-900/30'
                }`}
              >
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-purple-600 text-white px-2 py-0.5 rounded-full">
                  Popular
                </span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Pro</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                  $19
                  <span className="text-sm font-normal text-zinc-500">/mo</span>
                </p>
                <ul className="mt-3 space-y-1.5">
                  <li className="text-[12px] text-zinc-500 flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-purple-500" /> 30 videos / month
                  </li>
                  <li className="text-[12px] text-zinc-500 flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-purple-500" /> 1080p Full HD
                  </li>
                  <li className="text-[12px] text-zinc-500 flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-purple-500" /> No watermark
                  </li>
                  <li className="text-[12px] text-zinc-500 flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-purple-500" /> Priority render
                  </li>
                </ul>
                {plan === 'pro' ? (
                  <p className="text-[12px] text-purple-600 font-medium mt-4 text-center">
                    Current plan
                  </p>
                ) : (
                  <button
                    onClick={() => handleUpgrade('pro')}
                    className="w-full h-8 mt-4 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-[12px] font-medium"
                  >
                    Upgrade to Pro
                  </button>
                )}
              </div>

              {/* Ultra */}
              <div
                className={`rounded-lg border p-4 ${
                  plan === 'ultra'
                    ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-900/10'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30'
                }`}
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Ultra
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                  $49
                  <span className="text-sm font-normal text-zinc-500">/mo</span>
                </p>
                <ul className="mt-3 space-y-1.5">
                  <li className="text-[12px] text-zinc-500 flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-purple-500" /> Unlimited videos
                  </li>
                  <li className="text-[12px] text-zinc-500 flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-purple-500" /> 4K export
                  </li>
                  <li className="text-[12px] text-zinc-500 flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-purple-500" /> Voice cloning
                  </li>
                  <li className="text-[12px] text-zinc-500 flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-purple-500" /> API access
                  </li>
                </ul>
                {plan === 'ultra' ? (
                  <p className="text-[12px] text-purple-600 font-medium mt-4 text-center">
                    Current plan
                  </p>
                ) : (
                  <button
                    onClick={() => handleUpgrade('ultra')}
                    className="w-full h-8 mt-4 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-[12px] font-medium"
                  >
                    Upgrade to Ultra
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account tab */}
      {activeTab === 'account' && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30">
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text:white">Account</h2>
          </div>
          <div className="px-5 py-5 space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-[13px] text-zinc-500">Account ID</span>
              <span className="text-[13px] text-zinc-900 dark:text-white font-mono">
                {profile?.id?.slice(0, 8)}...
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[13px] text-zinc-500">Member since</span>
              <span className="text-[13px] text-zinc-900 dark:text-white">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : '—'}
              </span>
            </div>
            {profile?.stripe_customer_id && (
              <div className="flex items-center justify-between py-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[13px] text-zinc-500">Billing ID</span>
                <span className="text-[13px] text-zinc-900 dark:text-white font-mono">
                  {profile.stripe_customer_id.slice(0, 14)}...
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-zinc-400 animate-spin" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}