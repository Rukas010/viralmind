import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  user_id: string
  display_name: string
  avatar_url: string | null
  plan: string
  credits_used: number
  credits_limit: number
  // Billing-related fields are nullable in the database
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan_period_end: string | null
  created_at: string
  updated_at: string
}

export type Template = {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  preview_url: string | null
  caption_style: string
  caption_position: string
  background_type: string
  font_style: string
  is_premium: boolean
  created_at: string
}

export type Video = {
  id: string
  user_id: string
  template_id: string | null
  title: string
  topic: string | null
  style: string
  script: string | null
  voiceover_url: string | null
  video_url: string | null
  thumbnail_url: string | null
  background_url: string | null
  status: 'draft' | 'generating' | 'ready' | 'failed'
  duration: number | null
  width: number
  height: number
  created_at: string
  updated_at: string
}

export type GenerationStep = {
  id: string
  video_id: string
  step: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result_url: string | null
  error_message: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}