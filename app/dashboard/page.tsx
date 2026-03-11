'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { getProfile } from '@/lib/auth'
import type { Profile, Video } from '@/lib/supabase'
import { Film, PlusCircle, Zap, Clock, Download } from 'lucide-react'

export default function DashboardOverview() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({ total: 0, ready: 0, generating: 0 })
  const [recentVideos, setRecentVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const p = await getProfile()
      if (!p) return
      setProfile(p)

      const { data: videos } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', p.user_id)
        .order('created_at', { ascending: false })

      const list = (videos ?? []) as Video[]
      setRecentVideos(list.slice(0, 5))
      setStats({
        total: list.length,
        ready: list.filter((v) => v.status === 'ready').length,
        generating: list.filter((v) => v.status === 'generating').length,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-64 bg-gray-800" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 bg-gray-800 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Videos', value: stats.total, icon: Film, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Ready', value: stats.ready, icon: Download, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Generating', value: stats.generating, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Credits Left', value: (profile?.credits_limit || 3) - (profile?.credits_used || 0), icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ]

  return (
    <div className="p-6 lg:p-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome back, {profile?.display_name || 'Creator'} 👋</h1>
        <p className="mt-1 text-gray-400">Here&apos;s what&apos;s happening with your videos.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</span>
                <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link href="/dashboard/create">
          <Card className="border-gray-800 bg-gray-900/50 hover:border-purple-500/50 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition">
                <PlusCircle className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Create New Video</h3>
                <p className="text-sm text-gray-400">Pick a style, enter a topic, let AI do the rest</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/videos">
          <Card className="border-gray-800 bg-gray-900/50 hover:border-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition">
                <Film className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">My Videos</h3>
                <p className="text-sm text-gray-400">View, download, or manage your videos</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">Recent Videos</h2>
      {recentVideos.length === 0 ? (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="py-12 text-center">
            <Film className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <p className="text-white mb-1">No videos yet</p>
            <p className="text-sm text-gray-500 mb-4">Create your first viral video in 60 seconds</p>
            <Link href="/dashboard/create">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" />Create Video
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {recentVideos.map((video) => (
            <Card key={video.id} className="border-gray-800 bg-gray-900/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center">
                    <Film className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{video.title}</p>
                    <p className="text-xs text-gray-500">{video.style} • {new Date(video.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  video.status === 'ready' ? 'bg-green-500/10 text-green-400' :
                  video.status === 'generating' ? 'bg-amber-500/10 text-amber-400' :
                  video.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                  'bg-gray-700 text-gray-400'
                }`}>{video.status}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}