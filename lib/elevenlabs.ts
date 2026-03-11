const VOICES: Record<string, string> = {
    'male-deep': 'onwK4e9ZLuTAKqWW03F9',      // Daniel
    'male-casual': 'TX3LPaxmHKxFdv7VOQHJ',     // Liam
    'female-warm': 'EXAVITQu4vr4xnSDxMaL',      // Sarah
    'female-young': 'XB0fDUnXU5powFXDhCwa',     // Charlotte
    'male-intense': 'N2lVS1w4EtoT3dr4eOWO',     // Callum
  }
  
  const styleVoices: Record<string, string> = {
    'reddit-story': 'male-casual',
    'scary-facts': 'male-deep',
    'would-you-rather': 'female-young',
    'motivation': 'male-intense',
    'ai-wisdom': 'male-deep',
    'hot-takes': 'male-casual',
    'life-hacks': 'female-warm',
    'story-time': 'female-warm',
    'conspiracy': 'male-deep',
    'roast-me': 'male-casual',
  }
  
  export async function generateVoiceover({
    script,
    style,
    voiceId,
  }: {
    script: string
    style: string
    voiceId?: string
  }): Promise<{ success: boolean; audioBuffer?: Buffer; error?: string }> {
    try {
      const apiKey = process.env.ELEVENLABS_API_KEY
      if (!apiKey) {
        return { success: false, error: 'ElevenLabs API key not configured' }
      }
  
      // Pick voice based on style or use provided voiceId
      const voiceKey = styleVoices[style] || 'male-casual'
      const resolvedVoiceId = voiceId || VOICES[voiceKey] || VOICES['male-casual']
  
      console.log(`Generating voiceover: voice=${voiceKey}, chars=${script.length}`)
  
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text: script,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.5,
              use_speaker_boost: true,
            },
          }),
        }
      )
  
      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs error:', response.status, errorText)
        return { success: false, error: `ElevenLabs API error: ${response.status}` }
      }
  
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = Buffer.from(arrayBuffer)
  
      console.log(`Voiceover generated: ${audioBuffer.length} bytes`)
  
      return { success: true, audioBuffer }
    } catch (err: any) {
      console.error('ElevenLabs exception:', err)
      return { success: false, error: err.message || 'Voiceover generation failed' }
    }
  }
  
  export function getAvailableVoices() {
    return Object.entries(VOICES).map(([key, id]) => ({
      key,
      id,
      label: key.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    }))
  }