import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface CaptionsProps {
  script: string;
  startFrame: number;
  endFrame: number;
  position?: 'center' | 'bottom' | 'bottom-half';
  size?: 'large' | 'medium' | 'small';
}

const WORDS_PER_GROUP = 3;

const SIZE_MAP = {
  large: { fontSize: 80, padding: '0 60px' },
  medium: { fontSize: 60, padding: '0 40px' },
  small: { fontSize: 48, padding: '0 30px' },
};

const POSITION_MAP = {
  center: { top: 0, bottom: 0, justifyContent: 'center' as const },
  bottom: { top: 'auto', bottom: '120px', justifyContent: 'flex-end' as const },
  'bottom-half': { top: '50%', bottom: 0, justifyContent: 'center' as const },
};

export const Captions: React.FC<CaptionsProps> = ({
  script,
  startFrame,
  endFrame,
  position = 'center',
  size = 'large',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = script.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return null;

  const groups: string[][] = [];
  for (let i = 0; i < words.length; i += WORDS_PER_GROUP) {
    groups.push(words.slice(i, i + WORDS_PER_GROUP));
  }

  // Minimal buffer — captions start almost immediately with audio
  const bufferFrames = Math.floor(fps * 0.05);
  const activeStart = startFrame + bufferFrames;
  const activeEnd = endFrame - bufferFrames;
  const activeDuration = activeEnd - activeStart;

  const framesPerGroup = activeDuration / groups.length;
  const relativeFrame = frame - activeStart;

  const activeGroupIndex = Math.min(
    Math.max(Math.floor(relativeFrame / framesPerGroup), 0),
    groups.length - 1
  );
  const activeGroup = groups[activeGroupIndex];

  const groupStartFrame = activeGroupIndex * framesPerGroup;
  const frameInGroup = relativeFrame - groupStartFrame;
  const framesPerWord = framesPerGroup / activeGroup.length;
  const activeWordIndex = Math.min(
    Math.max(Math.floor(frameInGroup / framesPerWord), 0),
    activeGroup.length - 1
  );

  if (frame < startFrame || frame > endFrame) return null;

  const groupSpring = spring({
    frame: Math.max(0, frame - (activeStart + groupStartFrame)),
    fps,
    config: { damping: 15, stiffness: 200, mass: 0.8 },
  });

  const groupOpacity = interpolate(
    frameInGroup,
    [0, framesPerGroup * 0.04, framesPerGroup * 0.88, framesPerGroup],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const sizeConfig = SIZE_MAP[size];
  const posConfig = POSITION_MAP[position];

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: posConfig.top,
        bottom: posConfig.bottom,
        display: 'flex',
        alignItems: posConfig.justifyContent,
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          padding: sizeConfig.padding,
          transform: `scale(${interpolate(groupSpring, [0, 1], [0.5, 1])})`,
          opacity: groupOpacity,
        }}
      >
        {activeGroup.map((word, i) => {
          const isActive = i === activeWordIndex;
          const isPast = i < activeWordIndex;

          const wordSpring = isActive
            ? spring({
                frame: Math.max(0, frame - (activeStart + groupStartFrame + i * framesPerWord)),
                fps,
                config: { damping: 12, stiffness: 250, mass: 0.6 },
              })
            : 0;

          const wordScale = isActive ? interpolate(wordSpring, [0, 1], [1, 1.2]) : 1;

          let color = '#FFFFFF';
          if (isActive) color = '#FACC15';
          if (isPast) color = '#FDE68A';

          return (
            <span
              key={`${activeGroupIndex}-${i}`}
              style={{
                fontSize: sizeConfig.fontSize,
                fontWeight: 900,
                fontFamily: 'Arial Black, Impact, sans-serif',
                color,
                textShadow:
                  '4px 4px 0px rgba(0,0,0,0.9), -2px -2px 0px rgba(0,0,0,0.9), 2px -2px 0px rgba(0,0,0,0.9), -2px 2px 0px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.6)',
                textTransform: 'uppercase',
                transform: `scale(${wordScale})`,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};