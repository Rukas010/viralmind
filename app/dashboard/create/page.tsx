'use client';

import { VideoDownloader } from '@/components/VideoDownloader';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, Check, Loader2,
  Sparkles, Shuffle, Volume2, Film,
  RotateCcw, Clock,
} from 'lucide-react';

const VideoPreviewSection = dynamic(
  () => import('@/components/VideoPreviewSection').then((mod) => mod.VideoPreviewSection),
  { ssr: false }
);

const STYLES = [
  { id: 'reddit-story', name: 'Reddit Story', emoji: '📖', color: 'bg-orange-500' },
  { id: 'scary-facts', name: 'Scary Facts', emoji: '💀', color: 'bg-red-500' },
  { id: 'would-you-rather', name: 'Would You Rather', emoji: '🤔', color: 'bg-purple-500' },
  { id: 'motivation', name: 'Motivation', emoji: '🔥', color: 'bg-amber-500' },
  { id: 'ai-wisdom', name: 'AI Wisdom', emoji: '🧠', color: 'bg-emerald-500' },
  { id: 'hot-takes', name: 'Hot Takes', emoji: '🌶️', color: 'bg-pink-500' },
  { id: 'life-hacks', name: 'Life Hacks', emoji: '💡', color: 'bg-cyan-500' },
  { id: 'story-time', name: 'Story Time', emoji: '📚', color: 'bg-indigo-500' },
  { id: 'conspiracy', name: 'Conspiracy', emoji: '👁️', color: 'bg-zinc-500' },
  { id: 'roast-me', name: 'Roast Me', emoji: '🎤', color: 'bg-yellow-500' },
];

const RANDOM_TOPICS: Record<string, string[]> = {
  'reddit-story': ['My neighbor has been secretly paying my bills', 'I found a hidden room in my new house', 'My coworker has been pretending to be someone else', 'I accidentally joined a secret society'],
  'scary-facts': ['Deep ocean creatures we haven\'t discovered', 'What happens to your body in space', 'The most haunted places on Earth', 'Parasites that control their hosts'],
  'would-you-rather': ['Have unlimited money or unlimited knowledge', 'Read minds or be invisible', 'Live 200 years in the past or future', 'Never sleep or never eat'],
  'motivation': ['Why most people quit right before success', 'The 5am routine that changed everything', 'How to build unbreakable discipline', 'What separates winners from losers'],
  'ai-wisdom': ['What AI thinks about human consciousness', 'The future of work according to AI', 'AI predictions for 2030', 'What AI learned from all of human history'],
  'hot-takes': ['College degrees are becoming useless', 'Social media is making us smarter not dumber', 'Remote work is better for everyone', 'Most productivity advice is wrong'],
  'life-hacks': ['Phone tricks most people don\'t know', 'How to save money without trying', 'Sleep hacks backed by science', 'Kitchen shortcuts that save hours'],
  'story-time': ['The strangest thing that happened at work', 'A trip that went completely wrong', 'Meeting a celebrity by accident', 'The best decision I ever made'],
  'conspiracy': ['Why certain inventions disappeared', 'Hidden messages in popular logos', 'Technologies being kept from the public', 'Strange coincidences in history'],
  'roast-me': ['Things people do that are secretly embarrassing', 'The worst dating profile mistakes', 'Gym behavior that needs to stop', 'Social media habits that are cringe'],
};

const DURATIONS = [
  { value: 30, label: '30s', desc: 'Quick hook' },
  { value: 60, label: '60s', desc: 'Standard' },
  { value: 90, label: '90s', desc: 'Deep dive' },
];

type Step = 'style' | 'topic' | 'script' | 'done';

const STEP_ORDER: Step[] = ['style', 'topic', 'script', 'done'];
const STEP_LABELS = ['Style', 'Topic', 'Script', 'Export'];

export default function CreateVideoPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('style');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [script, setScript] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [videoId, setVideoId] = useState('');
  const [voiceoverUrl, setVoiceoverUrl] = useState('');
  const [generatingScript, setGeneratingScript] = useState(false);
  const [generatingVoiceover, setGeneratingVoiceover] = useState(false);
  const [creditsLeft, setCreditsLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const profile = await getProfile();
      if (profile) {
        const p = profile as { credits_used: number; credits_limit: number };
        setCreditsLeft(p.credits_limit - p.credits_used);
      }
      setLoading(false);
    }
    load();
  }, []);

  const currentStepIndex = STEP_ORDER.indexOf(step);

  const handleRandomTopic = () => {
    const topics = RANDOM_TOPICS[selectedStyle] || [];
    if (topics.length > 0) {
      setTopic(topics[Math.floor(Math.random() * topics.length)]);
    }
  };

  const handleGenerateScript = async () => {
    if (creditsLeft <= 0) {
      toast.error('No credits remaining. Upgrade your plan.');
      return;
    }
    setGeneratingScript(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Not authenticated');
        return;
      }
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ style: selectedStyle, topic, duration: selectedDuration }),
      });
      const data = await res.json();
      if (data.success) {
        setScript(data.video.script);
        setGeneratedTitle(data.video.title);
        setVideoId(data.video.id);
        setCreditsLeft((prev) => prev - 1);
        setStep('script');
      } else {
        toast.error(data.error || 'Failed to generate script');
      }
    } catch {
      toast.error('Failed to generate script');
    } finally {
      setGeneratingScript(false);
    }
  };

  const handleRegenerateScript = async () => {
    setGeneratingScript(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ style: selectedStyle, topic, duration: selectedDuration }),
      });
      const data = await res.json();
      if (data.success) {
        setScript(data.video.script);
        setGeneratedTitle(data.video.title);
        setVideoId(data.video.id);
        setCreditsLeft((prev) => prev - 1);
        toast.success('Script regenerated');
      } else {
        toast.error(data.error || 'Failed to regenerate');
      }
    } catch {
      toast.error('Failed to regenerate script');
    } finally {
      setGeneratingScript(false);
    }
  };

  const handleSaveScript = async () => {
    setStep('done');
    toast.success('Script saved');
  };

  const handleGenerateVoiceover = async () => {
    setGeneratingVoiceover(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/generate-voiceover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ videoId }),
      });
      const data = await res.json();
      if (data.success) {
        setVoiceoverUrl(data.voiceover_url);
        toast.success('Voiceover generated');
      } else {
        toast.error(data.error || 'Failed to generate voiceover');
      }
    } catch {
      toast.error('Failed to generate voiceover');
    } finally {
      setGeneratingVoiceover(false);
    }
  };

  const handleStartOver = () => {
    setStep('style');
    setSelectedStyle('');
    setTopic('');
    setScript('');
    setGeneratedTitle('');
    setVideoId('');
    setVoiceoverUrl('');
    setSelectedDuration(60);
  };

  const wordCount = script.split(/\s+/).filter((w) => w.length > 0).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-64 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Create Video</h1>
        <p className="text-[13px] text-zinc-500 mt-0.5">
          {creditsLeft} credit{creditsLeft !== 1 ? 's' : ''} remaining
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-medium ${
                i < currentStepIndex
                  ? 'bg-purple-600 text-white'
                  : i === currentStepIndex
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
              }`}>
                {i < currentStepIndex ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={`text-[12px] hidden sm:inline ${
                i <= currentStepIndex ? 'text-zinc-900 dark:text-white font-medium' : 'text-zinc-400'
              }`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`w-8 h-px ${i < currentStepIndex ? 'bg-purple-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ===== STEP 1: STYLE ===== */}
      {step === 'style' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">Pick a style</h2>
            <p className="text-[13px] text-zinc-500">Choose a content format for your video.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(s.id)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                  selectedStyle === s.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/[0.05]'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className={`h-9 w-9 rounded-lg ${s.color} flex items-center justify-center text-lg flex-shrink-0`}>
                  {s.emoji}
                </div>
                <span className={`text-sm font-medium ${
                  selectedStyle === s.id ? 'text-purple-700 dark:text-purple-300' : 'text-zinc-700 dark:text-zinc-300'
                }`}>
                  {s.name}
                </span>
                {selectedStyle === s.id && (
                  <Check className="h-4 w-4 text-purple-500 ml-auto" />
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep('topic')}
              disabled={!selectedStyle}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 2: TOPIC ===== */}
      {step === 'topic' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">Enter a topic</h2>
            <p className="text-[13px] text-zinc-500">What should the video be about?</p>
          </div>

          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. What happens if you don't sleep for 7 days"
                className="flex-1 h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
              />
              <button
                onClick={handleRandomTopic}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                title="Random topic"
              >
                <Shuffle className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Duration
            </label>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDuration(d.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border text-sm font-medium transition-all ${
                    selectedDuration === d.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/[0.05] text-purple-700 dark:text-purple-300'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {d.label}
                  <span className="text-[11px] text-zinc-400 hidden sm:inline">• {d.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep('style')}
              className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              onClick={handleGenerateScript}
              disabled={!topic.trim() || generatingScript}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingScript ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="h-3.5 w-3.5" /> Generate Script</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 3: SCRIPT ===== */}
      {step === 'script' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">Review your script</h2>
            <p className="text-[13px] text-zinc-500">Edit the script below or regenerate a new one.</p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Title</label>
            <input
              type="text"
              value={generatedTitle}
              onChange={(e) => setGeneratedTitle(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Script */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">Script</label>
              <span className="text-[12px] text-zinc-400">{wordCount} words</span>
            </div>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={10}
              className="w-full px-3 py-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleRegenerateScript}
              disabled={generatingScript}
              className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors disabled:opacity-50"
            >
              {generatingScript ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Regenerate
            </button>
            <button
              onClick={handleSaveScript}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition-colors"
            >
              Save & Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 4: DONE ===== */}
      {step === 'done' && (
        <div className="space-y-5">
          {/* Saved confirmation */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-6 text-center">
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">Script saved</h2>
            <p className="text-[13px] text-zinc-500">&ldquo;{generatedTitle}&rdquo;</p>
          </div>

          {/* Voiceover */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Voiceover</h3>
              <p className="text-[12px] text-zinc-500 mt-0.5">Generate an AI voiceover for your script.</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <button
                onClick={handleGenerateVoiceover}
                disabled={generatingVoiceover || !!voiceoverUrl}
                className={`w-full h-9 flex items-center justify-center gap-1.5 rounded-md text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  voiceoverUrl
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {generatingVoiceover ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...</>
                ) : voiceoverUrl ? (
                  <><Check className="h-3.5 w-3.5" /> Voiceover ready</>
                ) : (
                  <><Volume2 className="h-3.5 w-3.5" /> Generate Voiceover</>
                )}
              </button>

              {voiceoverUrl && (
                <div className="rounded-md border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3">
                  <p className="text-[11px] text-zinc-400 mb-2">Preview</p>
                  <audio controls className="w-full h-8" src={voiceoverUrl}>
                    Your browser does not support audio.
                  </audio>
                </div>
              )}
            </div>
          </div>

          {/* Video Preview */}
          <VideoPreviewSection
            script={script}
            voiceoverUrl={voiceoverUrl}
            style={selectedStyle}
            topic={topic}
            durationInSeconds={selectedDuration}
          />

          {/* Download */}
          <VideoDownloader
            script={script}
            style={selectedStyle}
            voiceoverUrl={voiceoverUrl}
            title={generatedTitle}
          />

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleStartOver}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" /> Create Another
            </button>
            <button
              onClick={() => router.push('/dashboard/videos')}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <Film className="h-3.5 w-3.5" /> My Videos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}