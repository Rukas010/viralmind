'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, getProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';

interface Profile {
  id: string;
  display_name: string;
  plan: string;
  credits_used: number;
  credits_limit: number;
  created_at: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) return;
      setEmail(user.email || '');

      const p = await getProfile();
      if (p) {
        setProfile(p as Profile);
        setDisplayName((p as Profile).display_name || '');
      }
      setLoading(false);
    }
    load();
  }, []);

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

  const creditsUsed = profile?.credits_used || 0;
  const creditsLimit = profile?.credits_limit || 3;
  const creditsPercent = Math.min((creditsUsed / creditsLimit) * 100, 100);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-64 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Settings</h1>
        <p className="text-[13px] text-zinc-500 mt-0.5">Manage your account and preferences.</p>
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
            <p className="text-[11px] text-zinc-400 mt-1">Email cannot be changed</p>
          </div>
          <div className="pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Save changes
            </button>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Subscription</h2>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">{profile?.plan || 'free'} plan</p>
              <p className="text-[12px] text-zinc-500">{creditsUsed} of {creditsLimit} videos used this month</p>
            </div>
            <button
              disabled
              className="text-[13px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md cursor-not-allowed"
            >
              Upgrade — Coming soon
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] text-zinc-500">Usage</span>
              <span className="text-[12px] text-zinc-400">{creditsPercent.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${creditsPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Account info */}
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
        </div>
      </div>
    </div>
  );
}