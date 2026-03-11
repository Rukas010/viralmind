'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Zap, Play, ArrowRight, Check, Menu, X,
  Wand2, Mic, Film, Download, Sparkles,
  ChevronDown, ChevronUp, Star,
} from 'lucide-react';

const TEMPLATES = [
  { emoji: '📖', name: 'Reddit Story', desc: 'Viral AITA and confession stories', color: 'from-orange-500 to-red-500', tag: 'Most Popular' },
  { emoji: '💀', name: 'Scary Facts', desc: 'Disturbing facts that keep you up at night', color: 'from-red-500 to-rose-700', tag: 'Trending' },
  { emoji: '🤔', name: 'Would You Rather', desc: 'Impossible choices that spark debate', color: 'from-purple-500 to-violet-700', tag: 'Engagement' },
  { emoji: '🔥', name: 'Motivation', desc: 'Sigma grindset and hustle content', color: 'from-amber-500 to-orange-600', tag: 'Viral' },
  { emoji: '🧠', name: 'AI Wisdom', desc: 'Mind-blowing AI-generated insights', color: 'from-emerald-500 to-teal-600', tag: 'New' },
  { emoji: '🌶️', name: 'Hot Takes', desc: 'Controversial opinions that go viral', color: 'from-pink-500 to-red-500', tag: 'Spicy' },
  { emoji: '💡', name: 'Life Hacks', desc: 'Tips and tricks nobody told you', color: 'from-cyan-500 to-blue-500', tag: 'Useful' },
  { emoji: '📚', name: 'Story Time', desc: 'Captivating personal narratives', color: 'from-indigo-500 to-purple-600', tag: 'Classic' },
  { emoji: '👁️', name: 'Conspiracy', desc: 'What they don\'t want you to know', color: 'from-gray-400 to-gray-600', tag: 'Mystery' },
  { emoji: '🎤', name: 'Roast Me', desc: 'Savage roasts and comedy gold', color: 'from-yellow-500 to-orange-500', tag: 'Funny' },
];

const STEPS = [
  { icon: Sparkles, title: 'Pick a Style', desc: 'Choose from 10+ viral content formats proven to get millions of views', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { icon: Wand2, title: 'Enter a Topic', desc: 'Type anything — or let AI suggest trending topics for you', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  { icon: Mic, title: 'AI Does the Work', desc: 'Script written, voiceover generated, video assembled — all automatic', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { icon: Download, title: 'Download & Post', desc: 'Get your video in seconds. Post to TikTok, Reels, or Shorts instantly', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
];

const PRICING = [
  {
    name: 'Free',
    price: '\$0',
    period: 'forever',
    desc: 'Try it out, no credit card needed',
    features: ['3 videos per month', '720p quality', 'All 10 styles', 'AI voiceover', 'Watermark on videos'],
    cta: 'Get Started Free',
    highlighted: false,
    gradient: 'from-gray-800 to-gray-900',
    border: 'border-gray-700',
  },
  {
    name: 'Pro',
    price: '\$19',
    period: '/month',
    desc: 'For creators who are serious about growth',
    features: ['30 videos per month', '1080p Full HD', 'All 10 styles', 'AI voiceover', 'No watermark', 'Priority rendering', 'Custom thumbnails'],
    cta: 'Start Pro Trial',
    highlighted: true,
    gradient: 'from-purple-600 to-pink-600',
    border: 'border-purple-500',
  },
  {
    name: 'Ultra',
    price: '\$49',
    period: '/month',
    desc: 'Unlimited power for agencies & pros',
    features: ['Unlimited videos', '4K Ultra HD', 'All 10 styles', 'Voice cloning', 'No watermark', 'Priority rendering', 'Custom thumbnails', 'API access', 'Dedicated support'],
    cta: 'Go Ultra',
    highlighted: false,
    gradient: 'from-gray-800 to-gray-900',
    border: 'border-gray-700',
  },
];

const FAQS = [
  { q: 'What is brainrot content?', a: 'Brainrot content is the addictive, fast-paced short-form video style that dominates TikTok, Reels, and Shorts. Think Reddit stories over Minecraft gameplay, scary facts with intense voiceovers, or controversial hot takes that keep viewers hooked. Our AI generates this content automatically.' },
  { q: 'How long does it take to make a video?', a: 'About 60 seconds. Pick a style, enter a topic, and our AI writes the script, generates a realistic voiceover, adds gameplay footage, and renders the final video. No editing skills needed.' },
  { q: 'Can I use these videos commercially?', a: 'Yes! All videos you create are yours to use however you want — post them on your channels, monetize them, or use them for clients. Background footage comes from royalty-free sources.' },
  { q: 'What makes this different from other video tools?', a: 'We\'re built specifically for viral short-form content. Other tools are general-purpose editors. Viralmind knows what gets views — the pacing, the hooks, the caption styles, the voice tones. Every template is engineered to maximize engagement.' },
  { q: 'Do I need to show my face?', a: 'Nope. That\'s the whole point. Faceless content is one of the fastest-growing categories on social media. Our AI handles everything — voice, visuals, captions. You stay anonymous while your content goes viral.' },
  { q: 'Can I cancel anytime?', a: 'Yes, cancel anytime with one click. No contracts, no hidden fees. Your videos are yours to keep even after canceling.' },
];

const STATS = [
  { value: '10+', label: 'Viral Styles' },
  { value: '60s', label: 'Per Video' },
  { value: '5', label: 'AI Voices' },
  { value: '0', label: 'Editing Needed' },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-pink-600/8 rounded-full blur-[100px] pointer-events-none" />

      {/* ===== NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5">
        <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-xl" />
        <div className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg blur-sm opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight">
              Viral<span className="text-gradient">mind</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#templates" className="text-sm text-gray-400 hover:text-white transition-colors">Templates</a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
              Log in
            </Link>
            <Link
              href="/signup"
              className="relative group text-sm font-semibold px-5 py-2.5 rounded-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:from-purple-500 group-hover:to-pink-500 transition-all" />
              <span className="relative text-white flex items-center gap-1.5">
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-400">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="relative md:hidden border-t border-white/5 bg-gray-950/95 backdrop-blur-xl">
            <div className="px-6 py-4 space-y-3">
              <a href="#templates" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 py-2">Templates</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 py-2">How It Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 py-2">Pricing</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 py-2">FAQ</a>
              <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                <Link href="/login" className="text-center text-gray-300 py-2.5 rounded-lg border border-gray-700">Log in</Link>
                <Link href="/signup" className="text-center text-white py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 font-semibold">Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 mb-8 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
            <span className="text-sm text-purple-300 font-medium">Now in Beta — Try free today</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Make viral{' '}
            <span className="text-gradient">brainrot</span>
            <br />
            videos in{' '}
            <span className="relative inline-block">
              <span className="relative z-10">60 seconds</span>
              <span className="absolute bottom-2 left-0 right-0 h-3 bg-purple-500/20 rounded-sm -z-0" />
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
            AI writes the script. AI does the voiceover. AI assembles the video.
            You just pick a topic and hit publish.{' '}
            <span className="text-white font-medium">No editing. No face needed. No experience required.</span>
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link
              href="/signup"
              className="relative group w-full sm:w-auto text-center font-bold text-lg px-8 py-4 rounded-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:from-purple-500 group-hover:to-pink-500 transition-all" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <span className="relative text-white flex items-center justify-center gap-2">
                Start Creating — It&apos;s Free <ArrowRight className="h-5 w-5" />
              </span>
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-6 py-4 rounded-full border border-gray-800 hover:border-gray-700 w-full sm:w-auto justify-center"
            >
              <Play className="h-4 w-4" /> See How It Works
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {STATS.map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl px-4 py-5 text-center">
                <div className="text-2xl sm:text-3xl font-black text-gradient">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating decorations */}
        <div className="absolute top-40 left-10 text-4xl animate-float opacity-20 hidden lg:block">🎮</div>
        <div className="absolute top-60 right-16 text-3xl animate-float-reverse opacity-20 hidden lg:block">🧠</div>
        <div className="absolute bottom-20 left-20 text-3xl animate-float opacity-15 hidden lg:block">🔥</div>
        <div className="absolute bottom-40 right-10 text-4xl animate-float-reverse opacity-15 hidden lg:block">💀</div>
      </section>

      {/* ===== TEMPLATES ===== */}
      <section id="templates" className="scroll-mt-20 relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">Templates</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              10 proven viral{' '}
              <span className="text-gradient">formats</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Each template is engineered for maximum engagement. Pick one and let AI do the rest.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {TEMPLATES.map((t) => (
              <div
                key={t.name}
                className="group glass-card rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
              >
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {t.emoji}
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-bold text-white text-sm">{t.name}</h3>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-gradient-to-r ${t.color} text-white`}>
                    {t.tag}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="scroll-mt-20 relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              Four steps to{' '}
              <span className="text-gradient">viral content</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              From idea to published video in under a minute. Seriously.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {STEPS.map((step, i) => (
              <div key={step.title} className="group relative">
                <div className={`glass-card rounded-2xl p-6 transition-all duration-300 hover:border-purple-500/30`}>
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 h-12 w-12 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center`}>
                      <step.icon className={`h-6 w-6 ${step.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-600 uppercase">Step {i + 1}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="scroll-mt-20 relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">Pricing</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              Simple,{' '}
              <span className="text-gradient">transparent</span>
              {' '}pricing
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Start free. Upgrade when you&apos;re ready to scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlighted
                    ? 'border-2 border-purple-500 shadow-[0_0_40px_-12px_rgba(168,85,247,0.4)]'
                    : 'border border-gray-800'
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-center py-1.5 text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="bg-gray-900/80 backdrop-blur p-6">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <Link
                    href="/signup"
                    className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
                        : 'bg-white/5 text-white border border-gray-700 hover:bg-white/10'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2.5">
                        <div className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${plan.highlighted ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-500'}`}>
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="scroll-mt-20 relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Got{' '}
              <span className="text-gradient">questions?</span>
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-white text-sm pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-5 w-5 text-purple-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative">
            {/* Glow effect behind */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl" />

            <div className="relative glass-card rounded-3xl p-10 sm:p-16 border border-purple-500/10">
              <div className="text-5xl mb-6">🚀</div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Ready to go{' '}
                <span className="text-gradient">viral?</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                Join creators who are growing their audience with AI-generated brainrot content. Start free, no credit card required.
              </p>
              <Link
                href="/signup"
                className="relative group inline-flex items-center gap-2 font-bold text-lg px-8 py-4 rounded-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:from-purple-500 group-hover:to-pink-500 transition-all" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
                <span className="relative text-white">Start Creating Now</span>
                <ArrowRight className="relative h-5 w-5 text-white" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold">Viralmind</span>
            </div>
            <div className="flex items-center gap-8">
              <a href="#templates" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Templates</a>
              <a href="#pricing" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Pricing</a>
              <a href="#faq" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">FAQ</a>
            </div>
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} Viralmind. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}