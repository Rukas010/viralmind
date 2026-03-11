import { createClient } from 'pexels';

const STYLE_SEARCH_TERMS: Record<string, string[]> = {
  'reddit-story': ['minecraft gameplay', 'subway surfers', 'satisfying slime', 'parkour city'],
  'scary-facts': ['dark forest drone', 'abandoned building', 'deep ocean underwater', 'night fog street'],
  'would-you-rather': ['colorful neon lights', 'roller coaster pov', 'abstract liquid', 'spinning ferris wheel'],
  motivation: ['city timelapse night', 'workout gym training', 'running athlete sunrise', 'mountain summit clouds'],
  'ai-wisdom': ['technology circuit board', 'space galaxy nebula', 'data center servers', 'futuristic city'],
  'hot-takes': ['fire flames close', 'crowd cheering stadium', 'lightning storm', 'boxing match'],
  'life-hacks': ['kitchen cooking overhead', 'home organization tidy', 'coffee making barista', 'desk workspace setup'],
  'story-time': ['rainy window night', 'cozy fireplace', 'night drive city', 'ocean waves sunset'],
  conspiracy: ['surveillance camera footage', 'dark clouds storm', 'government building night', 'eye close up macro'],
  'roast-me': ['fire explosion slow motion', 'crowd laughing audience', 'dramatic spotlight stage', 'fireworks close up'],
};

const GAMEPLAY_SEARCH_TERMS = [
  'minecraft gameplay',
  'subway surfers gameplay',
  'satisfying soap cutting',
  'sand cutting asmr',
  'slime satisfying',
  'water flow satisfying',
];

export async function getBackgroundVideo(style: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.error('PEXELS_API_KEY not set');
    return null;
  }

  const client = createClient(apiKey);
  const searchTerms = STYLE_SEARCH_TERMS[style] || ['abstract background'];
  const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

  try {
    const response = await client.videos.search({
      query: randomTerm,
      per_page: 15,
      orientation: 'portrait',
      size: 'medium',
    });

    if ('videos' in response && response.videos.length > 0) {
      const randomVideo = response.videos[Math.floor(Math.random() * response.videos.length)];
      const videoFile =
        randomVideo.video_files
          .filter((f) => f.quality === 'hd' && f.width && f.width <= 1920)
          .sort((a, b) => (b.width || 0) - (a.width || 0))[0] || randomVideo.video_files[0];
      return videoFile?.link || null;
    }
    return null;
  } catch (error) {
    console.error('Pexels API error:', error);
    return null;
  }
}

export async function getMultipleBackgroundClips(
  style: string,
  count: number = 3
): Promise<string[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.error('PEXELS_API_KEY not set');
    return [];
  }

  const client = createClient(apiKey);
  const searchTerms = STYLE_SEARCH_TERMS[style] || ['abstract background'];

  const urls: string[] = [];

  for (let i = 0; i < count; i++) {
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

    try {
      const response = await client.videos.search({
        query: randomTerm,
        per_page: 10,
        orientation: 'portrait',
        size: 'medium',
        page: i + 1,
      });

      if ('videos' in response && response.videos.length > 0) {
        const randomVideo = response.videos[Math.floor(Math.random() * response.videos.length)];
        const videoFile =
          randomVideo.video_files
            .filter((f) => f.quality === 'hd' && f.width && f.width <= 1920)
            .sort((a, b) => (b.width || 0) - (a.width || 0))[0] || randomVideo.video_files[0];
        if (videoFile?.link) {
          urls.push(videoFile.link);
        }
      }
    } catch (error) {
      console.error(`Pexels API error (clip ${i + 1}):`, error);
    }
  }

  return urls;
}

export async function getGameplayClip(): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  const client = createClient(apiKey);
  const randomTerm = GAMEPLAY_SEARCH_TERMS[Math.floor(Math.random() * GAMEPLAY_SEARCH_TERMS.length)];

  try {
    const response = await client.videos.search({
      query: randomTerm,
      per_page: 10,
      orientation: 'portrait',
      size: 'medium',
    });

    if ('videos' in response && response.videos.length > 0) {
      const randomVideo = response.videos[Math.floor(Math.random() * response.videos.length)];
      const videoFile =
        randomVideo.video_files
          .filter((f) => f.quality === 'hd' && f.width && f.width <= 1920)
          .sort((a, b) => (b.width || 0) - (a.width || 0))[0] || randomVideo.video_files[0];
      return videoFile?.link || null;
    }
    return null;
  } catch (error) {
    console.error('Pexels gameplay error:', error);
    return null;
  }
}