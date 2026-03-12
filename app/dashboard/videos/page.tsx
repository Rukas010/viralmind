'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Plus, ArrowRight, ChevronDown, ChevronUp,
  Copy, Trash2, CheckCircle2, Loader2,
  AlertCircle, Clock, Film,
} from 'lucide-react';

interface Video {
  id: string;
  title: string;
  topic: string;
  style: string;
  script: string;
  voiceover_url: string | null;
  status: string;
  created_at: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) return;

      const { data } = await supabase
        .from('videos')
        .select('id, title, topic, style, script, voiceover_url, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setVideos(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleCopyScript = (script: string) => {
    navigator.clipboard.writeText(script);
    toast.success('Script copied to clipboard');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video? This cannot be undone.')) return;
    setDeletingId(id);

    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete');
    } else {
      setVideos((prev) => prev.filter((v) => v.id !== id));
      toast.success('Video deleted');
    }
    setDeletingId(null);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
      case 'generating': return <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" />;
      case 'failed': return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
      default: return <Clock className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ready: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
      generating: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
      failed: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10',
      draft: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800',
    };
    return styles[status] || styles.draft;
  };

  const wordCount = (text: string) => text.split(/\s+/).filter((w) => w.length > 0).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">My Videos</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">
            {videos.length} video{videos.length !== 1 ? 's' : ''} created
          </p>
        </div>
        <Link
          href="/dashboard/create"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> New video
        </Link>
      </div>

      {/* Empty state */}
      {videos.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-12 text-center">
          <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
            <Film className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-900 dark:text-white mb-1">No videos yet</p>
          <p className="text-[13px] text-zinc-500 mb-4">Create your first AI-generated video.</p>
          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-purple-600 dark:text-purple-400 hover:underline"
          >
            Get started <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {videos.map((video) => {
            const isExpanded = expandedId === video.id;
            return (
              <div
                key={video.id}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 overflow-hidden"
              >
                {/* Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : video.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {statusIcon(video.status)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{video.title}</p>
                      <p className="text-[12px] text-zinc-400">
                        {video.style} • {wordCount(video.script)} words • {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusBadge(video.status)}`}>
                      {video.status}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-400" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-zinc-100 dark:border-zinc-800">
                    {/* Script */}
                    <div className="mt-3 rounded-md border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Script</span>
                        <button
                          onClick={() => handleCopyScript(video.script)}
                          className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                      </div>
                      <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                        {video.script}
                      </p>
                    </div>

                    {/* Audio */}
                    {video.voiceover_url && (
                      <div className="mt-3 rounded-md border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3">
                        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Voiceover</p>
                        <audio controls className="w-full h-8" src={video.voiceover_url}>
                          Your browser does not support audio.
                        </audio>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleDelete(video.id)}
                        disabled={deletingId === video.id}
                        className="inline-flex items-center gap-1.5 text-[12px] text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                      >
                        {deletingId === video.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}