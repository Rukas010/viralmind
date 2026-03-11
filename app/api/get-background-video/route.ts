import { NextRequest, NextResponse } from 'next/server';
import { getBackgroundVideo } from '@/lib/pexels';

export async function GET(req: NextRequest) {
  const style = req.nextUrl.searchParams.get('style') || 'reddit-story';

  try {
    const url = await getBackgroundVideo(style);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Background video fetch error:', error);
    return NextResponse.json(
      { success: false, url: null, error: 'Failed to fetch background video' },
      { status: 500 }
    );
  }
}