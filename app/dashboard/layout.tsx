'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getProfile, signOut } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Zap, LayoutDashboard, Plus, Film, Grid3X3, Settings,
  LogOut, Menu, X, ChevronRight,
} from 'lucide-react';

interface Profile {
  display_name: string;
  plan: string;
  credits_used: number;
  credits_limit: number;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/create', label: 'Create Video', icon: Plus },
  { href: '/dashboard/videos', label: 'My Videos', icon: Film },
  { href: '/dashboard/templates', label: 'Templates', icon: Grid3X3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const p = await getProfile();
      if (p) setProfile(p as Profile);
      setLoading(false);
    }
    load();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="h-4 w-4 border-2 border-zinc-300 dark:border-zinc-700 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  const creditsUsed = profile?.credits_used || 0;
  const creditsLimit = profile?.credits_limit || 3;
  const creditsPercent = Math.min((creditsUsed / creditsLimit) * 100, 100);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b]">

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="fixed top-0 left-0 bottom-0 w-56 bg-white dark:bg-[#0c0c0e] border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col z-40">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-zinc-100 dark:border-zinc-800/50">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-600">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">Viralmind</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                {item.label}
                {item.href === '/dashboard/create' && (
                  <span className="ml-auto text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-1.5 py-0.5 rounded">
                    New
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-4 space-y-3">
          {/* Credits */}
          <div className="px-2.5 py-3 rounded-md bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Credits</span>
              <span className="text-[11px] text-zinc-400">{creditsUsed}/{creditsLimit}</span>
            </div>
            <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${creditsPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-2.5">
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <LogOut className="h-3 w-3" />
              Log out
            </button>
          </div>

          {/* User */}
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md">
            <div className="h-7 w-7 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              {profile?.display_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-zinc-900 dark:text-white truncate">
                {profile?.display_name || 'User'}
              </p>
              <p className="text-[11px] text-zinc-400 capitalize">{profile?.plan || 'free'} plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE HEADER ===== */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white dark:bg-[#0c0c0e] border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-600">
            <Zap className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">Viralmind</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-500"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-white dark:bg-[#09090b] pt-14">
          <nav className="px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-3 rounded-md text-sm ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-white font-medium'
                      : 'text-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                    {item.label}
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-700" />
                </Link>
              );
            })}
          </nav>

          <div className="px-4 pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-4 px-3">
              <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[12px] font-semibold text-zinc-600 dark:text-zinc-400">
                {profile?.display_name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{profile?.display_name || 'User'}</p>
                <p className="text-[12px] text-zinc-400 capitalize">{profile?.plan || 'free'} plan • {creditsUsed}/{creditsLimit} credits</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-3 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white w-full"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="md:ml-56 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}           