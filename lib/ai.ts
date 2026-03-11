import Groq from 'groq-sdk'

function getGroq() {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set')
  return new Groq({ apiKey })
}

const stylePrompts: Record<string, string> = {
  'reddit-story': `You write viral Reddit-style stories for TikTok/Shorts. Write in first person. Start with a hook like "So this happened to me yesterday..." or "AITA for..." Make it dramatic, engaging, and end with a twist or cliffhanger. Use casual internet language. The story should feel real and relatable.`,

  'scary-facts': `You write creepy, unsettling facts designed to go viral on TikTok/Shorts. Each fact should make the viewer feel uneasy. Start with "Did you know..." or a shocking statement. Keep each fact punchy — 1-2 sentences max. Write 5-7 facts per script. Use a dark, mysterious tone.`,

  'would-you-rather': `You create viral "Would You Rather" questions for TikTok/Shorts. Each question should be genuinely difficult to choose between. Make them thought-provoking, funny, or slightly uncomfortable. Write 5-7 questions per script. Format: "Would you rather [option A] OR [option B]?"`,

  'motivation': `You write powerful motivational speeches for TikTok/Shorts. Channel David Goggins, Marcus Aurelius, and modern self-improvement. Be intense, direct, and inspiring. Use short punchy sentences. Build to a crescendo. Make the viewer want to get up and do something.`,

  'ai-wisdom': `You share mind-blowing AI-generated insights and philosophical observations for TikTok/Shorts. Make viewers question reality. Mix science, philosophy, and futurism. Each insight should feel profound and shareable. Write 5-7 insights per script.`,

  'hot-takes': `You write controversial but entertaining hot takes for TikTok/Shorts. Each take should be bold, slightly provocative, and designed to spark debate in the comments. Not offensive — just contrarian enough to make people react. Write 5-7 takes per script.`,

  'life-hacks': `You share genuinely useful life hacks and tips for TikTok/Shorts. Each hack should be practical, surprising, and easy to try. Start with "Here's something most people don't know..." Mix everyday tips with mind-blowing tricks. Write 5-7 hacks per script.`,

  'story-time': `You write captivating short stories for TikTok/Shorts. Create fictional but believable stories with strong hooks, tension, and satisfying endings. Use vivid details and emotional moments. Write in a conversational tone like you're telling a friend.`,

  'conspiracy': `You present wild conspiracy theories and mysteries for TikTok/Shorts. Mix real unsolved mysteries with speculative theories. Use phrases like "What if I told you..." and "Here's what they don't want you to know..." Be entertaining, not harmful. Write 5-7 points per script.`,

  'roast-me': `You write savage but funny roasts and comebacks for TikTok/Shorts. Target universal experiences everyone can relate to (not specific people). Be witty, clever, and sharp. Each roast should make people laugh and tag their friends. Write 5-7 roasts per script.`,
}

export async function generateScript({
  style,
  topic,
  duration = 60,
}: {
  style: string
  topic: string
  duration?: number
}): Promise<{ success: boolean; script?: string; error?: string }> {
  try {
    const groq = getGroq()

    const systemPrompt = stylePrompts[style] || stylePrompts['reddit-story']
    const wordCount = Math.round(duration * 2.5)

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}

RULES:
- Write a script that is approximately ${wordCount} words (about ${duration} seconds when read aloud)
- Write ONLY the spoken script — no stage directions, no [brackets], no annotations
- Do NOT include titles, headers, or labels
- Every word you write will be spoken aloud as voiceover
- Make the first sentence an absolute hook — the viewer decides in 1 second
- Use natural speech patterns, contractions, and conversational tone
- End with something that makes viewers comment, share, or watch again`,
        },
        {
          role: 'user',
          content: `Write a viral TikTok/Shorts script about: ${topic}`,
        },
      ],
      temperature: 0.9,
      max_tokens: 1000,
    })

    const script = response.choices[0]?.message?.content?.trim()

    if (!script) {
      return { success: false, error: 'No script generated' }
    }

    return { success: true, script }
  } catch (err: any) {
    console.error('Groq error:', err)
    return { success: false, error: err.message || 'Failed to generate script' }
  }
}

export async function generateTitle({
  style,
  topic,
}: {
  style: string
  topic: string
}): Promise<string> {
  try {
    const groq = getGroq()

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Generate a short catchy title (max 6 words) for a viral TikTok video. Return ONLY the title, nothing else. No quotes. No punctuation unless it adds impact.',
        },
        {
          role: 'user',
          content: `Style: ${style}. Topic: ${topic}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 30,
    })

    return response.choices[0]?.message?.content?.trim() || `${style} — ${topic}`
  } catch {
    return `${style} — ${topic}`
  }
}