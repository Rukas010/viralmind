import React from 'react';
import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { BackgroundClip } from './type';

interface BackgroundProps {
  clips?: BackgroundClip[];
  videoUrl?: string;
  style: string;
  region?: 'full' | 'top-half' | 'bottom-half';
}

const STYLE_GRADIENTS: Record<string, string> = {
  'reddit-story': 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'scary-facts': 'linear-gradient(180deg, #0d0d0d 0%, #1a0000 50%, #0d0d0d 100%)',
  'would-you-rather': 'linear-gradient(180deg, #1a0a2e 0%, #2d1b69 50%, #1a0a2e 100%)',
  'motivation': 'linear-gradient(180deg, #0a1628 0%, #1b2838 50%, #0a1628 100%)',
  'ai-wisdom': 'linear-gradient(180deg, #0a1a0a 0%, #0d2818 50%, #0a1a0a 100%)',
  'hot-takes': 'linear-gradient(180deg, #2e1a0a 0%, #4a2010 50%, #2e1a0a 100%)',
  'life-hacks': 'linear-gradient(180deg, #0a2e2e 0%, #104040 50%, #0a2e2e 100%)',
  'story-time': 'linear-gradient(180deg, #1a1a2e 0%, #2a2040 50%, #1a1a2e 100%)',
  'conspiracy': 'linear-gradient(180deg, #0d0d0d 0%, #1a1a1a 50%, #0d0d0d 100%)',
  'roast-me': 'linear-gradient(180deg, #2e0a0a 0%, #4a1010 50%, #2e0a0a 100%)',
};

const REGION_STYLES: Record<string, React.CSSProperties> = {
  full: { top: 0, left: 0, right: 0, bottom: 0 },
  'top-half': { top: 0, left: 0, right: 0, height: '50%' },
  'bottom-half': { top: '50%', left: 0, right: 0, bottom: 0 },
};

export const Background: React.FC<BackgroundProps> = ({
  clips,
  videoUrl,
  style,
  region = 'full',
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const regionStyle = REGION_STYLES[region];
  const regionHeight = region === 'full' ? height : height / 2;

  // Build clip list — either multiple clips or single fallback
  const clipList: BackgroundClip[] = clips && clips.length > 0
    ? clips
    : videoUrl
    ? [{ url: videoUrl, startFrame: 0, endFrame: 99999 }]
    : [];

  return (
    <div style={{ position: 'absolute', overflow: 'hidden', ...regionStyle }}>
      {/* Gradient base */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height: regionHeight,
          background: STYLE_GRADIENTS[style] || STYLE_GRADIENTS['reddit-story'],
        }}
      />

      {/* Video clips with crossfade transitions */}
      {clipList.map((clip, index) => {
        const isActive = frame >= clip.startFrame && frame <= clip.endFrame;
        if (!isActive) return null;

        const TRANSITION_FRAMES = 15;

        // Fade in at start
        const fadeIn = interpolate(
          frame,
          [clip.startFrame, clip.startFrame + TRANSITION_FRAMES],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        // Fade out at end
        const fadeOut = interpolate(
          frame,
          [clip.endFrame - TRANSITION_FRAMES, clip.endFrame],
          [1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        // Subtle zoom over time
        const zoomProgress = interpolate(
          frame,
          [clip.startFrame, clip.endFrame],
          [1, 1.08],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: Math.min(fadeIn, fadeOut),
            }}
          >
            <Video
              src={clip.url}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `scale(${zoomProgress})`,
              }}
              muted
            />
          </div>
        );
      })}

      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: clipList.length > 0 ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)',
        }}
      />
    </div>
  );
};