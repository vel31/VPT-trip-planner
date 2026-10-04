/**
 * Lightweight Web Audio API Ambient Soundscape Generator
 * Produces a warm, relaxing cinematic ambient drone (warm pads + subtle overtone).
 * Completely client-side, zero external assets required.
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isPlaying = false;

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.oscillators.forEach(o => {
        try { o.stop(); } catch { /* ignore */ }
      });
      this.oscillators = [];

      // Warm cinematic pentatonic drone frequencies (D major / Indian Raga Bhupali harmonic base: D2, A2, D3, F#3, A3)
      const freqs = [73.42, 110.0, 146.83, 185.0, 220.0];

      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Lowpass warm filter to keep it soft and atmospheric
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450 + idx * 80, this.ctx.currentTime);

        // Subtle LFO for gentle breathing movement
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.08 + idx * 0.03, this.ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
        lfo.connect(gain.gain);
        lfo.start();

        gain.gain.setValueAtTime(0.03 / (idx + 1), this.ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        this.oscillators.push(osc);
      });

      // Smooth fade-in
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 2.5);

      this.isPlaying = true;
    } catch (e) {
      console.warn('Web Audio Soundscape init notice:', e);
      this.isPlaying = false;
    }
  }

  public stop() {
    if (!this.ctx || !this.masterGain) return;
    try {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
      setTimeout(() => {
        this.oscillators.forEach(o => {
          try { o.stop(); } catch { /* ignore */ }
        });
        this.oscillators = [];
        this.isPlaying = false;
      }, 1200);
    } catch {
      this.isPlaying = false;
    }
  }

  public getStatus() {
    return this.isPlaying;
  }
}

export const soundscapeEngine = new AmbientSoundEngine();
