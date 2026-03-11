import React from 'react';
import { AbsoluteFill, Audio, useVideoConfig } from 'remotion';
import { Background } from './Background';
import { Captions } from './Captions';

export interface BrainrotVideoProps {
  script: string;
  voiceoverUrl?: string;
  backgroundVideoUrl?: string;
  style: string;
}

export const BrainrotVideo: React.FC<BrainrotVideoProps> = ({
  script,
  voiceoverUrl,
  backgroundVideoUrl,
  style,
}) => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Layer 1: Background */}
      <Background videoUrl={backgroundVideoUrl} style={style} />

      {/* Layer 2: Captions */}
      <Captions script={script} startFrame={0} endFrame={durationInFrames} />

      {/* Layer 3: Audio */}
      {voiceoverUrl && <Audio src={voiceoverUrl} volume={1} />}
    </AbsoluteFill>
  );
};