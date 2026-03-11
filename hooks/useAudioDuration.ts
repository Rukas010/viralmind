'use client';

import { useState, useEffect } from 'react';

export function useAudioDuration(url?: string): number | null {
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    if (!url) {
      setDuration(null);
      return;
    }

    const audio = new Audio();

    const handleLoaded = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleError = () => {
      console.error('Failed to load audio for duration detection');
      setDuration(null);
    };

    audio.addEventListener('loadedmetadata', handleLoaded);
    audio.addEventListener('error', handleError);
    audio.src = url;
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoaded);
      audio.removeEventListener('error', handleError);
      audio.src = '';
    };
  }, [url]);

  return duration;
}