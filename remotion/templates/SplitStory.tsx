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
  const { fps, width } = useVideoConfig();

  const words = script.split(/\s+/).filter((w) => w.length > 0);
  const WORDS_PER_GROUP = 3;
  const totalGroups = Math.ceil(words.length / WORDS_PER_GROUP);
  const bufferFrames = Math.floor(fps * 0.3);
  const activeStart = bufferFrames;
  const activeEnd = durationInFrames - bufferFrames;
  const activeDuration = activeEnd - activeStart;
  const framesPerGroup = activeDuration / totalGroups;
  const relativeFrame = frame - activeStart;
  const activeGroupIndex = Math.min(
    Math.max(Math.floor(relativeFrame / framesPerGroup), 0),
    totalGroups - 1
  );

  // Current word index (global)
  const currentWordStart = activeGroupIndex * WORDS_PER_GROUP;

  // Upvote animation
  const upvoteCount = interpolate(
    frame,
    [0, durationInFrames * 0.3, durationInFrames],
    [847, 12400, 24800],
    { extrapolateRight: 'clamp' }
  );

  const formatUpvotes = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return Math.floor(n).toString();
  };

  // Comment count grows
  const commentCount = interpolate(
    frame,
    [0, durationInFrames],
    [234, 2347],
    { extrapolateRight: 'clamp' }
  );

  // Calculate visible text window - show surrounding context
  const VISIBLE_WORDS = 40;
  const windowStart = Math.max(0, currentWordStart - 8);
  const windowEnd = Math.min(words.length, windowStart + VISIBLE_WORDS);
  const visibleWords = words.slice(windowStart, windowEnd);

  // Entry animation for the Reddit card
  const cardSlide = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80, mass: 1 },
  });
  const cardY = interpolate(cardSlide, [0, 1], [60, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Top half: Gameplay */}
      <Background
        clips={clips}
        videoUrl={backgroundVideoUrl}
        style={style}
        region="top-half"
      />

      {/* Top half captions */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TopCaptions
          words={words}
          activeGroupIndex={activeGroupIndex}
          wordsPerGroup={WORDS_PER_GROUP}
          framesPerGroup={framesPerGroup}
          relativeFrame={relativeFrame}
          activeStart={activeStart}
          frame={frame}
          fps={fps}
        />
      </div>

      {/* Divider */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: '#343536',
          zIndex: 10,
        }}
      />

      {/* Bottom half: Reddit UI */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#030303',
          overflow: 'hidden',
          transform: `translateY(${cardY}px)`,
        }}
      >
        {/* Subreddit bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 20px 10px',
            borderBottom: '1px solid #343536',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#ff4500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 900,
              color: '#fff',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            r/
          </div>
          <div>
            <span
              style={{
                color: '#d7dadc',
                fontSize: 18,
                fontWeight: 700,
                fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
              }}
            >
              r/stories
            </span>
            <span
              style={{
                color: '#818384',
                fontSize: 14,
                marginLeft: 8,
                fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
              }}
            >
              • 3h
            </span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div
              style={{
                padding: '4px 16px',
                borderRadius: 20,
                border: '1px solid #d7dadc',
                color: '#d7dadc',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
              }}
            >
              Join
            </div>
          </div>
        </div>

        {/* Post content */}
        <div style={{ display: 'flex', padding: '12px 8px 12px 4px' }}>
          {/* Vote column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0 10px',
              gap: 4,
              minWidth: 48,
            }}
          >
            {/* Upvote arrow */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff4500">
              <path d="M12 4l-8 8h5v8h6v-8h5z" />
            </svg>
            <span
              style={{
                color: '#ff4500',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
              }}
            >
              {formatUpvotes(upvoteCount)}
            </span>
            {/* Downvote arrow */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#818384">
              <path d="M12 20l8-8h-5V4H9v8H4z" />
            </svg>
          </div>

          {/* Post body */}
          <div style={{ flex: 1, paddingRight: 12 }}>
            {/* Username */}
            <div style={{ marginBottom: 6 }}>
              <span
                style={{
                  color: '#818384',
                  fontSize: 14,
                  fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
                }}
              >
                u/throwaway29384 •{' '}
              </span>
              <span
                style={{
                  color: '#818384',
                  fontSize: 14,
                  fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
                }}
              >
                3 hours ago
              </span>
            </div>

            {/* Post text with highlighted words */}
            <div
              style={{
                lineHeight: 1.7,
              }}
            >
              {visibleWords.map((word, i) => {
                const globalIndex = windowStart + i;
                const isInActiveGroup =
                  globalIndex >= currentWordStart &&
                  globalIndex < currentWordStart + WORDS_PER_GROUP;
                const isPast = globalIndex < currentWordStart;

                return (
                  <span
                    key={`${globalIndex}-${word}`}
                    style={{
                      fontSize: 28,
                      fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
                      color: isInActiveGroup
                        ? '#ff4500'
                        : isPast
                        ? '#818384'
                        : '#d7dadc',
                      fontWeight: isInActiveGroup ? 700 : 400,
                      backgroundColor: isInActiveGroup
                        ? 'rgba(255, 69, 0, 0.1)'
                        : 'transparent',
                      borderRadius: isInActiveGroup ? 4 : 0,
                      padding: isInActiveGroup ? '2px 4px' : '0 1px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {word}{' '}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom action bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '8px 20px 16px 62px',
            borderTop: '1px solid #343536',
            marginTop: 8,
          }}
        >
          <ActionButton icon="💬" label={`${formatUpvotes(commentCount)}`} />
          <ActionButton icon="🔄" label="Share" />
          <ActionButton icon="🏆" label="Award" />
          <ActionButton icon="💾" label="Save" />
        </div>
      </div>

      {voiceoverUrl && <Audio src={voiceoverUrl} volume={1} />}
    </AbsoluteFill>
  );
};

// Small caption overlay for the top half
const TopCaptions: React.FC<{
  words: string[];
  activeGroupIndex: number;
  wordsPerGroup: number;
  framesPerGroup: number;
  relativeFrame: number;
  activeStart: number;
  frame: number;
  fps: number;
}> = ({
  words,
  activeGroupIndex,
  wordsPerGroup,
  framesPerGroup,
  relativeFrame,
  frame,
  fps,
}) => {
  const groupStartFrame = activeGroupIndex * framesPerGroup;
  const frameInGroup = relativeFrame - groupStartFrame;
  const activeGroup = words.slice(
    activeGroupIndex * wordsPerGroup,
    activeGroupIndex * wordsPerGroup + wordsPerGroup
  );

  if (activeGroup.length === 0) return null;

  const framesPerWord = framesPerGroup / activeGroup.length;
  const activeWordIndex = Math.min(
    Math.max(Math.floor(frameInGroup / framesPerWord), 0),
    activeGroup.length - 1
  );

  const groupSpring = spring({
    frame: Math.max(0, frameInGroup),
    fps,
    config: { damping: 15, stiffness: 200, mass: 0.8 },
  });

  const groupOpacity = interpolate(
    frameInGroup,
    [0, framesPerGroup * 0.05, framesPerGroup * 0.85, framesPerGroup],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        padding: '0 40px',
        transform: `scale(${interpolate(groupSpring, [0, 1], [0.5, 1])})`,
        opacity: groupOpacity,
      }}
    >
      {activeGroup.map((word, i) => {
        const isActive = i === activeWordIndex;
        return (
          <span
            key={`${activeGroupIndex}-${i}`}
            style={{
              fontSize: 56,
              fontWeight: 900,
              fontFamily: 'Arial Black, Impact, sans-serif',
              color: isActive ? '#FACC15' : '#FFFFFF',
              textShadow:
                '3px 3px 0px rgba(0,0,0,0.9), -2px -2px 0px rgba(0,0,0,0.9), 2px -2px 0px rgba(0,0,0,0.9), -2px 2px 0px rgba(0,0,0,0.9)',
              textTransform: 'uppercase',
              transform: isActive ? 'scale(1.15)' : 'scale(1)',
              lineHeight: 1.2,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

const ActionButton: React.FC<{ icon: string; label: string }> = ({
  icon,
  label,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      color: '#818384',
      fontSize: 16,
      fontWeight: 700,
      fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif',
    }}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </div>
);  