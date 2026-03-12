'use client';

import React, { useState } from 'react';
import { renderVideoToBlob } from '@/lib/canvas-renderer';
import { useAudioDuration } from '@/hooks/useAudioDuration';
import { Download, Loader2, Check, AlertCircle } from 'lucide-react';

interface VideoDownloaderProps {
  script: string;
  style: string;
  voiceoverUrl?: string;
  title?: string;
}

export function VideoDownloader({
  script,
  style,
  voiceoverUrl,
  title,
}: VideoDownloaderProps) {
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioDuration = useAudioDuration(voiceoverUrl);
  const wordCount = script.split(/\s+/).filter((w) => w.length > 0).length;
  const estimatedDuration = Math.ceil(wordCount / 2.5);
  const duration = audioDuration || estimatedDuration;
  const hasAudio = !!voiceoverUrl;
  const audioReady = !hasAudio || audioDuration !== null;

  const handleRender = async () => {
    setRendering(true);
    setProgress(0);
    setDone(false);
    setError(null);

    try {
      const blob = await renderVideoToBlob({
        script,
        style,
        voiceoverUrl,
        durationInSeconds: duration,
        onProgress: setProgress,
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(title || 'viralmind-video').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup after a delay
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setDone(true);
    } catch (err) {
      console.error('Render failed:', err);
      setError('Rendering failed. Try again or use a different browser.');
    } finally {
      setRendering(false);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Download Video</h3>
        <p className="text-[12px] text-zinc-500 mt-0.5">
          Render and download your video as a WebM file.
        </p>
      </div>

      <div className="px-5 py-4 space-y-3">
        {/* Info row */}
        <div className="flex items-center gap-4 text-[12px] text-zinc-400">
          <span>1080 × 1920</span>
          <span>•</span>
          <span>{duration.toFixed(1)}s {audioDuration ? '(from audio)' : '(estimated)'}</span>
          <span>•</span>
          <span>30fps</span>
          <span>•</span>
          <span>WebM</span>
        </div>

        {/* Progress bar */}
        {rendering && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] text-zinc-500">Rendering...</span>
              <span className="text-[12px] text-zinc-400">{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1.5">
              This renders in real-time — a {Math.round(duration)}s video takes ~{Math.round(duration)}s to export.
              Keep this tab open.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-[13px] text-red-500 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Done message */}
        {done && !rendering && (
          <div className="flex items-center gap-2 text-[13px] text-emerald-600 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            Download started! Check your downloads folder.
          </div>
        )}

        {/* Render button */}
        <button
          onClick={handleRender}
          disabled={rendering || !audioReady}
          className="w-full h-9 flex items-center justify-center gap-1.5 rounded-md text-[13px] font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {rendering ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Rendering ({Math.round(progress * 100)}%)
            </>
          ) : !audioReady ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Detecting audio...
            </>
          ) : done ? (
            <>
              <Download className="h-3.5 w-3.5" />
              Download Again
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Render & Download
            </>
          )}
        </button>
      </div>
    </div>
  );
}