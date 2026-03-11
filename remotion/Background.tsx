import React from 'react';
import { AbsoluteFill, Video, useVideoConfig } from 'remotion';

interface BackgroundProps {
  videoUrl?: string;
  style: string;
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

export const Background: React.FC<BackgroundProps> = ({ videoUrl, style }) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Gradient fallback */}
      <div
        style={{
          width,
          height,
          background: STYLE_GRADIENTS[style] || STYLE_GRADIENTS['reddit-story'],
        }}
      />

      {/* Stock video layer */}
      {videoUrl && (
        <AbsoluteFill>
          <Video
            src={videoUrl}
            style={{
              width,
              height,
              objectFit: 'cover',
            }}
            muted
          />
        </AbsoluteFill>
      )}

      {/* Dark overlay for text readability */}
      <AbsoluteFill>
        <div
          style={{
            width,
            height,
            backgroundColor: videoUrl ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.1)',
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};