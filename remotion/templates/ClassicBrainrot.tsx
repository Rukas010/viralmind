import React from 'react';
import { AbsoluteFill, Audio } from 'remotion';
import { Background } from '../Background';
import { Captions } from '../Captions';
import { BackgroundClip } from '../type';

interface ClassicBrainrotProps {
  script: string;
  voiceoverUrl?: string;
  backgroundVideoUrl?: string;
  clips?: BackgroundClip[];
  style: string;
  durationInFrames: number;
}

export const ClassicBrainrot: React.FC<ClassicBrainrotProps> = ({
  script,
  voiceoverUrl,
  backgroundVideoUrl,
  clips,
  style,
  durationInFrames,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Background
        clips={clips}
        videoUrl={backgroundVideoUrl}
        style={style}
        region="full"
      />

      <Captions
        script={script}
        startFrame={0}
        endFrame={durationInFrames}
        position="center"
        size="large"
      />

      {voiceoverUrl && <Audio src={voiceoverUrl} volume={1} />}
    </AbsoluteFill>
  );
};