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

// Common words to filter out when extracting keywords from topic
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over',
  'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
  'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and', 'or',
  'if', 'while', 'about', 'what', 'which', 'who', 'whom', 'this', 'that',
  'these', 'those', 'am', 'it', 'its', 'my', 'your', 'his', 'her', 'our',
  'their', 'me', 'him', 'us', 'them', 'i', 'you', 'he', 'she', 'we', 'they',
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function buildSearchQueries(topic: string, style: string): string[] {
  const keywords = extractKeywords(topic);
  const queries: string[] = [];

  // Topic-based searches (most relevant)
  if (keywords.length >= 2) {
    queries.push(keywords.slice(0, 3).join(' '));
  }
  if (keywords.length >= 1) {
    queries.push(`${keywords[0]} cinematic`);
    queries.push(`${keywords[0]} dramatic`);
  }

  // Style fallbacks
  const styleFallbacks = STYLE_SEARCH_TERMS[style] || ['abstract background'];
  queries.push(...styleFallbacks);

  return queries;
}

async function searchPexelsVideo(
  client: ReturnType<typeof createClient>,
  query: string
): Promise<string | null> {
  try {
    const response = await client.videos.search({
      query,
      per_page: 10,
      orientation: 'portrait',
      size: 'medium',
    });

    if ('videos' in response && response.videos.length > 0) {
      const randomVideo =
        response.videos[Math.floor(Math.random() * response.videos.length)];
      const videoFile =
        randomVideo.video_files
          .filter((f) => f.quality === 'hd' && f.width && f.width <= 1920)
          .sort((a, b) => (b.width || 0) - (a.width || 0))[0] ||
        randomVideo.video_files[0];
      return videoFile?.link || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getBackgroundVideo(
  style: string,
  topic?: string
): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  const client = createClient(apiKey);
  const queries = topic
    ? buildSearchQueries(topic, style)
    : STYLE_SEARCH_TERMS[style] || ['abstract background'];

  // Try topic-based queries first, then fall back to style defaults
  for (const query of queries) {
    const url = await searchPexelsVideo(client, query);
    if (url) return url;
  }

  return null;
}

export async function getMultipleBackgroundClips(
  style: string,
  count: number = 3,
  topic?: string
): Promise<string[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  const client = createClient(apiKey);
  const queries = topic
    ? buildSearchQueries(topic, style)
    : STYLE_SEARCH_TERMS[style] || ['abstract background'];

  const urls: string[] = [];
  let queryIndex = 0;

  for (let i = 0; i < count; i++) {
    const query = queries[queryIndex % queries.length];
    queryIndex++;

    try {
      const response = await client.videos.search({
        query,
        per_page: 10,
        orientation: 'portrait',
        size: 'medium',
        page: i + 1,
      });

      if ('videos' in response && response.videos.length > 0) {
        const randomVideo =
          response.videos[Math.floor(Math.random() * response.videos.length)];
        const videoFile =
          randomVideo.video_files
            .filter((f) => f.quality === 'hd' && f.width && f.width <= 1920)
            .sort((a, b) => (b.width || 0) - (a.width || 0))[0] ||
          randomVideo.video_files[0];
        if (videoFile?.link) {
          urls.push(videoFile.link);
        }
      }
    } catch (error) {
      console.error(`Pexels error (clip ${i + 1}):`, error);
    }
  }

  return urls;
}

export async function getGameplayClip(): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  const client = createClient(apiKey);
  const randomTerm =
    GAMEPLAY_SEARCH_TERMS[Math.floor(Math.random() * GAMEPLAY_SEARCH_TERMS.length)];

  try {
    const response = await client.videos.search({
      query: randomTerm,
      per_page: 10,
      orientation: 'portrait',
      size: 'medium',
    });

    if ('videos' in response && response.videos.length > 0) {
      const randomVideo =
        response.videos[Math.floor(Math.random() * response.videos.length)];
      const videoFile =
        randomVideo.video_files
          .filter((f) => f.quality === 'hd' && f.width && f.width <= 1920)
          .sort((a, b) => (b.width || 0) - (a.width || 0))[0] ||
        randomVideo.video_files[0];
      return videoFile?.link || null;
    }
    return null;
  } catch {
    return null;
  }
}