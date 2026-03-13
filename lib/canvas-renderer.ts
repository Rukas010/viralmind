// lib/canvas-renderer.ts

export interface RenderConfig {
    script: string;
    voiceoverUrl: string;
    backgroundUrls: string[];
    musicUrl?: string;
    width?: number;
    height?: number;
    fps?: number;
    onProgress?: (percent: number) => void;
    watermark?: boolean;
  }
  
  interface WordTiming {
    word: string;
    startTime: number;
    endTime: number;
  }
  
  interface ClipState {
    element: HTMLVideoElement;
    startTime: number;
    endTime: number;
  }
  
  // ─── Main Export ─────────────────────────────────────────────
  
  export async function renderVideo(config: RenderConfig): Promise<Blob> {
    const {
      script,
      voiceoverUrl,
      backgroundUrls,
      musicUrl,
      width = 1080,
      height = 1920,
      fps = 30,
      onProgress,
      watermark = false,
    } = config;
  
    // ── Step 1: Load all assets in parallel ──
  
    onProgress?.(2);
  
    const [voiceoverBuffer, backgroundClips, musicBuffer] = await Promise.all([
      loadAudioBuffer(voiceoverUrl),
      loadBackgroundClips(backgroundUrls),
      musicUrl ? loadAudioBuffer(musicUrl).catch(() => null) : null,
    ]);
  
    if (!voiceoverBuffer) {
      throw new Error('Failed to load voiceover audio');
    }
  
    onProgress?.(10);
  
    // ── Step 2: Calculate timing ──
  
    const audioDuration = voiceoverBuffer.duration;
    const totalFrames = Math.ceil(audioDuration * fps);
    const words = parseScript(script);
    const wordTimings = calculateWordTimings(words, audioDuration);
    const clipTimings = calculateClipTimings(backgroundClips, audioDuration);
  
    // ── Step 3: Set up canvas ──
  
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false })!;
  
    // ── Step 4: Mix audio ──
  
    const mixedAudioStream = await mixAudio(voiceoverBuffer, musicBuffer);
  
    // ── Step 5: Set up MediaRecorder ──
  
    const canvasStream = canvas.captureStream(fps);
  
    // Add audio track to canvas stream
    const audioTracks = mixedAudioStream.getAudioTracks();
    audioTracks.forEach((track) => canvasStream.addTrack(track));
  
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(canvasStream, {
      mimeType: getSupportedMimeType(),
      videoBitsPerSecond: 8_000_000, // 8 Mbps for good quality
    });
  
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
  
    // ── Step 6: Render frame by frame ──
  
    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        const mimeType = getSupportedMimeType();
        const blob = new Blob(chunks, { type: mimeType });
        cleanup(backgroundClips, mixedAudioStream);
        resolve(blob);
      };
  
      recorder.onerror = (e) => {
        cleanup(backgroundClips, mixedAudioStream);
        reject(new Error('Recording failed'));
      };
  
      recorder.start();
  
      let currentFrame = 0;
  
      const renderFrame = () => {
        if (currentFrame >= totalFrames) {
          recorder.stop();
          return;
        }
  
        const currentTime = currentFrame / fps;
  
        // Draw background
        drawBackground(ctx, clipTimings, currentTime, width, height);
  
        // Draw subtle dark overlay for text readability
        drawOverlay(ctx, width, height);
  
        // Draw captions
        drawCaptions(ctx, wordTimings, currentTime, width, height);
  
        // Draw watermark if free tier
        if (watermark) {
          drawWatermark(ctx, width, height);
        }
  
        currentFrame++;
        onProgress?.(10 + Math.floor((currentFrame / totalFrames) * 85));
  
        // Use requestAnimationFrame for smooth rendering
        // but setTimeout for consistent timing
        setTimeout(renderFrame, 1000 / fps / 2); // render at 2x speed
      };
  
      // Start background video playback
      startClips(clipTimings);
      renderFrame();
    });
  }
  
  // ─── Audio Loading ──────────────────────────────────────────
  
  async function loadAudioBuffer(url: string): Promise<AudioBuffer> {
    const audioCtx = new AudioContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    audioCtx.close();
    return audioBuffer;
  }
  
  // ─── Audio Mixing ───────────────────────────────────────────
  
  async function mixAudio(
    voiceover: AudioBuffer,
    music: AudioBuffer | null
  ): Promise<MediaStream> {
    const audioCtx = new AudioContext();
    const dest = audioCtx.createMediaStreamDestination();
  
    // Voiceover — loud and clear
    const voiceSource = audioCtx.createBufferSource();
    voiceSource.buffer = voiceover;
    const voiceGain = audioCtx.createGain();
    voiceGain.gain.value = 0.9;
    voiceSource.connect(voiceGain).connect(dest);
  
    // Background music — quiet, just vibes
    if (music) {
      const musicSource = audioCtx.createBufferSource();
      musicSource.buffer = music;
      musicSource.loop = true; // loop if shorter than video
      const musicGain = audioCtx.createGain();
      musicGain.gain.value = 0.10; // very quiet
      musicSource.connect(musicGain).connect(dest);
      musicSource.start(0);
    }
  
    voiceSource.start(0);
  
    return dest.stream;
  }
  
  // ─── Background Video Loading ───────────────────────────────
  
  async function loadBackgroundClips(urls: string[]): Promise<HTMLVideoElement[]> {
    if (!urls || urls.length === 0) return [];
  
    const loadPromises = urls.map((url) => {
      return new Promise<HTMLVideoElement>((resolve, reject) => {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.loop = false;
  
        video.oncanplaythrough = () => resolve(video);
        video.onerror = () => {
          console.warn(`Failed to load clip: ${url}`);
          reject(new Error(`Failed to load: ${url}`));
        };
  
        video.src = url;
        video.load();
      });
    });
  
    // Load what we can, skip failures
    const results = await Promise.allSettled(loadPromises);
    return results
      .filter((r): r is PromiseFulfilledResult<HTMLVideoElement> => r.status === 'fulfilled')
      .map((r) => r.value);
  }
  
  function calculateClipTimings(
    clips: HTMLVideoElement[],
    totalDuration: number
  ): ClipState[] {
    if (clips.length === 0) return [];
  
    // Distribute clips evenly across the video duration
    const clipDuration = totalDuration / clips.length;
  
    return clips.map((element, i) => ({
      element,
      startTime: i * clipDuration,
      endTime: (i + 1) * clipDuration,
    }));
  }
  
  function startClips(clips: ClipState[]) {
    // Start first clip immediately, others will be started when needed
    if (clips.length > 0) {
      clips[0].element.currentTime = 0;
      clips[0].element.play().catch(() => {});
    }
  }
  
  // ─── Script Parsing & Word Timing ───────────────────────────
  
  function parseScript(script: string): string[] {
    return script
      .replace(/\n+/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 0);
  }
  
  function calculateWordTimings(words: string[], duration: number): WordTiming[] {
    const wordDuration = duration / words.length;
  
    return words.map((word, i) => ({
      word,
      startTime: i * wordDuration,
      endTime: (i + 1) * wordDuration,
    }));
  }
  
  // ─── Drawing Functions ──────────────────────────────────────
  
  function drawBackground(
    ctx: CanvasRenderingContext2D,
    clips: ClipState[],
    currentTime: number,
    width: number,
    height: number
  ) {
    // Find the current clip
    const currentClip = clips.find(
      (c) => currentTime >= c.startTime && currentTime < c.endTime
    );
  
    if (currentClip && currentClip.element.readyState >= 2) {
      // Make sure this clip is playing
      if (currentClip.element.paused) {
        currentClip.element.currentTime = 0;
        currentClip.element.play().catch(() => {});
      }
  
      // Ken Burns effect — slow zoom over clip duration
      const clipProgress =
        (currentTime - currentClip.startTime) /
        (currentClip.endTime - currentClip.startTime);
      const scale = 1.0 + clipProgress * 0.08; // 8% zoom over clip
  
      // Draw with zoom
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-width / 2, -height / 2);
  
      // Cover-fit the video to canvas (handle aspect ratio)
      drawCoverFit(ctx, currentClip.element, width, height);
  
      ctx.restore();
  
      // Pause clips that aren't current
      clips.forEach((c) => {
        if (c !== currentClip && !c.element.paused) {
          c.element.pause();
        }
      });
    } else {
      // Fallback gradient if no clips loaded
      drawFallbackBackground(ctx, width, height, currentTime);
    }
  }
  
  function drawCoverFit(
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    canvasW: number,
    canvasH: number
  ) {
    const videoW = video.videoWidth || canvasW;
    const videoH = video.videoHeight || canvasH;
  
    const canvasRatio = canvasW / canvasH;
    const videoRatio = videoW / videoH;
  
    let drawW: number, drawH: number, offsetX: number, offsetY: number;
  
    if (videoRatio > canvasRatio) {
      // Video is wider — crop sides
      drawH = canvasH;
      drawW = canvasH * videoRatio;
      offsetX = -(drawW - canvasW) / 2;
      offsetY = 0;
    } else {
      // Video is taller — crop top/bottom
      drawW = canvasW;
      drawH = canvasW / videoRatio;
      offsetX = 0;
      offsetY = -(drawH - canvasH) / 2;
    }
  
    ctx.drawImage(video, offsetX, offsetY, drawW, drawH);
  }
  
  function drawFallbackBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentTime: number
  ) {
    // Animated dark gradient as fallback
    const hueShift = (currentTime * 10) % 360;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, `hsl(${260 + hueShift * 0.1}, 30%, 8%)`);
    gradient.addColorStop(0.5, `hsl(${280 + hueShift * 0.1}, 25%, 12%)`);
    gradient.addColorStop(1, `hsl(${300 + hueShift * 0.1}, 20%, 6%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  function drawOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    // Subtle dark gradient overlay for caption readability
    // Stronger at bottom where captions appear
    const overlay = ctx.createLinearGradient(0, height * 0.4, 0, height);
    overlay.addColorStop(0, 'rgba(0, 0, 0, 0)');
    overlay.addColorStop(0.5, 'rgba(0, 0, 0, 0.15)');
    overlay.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);
  
    // Also a subtle top vignette
    const topOverlay = ctx.createLinearGradient(0, 0, 0, height * 0.2);
    topOverlay.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    topOverlay.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topOverlay;
    ctx.fillRect(0, 0, width, height);
  }
  
  function drawCaptions(
    ctx: CanvasRenderingContext2D,
    wordTimings: WordTiming[],
    currentTime: number,
    width: number,
    height: number
  ) {
    // Find the active word index
    const activeIndex = wordTimings.findIndex(
      (w) => currentTime >= w.startTime && currentTime < w.endTime
    );
  
    if (activeIndex === -1) return;
  
    // Show a window of words (2-3 at a time for that brainrot feel)
    const WORDS_PER_GROUP = 3;
    const groupIndex = Math.floor(activeIndex / WORDS_PER_GROUP);
    const groupStart = groupIndex * WORDS_PER_GROUP;
    const groupEnd = Math.min(groupStart + WORDS_PER_GROUP, wordTimings.length);
    const visibleWords = wordTimings.slice(groupStart, groupEnd);
  
    const centerX = width / 2;
    const baseY = height * 0.72; // lower third area
    const lineHeight = 90;
  
    // Pop animation for the active word group
    const groupStartTime = visibleWords[0]?.startTime ?? 0;
    const timeSinceGroupStart = currentTime - groupStartTime;
    const groupPop =
      timeSinceGroupStart < 0.12
        ? 1.0 + Math.sin((timeSinceGroupStart / 0.12) * Math.PI) * 0.08
        : 1.0;
  
    ctx.save();
    ctx.translate(centerX, baseY);
    ctx.scale(groupPop, groupPop);
    ctx.translate(-centerX, -baseY);
  
    visibleWords.forEach((wordTiming, i) => {
      const isActive = groupStart + i === activeIndex;
      const isPast =
        groupStart + i < activeIndex ||
        currentTime > wordTiming.endTime;
      const wordY = baseY + i * lineHeight;
  
      const word = wordTiming.word.toUpperCase();
  
      // Font setup
      const fontSize = isActive ? 74 : 68;
      ctx.font = `900 ${fontSize}px "Arial Black", "Impact", "Helvetica Neue", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
  
      // Per-word pop animation
      if (isActive) {
        const timeSinceWord = currentTime - wordTiming.startTime;
        const wordPop =
          timeSinceWord < 0.1
            ? 1.0 + Math.sin((timeSinceWord / 0.1) * Math.PI) * 0.12
            : 1.0;
  
        ctx.save();
        ctx.translate(centerX, wordY);
        ctx.scale(wordPop, wordPop);
        ctx.translate(-centerX, -wordY);
      }
  
      // Shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
  
      // Thick black stroke — makes text readable over ANY background
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 14;
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(word, centerX, wordY);
  
      // Reset shadow before fill
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
  
    // Fill color
    if (isActive) {
        // Active word: bright yellow
        ctx.fillStyle = '#FACC15';
      } else if (isPast) {
        // Past words: slightly dimmed white
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      } else {
        // Upcoming words: bright white
        ctx.fillStyle = '#FFFFFF';
      }
  
      ctx.fillText(word, centerX, wordY);
  
      if (isActive) {
        ctx.restore();
      }
    });
  
    ctx.restore();
  }
  
  function drawWatermark(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    ctx.save();
  
    ctx.globalAlpha = 0.35;
    ctx.font = '600 28px "Arial", "Helvetica Neue", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
  
    const text = 'viraleye.ai';
    const x = width - 32;
    const y = height - 32;
  
    // Stroke for readability
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
  
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
  
    ctx.restore();
  }
  
  // ─── Utility Functions ──────────────────────────────────────
  
  function getSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];
  
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
  
    return 'video/webm';
  }
  
  function cleanup(clips: HTMLVideoElement[], stream: MediaStream) {
    // Stop all video elements
    clips.forEach((clip) => {
      clip.pause();
      clip.removeAttribute('src');
      clip.load();
    });
  
    // Stop all audio tracks
    stream.getTracks().forEach((track) => track.stop());
  }
  
  // ─── Export Helper ───────────────────────────────────────────
  
  export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }