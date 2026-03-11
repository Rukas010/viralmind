export interface VideoTemplate {
    id: string;
    name: string;
    description: string;
    emoji: string;
    layout: 'classic' | 'split-story' | 'split-character' | 'cinematic';
    captionPosition: 'center' | 'bottom' | 'bottom-half';
    captionSize: 'large' | 'medium' | 'small';
  }
  
  export interface BackgroundClip {
    url: string;
    startFrame: number;
    endFrame: number;
  }
  
  export interface SoundEffect {
    id: string;
    name: string;
    url: string;
    triggerType: 'transition' | 'emphasis' | 'intro' | 'outro';
  }
  
  export const VIDEO_TEMPLATES: VideoTemplate[] = [
    {
      id: 'classic-brainrot',
      name: 'Classic Brainrot',
      description: 'Gameplay background + big centered captions',
      emoji: '🎮',
      layout: 'classic',
      captionPosition: 'center',
      captionSize: 'large',
    },
    {
      id: 'split-story',
      name: 'Reddit Story',
      description: 'Gameplay on top, story scrolling on bottom',
      emoji: '📖',
      layout: 'split-story',
      captionPosition: 'bottom-half',
      captionSize: 'medium',
    },
    {
      id: 'split-character',
      name: 'Character React',
      description: 'Gameplay on top, AI character reacting below',
      emoji: '🗣️',
      layout: 'split-character',
      captionPosition: 'bottom',
      captionSize: 'medium',
    },
    {
      id: 'cinematic',
      name: 'Cinematic',
      description: 'Full screen dramatic footage + bold captions',
      emoji: '🎬',
      layout: 'cinematic',
      captionPosition: 'center',
      captionSize: 'large',
    },
  ];