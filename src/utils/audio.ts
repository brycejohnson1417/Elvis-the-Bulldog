let audioCtx: AudioContext | null = null;

export const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playCrunchSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Create a noise buffer for crunch
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.value = 0.5;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(now);
  } catch (e) {
    console.error("Audio error:", e);
  }
};

export const playTrickSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Rock lick: E3, G3, A3
    playNote(164.81, now, 0.2);
    playNote(196.00, now + 0.15, 0.2);
    playNote(220.00, now + 0.3, 0.5);
  } catch (e) {
    console.error("Audio error:", e);
  }
};

export const playConcertSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Big E power chord
    const freqs = [82.41, 123.47, 164.81, 246.94, 329.63]; 
    
    freqs.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 3.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 3.5);
    });
  } catch (e) {
    console.error("Audio error:", e);
  }
};
