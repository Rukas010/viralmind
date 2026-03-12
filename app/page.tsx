'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Zap, ArrowRight, Check, Menu, X,
  Wand2, Mic, Download, Sparkles,
  ChevronDown,
} from 'lucide-react';

const TEMPLATES = [
  { name: 'Reddit Story', desc: 'Confession and AITA stories', tag: 'Popular' },
  { name: 'Scary Facts', desc: 'Disturbing facts and dark trivia', tag: 'Trending' },
  { name: 'Would You Rather', desc: 'Impossible choices that spark debate' },
  { name: 'Motivation', desc: 'Grindset and self-improvement' },
  { name: 'AI Wisdom', desc: 'Mind-bending AI perspectives', tag: 'New' },
  { name: 'Hot Takes', desc: 'Controversial opinions' },
  { name: 'Life Hacks', desc: 'Useful tips nobody taught you' },
  { name: 'Story Time', desc: 'Personal narratives that hook' },
  { name: 'Conspiracy', desc: 'Theories and hidden truths' },
  { name: 'Roast Me', desc: 'Comedy roasts and burns' },
];

const STEPS = [
  { icon: Sparkles, title: 'Pick a format', desc: '10 styles optimized for engagement — Reddit stories, scary facts, motivation, and more.' },
  { icon: Wand2, title: 'Enter your topic', desc: 'Type a topic or let AI suggest one. The script is written in seconds.' },
  { icon: Mic, title: 'Generate voiceover', desc: 'Choose from 5 realistic AI voices. Each one matched to your content style.' },
  { icon: Download, title: 'Export and post', desc: 'Download your video and post directly to TikTok, Reels, or Shorts.' },
];

const PLANS = [
  {
    name: 'Free',
    price: '\$0',
    desc: 'For trying it out',
    features: ['3 videos per month', '720p export', 'All content styles', 'AI voiceover', 'Watermarked'],
    cta: 'Get started',
    primary: false,
  },
  {
    name: 'Pro',
    price: '\$19',
    desc: 'For active creators',
    features: ['30 videos per month', '1080p Full HD', 'All content styles', 'AI voiceover', 'No watermark', 'Priority rendering'],
    cta: 'Start free trial',
    primary: true,
    badge: 'Most popular',
  },
  {
    name: 'Ultra',
    price: '\$49',
    desc: 'For teams and agencies',
    features: ['Unlimited videos', '4K export', 'Voice cloning', 'No watermark', 'Priority rendering', 'API access', 'Dedicated support'],
    cta: 'Contact us',
    primary: false,
  },
];

const FAQS = [
  { q: 'What exactly does Viralmind do?', a: 'Viralmind generates short-form videos for TikTok, Reels, and Shorts. You pick a content style, enter a topic, and the AI writes a script, generates a voiceover, adds background footage, and renders a ready-to-post video.' },
  { q: 'Do I need editing experience?', a: 'No. The entire process is automated. You make creative decisions (topic, style, voice) and the AI handles production.' },
  { q: 'How long does each video take?', a: 'Under a minute from topic to finished video. Script generation takes a few seconds, voiceover about 10 seconds, and rendering under a minute.' },
  { q: 'Do I need to show my face?', a: 'No. All content is faceless by design — AI voiceover with background footage and captions. This is one of the fastest-growing content formats on social media.' },
  { q: 'Can I use the videos commercially?', a: 'Yes. Everything you create is yours. Background footage is sourced from royalty-free libraries. Post them, monetize them, use them for clients.' },
  { q: 'Can I cancel anytime?', a: 'Yes. No contracts. Cancel with one click and keep all videos you\'ve already created.' },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#09090b] text-white antialiased">

      {/* ===== NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-sm border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-600">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Viralmind</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#templates" className="text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors">Templates</a>
            <a href="#how-it-works" className="text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors">How it works</a>
            <a href="#pricing" className="text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors">Pricing</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-[13px] text-zinc-400 hover:text-white transition-colors px-3 py-1.5">
              Log in
            </Link>
            <Link href="/signup" className="text-[13px] font-medium text-white bg-purple-600 hover:bg-purple-500 px-4 py-1.5 rounded-md transition-colors">
              Get started
            </Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-zinc-400">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-[#09090b] px-6 py-4 space-y-2">
            <a href="#templates" onClick={() => setMobileOpen(false)} className="block text-sm text-zinc-400 py-2">Templates</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="block text-sm text-zinc-400 py-2">How it works</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="block text-sm text-zinc-400 py-2">Pricing</a>
            <div className="pt-3 border-t border-white/[0.06] space-y-2">
              <Link href="/login" className="block text-sm text-center text-zinc-400 py-2 rounded-md border border-zinc-800">Log in</Link>
              <Link href="/signup" className="block text-sm text-center text-white py-2 rounded-md bg-purple-600 font-medium">Get started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 text-[13px] text-zinc-500 border border-zinc-800 rounded-full px-3 py-1 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              Now in beta
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            Short-form video,
            <br />
            <span className="text-zinc-500">fully automated.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-500 max-w-xl leading-relaxed mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Viralmind generates viral TikToks, Reels, and Shorts from a single topic. 
            AI writes the script, generates the voiceover, and assembles the video. 
            No editing required.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-md transition-colors"
            >
              Start creating <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center text-sm text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 px-6 py-2.5 rounded-md transition-colors"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* ===== TEMPLATES ===== */}
      <section id="templates" className="scroll-mt-20 py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              10 content styles
            </h2>
            <p className="text-zinc-500 text-[15px] leading-relaxed">
              Each template is built around a format that consistently performs on short-form platforms. Pick one and the AI adapts its writing style, pacing, and tone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-white/[0.04] rounded-lg overflow-hidden">
            {TEMPLATES.map((t) => (
              <div
                key={t.name}
                className="bg-[#09090b] p-4 hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-sm font-medium text-white">{t.name}</h3>
                  {t.tag && (
                    <span className="text-[10px] font-medium text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded">
                      {t.tag}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-zinc-600 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="scroll-mt-20 py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              How it works
            </h2>
            <p className="text-zinc-500 text-[15px] leading-relaxed">
              Go from idea to published video in under a minute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-lg overflow-hidden">
            {STEPS.map((step, i) => (
              <div key={step.title} className="bg-[#09090b] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800">
                    <step.icon className="h-4 w-4 text-zinc-400" />
                  </div>
                  <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">Step {i + 1}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{step.title}</h3>
                <p className="text-[13px] text-zinc-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="scroll-mt-20 py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="max-w-xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Pricing
            </h2>
            <p className="text-zinc-500 text-[15px] leading-relaxed">
              Start free. Upgrade when you need more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04] rounded-lg overflow-hidden">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`bg-[#09090b] p-6 relative ${plan.primary ? 'bg-zinc-900/30' : ''}`}
              >
                {plan.badge && (
                  <span className="absolute top-4 right-4 text-[10px] font-medium text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">
                    {plan.badge}
                  </span>
                )}
                <p className="text-sm font-medium text-white mb-0.5">{plan.name}</p>
                <p className="text-[13px] text-zinc-600 mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  {plan.price !== '\$0' && <span className="text-sm text-zinc-600">/mo</span>}
                </div>
                <Link
                  href="/signup"
                  className={`block text-center text-[13px] font-medium py-2 rounded-md transition-colors mb-6 ${
                    plan.primary
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                  }`}
                >
                  {plan.cta}
                </Link>
                <div className="space-y-2.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
                      <span className="text-[13px] text-zinc-500">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="scroll-mt-20 py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-12">
            FAQ
          </h2>

          <div className="space-y-px rounded-lg overflow-hidden bg-white/[0.04]">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-[#09090b]">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-900/30 transition-colors"
                >
                  <span className="text-sm font-medium text-zinc-300 pr-8">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-zinc-600 flex-shrink-0 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-4">
                    <p className="text-[13px] text-zinc-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Start making videos today
          </h2>
          <p className="text-zinc-500 text-[15px] mb-6">
            Free to start. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-md transition-colors"
          >
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/[0.04] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-600">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-zinc-500">Viralmind</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#templates" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Templates</a>
            <a href="#pricing" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Pricing</a>
            <a href="#faq" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">FAQ</a>
          </div>
          <p className="text-xs text-zinc-700">© {new Date().getFullYear()} Viralmind</p>
        </div>
      </footer>
    </div>
  );
}