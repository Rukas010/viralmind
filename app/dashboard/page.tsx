'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser, getProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
  Plus, Film, ArrowRight, Clock,
  CheckCircle2, Loader2, AlertCircle,
} from 'lucide-react';

interface Profile {
  display_name: string;
  plan: string;
  credits_used: number;
  credits_limit: number;
}

interface Video {
  id: string;
  title: string;
  style: string;
  status: string;
  created_at: string;
}

export default function DashboardOverview() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) return;

      const p = await getProfile();
      if (p) setProfile(p as Profile);

      const { data } = await supabase
        .from('videos')
        .select('id, title, style, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) setVideos(data);
      setLoading(false);
    }
    load();
  }, []);

  const totalVideos = videos.length;
  const readyCount = videos.filter((v) => v.status === 'ready').length;
  const generatingCount = videos.filter((v) => v.status === 'generating').length;
  const creditsLeft = (profile?.credits_limit || 3) - (profile?.credits_used || 0);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
      case 'generating': return <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" />;
      case 'failed': return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
      default: return <Clock className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}
          </h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">
            Here&apos;s what&apos;s happening with your videos.
          </p>
        </div>
        <Link
          href="/dashboard/create"
          className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> New video
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total videos', value: totalVideos, color: 'text-zinc-900 dark:text-white' },
          { label: 'Ready', value: readyCount, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Generating', value: generatingCount, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Credits left', value: creditsLeft, color: 'text-purple-600 dark:text-purple-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-4"
          >
            <p className="text-[12px] text-zinc-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/dashboard/create"
          className="group flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-4 hover:border-purple-300 dark:hover:border-purple-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
              <Plus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Create new video</p>
              <p className="text-[12px] text-zinc-500">Start the AI video wizard</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-300 dark:text-zinc-700 group-hover:text-purple-500 transition-colors" />
        </Link>

        <Link
          href="/dashboard/videos"
          className="group flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <Film className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">My Videos</p>
              <p className="text-[12px] text-zinc-500">{totalVideos} video{totalVideos !== 1 ? 's' : ''} created</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 transition-colors" />
        </Link>
      </div>

      {/* Recent videos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Recent videos</h2>
          {videos.length > 0 && (
            <Link href="/dashboard/videos" className="text-[12px] text-purple-600 dark:text-purple-400 hover:underline">
              View all
            </Link>
          )}
        </div>

        {videos.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-8 text-center">
            <p className="text-sm text-zinc-500 mb-3">No videos yet</p>
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-purple-600 dark:text-purple-400 hover:underline"
            >
              Create your first video <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
            {videos.map((video) => (
              <div key={video.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  {statusIcon(video.status)}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{video.title}</p>
                    <p className="text-[12px] text-zinc-400">
                      {video.style} • {new Date(video.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                  video.status === 'ready'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                    : video.status === 'generating'
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                    : video.status === 'failed'
                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
                    : 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800'
                }`}>
                  {video.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}