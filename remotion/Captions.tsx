import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface CaptionsProps {
  script: string;
  startFrame: number;
  endFrame: number;
}

const WORDS_PER_GROUP = 3;

export const Captions: React.FC<CaptionsProps> = ({ script, startFrame, endFrame }) => {
  const frame = useCurrentFrame();

  const words = script.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return null;

  // Split words into groups
  const groups: string[][] = [];
  for (let i = 0; i < words.length; i += WORDS_PER_GROUP) {
    groups.push(words.slice(i, i + WORDS_PER_GROUP));
  }

  const totalFrames = endFrame - startFrame;
  const framesPerGroup = totalFrames / groups.length;
  const relativeFrame = frame - startFrame;

  // Which group is active
  const activeGroupIndex = Math.min(
    Math.max(Math.floor(relativeFrame / framesPerGroup), 0),
    groups.length - 1
  );
  const activeGroup = groups[activeGroupIndex];

  // Which word within the group is active
  const frameInGroup = relativeFrame - activeGroupIndex * framesPerGroup;
  const framesPerWord = framesPerGroup / activeGroup.length;
  const activeWordIndex = Math.min(
    Math.max(Math.floor(frameInGroup / framesPerWord), 0),
    activeGroup.length - 1
  );

  // Group entry animation
  const entryProgress = frameInGroup / framesPerGroup;
  const groupScale = interpolate(entryProgress, [0, 0.08], [0.6, 1], {
    extrapolateRight: 'clamp',
  });
  const groupOpacity = interpolate(entryProgress, [0, 0.05, 0.85, 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Don't render before start or after end
  if (frame < startFrame || frame > endFrame) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          padding: '0 60px',
          transform: `scale(${groupScale})`,
          opacity: groupOpacity,
        }}
      >
        {activeGroup.map((word, i) => {
          const isActive = i === activeWordIndex;
          const wordProgress = isActive
            ? interpolate(
                frameInGroup - i * framesPerWord,
                [0, framesPerWord * 0.3],
                [0, 1],
                { extrapolateRight: 'clamp' }
              )
            : 0;

          const wordScale = isActive
            ? interpolate(wordProgress, [0, 1], [1, 1.15], {
                extrapolateRight: 'clamp',
              })
            : 1;

          return (
            <span
              key={`${activeGroupIndex}-${i}`}
              style={{
                fontSize: 80,
                fontWeight: 900,
                fontFamily: 'Arial Black, Impact, sans-serif',
                color: isActive ? '#FACC15' : '#FFFFFF',
                textShadow:
                  '4px 4px 0px rgba(0,0,0,0.8), -2px -2px 0px rgba(0,0,0,0.8), 2px -2px 0px rgba(0,0,0,0.8), -2px 2px 0px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.5)',
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