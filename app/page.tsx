'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Zap, ArrowRight, Check, Menu, X,
  Wand2, Mic, Download, Sparkles, Play,
  ChevronDown, Clock, Layers, Volume2,
} from 'lucide-react';

const TEMPLATES = [
  { name: 'Reddit Story', color: 'bg-orange-500' },
  { name: 'Scary Facts', color: 'bg-red-500' },
  { name: 'Would You Rather', color: 'bg-purple-500' },
  { name: 'Motivation', color: 'bg-amber-500' },
  { name: 'AI Wisdom', color: 'bg-emerald-500' },
  { name: 'Hot Takes', color: 'bg-pink-500' },
  { name: 'Life Hacks', color: 'bg-cyan-500' },
  { name: 'Story Time', color: 'bg-indigo-500' },
  { name: 'Conspiracy', color: 'bg-zinc-500' },
  { name: 'Roast Me', color: 'bg-yellow-500' },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: '10 viral formats',
    desc: 'Reddit stories, scary facts, motivation, hot takes — each one optimized for the algorithm.',
    span: 'md:col-span-2',
  },
  {
    icon: Mic,
    title: '5 AI voices',
    desc: 'Realistic voiceovers matched to each style. Deep, casual, intense — pick the right tone.',
    span: 'md:col-span-1',
  },
  {
    icon: Clock,
    title: 'Under 60 seconds',
    desc: 'From topic to finished video. Write, voice, render — done.',
    span: 'md:col-span-1',
  },
  {
    icon: Layers,
    title: '4 video layouts',
    desc: 'Classic brainrot, split-screen story, character react, or cinematic. Switch between them instantly.',
    span: 'md:col-span-2',
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '\$0',
    period: '',
    desc: 'For trying it out',
    features: ['3 videos / month', '720p export', 'All styles', 'Watermarked'],
    cta: 'Get started',
    primary: false,
  },
  {
    name: 'Pro',
    price: '\$19',
    period: '/mo',
    desc: 'For active creators',
    features: ['30 videos / month', '1080p Full HD', 'All styles', 'No watermark', 'Priority render'],
    cta: 'Start free trial',
    primary: true,
    badge: 'Popular',
  },
  {
    name: 'Ultra',
    price: '\$49',
    period: '/mo',
    desc: 'For teams & agencies',
    features: ['Unlimited videos', '4K export', 'Voice cloning', 'No watermark', 'API access', 'Support'],
    cta: 'Contact us',
    primary: false,
  },
];

const FAQS = [
  { q: 'What does Viralmind actually do?', a: 'You enter a topic, pick a style, and Viralmind generates a complete short-form video — script, voiceover, background footage, captions, everything. You download the MP4 and post it.' },
  { q: 'Do I need editing experience?', a: 'No. The entire workflow is automated. You make creative decisions and the AI handles production.' },
  { q: 'Do I need to show my face?', a: 'No. Every format is faceless by design — AI voice, stock footage, and animated captions. You stay behind the scenes.' },
  { q: 'Can I monetize the videos?', a: 'Yes. Everything you create is yours. Background footage comes from royalty-free sources. Use them on your channels, for clients, wherever.' },
  { q: 'How fast is it?', a: 'Script generation takes a few seconds. Voiceover takes about 10 seconds. Full video rendering under a minute.' },
  { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no fees. Cancel with one click. Videos you\'ve made are yours to keep.' },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white">

      {/* ===== NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-sm border-b border-zinc-200 dark:border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-600">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Viralmind</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[13px] text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Features</a>
            <a href="#templates" className="text-[13px] text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Templates</a>
            <a href="#pricing" className="text-[13px] text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Pricing</a>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="text-[13px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors px-3 py-1.5">
              Log in
            </Link>
            <Link href="/signup" className="text-[13px] font-medium text-white bg-purple-600 hover:bg-purple-500 px-4 py-1.5 rounded-md transition-colors">
              Get started
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-zinc-500">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-[#09090b] px-6 py-4 space-y-2">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block text-sm text-zinc-500 py-2">Features</a>
            <a href="#templates" onClick={() => setMobileOpen(false)} className="block text-sm text-zinc-500 py-2">Templates</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="block text-sm text-zinc-500 py-2">Pricing</a>
            <div className="pt-3 border-t border-zinc-200 dark:border-white/[0.06] space-y-2">
              <Link href="/login" className="block text-sm text-center text-zinc-500 py-2 rounded-md border border-zinc-200 dark:border-zinc-800">Log in</Link>
              <Link href="/signup" className="block text-sm text-center text-white py-2 rounded-md bg-purple-600 font-medium">Get started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative pt-28 pb-20 px-6 overflow-hidden">
        {/* Subtle gradient — the ONE decorative element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-500/[0.07] dark:bg-purple-500/[0.08] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 text-[13px] text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-full px-3 py-1 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-subtle-pulse" />
                Now in beta
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15] mb-4 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
              AI-generated
              <br />
              short-form video
            </h1>

            <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Viralmind turns a topic into a ready-to-post TikTok, Reel, or Short. Script, voiceover, captions, footage — all handled by AI. No editing. No face needed.
            </p>

            <div className="flex flex-wrap gap-3 mb-10 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-md transition-colors"
              >
                Start creating <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 px-5 py-2.5 rounded-md transition-colors"
              >
                Learn more
              </a>
            </div>

            <div className="flex items-center gap-6 text-[13px] text-zinc-400 dark:text-zinc-600 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-purple-500" /> Free tier available</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-purple-500" /> No credit card</span>
            </div>
          </div>

          {/* Right: Product Preview Card */}
          <div className="animate-fade-in-up hidden lg:block" style={{ animationDelay: '0.15s' }}>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-xl dark:shadow-none overflow-hidden">
              {/* Mini title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                </div>
                <span className="text-[11px] text-zinc-400 ml-2">viralmind.app/create</span>
              </div>

              <div className="p-5">
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-5">
                  {['Style', 'Topic', 'Script', 'Export'].map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-medium ${
                        i <= 2
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                      }`}>
                        {i <= 1 ? <Check className="h-3 w-3" /> : i + 1}
                      </div>
                      <span className={`text-[11px] ${i <= 2 ? 'text-zinc-900 dark:text-white font-medium' : 'text-zinc-400'}`}>{s}</span>
                      {i < 3 && <div className="w-6 h-px bg-zinc-200 dark:bg-zinc-700" />}
                    </div>
                  ))}
                </div>

                {/* Mock script card */}
                <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] font-medium text-zinc-900 dark:text-white">Generated Script</span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded font-medium">Reddit Story</span>
                  </div>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">
                    &ldquo;So I just found out my neighbor has been using my WiFi for three years. But here&apos;s the twist — he&apos;s been paying half my internet bill anonymously...&rdquo;
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                    <span>147 words</span>
                    <span>•</span>
                    <span>~58s</span>
                  </div>
                </div>

                {/* Mock voiceover bar */}
                <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-md bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <Play className="h-3 w-3 text-white ml-0.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      {[40, 65, 30, 80, 55, 70, 35, 90, 45, 60, 75, 40, 85, 50, 70, 30, 65, 55, 80, 45].map((h, i) => (
                        <div key={i} className="w-1.5 rounded-full bg-purple-500/30" style={{ height: `${h * 0.2}px` }}>
                          <div className="w-full rounded-full bg-purple-500" style={{ height: `${Math.min(100, i < 8 ? 100 : 0)}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-400 flex-shrink-0">0:32 / 0:58</span>
                </div>

                {/* Status pills */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                    <Check className="h-3 w-3" /> Script
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                    <Check className="h-3 w-3" /> Voice
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-1 rounded">
                    <Volume2 className="h-3 w-3" /> Rendering...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES (Bento) ===== */}
      <section id="features" className="scroll-mt-20 py-24 px-6 border-t border-zinc-100 dark:border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-lg mb-12">
            <p className="text-[13px] font-medium text-purple-600 dark:text-purple-400 mb-2">Features</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="text-zinc-500 text-[15px] leading-relaxed">
              Built specifically for short-form viral content. Every feature exists to get you from idea to published video faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`group rounded-xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors ${f.span}`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-4 group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-colors">
                  <f.icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                </div>
                <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 px-6 border-t border-zinc-100 dark:border-white/[0.04] bg-zinc-50/50 dark:bg-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-lg mb-12">
            <p className="text-[13px] font-medium text-purple-600 dark:text-purple-400 mb-2">How it works</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Four steps, one minute
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Sparkles, title: 'Pick a format', desc: 'Choose from 10 content styles built for engagement.' },
              { icon: Wand2, title: 'Enter a topic', desc: 'Type anything or use AI-suggested trending topics.' },
              { icon: Mic, title: 'Generate', desc: 'AI writes the script, picks a voice, and renders the video.' },
              { icon: Download, title: 'Post it', desc: 'Download your video and upload to TikTok, Reels, or Shorts.' },
            ].map((step, i) => (
              <div key={step.title} className="relative">
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(100%+4px)] w-[calc(100%-40px)] h-px bg-zinc-200 dark:bg-zinc-800" />
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <step.icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">Step {i + 1}</span>
                </div>
                <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TEMPLATES ===== */}
      <section id="templates" className="scroll-mt-20 py-24 px-6 border-t border-zinc-100 dark:border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-lg mb-12">
            <p className="text-[13px] font-medium text-purple-600 dark:text-purple-400 mb-2">Templates</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              10 content styles
            </h2>
            <p className="text-zinc-500 text-[15px] leading-relaxed">
              Each format is tuned for a specific type of viral content — the pacing, tone, and structure are all handled automatically.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <div
                key={t.name}
                className="group flex items-center gap-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-2.5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-default"
              >
                <div className={`h-2 w-2 rounded-full ${t.color}`} />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF / NUMBERS ===== */}
      <section className="py-24 px-6 border-t border-zinc-100 dark:border-white/[0.04] bg-zinc-50/50 dark:bg-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '10+', label: 'Content styles', sub: 'Each one algorithm-optimized' },
              { number: '5', label: 'AI voices', sub: 'Matched to content type' },
              { number: '<60s', label: 'Per video', sub: 'Topic to finished export' },
              { number: '4', label: 'Video layouts', sub: 'Classic, split, react, cinematic' },
            ].map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">{stat.number}</div>
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-0.5">{stat.label}</div>
                <div className="text-[12px] text-zinc-400 dark:text-zinc-600">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="scroll-mt-20 py-24 px-6 border-t border-zinc-100 dark:border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-lg mb-12">
            <p className="text-[13px] font-medium text-purple-600 dark:text-purple-400 mb-2">Pricing</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Simple pricing
            </h2>
            <p className="text-zinc-500 text-[15px] leading-relaxed">
              Start free. Upgrade when you need more capacity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-6 transition-all ${
                  plan.primary
                    ? 'border-purple-500 dark:border-purple-500 bg-purple-50/50 dark:bg-purple-500/[0.05] shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30'
                }`}
              >
                {plan.badge && (
                  <span className="absolute top-4 right-4 text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-2 py-0.5 rounded-full">
                    {plan.badge}
                  </span>
                )}

                <p className="text-sm font-semibold mb-0.5">{plan.name}</p>
                <p className="text-[13px] text-zinc-500 mb-4">{plan.desc}</p>

                <div className="flex items-baseline gap-0.5 mb-5">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-sm text-zinc-400">{plan.period}</span>}
                </div>

                <Link
                  href="/signup"
                  className={`block text-center text-[13px] font-medium py-2.5 rounded-md transition-colors mb-6 ${
                    plan.primary
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {plan.cta}
                </Link>

                <div className="space-y-2.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <Check className={`h-3.5 w-3.5 flex-shrink-0 ${plan.primary ? 'text-purple-500' : 'text-zinc-400 dark:text-zinc-600'}`} />
                      <span className="text-[13px] text-zinc-600 dark:text-zinc-400">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="scroll-mt-20 py-24 px-6 border-t border-zinc-100 dark:border-white/[0.04] bg-zinc-50/50 dark:bg-transparent">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12">
            <p className="text-[13px] font-medium text-purple-600 dark:text-purple-400 mb-2">FAQ</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Common questions
            </h2>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 overflow-hidden"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 pr-6">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-4 -mt-1">
                    <p className="text-[13px] text-zinc-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 px-6 border-t border-zinc-100 dark:border-white/[0.04]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Start making videos
          </h2>
          <p className="text-zinc-500 text-[15px] mb-8">
            Free to try. No credit card. No editing skills needed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-md transition-colors"
            >
              Get started free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors px-4 py-2.5"
            >
              View pricing
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-zinc-100 dark:border-white/[0.04] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-600">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-zinc-400">Viralmind</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Features</a>
            <a href="#templates" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Templates</a>
            <a href="#pricing" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Pricing</a>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-700">© {new Date().getFullYear()} Viralmind</p>
        </div>
      </footer>
    </div>
  );
}