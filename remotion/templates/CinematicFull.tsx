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

interface CinematicFullProps {
  script: string;
  voiceoverUrl?: string;
  backgroundVideoUrl?: string;
  clips?: BackgroundClip[];
  style: string;
  durationInFrames: number;
}

export const CinematicFull: React.FC<CinematicFullProps> = ({
  script,
  voiceoverUrl,
  backgroundVideoUrl,
  clips,
  style,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Cinematic intro fade
  const introOpacity = interpolate(frame, [0, fps * 1.5], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Outro fade
  const outroOpacity = interpolate(
    frame,
    [durationInFrames - fps * 1.5, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp' }
  );

  const masterOpacity = Math.min(introOpacity, outroOpacity);

  // Subtle breathing/pulse on the vignette
  const vignettePulse = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0.5, 0.7]
  );

  // Letterbox bars for cinematic feel
  const letterboxHeight = 80;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <div style={{ opacity: masterOpacity }}>
        {/* Background footage */}
        <Background
          clips={clips}
          videoUrl={backgroundVideoUrl}
          style={style}
          region="full"
        />

        {/* Cinematic vignette */}
        <AbsoluteFill>
          <div
            style={{
              width,
              height,
              background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${vignettePulse}) 100%)`,
            }}
          />
        </AbsoluteFill>

        {/* Film grain overlay */}
        <AbsoluteFill>
          <div
            style={{
              width,
              height,
              opacity: 0.06,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: '128px 128px',
              transform: `translate(${(frame * 7) % 128}px, ${(frame * 11) % 128}px)`,
            }}
          />
        </AbsoluteFill>

        {/* Top letterbox */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: letterboxHeight,
            background: 'linear-gradient(180deg, #000000 60%, transparent 100%)',
          }}
        />

        {/* Bottom letterbox */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: letterboxHeight,
            background: 'linear-gradient(0deg, #000000 60%, transparent 100%)',
          }}
        />
      </div>

      {/* Captions with full opacity (not affected by intro/outro) */}
      <Captions
        script={script}
        startFrame={Math.floor(fps * 0.8)}
        endFrame={durationInFrames - Math.floor(fps * 0.8)}
        position="center"
        size="large"
      />

      {voiceoverUrl && <Audio src={voiceoverUrl} volume={1} />}
    </AbsoluteFill>
  );
};