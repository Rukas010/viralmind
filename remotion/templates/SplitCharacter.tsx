import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { Background } from '../Background';
import { Captions } from '../Captions';
import { BackgroundClip } from '../type';

interface SplitCharacterProps {
  script: string;
  voiceoverUrl?: string;
  backgroundVideoUrl?: string;
  clips?: BackgroundClip[];
  style: string;
  durationInFrames: number;
}

const CHARACTER_COLORS: Record<string, { bg: string; skin: string; accent: string }> = {
  'reddit-story': { bg: '#1a1a2e', skin: '#fdbcb4', accent: '#ff4500' },
  'scary-facts': { bg: '#0d0d0d', skin: '#c9b99a', accent: '#8b0000' },
  'would-you-rather': { bg: '#1a0a2e', skin: '#fdbcb4', accent: '#a855f7' },
  motivation: { bg: '#0a1628', skin: '#c68642', accent: '#f59e0b' },
  'ai-wisdom': { bg: '#0a1a0a', skin: '#fdbcb4', accent: '#22c55e' },
  'hot-takes': { bg: '#2e1a0a', skin: '#fdbcb4', accent: '#ef4444' },
  'life-hacks': { bg: '#0a2e2e', skin: '#fdbcb4', accent: '#06b6d4' },
  'story-time': { bg: '#1a1a2e', skin: '#fdbcb4', accent: '#8b5cf6' },
  conspiracy: { bg: '#0d0d0d', skin: '#c9b99a', accent: '#6b7280' },
  'roast-me': { bg: '#2e0a0a', skin: '#fdbcb4', accent: '#f97316' },
};

export const SplitCharacter: React.FC<SplitCharacterProps> = ({
  script,
  voiceoverUrl,
  backgroundVideoUrl,
  clips,
  style,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = script.split(/\s+/).filter((w) => w.length > 0);
  const WORDS_PER_GROUP = 3;
  const groups = Math.ceil(words.length / WORDS_PER_GROUP);
  const framesPerGroup = durationInFrames / groups;
  const currentGroup = Math.floor(frame / framesPerGroup);

  const colors = CHARACTER_COLORS[style] || CHARACTER_COLORS['reddit-story'];

  // Character animations
  const bodyBounce = Math.sin(frame * 0.15) * 4;

  // Mouth opens/closes with each word group
  const mouthOpen = spring({
    frame: frame % Math.floor(framesPerGroup),
    fps,
    config: { damping: 8, stiffness: 200, mass: 0.5 },
  });
  const mouthHeight = interpolate(mouthOpen, [0, 1], [4, 18]);

  // Eye blink every ~3 seconds
  const blinkCycle = frame % (fps * 3);
  const isBlinking = blinkCycle >= 0 && blinkCycle <= 4;
  const eyeHeight = isBlinking ? 2 : 14;

  // Head tilt
  const headTilt = Math.sin(frame * 0.08) * 3;

  // Eyebrow raise on emphasis (every other group)
  const eyebrowRaise = currentGroup % 2 === 0 ? -3 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Top half: Gameplay */}
      <Background
        clips={clips}
        videoUrl={backgroundVideoUrl}
        style={style}
        region="top-half"
      />

      {/* Divider */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`,
          zIndex: 10,
        }}
      />

      {/* Bottom half: Character */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at center, ${colors.bg} 0%, #000000 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Animated character */}
        <div
          style={{
            transform: `translateY(${bodyBounce}px) rotate(${headTilt}deg)`,
          }}
        >
          {/* Head */}
          <svg width="280" height="320" viewBox="0 0 280 320">
            {/* Hair */}
            <ellipse cx="140" cy="100" rx="110" ry="105" fill="#2a1810" />

            {/* Face */}
            <ellipse cx="140" cy="130" rx="95" ry="100" fill={colors.skin} />

            {/* Eyes */}
            <ellipse cx="100" cy={115 + eyebrowRaise} rx="16" ry={eyeHeight} fill="#1a1a1a" />
            <ellipse cx="180" cy={115 + eyebrowRaise} rx="16" ry={eyeHeight} fill="#1a1a1a" />

            {/* Eye shine */}
            {!isBlinking && (
              <>
                <circle cx="106" cy="110" r="5" fill="#ffffff" opacity="0.8" />
                <circle cx="186" cy="110" r="5" fill="#ffffff" opacity="0.8" />
              </>
            )}

            {/* Eyebrows */}
            <rect
              x="78"
              y={92 + eyebrowRaise}
              width="42"
              height="6"
              rx="3"
              fill="#2a1810"
              transform={`rotate(-5, 99, ${95 + eyebrowRaise})`}
            />
            <rect
              x="160"
              y={92 + eyebrowRaise}
              width="42"
              height="6"
              rx="3"
              fill="#2a1810"
              transform={`rotate(5, 181, ${95 + eyebrowRaise})`}
            />

            {/* Nose */}
            <ellipse cx="140" cy="145" rx="8" ry="6" fill="#e8a090" opacity="0.5" />

            {/* Mouth */}
            <ellipse cx="140" cy="175" rx="22" ry={mouthHeight} fill="#2a1810" />
            {mouthHeight > 10 && (
              <ellipse cx="140" cy="170" rx="16" ry="4" fill="#ffffff" opacity="0.9" />
            )}

            {/* Body/Shirt */}
            <path
              d="M60,240 Q140,220 220,240 L240,320 L40,320 Z"
              fill={colors.accent}
              opacity="0.9"
            />

            {/* Collar detail */}
            <path
              d="M110,235 L140,260 L170,235"
              stroke={colors.bg}
              strokeWidth="3"
              fill="none"
            />
          </svg>
        </div>

        {/* Speech indicator */}
        <div
          style={{
            marginTop: 10,
            padding: '8px 24px',
            borderRadius: 20,
            background: `${colors.accent}33`,
            border: `1px solid ${colors.accent}66`,
          }}
        >
          <span
            style={{
              color: colors.accent,
              fontSize: 20,
              fontWeight: 700,
              fontFamily: 'Arial, sans-serif',
            }}
          >
            🎙️ Speaking...
          </span>
        </div>
      </div>

      {/* Captions on top half */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%' }}>
        <Captions
          script={script}
          startFrame={0}
          endFrame={durationInFrames}
          position="center"
          size="medium"
        />
      </div>

      {voiceoverUrl && <Audio src={voiceoverUrl} volume={1} />}
    </AbsoluteFill>
  );
};