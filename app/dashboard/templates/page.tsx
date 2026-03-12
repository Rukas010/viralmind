'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Lock, ArrowRight } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  caption_style: string;
  background_type: string;
  is_premium: boolean;
}

const STYLE_COLORS: Record<string, string> = {
  'reddit-story': 'bg-orange-500',
  'scary-facts': 'bg-red-500',
  'would-you-rather': 'bg-purple-500',
  'motivation': 'bg-amber-500',
  'ai-wisdom': 'bg-emerald-500',
  'hot-takes': 'bg-pink-500',
  'life-hacks': 'bg-cyan-500',
  'story-time': 'bg-indigo-500',
  'conspiracy': 'bg-zinc-500',
  'roast-me': 'bg-yellow-500',
};

const STYLE_EMOJIS: Record<string, string> = {
  'reddit-story': '📖',
  'scary-facts': '💀',
  'would-you-rather': '🤔',
  'motivation': '🔥',
  'ai-wisdom': '🧠',
  'hot-takes': '🌶️',
  'life-hacks': '💡',
  'story-time': '📚',
  'conspiracy': '👁️',
  'roast-me': '🎤',
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: true });

      if (data) setTemplates(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Templates</h1>
        <p className="text-[13px] text-zinc-500 mt-0.5">
          {templates.length} content styles available. Each one generates a different type of viral video.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map((template) => {
          const color = STYLE_COLORS[template.slug] || 'bg-zinc-500';
          const emoji = STYLE_EMOJIS[template.slug] || '🎬';

          return (
            <div
              key={template.id}
              className="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors relative"
            >
              {/* Premium badge */}
              {template.is_premium && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
                  <Lock className="h-2.5 w-2.5" /> PRO
                </span>
              )}

              {/* Emoji + Name */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center text-xl`}>
                  {emoji}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{template.name}</h3>
                  <p className="text-[11px] text-zinc-400 capitalize">{template.category}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-[13px] text-zinc-500 leading-relaxed mb-4">
                {template.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {template.caption_style && (
                  <span className="text-[10px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    {template.caption_style}
                  </span>
                )}
                {template.background_type && (
                  <span className="text-[10px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    {template.background_type}
                  </span>
                )}
              </div>

              {/* Use button */}
              <Link
                href="/dashboard/create"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-purple-600 dark:text-purple-400 hover:underline"
              >
                Use template <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}