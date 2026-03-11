'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { getProfile } from '@/lib/auth'
import type { Video } from '@/lib/supabase'
import { Film, PlusCircle, Clock, Trash2, Eye, Copy } from 'lucide-react'
import { toast } from 'sonner'

const emojiMap: Record<string, string> = {
  'reddit-story': '📖', 'scary-facts': '😱', 'would-you-rather': '🤔',
  'motivation': '💪', 'ai-wisdom': '🧠', 'hot-takes': '🔥',
  'life-hacks': '💡', 'story-time': '📚', 'conspiracy': '👁️', 'roast-me': '🎤',
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    loadVideos()
  }, [])

  async function loadVideos() {
    const profile = await getProfile()
    if (!profile) return

    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', profile.user_id)
      .order('created_at', { ascending: false })

    setVideos((data ?? []) as Video[])
    setLoading(false)
  }

  async function handleDelete(videoId: string) {
    if (!confirm('Delete this video?')) return

    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId)

    if (error) {
      toast.error('Failed to delete')
      return
    }

    setVideos((prev) => prev.filter((v) => v.id !== videoId))
    toast.success('Video deleted')
  }

  function handleCopyScript(script: string) {
    navigator.clipboard.writeText(script)
    toast.success('Script copied to clipboard')
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-4">
        <Skeleton className="h-8 w-48 bg-gray-800" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 bg-gray-800 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Videos</h1>
          <p className="mt-1 text-gray-400">{videos.length} video{videos.length !== 1 ? 's' : ''} created</p>
        </div>
        <Link href="/dashboard/create">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </Link>
      </div>

      {videos.length === 0 ? (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="py-16 text-center">
            <Film className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No videos yet</h2>
            <p className="text-gray-400 mb-6">Create your first viral video in 60 seconds</p>
            <Link href="/dashboard/create">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Video
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => {
            const isExpanded = expandedId === video.id
            const emoji = emojiMap[video.style] || '🎬'
            const wordCount = video.script?.split(/\s+/).length || 0

            return (
              <Card
                key={video.id}
                className="border-gray-800 bg-gray-900/50 hover:border-gray-700 transition-all"
              >
                <CardContent className="p-0">
                  {/* Header row */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : video.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center text-xl shrink-0">
                        {emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{video.title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-500">{video.style}</span>
                          <span className="text-xs text-gray-600">•</span>
                          <span className="text-xs text-gray-500">{wordCount} words</span>
                          <span className="text-xs text-gray-600">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(video.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        video.status === 'ready' ? 'bg-green-500/10 text-green-400' :
                        video.status === 'generating' ? 'bg-amber-500/10 text-amber-400' :
                        video.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {video.status}
                      </span>
                      <Eye className={`h-4 w-4 transition-transform ${isExpanded ? 'text-purple-400' : 'text-gray-600'}`} />
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && video.script && (
                    <div className="px-4 pb-4 border-t border-gray-800">
                      <div className="mt-4 rounded-lg bg-gray-950 border border-gray-800 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Script</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleCopyScript(video.script!) }}
                            className="text-gray-500 hover:text-white h-7 px-2"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {video.script}
                        </p>
                      </div>

                      {video.topic && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-medium text-gray-400">Topic:</span>
                          {video.topic}
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleDelete(video.id) }}
                          className="text-gray-500 hover:text-red-400 h-8"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}