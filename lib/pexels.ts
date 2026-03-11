import { createClient } from 'pexels';

const STYLE_SEARCH_TERMS: Record<string, string[]> = {
  'reddit-story': [
    'minecraft gameplay',
    'subway surfers',
    'satisfying slime',
    'parkour city',
  ],
  'scary-facts': [
    'dark forest drone',
    'abandoned building',
    'deep ocean underwater',
    'night fog street',
  ],
  'would-you-rather': [
    'colorful neon lights',
    'roller coaster pov',
    'abstract liquid',
    'spinning ferris wheel',
  ],
  motivation: [
    'city timelapse night',
    'workout gym training',
    'running athlete sunrise',
    'mountain summit clouds',
  ],
  'ai-wisdom': [
    'technology circuit board',
    'space galaxy nebula',
    'data center servers',
    'futuristic city',
  ],
  'hot-takes': [
    'fire flames close',
    'crowd cheering stadium',
    'lightning storm',
    'boxing match',
  ],
  'life-hacks': [
    'kitchen cooking overhead',
    'home organization tidy',
    'coffee making barista',
    'desk workspace setup',
  ],
  'story-time': [
    'rainy window night',
    'cozy fireplace',
    'night drive city',
    'ocean waves sunset',
  ],
  conspiracy: [
    'surveillance camera footage',
    'dark clouds storm',
    'government building night',
    'eye close up macro',
  ],
  'roast-me': [
    'fire explosion slow motion',
    'crowd laughing audience',
    'dramatic spotlight stage',
    'fireworks close up',
  ],
};

export async function getBackgroundVideo(
  style: string
): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.error('PEXELS_API_KEY not set');
    return null;
  }

  const client = createClient(apiKey);
  const searchTerms = STYLE_SEARCH_TERMS[style] || ['abstract background'];
  const randomTerm =
    searchTerms[Math.floor(Math.random() * searchTerms.length)];

  try {
    const response = await client.videos.search({
      query: randomTerm,
      per_page: 15,
      orientation: 'portrait',
      size: 'medium',
    });

    if ('videos' in response && response.videos.length > 0) {
      // Pick a random video from results
      const randomVideo =
        response.videos[Math.floor(Math.random() * response.videos.length)];

      // Prefer HD quality, portrait-friendly
      const videoFile =
        randomVideo.video_files
          .filter((f) => f.quality === 'hd' && f.width && f.width <= 1920)
          .sort((a, b) => (b.width || 0) - (a.width || 0))[0] ||
        randomVideo.video_files[0];

      return videoFile?.link || null;
    }

    return null;
  } catch (error) {
    console.error('Pexels API error:', error);
    return null;
  }
}