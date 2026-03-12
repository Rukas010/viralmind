const STYLE_GRADIENTS: Record<string, [string, string, string]> = {
    'reddit-story': ['#1a1a2e', '#16213e', '#0f3460'],
    'scary-facts': ['#0d0d0d', '#1a0000', '#0d0d0d'],
    'would-you-rather': ['#1a0a2e', '#2d1b69', '#1a0a2e'],
    motivation: ['#0a1628', '#1b2838', '#0a1628'],
    'ai-wisdom': ['#0a1a0a', '#0d2818', '#0a1a0a'],
    'hot-takes': ['#2e1a0a', '#4a2010', '#2e1a0a'],
    'life-hacks': ['#0a2e2e', '#104040', '#0a2e2e'],
    'story-time': ['#1a1a2e', '#2a2040', '#1a1a2e'],
    conspiracy: ['#0d0d0d', '#1a1a1a', '#0d0d0d'],
    'roast-me': ['#2e0a0a', '#4a1010', '#2e0a0a'],
  };
  
  interface RenderOptions {
    script: string;
    style: string;
    voiceoverUrl?: string;
    width?: number;
    height?: number;
    fps?: number;
    durationInSeconds: number;
    onProgress: (progress: number) => void;
  }
  
  export async function renderVideoToBlob(options: RenderOptions): Promise<Blob> {
    const {
      script,
      style,
      voiceoverUrl,
      width = 1080,
      height = 1920,
      fps = 30,
      durationInSeconds,
      onProgress,
    } = options;
  
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
  
    // Set up canvas stream
    const canvasStream = canvas.captureStream(fps);
    let combinedStream: MediaStream;
    let audioSource: AudioBufferSourceNode | null = null;
    let audioCtx: AudioContext | null = null;
  
    // Load and attach audio if voiceover exists
    if (voiceoverUrl) {
      try {
        audioCtx = new AudioContext();
        const response = await fetch(voiceoverUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        audioSource = audioCtx.createBufferSource();
        audioSource.buffer = audioBuffer;
        const dest = audioCtx.createMediaStreamDestination();
        audioSource.connect(dest);
  
        combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...dest.stream.getAudioTracks(),
        ]);
      } catch (err) {
        console.error('Audio load failed, rendering without audio:', err);
        combinedStream = canvasStream;
        audioSource = null;
        audioCtx = null;
      }
    } else {
      combinedStream = canvasStream;
    }
  
    // Pick best supported format
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
      ? 'video/webm;codecs=vp8,opus'
      : 'video/webm';
  
    const recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 5_000_000,
    });
  
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
  
    // Prepare caption data
    const words = script.split(/\s+/).filter((w) => w.length > 0);
    const WORDS_PER_GROUP = 3;
    const groups: string[][] = [];
    for (let i = 0; i < words.length; i += WORDS_PER_GROUP) {
      groups.push(words.slice(i, i + WORDS_PER_GROUP));
    }
  
    const totalFrames = Math.ceil(durationInSeconds * fps);
    const framesPerGroup = totalFrames / groups.length;
    const gradientColors = STYLE_GRADIENTS[style] || STYLE_GRADIENTS['reddit-story'];
  
    return new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        if (audioCtx) audioCtx.close();
        resolve(blob);
      };
  
      recorder.onerror = () => {
        if (audioCtx) audioCtx.close();
        reject(new Error('Recording failed'));
      };
  
      recorder.start(100);
      if (audioSource) audioSource.start();
  
      const startTime = performance.now();
      const frameDuration = 1000 / fps;
      let lastFrameTime = 0;
  
      const renderLoop = () => {
        const elapsed = performance.now() - startTime;
        const currentTime = elapsed / 1000;
  
        if (currentTime >= durationInSeconds) {
          recorder.stop();
          if (audioSource) {
            try { audioSource.stop(); } catch { /* already stopped */ }
          }
          onProgress(1);
          return;
        }
  
        if (elapsed - lastFrameTime >= frameDuration) {
          const frame = Math.floor(currentTime * fps);
          drawBackground(ctx, width, height, gradientColors);
          drawCaptions(ctx, frame, width, height, groups, framesPerGroup);
          lastFrameTime = elapsed;
          onProgress(currentTime / durationInSeconds);
        }
  
        requestAnimationFrame(renderLoop);
      };
  
      requestAnimationFrame(renderLoop);
    });
  }
  
  function drawBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: [string, string, string]
  ) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, colors[1]);
    gradient.addColorStop(1, colors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  
    // Subtle overlay noise
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, 0, width, height);
  }
  
  function drawCaptions(
    ctx: CanvasRenderingContext2D,
    frame: number,
    width: number,
    height: number,
    groups: string[][],
    framesPerGroup: number
  ) {
    if (groups.length === 0) return;
  
    const activeGroupIndex = Math.min(
      Math.max(Math.floor(frame / framesPerGroup), 0),
      groups.length - 1
    );
    const activeGroup = groups[activeGroupIndex];
  
    const groupStartFrame = activeGroupIndex * framesPerGroup;
    const frameInGroup = frame - groupStartFrame;
    const framesPerWord = framesPerGroup / activeGroup.length;
    const activeWordIndex = Math.min(
      Math.max(Math.floor(frameInGroup / framesPerWord), 0),
      activeGroup.length - 1
    );
  
    // Fade in/out
    const groupProgress = frameInGroup / framesPerGroup;
    let opacity = 1;
    if (groupProgress < 0.05) opacity = groupProgress / 0.05;
    if (groupProgress > 0.88) opacity = (1 - groupProgress) / 0.12;
    opacity = Math.max(0, Math.min(1, opacity));
  
    // Scale entrance
    const scale = groupProgress < 0.08
      ? 0.5 + (groupProgress / 0.08) * 0.5
      : 1;
  
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(width / 2, height / 2);
    ctx.scale(scale, scale);
  
    const fontSize = Math.round(width * 0.074);
    ctx.font = `900 ${fontSize}px "Arial Black", Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  
    const gap = Math.round(width * 0.015);
    const wordMeasures = activeGroup.map((w) => ctx.measureText(w.toUpperCase()).width);
    const totalWidth = wordMeasures.reduce((a, b) => a + b, 0) + gap * (activeGroup.length - 1);
    let x = -totalWidth / 2;
  
    activeGroup.forEach((word, i) => {
      const isActive = i === activeWordIndex;
      const isPast = i < activeWordIndex;
      const wordWidth = wordMeasures[i];
      const wordX = x + wordWidth / 2;
      const wordScale = isActive ? 1.15 : 1;
  
      ctx.save();
      ctx.translate(wordX, 0);
      ctx.scale(wordScale, wordScale);
  
      // Shadow layers
      ctx.fillStyle = 'rgba(0,0,0,0.9)';
      const offsets = [[4, 4], [-2, -2], [2, -2], [-2, 2]];
      offsets.forEach(([dx, dy]) => {
        ctx.fillText(word.toUpperCase(), dx, dy);
      });
  
      // Glow
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
  
      // Color
      ctx.fillStyle = isActive ? '#FACC15' : isPast ? '#FDE68A' : '#FFFFFF';
      ctx.fillText(word.toUpperCase(), 0, 0);
  
      ctx.restore();
      x += wordWidth + gap;
    });
  
    ctx.restore();
  }