import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { Background } from '../Background';
import { Captions } from '../Captions';
import { BackgroundClip } from '../type';

interface SplitStoryProps {
  script: string;
  voiceoverUrl?: string;
  backgroundVideoUrl?: string;
  clips?: BackgroundClip[];
  style: string;
  durationInFrames: number;
}

export const SplitStory: React.FC<SplitStoryProps> = ({
  script,
  voiceoverUrl,
  backgroundVideoUrl,
  clips,
  style,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { height, width } = useVideoConfig();

  // Slow scroll for the full script text in bottom panel
  const scrollY = interpolate(frame, [0, durationInFrames], [0, -400], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Top half: Gameplay */}
      <Background
        clips={clips}
        videoUrl={backgroundVideoUrl}
        style={style}
        region="top-half"
      />

      {/* Divider line */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, transparent, #a855f7, transparent)',
          zIndex: 10,
        }}
      />

      {/* Bottom half: Story panel */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Reddit-style header */}
        <div
          style={{
            padding: '20px 40px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff4500, #ff8b60)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            📖
          </div>
          <div>
            <div style={{ color: '#e5e5e5', fontSize: 22, fontWeight: 700 }}>
              r/stories
            </div>
            <div style={{ color: '#737373', fontSize: 16 }}>
              Posted by u/viralmind • now
            </div>
          </div>
        </div>

        {/* Scrolling story text */}
        <div
          style={{
            padding: '10px 40px',
            transform: `translateY(${scrollY}px)`,
          }}
        >
          <p
            style={{
              color: '#d4d4d4',
              fontSize: 32,
              lineHeight: 1.6,
              fontFamily: 'Georgia, serif',
            }}
          >
            {script}
          </p>
        </div>
      </div>

      {/* Word captions overlay on top half */}
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