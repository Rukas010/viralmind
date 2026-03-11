'use client';

import React, { useState, useCallback } from 'react';
import { Player } from '@remotion/player';
import { BrainrotVideo } from '@/remotion/BrainrotVideo';
import { VIDEO_WIDTH, VIDEO_HEIGHT, VIDEO_FPS } from '@/remotion/constants';
import { VIDEO_TEMPLATES, BackgroundClip } from '@/remotion/type';
import { useAudioDuration } from '@/hooks/useAudioDuration';
import { Button } from '@/components/ui/button';
import { Play, Loader2, RefreshCw, Monitor, Music } from 'lucide-react';

interface VideoPreviewSectionProps {
  script: string;
  voiceoverUrl?: string;
  style: string;
  topic?: string;
  durationInSeconds?: number;
}

export function VideoPreviewSection({
  script,
  voiceoverUrl,
  style,
  topic,
}: VideoPreviewSectionProps) {
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState<string | null>(null);
  const [clips, setClips] = useState<BackgroundClip[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('classic-brainrot');

  const audioDuration = useAudioDuration(voiceoverUrl);

  const wordCount = script.split(/\s+/).filter((w) => w.length > 0).length;
  const estimatedSeconds = Math.ceil(wordCount / 2.5);

  // Use EXACT audio duration when available — no extra buffers
  const hasVoiceover = !!voiceoverUrl;
  const audioReady = !hasVoiceover || audioDuration !== null;
  const actualSeconds = audioDuration || estimatedSeconds;
  const durationInFrames = Math.max(Math.ceil(actualSeconds * VIDEO_FPS), VIDEO_FPS);

  const fetchBackgrounds = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const topicParam = topic ? `&topic=${encodeURIComponent(topic)}` : '';
      const res = await fetch(
        `/api/get-background-video?style=${encodeURIComponent(style)}&mode=multiple&count=3${topicParam}`
      );
      const data = await res.json();

      if (data.urls && data.urls.length > 0) {
        const framesPerClip = Math.floor(durationInFrames / data.urls.length);
        const newClips: BackgroundClip[] = data.urls.map(
          (url: string, i: number) => ({
            url,
            startFrame: i * framesPerClip,
            endFrame:
              i === data.urls.length - 1
                ? durationInFrames
                : (i + 1) * framesPerClip + 15,
          })
        );
        setClips(newClips);
        setBackgroundVideoUrl(data.urls[0]);
      } else if (data.url) {
        setBackgroundVideoUrl(data.url);
        setClips([]);
      }
    } catch (err) {
      console.error('Failed to fetch backgrounds:', err);
      setError('Could not load background videos. Using gradient fallback.');
    }

    setLoading(false);
    setShowPreview(true);
  }, [style, topic, durationInFrames]);

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur">
      {/* Template Picker */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
            <Monitor className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Video Preview</h3>
            <p className="text-sm text-gray-400">
              Pick a layout, then preview
              {audioDuration && (
                <span className="text-purple-400">
                  {' '}• {audioDuration.toFixed(1)}s audio detected
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {VIDEO_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setSelectedTemplate(template.id);
                setShowPreview(false);
              }}
              className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                selectedTemplate === template.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <span className="text-2xl">{template.emoji}</span>
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium ${
                    selectedTemplate === template.id
                      ? 'text-purple-300'
                      : 'text-gray-300'
                  }`}
                >
                  {template.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {template.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Audio detection state */}
      {hasVoiceover && !audioReady && (
        <div className="flex items-center gap-2 text-sm text-purple-400 mb-3">
          <Music className="h-4 w-4 animate-pulse" />
          <span>Detecting audio duration...</span>
        </div>
      )}

      {/* Preview */}
      {!showPreview ? (
        <Button
          onClick={fetchBackgrounds}
          disabled={loading || !audioReady}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading preview...
            </>
          ) : !audioReady ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Waiting for audio...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Preview Video
            </>
          )}
        </Button>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-400">
              {actualSeconds.toFixed(1)}s
              {audioDuration ? ' (synced to audio)' : ' (estimated)'}
              {' '}• {wordCount} words
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBackgrounds}
              disabled={loading}
              className="border-gray-700 text-gray-300 hover:text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  New Clips
                </>
              )}
            </Button>
          </div>

          {error && <p className="text-amber-400 text-sm mb-3">{error}</p>}

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
                  clips: clips.length > 0 ? clips : undefined,
                  style,
                  templateId: selectedTemplate,
                }}
                compositionWidth={VIDEO_WIDTH}
                compositionHeight={VIDEO_HEIGHT}
                fps={VIDEO_FPS}
                durationInFrames={durationInFrames}
                controls
                loop
                style={{ width: '100%', height: '100%' }}
                acknowledgeRemotionLicense
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}