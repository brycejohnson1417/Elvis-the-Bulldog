export class AudioQueue {
  private audioContext: AudioContext;
  private nextTime: number = 0;
  private sourceNodes: AudioBufferSourceNode[] = [];
  public isPlaying: boolean = false;
  private onPlayStateChange?: (isPlaying: boolean) => void;
  
  // Audio nodes and params
  private toneNode: BiquadFilterNode;
  private speed: number = 1.0;
  private pitch: number = 0; // in cents
  private tone: number = 0; // gain in dB

  constructor(audioContext: AudioContext, onPlayStateChange?: (isPlaying: boolean) => void) {
    this.audioContext = audioContext;
    this.onPlayStateChange = onPlayStateChange;
    
    // Initialize tone control (HighShelf filter for brightness/darkness)
    this.toneNode = this.audioContext.createBiquadFilter();
    this.toneNode.type = 'highshelf';
    this.toneNode.frequency.value = 2000; // Focus on treble frequencies
    this.toneNode.gain.value = 0;
    this.toneNode.connect(this.audioContext.destination);
  }

  setAudioParams(speed: number, pitch: number, tone: number) {
    this.speed = speed;
    this.pitch = pitch;
    this.tone = tone;
    
    // Update tone immediately
    if (this.toneNode) {
      this.toneNode.gain.setTargetAtTime(tone, this.audioContext.currentTime, 0.1);
    }
  }

  playBase64Pcm(base64: string, sampleRate: number = 24000) {
    try {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const pcm16 = new Int16Array(bytes.buffer);
      const audioBuffer = this.audioContext.createBuffer(1, pcm16.length, sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < pcm16.length; i++) {
        channelData[i] = pcm16[i] / 0x7FFF;
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Apply speed and pitch
      source.playbackRate.value = this.speed;
      source.detune.value = this.pitch;

      // Connect through tone node
      source.connect(this.toneNode);

      if (this.nextTime < this.audioContext.currentTime) {
        this.nextTime = this.audioContext.currentTime;
      }

      source.start(this.nextTime);
      // Adjust duration calculation based on speed
      this.nextTime += audioBuffer.duration / this.speed;
      this.sourceNodes.push(source);
      
      this.setPlaying(true);
      
      source.onended = () => {
        this.sourceNodes = this.sourceNodes.filter(s => s !== source);
        if (this.sourceNodes.length === 0) {
          this.setPlaying(false);
        }
      };
    } catch (e) {
      console.error("Error playing audio chunk:", e);
    }
  }

  private setPlaying(playing: boolean) {
    if (this.isPlaying !== playing) {
      this.isPlaying = playing;
      if (this.onPlayStateChange) {
        this.onPlayStateChange(playing);
      }
    }
  }

  stop() {
    this.sourceNodes.forEach(source => {
      try {
        source.stop();
      } catch (e) {}
    });
    this.sourceNodes = [];
    this.nextTime = 0;
    this.setPlaying(false);
  }
}
