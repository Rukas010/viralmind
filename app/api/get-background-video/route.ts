import { NextRequest, NextResponse } from 'next/server';
import {
  getBackgroundVideo,
  getMultipleBackgroundClips,
  getGameplayClips,
} from '@/lib/pexels';

export async function GET(req: NextRequest) {
  const style = req.nextUrl.searchParams.get('style') || 'reddit-story';
  const mode = req.nextUrl.searchParams.get('mode') || 'single';
  const count = parseInt(req.nextUrl.searchParams.get('count') || '3', 10);
  const topic = req.nextUrl.searchParams.get('topic') || undefined;

  try {
    if (mode === 'gameplay') {
      const urls = await getGameplayClips(count);
      return NextResponse.json({ success: true, url: urls[0] || null, urls });
    }

    if (mode === 'multiple') {
      const urls = await getMultipleBackgroundClips(style, count, topic);
      return NextResponse.json({ success: true, url: urls[0] || null, urls });
    }

    const url = await getBackgroundVideo(style, topic);
    return NextResponse.json({ success: true, url, urls: url ? [url] : [] });
  } catch (error) {
    console.error('Background video fetch error:', error);
    return NextResponse.json(
      { success: false, url: null, urls: [], error: 'Failed to fetch' },
      { status: 500 }
    );
  }
}