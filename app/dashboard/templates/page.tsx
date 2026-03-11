'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import type { Template } from '@/lib/supabase'
import { Lock } from 'lucide-react'

const emojiMap: Record<string, string> = {
  'reddit-story': '📖',
  'scary-facts': '😱',
  'would-you-rather': '🤔',
  'motivation': '💪',
  'ai-wisdom': '🧠',
  'hot-takes': '🔥',
  'life-hacks': '💡',
  'story-time': '📚',
  'conspiracy': '👁️',
  'roast-me': '🎤',
}

const colorMap: Record<string, string> = {
  'reddit-story': 'from-orange-500 to-red-500',
  'scary-facts': 'from-red-500 to-purple-500',
  'would-you-rather': 'from-yellow-500 to-orange-500',
  'motivation': 'from-blue-500 to-cyan-500',
  'ai-wisdom': 'from-cyan-500 to-blue-500',
  'hot-takes': 'from-orange-500 to-yellow-500',
  'life-hacks': 'from-green-500 to-emerald-500',
  'story-time': 'from-indigo-500 to-purple-500',
  'conspiracy': 'from-purple-500 to-pink-500',
  'roast-me': 'from-red-500 to-orange-500',
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: true })

      setTemplates((data ?? []) as Template[])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-48 bg-gray-800" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-48 bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Templates</h1>
        <p className="mt-1 text-gray-400">Browse all available video styles.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {templates.map((template) => {
          const emoji = emojiMap[template.slug] || '🎬'
          const gradient = colorMap[template.slug] || 'from-gray-500 to-gray-600'

          return (
            <Card
              key={template.id}
              className="border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              {template.is_premium && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                    <Lock className="h-3 w-3" />
                    PRO
                  </span>
                </div>
              )}
              <CardContent className="p-6 text-center">
                <div className={`mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
                  {emoji}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{template.name}</h3>
                <p className="text-xs text-gray-500">{template.category}</p>
                {template.description && (
                  <p className="mt-2 text-xs text-gray-400 line-clamp-2">{template.description}</p>
                )}
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                    {template.caption_style}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                    {template.background_type}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}