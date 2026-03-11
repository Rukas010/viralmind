'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getProfile } from '@/lib/auth'
import type { Profile } from '@/lib/supabase'
import { LayoutDashboard, Film, PlusCircle, Palette, Settings, LogOut, Zap, Menu, X } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/create', label: 'Create Video', icon: PlusCircle },
  { href: '/dashboard/videos', label: 'My Videos', icon: Film },
  { href: '/dashboard/templates', label: 'Templates', icon: Palette },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function init() {
      const p = await getProfile()
      if (!p) { router.push('/login'); return }
      setProfile(p)
      setLoading(false)
    }
    init()
  }, [router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-gray-800 bg-gray-950 fixed h-full">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Viralmind</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === item.href ? 'bg-purple-500/10 text-purple-400' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>
              <item.icon className="h-5 w-5" />{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-3">
          <div className="flex items-center gap-3 px-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
              {profile?.display_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{profile?.display_name}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-700 text-gray-300">{profile?.plan?.toUpperCase()}</span>
            </div>
          </div>
          <div className="px-3 text-xs text-gray-500">{profile?.credits_used}/{profile?.credits_limit} videos used</div>
          <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-900 w-full transition-all">
            <LogOut className="h-5 w-5" />Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">Viralmind</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-400">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-gray-950 pt-16">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${pathname === item.href ? 'bg-purple-500/10 text-purple-400' : 'text-gray-400'}`}>
                <item.icon className="h-5 w-5" />{item.label}
              </Link>
            ))}
            <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-400 w-full">
              <LogOut className="h-5 w-5" />Sign Out
            </button>
          </nav>
        </div>
      )}

      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">{children}</main>
    </div>
  )
}