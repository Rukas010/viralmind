'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Zap, Sparkles, Download, Play, Film,
  MessageSquare, TrendingUp, Check, ChevronDown, Menu, X,
} from 'lucide-react'

const templates = [
  { name: 'Reddit Stories', emoji: '📖', color: 'from-orange-500 to-red-500' },
  { name: 'Scary Facts', emoji: '😱', color: 'from-red-500 to-purple-500' },
  { name: 'Would You Rather', emoji: '🤔', color: 'from-yellow-500 to-orange-500' },
  { name: 'Motivation', emoji: '💪', color: 'from-blue-500 to-cyan-500' },
  { name: 'Hot Takes', emoji: '🔥', color: 'from-orange-500 to-yellow-500' },
  { name: 'Conspiracy', emoji: '👁️', color: 'from-purple-500 to-pink-500' },
]

const steps = [
  { icon: Sparkles, title: 'Pick a Style', desc: 'Choose from 10+ viral templates — Reddit stories, scary facts, hot takes, and more.' },
  { icon: MessageSquare, title: 'Enter a Topic', desc: 'Type a topic or click random. AI writes a scroll-stopping script in seconds.' },
  { icon: Film, title: 'AI Makes the Video', desc: 'Voiceover, captions, background footage — all generated and assembled automatically.' },
  { icon: Download, title: 'Download & Post', desc: 'Get your MP4. Post to TikTok, Reels, Shorts. Start getting views.' },
]

const plans = [
  {
    name: 'Free', price: '\$0', period: 'forever', credits: '3 videos/month',
    features: ['3 videos per month', '720p quality', 'Watermark', '5 templates', 'Standard voices'],
    cta: 'Start Free', popular: false,
  },
  {
    name: 'Pro', price: '\$19', period: '/month', credits: '30 videos/month',
    features: ['30 videos per month', '1080p HD quality', 'No watermark', 'All templates', 'Premium voices', 'Priority rendering', 'Custom thumbnails'],
    cta: 'Go Pro', popular: true,
  },
  {
    name: 'Ultra', price: '\$49', period: '/month', credits: 'Unlimited',
    features: ['Unlimited videos', '4K quality', 'No watermark', 'All templates', 'Clone your voice', 'Instant rendering', 'Custom thumbnails', 'API access', 'Priority support'],
    cta: 'Go Ultra', popular: false,
  },
]

const faqs = [
  { q: 'What is brainrot content?', a: "Short-form vertical videos designed to be addictive and go viral — think Reddit stories over Minecraft gameplay, scary facts with dark backgrounds, or hot takes with captions." },
  { q: 'Do I need editing skills?', a: "None. You type a topic, pick a style, and the AI handles everything — script, voiceover, captions, background footage, and final video." },
  { q: 'Can I use this for my TikTok/YouTube?', a: "Yes. Every video you create is yours. Post anywhere — TikTok, YouTube Shorts, Instagram Reels, Twitter/X." },
  { q: 'How long does it take?', a: "About 60 seconds. The AI writes the script instantly, generates voiceover, and assembles the video automatically." },
  { q: 'Can I cancel anytime?', a: "Yes, no contracts. Cancel from your dashboard whenever you want." },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Viralmind</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#templates" className="text-sm text-gray-400 hover:text-white transition">Templates</a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition">How It Works</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition">Pricing</a>
            <a href="#faq" className="text-sm text-gray-400 hover:text-white transition">FAQ</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" className="text-gray-300 hover:text-white">Log in</Button></Link>
            <Link href="/signup"><Button className="bg-purple-600 hover:bg-purple-700 text-white">Start Free</Button></Link>
          </div>
          <button className="md:hidden text-gray-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-950 px-6 py-4 space-y-3">
            <a href="#templates" className="block text-gray-400">Templates</a>
            <a href="#how-it-works" className="block text-gray-400">How It Works</a>
            <a href="#pricing" className="block text-gray-400">Pricing</a>
            <a href="#faq" className="block text-gray-400">FAQ</a>
            <div className="flex gap-3 pt-2">
              <Link href="/login"><Button variant="ghost" className="text-gray-300">Log in</Button></Link>
              <Link href="/signup"><Button className="bg-purple-600 text-white">Start Free</Button></Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-400 mb-6">
          <Sparkles className="h-4 w-4" />
          AI-powered video generation
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
          <span className="text-white">Make viral </span>
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">brainrot videos</span>
          <br />
          <span className="text-white">in 60 seconds</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
          Type a topic. Pick a style. AI writes the script, generates the voiceover, adds captions, picks the background, and renders your video. No editing. No skills. Just content.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6">
              <Zap className="mr-2 h-5 w-5" />
              Start Making Videos — Free
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button size="lg" variant="outline" className="border-gray-700 text-gray-300 hover:text-white text-lg px-8 py-6">
              <Play className="mr-2 h-5 w-5" />
              See How It Works
            </Button>
          </a>
        </div>
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Check className="h-4 w-4 text-green-500" /> No credit card</span>
          <span className="flex items-center gap-1"><Check className="h-4 w-4 text-green-500" /> 3 free videos</span>
          <span className="flex items-center gap-1"><Check className="h-4 w-4 text-green-500" /> 60 second render</span>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="scroll-mt-20 mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">10+ Viral Templates</h2>
          <p className="mt-3 text-gray-400">Pick a style. Each one is engineered to stop the scroll.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {templates.map((t) => (
            <div key={t.name} className="group rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-center hover:border-gray-700 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className={`mx-auto mb-3 h-12 w-12 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-2xl`}>
                {t.emoji}
              </div>
              <p className="text-sm font-medium text-white">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="scroll-mt-20 mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">How It Works</h2>
          <p className="mt-3 text-gray-400">Four steps. Sixty seconds. One viral video.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-gray-700 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <step.icon className="h-5 w-5 text-purple-400" />
                </div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Step {i + 1}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Simple Pricing</h2>
          <p className="mt-3 text-gray-400">Start free. Upgrade when you&apos;re addicted.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-xl border p-6 ${plan.popular ? 'border-purple-500 bg-purple-500/5' : 'border-gray-800 bg-gray-900/50'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white">MOST POPULAR</div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <div className="mt-2"><span className="text-4xl font-bold text-white">{plan.price}</span><span className="text-gray-400">{plan.period}</span></div>
                <p className="mt-1 text-sm text-purple-400">{plan.credits}</p>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button className={`w-full ${plan.popular ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 mx-auto max-w-3xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">FAQ</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between px-6 py-4 text-left">
                <span className="font-medium text-white">{faq.q}</span>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <div className="px-6 pb-4 text-sm text-gray-400">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-500/10 to-transparent p-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Stop scrolling. Start creating.</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">Your first viral video is 60 seconds away.</p>
          <Link href="/signup">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6">
              <Zap className="mr-2 h-5 w-5" />
              Make Your First Video Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white">Viralmind</span>
          </div>
          <p className="text-sm text-gray-500">© 2025 Viralmind. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}