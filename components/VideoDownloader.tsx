// components/VideoDownloader.tsx
'use client';

import { useState } from 'react';
import { Download, Loader2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { renderVideo, downloadBlob, RenderConfig } from '@/lib/canvas-renderer';

interface VideoDownloaderProps {
  script: string;
  voiceoverUrl: string;
  backgroundUrls: string[];
  musicUrl?: string;
  title: string;
  watermark?: boolean;
}

export default function VideoDownloader({
  script,
  voiceoverUrl,
  backgroundUrls,
  musicUrl,
  title,
  watermark = false,
}: VideoDownloaderProps) {
  const [status, setStatus] = useState<'idle' | 'rendering' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRender = async () => {
    try {
      setStatus('rendering');
      setProgress(0);
      setErrorMessage('');

      const blob = await renderVideo({
        script,
        voiceoverUrl,
        backgroundUrls,
        musicUrl,
        width: 1080,
        height: 1920,
        fps: 30,
        watermark,
        onProgress: (p) => setProgress(p),
      });

      setProgress(100);
      setStatus('done');

      // Auto-download
      const safeName = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      downloadBlob(blob, `viraleye-${safeName}.webm`);
    } catch (err: any) {
      console.error('Render failed:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong during rendering');
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Download Video
        </h3>
        <p className="text-[13px] text-zinc-500 mt-0.5">
          1080×1920 • 30fps • HD vertical video
        </p>
      </div>

      {/* Body */}
      <div className="px-5 py-5">
        {status === 'idle' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2">
                <div className="text-[11px] text-zinc-400 uppercase tracking-wide">Resolution</div>
                <div className="text-[13px] font-medium text-zinc-900 dark:text-white mt-0.5">1080×1920</div>
              </div>
              <div className="rounded-md bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2">
                <div className="text-[11px] text-zinc-400 uppercase tracking-wide">FPS</div>
                <div className="text-[13px] font-medium text-zinc-900 dark:text-white mt-0.5">30</div>
              </div>
              <div className="rounded-md bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2">
                <div className="text-[11px] text-zinc-400 uppercase tracking-wide">Format</div>
                <div className="text-[13px] font-medium text-zinc-900 dark:text-white mt-0.5">WebM</div>
              </div>
            </div>

            {backgroundUrls.length === 0 && (
              <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2">
                <p className="text-[12px] text-amber-700 dark:text-amber-400">
                  No background clips loaded. Video will use animated gradient fallback.
                </p>
              </div>
            )}

            <button
              onClick={handleRender}
              className="w-full h-10 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-[13px] font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Render & Download
            </button>
          </div>
        )}

        {status === 'rendering' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-purple-500 animate-spin flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-zinc-900 dark:text-white">
                  {progress < 10
                    ? 'Loading assets...'
                    : progress < 95
                    ? 'Rendering video...'
                    : 'Finalizing...'}
                </p>
                <p className="text-[12px] text-zinc-500">
                  {progress < 10
                    ? 'Loading backgrounds, audio, and fonts'
                    : `Frame by frame rendering — ${progress}%`}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-400 text-center">
              Don&apos;t close this tab while rendering
            </p>
          </div>
        )}

        {status === 'done' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-zinc-900 dark:text-white">
                  Video ready!
                </p>
                <p className="text-[12px] text-zinc-500">
                  Your download should have started automatically
                </p>
              </div>
            </div>

            <button
              onClick={handleRender}
              className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Render Again
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-zinc-900 dark:text-white">
                  Rendering failed
                </p>
                <p className="text-[12px] text-zinc-500">
                  {errorMessage || 'Something went wrong. Try again.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleRender}
              className="w-full h-9 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-[13px] font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}