import { createClient } from 'pexels';

// These search terms are tested to return usable vertical video from Pexels
const STYLE_SEARCH_TERMS: Record<string, string[]> = {
  'reddit-story': [
    'mobile game colorful',
    'running game obstacle',
    'satisfying sand cutting',
    'soap cutting asmr',
    'colorful slime mixing',
    'water slide pov',
  ],
  'scary-facts': [
    'dark corridor walking',
    'foggy forest night',
    'deep sea creatures',
    'abandoned hospital dark',
    'thunderstorm night city',
    'dark tunnel underground',
  ],
  'would-you-rather': [
    'neon lights city night',
    'roller coaster pov ride',
    'colorful liquid mixing',
    'arcade game neon',
    'carnival ride spinning',
    'colorful smoke abstract',
  ],
  motivation: [
    'person running sunrise',
    'city skyline timelapse night',
    'weightlifting gym workout',
    'luxury car driving',
    'mountain climbing summit',
    'boxing training intense',
  ],
  'ai-wisdom': [
    'circuit board macro',
    'space stars nebula',
    'robot technology',
    'digital rain code',
    'futuristic tunnel light',
    'hologram technology',
  ],
  'hot-takes': [
    'fire close up slow motion',
    'crowd cheering stadium',
    'lightning bolt storm',
    'explosion slow motion',
    'debate microphone stage',
    'boxing ring fight',
  ],
  'life-hacks': [
    'cooking kitchen overhead',
    'cleaning organizing home',
    'coffee latte art',
    'desk workspace minimal',
    'grocery shopping store',
    'laundry folding',
  ],
  'story-time': [
    'rain on window night',
    'fireplace cozy room',
    'driving night city lights',
    'sunset ocean waves',
    'train window moving',
    'walking street night',
  ],
  conspiracy: [
    'eye close up macro iris',
    'security camera footage',
    'dark clouds time lapse',
    'pyramid egypt aerial',
    'satellite space orbit',
    'documents papers close',
  ],
  'roast-me': [
    'fire flames slow motion',
    'audience laughing comedy',
    'spotlight stage dark',
    'fireworks colorful night',
    'microphone comedy stage',
    'crowd reaction shocked',
  ],
};

// Satisfying / gameplay style clips that work as universal backgrounds
const GAMEPLAY_TERMS = [
  'mobile game obstacle run',
  'satisfying soap cutting asmr',
  'satisfying sand cutting kinetic',
  'colorful slime mixing satisfying',
  'water flow satisfying close',
  'marble run colorful',
  'domino chain reaction',
  'paint mixing satisfying',
  'cake decorating satisfying',
  'hydraulic press crushing',
  'candy making factory',
  'pottery wheel spinning clay',
];

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

  if (keywords.length >= 2) {
    queries.push(keywords.slice(0, 3).join(' '));
  }
  if (keywords.length >= 1) {
    queries.push(`${keywords[0]} cinematic`);
  }

  const styleFallbacks = STYLE_SEARCH_TERMS[style] || GAMEPLAY_TERMS;
  queries.push(...styleFallbacks);

  return queries;
}

async function searchPexelsVideo(
  client: ReturnType<typeof createClient>,
  query: string,
  page: number = 1
): Promise<string | null> {
  try {
    const response = await client.videos.search({
      query,
      per_page: 15,
      orientation: 'portrait',
      size: 'medium',
      page,
    });

    if ('videos' in response && response.videos.length > 0) {
      const video = response.videos[Math.floor(Math.random() * response.videos.length)];
      const file =
        video.video_files
          .filter((f) => f.quality === 'hd' && f.width && f.width <= 1920)
          .sort((a, b) => (b.width || 0) - (a.width || 0))[0] ||
        video.video_files[0];
      return file?.link || null;
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
    : STYLE_SEARCH_TERMS[style] || GAMEPLAY_TERMS;

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
    : STYLE_SEARCH_TERMS[style] || GAMEPLAY_TERMS;

  const urls: string[] = [];
  const usedUrls = new Set<string>();

  for (let i = 0; i < count; i++) {
    const query = queries[i % queries.length];

    for (let page = 1; page <= 3; page++) {
      const url = await searchPexelsVideo(client, query, page);
      if (url && !usedUrls.has(url)) {
        urls.push(url);
        usedUrls.add(url);
        break;
      }
    }
  }

  return urls;
}

export async function getGameplayClips(count: number = 3): Promise<string[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  const client = createClient(apiKey);
  const urls: string[] = [];
  const usedUrls = new Set<string>();
  const shuffled = [...GAMEPLAY_TERMS].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count; i++) {
    const term = shuffled[i % shuffled.length];
    const url = await searchPexelsVideo(client, term);
    if (url && !usedUrls.has(url)) {
      urls.push(url);
      usedUrls.add(url);
    }
  }

  return urls;
}