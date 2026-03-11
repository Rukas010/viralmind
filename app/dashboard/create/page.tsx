'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { getProfile } from '@/lib/auth'
import type { Template, Profile } from '@/lib/supabase'
import {
  Sparkles, ArrowLeft, Loader2, Zap,
  Shuffle, Clock, Film, Check, Wand2, Volume2,
} from 'lucide-react'
import { toast } from 'sonner'

const emojiMap: Record<string, string> = {
  'reddit-story': '📖', 'scary-facts': '😱', 'would-you-rather': '🤔',
  'motivation': '💪', 'ai-wisdom': '🧠', 'hot-takes': '🔥',
  'life-hacks': '💡', 'story-time': '📚', 'conspiracy': '👁️', 'roast-me': '🎤',
}

const colorMap: Record<string, string> = {
  'reddit-story': 'from-orange-500 to-red-500', 'scary-facts': 'from-red-500 to-purple-500',
  'would-you-rather': 'from-yellow-500 to-orange-500', 'motivation': 'from-blue-500 to-cyan-500',
  'ai-wisdom': 'from-cyan-500 to-blue-500', 'hot-takes': 'from-orange-500 to-yellow-500',
  'life-hacks': 'from-green-500 to-emerald-500', 'story-time': 'from-indigo-500 to-purple-500',
  'conspiracy': 'from-purple-500 to-pink-500', 'roast-me': 'from-red-500 to-orange-500',
}

const randomTopics: Record<string, string[]> = {
  'reddit-story': ['My neighbor has been stealing my WiFi for 3 years', 'I accidentally sent a text about my boss to my boss', 'I found a hidden room in my apartment', 'AITA for refusing to share my lottery winnings with family'],
  'scary-facts': ['The ocean', 'The human brain', 'Things that happen while you sleep', 'Space and the universe'],
  'would-you-rather': ['Superpowers with consequences', 'Money vs time', 'Know the future vs change the past', 'Social media dilemmas'],
  'motivation': ['Discipline over motivation', 'Starting from zero', 'Proving everyone wrong', 'The cost of staying comfortable'],
  'ai-wisdom': ['The nature of consciousness', 'What happens after we die', 'The simulation theory', 'The meaning of time'],
  'hot-takes': ['Modern dating', 'Social media culture', 'The education system', 'Hustle culture'],
  'life-hacks': ['Productivity tricks', 'Money saving hacks', 'Social skills', 'Things nobody teaches you'],
  'story-time': ['A stranger on a train', 'The worst job interview ever', 'A deal with the devil', 'The last person on earth'],
  'conspiracy': ['The moon landing', 'Missing time', 'Ancient civilizations', 'The internet is watching'],
  'roast-me': ['People who say they are foodies', 'Gym culture', 'LinkedIn influencers', 'People who wake up at 5am'],
}

type WizardStep = 'style' | 'topic' | 'script' | 'done'

export default function CreateVideoPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatingVoiceover, setGeneratingVoiceover] = useState(false)
  const [voiceoverUrl, setVoiceoverUrl] = useState<string | null>(null)
  const [step, setStep] = useState<WizardStep>('style')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState(60)
  const [generatedScript, setGeneratedScript] = useState('')
  const [generatedTitle, setGeneratedTitle] = useState('')
  const [videoId, setVideoId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const p = await getProfile()
      if (!p) return
      setProfile(p)

      const { data } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: true })

      setTemplates((data ?? []) as Template[])
      setLoading(false)
    }
    load()
  }, [])

  function handleSelectTemplate(template: Template) {
    setSelectedTemplate(template)
    setStep('topic')
  }

  function handleRandomTopic() {
    if (!selectedTemplate) return
    const topics = randomTopics[selectedTemplate.slug] || randomTopics['reddit-story']
    const random = topics[Math.floor(Math.random() * topics.length)]
    setTopic(random)
  }

  async function handleGenerate() {
    if (!selectedTemplate || !topic.trim()) {
      toast.error('Enter a topic first')
      return
    }

    if (profile && profile.credits_used >= profile.credits_limit) {
      toast.error('No credits remaining. Upgrade your plan.')
      return
    }

    setGenerating(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('Not authenticated')
        setGenerating(false)
        return
      }

      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          style: selectedTemplate.slug,
          topic: topic.trim(),
          templateId: selectedTemplate.id,
          duration,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        toast.error(result.error || 'Failed to generate script')
        setGenerating(false)
        return
      }

      setGeneratedScript(result.video.script)
      setGeneratedTitle(result.video.title)
      setVideoId(result.video.id)
      setStep('script')

      if (profile) {
        setProfile({ ...profile, credits_used: profile.credits_used + 1 })
      }

      toast.success('Script generated!')
    } catch (err: any) {
      console.error('Generate error:', err)
      toast.error('Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSaveScript() {
    if (!videoId || !generatedScript.trim()) return

    try {
      const { error } = await supabase
        .from('videos')
        .update({
          script: generatedScript,
          title: generatedTitle,
          updated_at: new Date().toISOString(),
        })
        .eq('id', videoId)

      if (error) {
        toast.error('Failed to save')
        return
      }

      setStep('done')
      toast.success('Video saved!')
    } catch {
      toast.error('Failed to save')
    }
  }

  async function handleGenerateVoiceover() {
    if (!videoId) return

    setGeneratingVoiceover(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('Not authenticated')
        setGeneratingVoiceover(false)
        return
      }

      const res = await fetch('/api/generate-voiceover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ videoId }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        toast.error(result.error || 'Failed to generate voiceover')
        setGeneratingVoiceover(false)
        return
      }

      setVoiceoverUrl(result.voiceover_url)
      toast.success('Voiceover generated!')
    } catch (err: any) {
      console.error('Voiceover error:', err)
      toast.error('Something went wrong')
    } finally {
      setGeneratingVoiceover(false)
    }
  }

  function handleStartOver() {
    setStep('style')
    setSelectedTemplate(null)
    setTopic('')
    setGeneratedScript('')
    setGeneratedTitle('')
    setVideoId(null)
    setDuration(60)
    setVoiceoverUrl(null)
    setGeneratingVoiceover(false)
  }

  const creditsLeft = (profile?.credits_limit || 3) - (profile?.credits_used || 0)

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-64 bg-gray-800" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <Skeleton key={i} className="h-32 bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Create Video</h1>
          <p className="mt-1 text-gray-400">
            {step === 'style' && 'Step 1 — Pick a style'}
            {step === 'topic' && 'Step 2 — Enter your topic'}
            {step === 'script' && 'Step 3 — Review your script'}
            {step === 'done' && 'Done!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-purple-400" />
          <span className="text-sm text-gray-400">
            {creditsLeft} credit{creditsLeft !== 1 ? 's' : ''} left
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8 flex items-center gap-2">
        {['style', 'topic', 'script', 'done'].map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${
              ['style', 'topic', 'script', 'done'].indexOf(step) >= i
                ? 'bg-purple-500'
                : 'bg-gray-800'
            }`} />
          </div>
        ))}
      </div>

      {/* Step 1: Pick Style */}
      {step === 'style' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {templates.map((template) => {
            const emoji = emojiMap[template.slug] || '🎬'
            const gradient = colorMap[template.slug] || 'from-gray-500 to-gray-600'

            return (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="text-left rounded-xl border border-gray-800 bg-gray-900/50 p-5 hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`mb-3 h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                  {emoji}
                </div>
                <h3 className="text-sm font-semibold text-white">{template.name}</h3>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{template.description}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Step 2: Topic */}
      {step === 'topic' && selectedTemplate && (
        <div className="max-w-2xl">
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${colorMap[selectedTemplate.slug] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-xl`}>
                  {emojiMap[selectedTemplate.slug] || '🎬'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{selectedTemplate.name}</p>
                  <p className="text-xs text-gray-500">{selectedTemplate.description}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Topic</Label>
                <div className="flex gap-2">
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="What should the video be about?"
                    className="bg-gray-800 border-gray-700 text-white flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                  <Button
                    variant="outline"
                    onClick={handleRandomTopic}
                    className="border-gray-700 text-gray-400 hover:text-white shrink-0"
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600">Be specific for better results. Or click the dice for a random topic.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Duration</Label>
                <div className="flex items-center gap-4">
                  {[30, 60, 90].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        duration === d
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                          : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Clock className="h-4 w-4" />{d}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="ghost"
                  onClick={() => { setStep('style'); setSelectedTemplate(null); setTopic('') }}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />Back
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!topic.trim() || generating || creditsLeft <= 0}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {generating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                  ) : (
                    <><Wand2 className="mr-2 h-4 w-4" />Generate Script</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Script Review */}
      {step === 'script' && (
        <div className="max-w-3xl">
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Title</Label>
                <Input
                  value={generatedTitle}
                  onChange={(e) => setGeneratedTitle(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white text-lg font-semibold"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Script</Label>
                  <span className="text-xs text-gray-500">
                    {generatedScript.split(/\s+/).length} words • ~{Math.round(generatedScript.split(/\s+/).length / 2.5)}s
                  </span>
                </div>
                <Textarea
                  value={generatedScript}
                  onChange={(e) => setGeneratedScript(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white min-h-[300px] leading-relaxed"
                />
                <p className="text-xs text-gray-600">Edit the script if you want. This is exactly what the voiceover will say.</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Film className="h-3 w-3" />{selectedTemplate?.name}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{duration}s target</span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep('topic')} className="text-gray-400 hover:text-white">
                  <ArrowLeft className="mr-2 h-4 w-4" />Back
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={generating || creditsLeft <= 0}
                    className="border-gray-700 text-gray-300 hover:text-white"
                  >
                    {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shuffle className="mr-2 h-4 w-4" />}
                    Regenerate
                  </Button>
                  <Button onClick={handleSaveScript} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Check className="mr-2 h-4 w-4" />Save Script
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Done + Voiceover */}
      {step === 'done' && (
        <div className="max-w-lg mx-auto text-center">
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="p-10">
              <div className="h-16 w-16 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Script Saved!</h2>
              <p className="text-gray-400 mb-2">&quot;{generatedTitle}&quot;</p>
              <p className="text-sm text-gray-500 mb-8">
                Now generate a voiceover, or create another video.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleGenerateVoiceover}
                  disabled={generatingVoiceover || !!voiceoverUrl}
                  className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                >
                  {generatingVoiceover ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Voiceover...</>
                  ) : voiceoverUrl ? (
                    <><Check className="mr-2 h-4 w-4" />Voiceover Ready</>
                  ) : (
                    <><Volume2 className="mr-2 h-4 w-4" />Generate Voiceover</>
                  )}
                </Button>

                {voiceoverUrl && (
                  <div className="rounded-lg bg-gray-950 border border-gray-800 p-4">
                    <p className="text-xs text-gray-500 mb-2">Preview</p>
                    <audio controls className="w-full" src={voiceoverUrl}>
                      Your browser does not support audio.
                    </audio>
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <Button
                    onClick={handleStartOver}
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:text-white flex-1"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Another
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/videos')}
                    className="border-gray-700 text-gray-300 hover:text-white flex-1"
                  >
                    <Film className="mr-2 h-4 w-4" />
                    My Videos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}