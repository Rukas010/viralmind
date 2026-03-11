import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateVoiceover } from '@/lib/elevenlabs'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

export async function POST(req: NextRequest) {
  console.log('=== GENERATE VOICEOVER API CALLED ===')

  try {
    // Auth
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Get request
    const { videoId } = await req.json()

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }

    // Get video and verify ownership
    const { data: video, error: videoErr } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('user_id', user.id)
      .single()

    if (videoErr || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    if (!video.script) {
      return NextResponse.json({ error: 'No script to convert' }, { status: 400 })
    }

    console.log('Video:', video.title, '| Style:', video.style)
    console.log('Script length:', video.script.length, 'chars')

    // Update status
    await supabaseAdmin
      .from('videos')
      .update({ status: 'generating' })
      .eq('id', videoId)

    // Generate voiceover
    const result = await generateVoiceover({
      script: video.script,
      style: video.style,
    })

    if (!result.success || !result.audioBuffer) {
      await supabaseAdmin
        .from('videos')
        .update({ status: 'failed' })
        .eq('id', videoId)

      return NextResponse.json({ error: result.error || 'Voiceover failed' }, { status: 500 })
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}/${videoId}.mp3`

    const { error: uploadErr } = await supabaseAdmin.storage
      .from('voiceovers')
      .upload(fileName, result.audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (uploadErr) {
      console.error('Upload error:', uploadErr)
      await supabaseAdmin
        .from('videos')
        .update({ status: 'failed' })
        .eq('id', videoId)

      return NextResponse.json({ error: 'Failed to upload audio' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('voiceovers')
      .getPublicUrl(fileName)

    const voiceoverUrl = urlData.publicUrl

    // Update video record
    await supabaseAdmin
      .from('videos')
      .update({
        voiceover_url: voiceoverUrl,
        status: 'ready',
        updated_at: new Date().toISOString(),
      })
      .eq('id', videoId)

    console.log('=== VOICEOVER COMPLETE ===')
    console.log('URL:', voiceoverUrl)

    return NextResponse.json({
      success: true,
      voiceover_url: voiceoverUrl,
    })
  } catch (err: any) {
    console.error('Voiceover route error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}