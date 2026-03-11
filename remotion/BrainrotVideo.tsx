import React from 'react';
import { useVideoConfig } from 'remotion';
import { ClassicBrainrot } from './templates/ClassicBrainrot';
import { SplitStory } from './templates/SplitStory';
import { SplitCharacter } from './templates/SplitCharacter';
import { CinematicFull } from './templates/CinematicFull';
import { BackgroundClip } from './type';

export interface BrainrotVideoProps {
  script: string;
  voiceoverUrl?: string;
  backgroundVideoUrl?: string;
  clips?: BackgroundClip[];
  style: string;
  templateId?: string;
}

export const BrainrotVideo: React.FC<BrainrotVideoProps> = ({
  script,
  voiceoverUrl,
  backgroundVideoUrl,
  clips,
  style,
  templateId = 'classic-brainrot',
}) => {
  const { durationInFrames } = useVideoConfig();

  const sharedProps = {
    script,
    voiceoverUrl,
    backgroundVideoUrl,
    clips,
    style,
    durationInFrames,
  };

  switch (templateId) {
    case 'split-story':
      return <SplitStory {...sharedProps} />;
    case 'split-character':
      return <SplitCharacter {...sharedProps} />;
    case 'cinematic':
      return <CinematicFull {...sharedProps} />;
    case 'classic-brainrot':
    default:
      return <ClassicBrainrot {...sharedProps} />;
  }
};