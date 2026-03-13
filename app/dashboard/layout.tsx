'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Video,
  PlusCircle,
  Layout,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { getCurrentUser, getProfile, signOut } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import Logo from '@/components/Logo';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Create Video', href: '/dashboard/create', icon: PlusCircle, badge: 'New' },
  { label: 'My Videos', href: '/dashboard/videos', icon: Video },
  { label: 'Templates', href: '/dashboard/templates', icon: Layout },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }
        const profileData = await getProfile();
        setProfile(profileData);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#09090b]">
        <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const plan = profile?.plan || 'free';
  const creditsUsed = profile?.credits_used || 0;
  const creditsLimit = profile?.credits_limit || 3;
  const usagePercent = creditsLimit > 0 ? Math.round((creditsUsed / creditsLimit) * 100) : 0;
  const displayName = profile?.display_name || 'User';
  const firstLetter = displayName.charAt(0).toUpperCase();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-zinc-200 dark:border-zinc-800">
        <Logo size="md" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                active
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-purple-600' : ''}`} />
              {item.label}
              {item.badge && (
                <span className="ml-auto text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Credits */}
      <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Credits</span>
          <span className="text-[11px] text-zinc-500">
            {creditsUsed}/{creditsLimit === -1 ? '∞' : creditsLimit}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              usagePercent > 90
                ? 'bg-red-500'
                : usagePercent > 70
                ? 'bg-amber-500'
                : 'bg-purple-600'
            }`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-[13px] font-semibold text-purple-600">
            {firstLetter}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-zinc-500 capitalize">{plan} plan</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className="flex-1 h-8 rounded-md flex items-center justify-center gap-2 text-[12px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex items-center justify-between px-4">
        <Logo size="sm" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="h-8 w-8 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white dark:bg-[#09090b] pt-14">
          <div className="flex flex-col h-full">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="md:pl-56">
        <div className="px-6 py-8 md:px-8 md:py-8 pt-20 md:pt-8 max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}