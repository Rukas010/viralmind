'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { getProfile, getCurrentUser } from '@/lib/auth'
import type { Profile } from '@/lib/supabase'
import { Loader2, User, CreditCard, Shield } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser()
      const p = await getProfile()
      if (!p || !user) return
      setProfile(p)
      setEmail(user.email || '')
      setDisplayName(p.display_name)
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, updated_at: new Date().toISOString() })
      .eq('id', profile.id)

    if (error) {
      toast.error('Failed to save settings')
      setSaving(false)
      return
    }

    setProfile({ ...profile, display_name: displayName })
    toast.success('Settings saved')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-48 bg-gray-800" />
        <Skeleton className="h-64 bg-gray-800 rounded-xl" />
        <Skeleton className="h-48 bg-gray-800 rounded-xl" />
      </div>
    )
  }

  const planLabels: Record<string, string> = {
    free: 'Free — 3 videos/month',
    pro: 'Pro — 30 videos/month',
    ultra: 'Ultra — Unlimited videos',
  }

  return (
    <div className="p-6 lg:p-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-gray-400">Manage your account and preferences.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <User className="h-5 w-5 text-purple-400" />
              </div>
              <CardTitle className="text-white">Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Display Name</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Your name or channel name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Email</Label>
                <Input
                  value={email}
                  disabled
                  className="bg-gray-800 border-gray-700 text-gray-500"
                />
                <p className="text-xs text-gray-600">Email cannot be changed here.</p>
              </div>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-400" />
              </div>
              <CardTitle className="text-white">Subscription</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Current Plan</p>
              <p className="text-lg font-semibold text-white">{planLabels[profile?.plan || 'free']}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Usage This Month</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${Math.min(((profile?.credits_used || 0) / (profile?.credits_limit || 3)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400">
                  {profile?.credits_used}/{profile?.credits_limit}
                </span>
              </div>
            </div>
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white" disabled>
              Upgrade Plan (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-amber-400" />
              </div>
              <CardTitle className="text-white">Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Account ID</p>
              <p className="text-xs text-gray-600 font-mono mt-1">{profile?.user_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Member Since</p>
              <p className="text-sm text-white">{new Date(profile?.created_at || '').toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}