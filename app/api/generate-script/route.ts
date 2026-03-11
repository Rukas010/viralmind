import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateScript, generateTitle } from '@/lib/ai'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

export async function POST(req: NextRequest) {
  console.log('=== GENERATE SCRIPT API CALLED ===')

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

    // Check credits
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.credits_used >= profile.credits_limit) {
      return NextResponse.json({ error: 'No credits remaining. Upgrade your plan.' }, { status: 403 })
    }

    // Get request body
    const { style, topic, templateId, duration } = await req.json()

    if (!style || !topic) {
      return NextResponse.json({ error: 'Style and topic are required' }, { status: 400 })
    }

    console.log('Generating script:', { style, topic, duration })

    // Generate script and title
    const [scriptResult, title] = await Promise.all([
      generateScript({ style, topic, duration: duration || 60 }),
      generateTitle({ style, topic }),
    ])

    if (!scriptResult.success || !scriptResult.script) {
      return NextResponse.json({ error: scriptResult.error || 'Failed to generate' }, { status: 500 })
    }

    console.log('Script generated, length:', scriptResult.script.length)
    console.log('Title:', title)

    // Save video to database
    const { data: video, error: videoErr } = await supabaseAdmin
      .from('videos')
      .insert({
        user_id: user.id,
        template_id: templateId || null,
        title,
        topic,
        style,
        script: scriptResult.script,
        status: 'draft',
        duration: duration || 60,
      })
      .select('*')
      .single()

    if (videoErr) {
      console.error('Video insert error:', videoErr)
      return NextResponse.json({ error: 'Failed to save video' }, { status: 500 })
    }

    // Increment credits used
    await supabaseAdmin
      .from('profiles')
      .update({ credits_used: profile.credits_used + 1 })
      .eq('id', profile.id)

    console.log('=== SCRIPT GENERATION COMPLETE ===')

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        title: video.title,
        script: video.script,
        style: video.style,
        topic: video.topic,
        status: video.status,
      },
    })
  } catch (err: any) {
    console.error('Generate script error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}