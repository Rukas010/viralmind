'use client';

import React, { useState, useCallback } from 'react';
import { Player } from '@remotion/player';
import { BrainrotVideo } from '@/remotion/BrainrotVideo';
import { VIDEO_WIDTH, VIDEO_HEIGHT, VIDEO_FPS } from '@/remotion/constants';
import { Button } from '@/components/ui/button';
import { Play, Loader2, RefreshCw, Monitor } from 'lucide-react';

interface VideoPreviewSectionProps {
  script: string;
  voiceoverUrl?: string;
  style: string;
  durationInSeconds?: number;
}

export function VideoPreviewSection({
  script,
  voiceoverUrl,
  style,
  durationInSeconds,
}: VideoPreviewSectionProps) {
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate duration from prop or estimate from word count
  const wordCount = script.split(/\s+/).filter((w) => w.length > 0).length;
  const estimatedSeconds = durationInSeconds || Math.ceil(wordCount / 2.5);
  const durationInFrames = Math.max(estimatedSeconds * VIDEO_FPS, VIDEO_FPS);

  const fetchBackgroundAndShow = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/get-background-video?style=${encodeURIComponent(style)}`);
      const data = await res.json();

      if (data.url) {
        setBackgroundVideoUrl(data.url);
      }
    } catch (err) {
      console.error('Failed to fetch background:', err);
      setError('Could not load background video. Preview will use gradient instead.');
    }

    setLoading(false);
    setShowPreview(true);
  }, [style]);

  const refreshBackground = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get-background-video?style=${encodeURIComponent(style)}`);
      const data = await res.json();
      if (data.url) {
        setBackgroundVideoUrl(data.url);
      }
    } catch (err) {
      console.error('Failed to refresh background:', err);
    }
    setLoading(false);
  }, [style]);

  if (!showPreview) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
            <Monitor className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Video Preview</h3>
            <p className="text-sm text-gray-400">
              See how your video will look with captions and background
            </p>
          </div>
        </div>

        <Button
          onClick={fetchBackgroundAndShow}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading preview...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Preview Video
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
            <Monitor className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Video Preview</h3>
            <p className="text-sm text-gray-400">
              {estimatedSeconds}s • {wordCount} words • {VIDEO_FPS}fps
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshBackground}
          disabled={loading}
          className="border-gray-700 text-gray-300 hover:text-white"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <RefreshCw className="mr-1 h-3 w-3" />
              New Background
            </>
          )}
        </Button>
      </div>

      {error && (
        <p className="text-amber-400 text-sm mb-3">{error}</p>
      )}

      {/* Player Container — maintains 9:16 aspect ratio */}
      <div className="flex justify-center">
        <div
          style={{
            width: '100%',
            maxWidth: 360,
            aspectRatio: '9 / 16',
            borderRadius: 12,
            overflow: 'hidden',
            border: '2px solid rgba(139, 92, 246, 0.3)',
          }}
        >
          <Player
            component={BrainrotVideo}
            inputProps={{
              script,
              voiceoverUrl: voiceoverUrl || undefined,
              backgroundVideoUrl: backgroundVideoUrl || undefined,
              style,
            }}
            compositionWidth={VIDEO_WIDTH}
            compositionHeight={VIDEO_HEIGHT}
            fps={VIDEO_FPS}
            durationInFrames={durationInFrames}
            controls
            loop
            style={{
              width: '100%',
              height: '100%',
            }}
            acknowledgeRemotionLicense
          />
        </div>
      </div>
    </div>
  );
}