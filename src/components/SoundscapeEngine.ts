/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SoundscapeId, SoundscapeEnvironment } from '../types';

export const SOUNDSCAPE_ENVIRONMENTS: SoundscapeEnvironment[] = [
  {
    id: 'null-void',
    name: 'Null Void',
    subtitle: 'Weightless Infinite Stillness',
    description: 'Distant airy pads, subtle low-frequency warmth, and vast spatial resonance for complete stillness and transcendence.',
    emotion: 'Overthinking',
    iconName: 'Sparkles',
    primaryFrequency: 108, // Meditative sacred fundamental
    secondaryFrequency: 216,
    natureFilterFreq: 280,
    noiseType: 'cosmic',
    palette: {
      bg: 'bg-slate-950/80',
      card: 'bg-slate-900/90',
      text: 'text-slate-100',
      accent: '#818cf8', // Indigo / Soft Lavender
      glow: 'shadow-indigo-500/20',
    },
  },
  {
    id: 'ocean-serenity',
    name: 'Ocean Serenity',
    subtitle: 'Shoreline Waves & Sea Breeze',
    description: 'Soft shoreline waves arriving at natural, irregular intervals with deep spatial oceanic breeze.',
    emotion: 'Anxiety',
    iconName: 'Waves',
    primaryFrequency: 136.1, // Earth OM frequency
    secondaryFrequency: 272.2,
    natureFilterFreq: 420,
    noiseType: 'waves',
    palette: {
      bg: 'bg-sky-950/20',
      card: 'bg-white/95',
      text: 'text-[#2C2018]',
      accent: '#38bdf8', // Sky Blue
      glow: 'shadow-sky-400/20',
    },
  },
  {
    id: 'forest-presence',
    name: 'Forest Presence',
    subtitle: 'Morning Leaves & Distant Stream',
    description: 'Gentle wind filtering through canopy leaves, distant flowing water, and spacious morning stillness.',
    emotion: 'Burnout',
    iconName: 'TreePine',
    primaryFrequency: 110, // A2 low warmth
    secondaryFrequency: 165,
    natureFilterFreq: 520,
    noiseType: 'leaves',
    palette: {
      bg: 'bg-[#94A47A]/15',
      card: 'bg-white/95',
      text: 'text-[#2C2018]',
      accent: '#94A47A', // Sage Green
      glow: 'shadow-[#94A47A]/25',
    },
  },
  {
    id: 'rain-sanctuary',
    name: 'Rain Sanctuary',
    subtitle: 'Light Rain on Leaves & Distant Warmth',
    description: 'Soft rhythmic rain tapping on glass with deep cozy room resonance and distant gentle thunder.',
    emotion: 'Sadness',
    iconName: 'CloudRain',
    primaryFrequency: 123.4, // Warm B2
    secondaryFrequency: 185.1,
    natureFilterFreq: 380,
    noiseType: 'rain',
    palette: {
      bg: 'bg-slate-800/10',
      card: 'bg-white/95',
      text: 'text-[#2C2018]',
      accent: '#64748b', // Slate
      glow: 'shadow-slate-400/20',
    },
  },
  {
    id: 'hearth-calm',
    name: 'Hearth Calm',
    subtitle: 'Crackling Fireplace & Wooden Haven',
    description: 'Delicate glowing embers, warm wooden room ambience, and a grounding low drone for evening reflection.',
    emotion: 'Journaling',
    iconName: 'Flame',
    primaryFrequency: 116.5, // Warm Bb
    secondaryFrequency: 233,
    natureFilterFreq: 340,
    noiseType: 'crackle',
    palette: {
      bg: 'bg-[#C67C58]/15',
      card: 'bg-white/95',
      text: 'text-[#2C2018]',
      accent: '#C67C58', // Terracotta Amber
      glow: 'shadow-[#C67C58]/25',
    },
  },
  {
    id: 'deep-sleep',
    name: 'Deep Sleep',
    subtitle: 'Delta Wave Resonance & Celestial Atmosphere',
    description: 'Slow atmospheric drone with barely audible breath-like air movement designed for insomnia relief.',
    emotion: 'Sleep',
    iconName: 'Moon',
    primaryFrequency: 72.5, // Deep resonant bass
    secondaryFrequency: 145,
    natureFilterFreq: 220,
    noiseType: 'cosmic',
    palette: {
      bg: 'bg-indigo-950/40',
      card: 'bg-slate-900/95',
      text: 'text-indigo-100',
      accent: '#a78bfa', // Lavender Violet
      glow: 'shadow-purple-500/25',
    },
  },
];

export class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private environmentGain: GainNode | null = null;
  private breathGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private pannerNode: StereoPannerNode | null = null;

  private droneOscillators: OscillatorNode[] = [];
  private droneGains: GainNode[] = [];
  private lfoNodes: OscillatorNode[] = [];
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;

  private activeId: SoundscapeId = 'null-void';
  private isPlaying: boolean = false;
  private volume: number = 0.35;
  private spatialAudioEnabled: boolean = true;
  private baseFilterFreq: number = 320;
  private panLfo: OscillatorNode | null = null;

  constructor() {}

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio API is not supported in this browser.');
      return;
    }
    this.ctx = new AudioContextClass();

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    // Environment sub-bus with soft warm lowpass filter (removes harsh 3-6kHz frequencies)
    this.environmentGain = this.ctx.createGain();
    this.environmentGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    this.breathGain = this.ctx.createGain();
    this.breathGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(this.baseFilterFreq, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(1.2, this.ctx.currentTime);

    // Spatial Stereo Panner
    if (this.ctx.createStereoPanner) {
      this.pannerNode = this.ctx.createStereoPanner();
      this.pannerNode.pan.setValueAtTime(0, this.ctx.currentTime);
    }

    // Connect graph
    if (this.pannerNode) {
      this.environmentGain.connect(this.breathGain);
      this.breathGain.connect(this.filterNode);
      this.filterNode.connect(this.pannerNode);
      this.pannerNode.connect(this.masterGain);
    } else {
      this.environmentGain.connect(this.breathGain);
      this.breathGain.connect(this.filterNode);
      this.filterNode.connect(this.masterGain);
    }
    this.masterGain.connect(this.ctx.destination);
  }

  public async start(soundscapeId: SoundscapeId = 'null-void', crossfadeSecs: number = 3.0) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.activeId = soundscapeId;
    this.isPlaying = true;

    const env = SOUNDSCAPE_ENVIRONMENTS.find((e) => e.id === soundscapeId) || SOUNDSCAPE_ENVIRONMENTS[0];
    this.baseFilterFreq = env.natureFilterFreq;

    const t = this.ctx.currentTime;

    // Crossfade: fade out existing nodes smoothly
    if (this.environmentGain) {
      this.environmentGain.gain.cancelScheduledValues(t);
      this.environmentGain.gain.setValueAtTime(this.environmentGain.gain.value, t);
      this.environmentGain.gain.linearRampToValueAtTime(0.01, t + 0.8);
    }

    setTimeout(() => {
      this.cleanActiveNodes();
      if (!this.ctx || !this.isPlaying || !this.environmentGain || !this.filterNode) return;

      const now = this.ctx.currentTime;
      this.filterNode.frequency.setValueAtTime(env.natureFilterFreq, now);

      // 1. Build Multi-harmonic Warm Drone
      this.buildWarmDrone(env, now);

      // 2. Build Procedural Organic Texture
      this.buildProceduralTexture(env, now);

      // 3. Build Spatial Panning LFO
      this.buildSpatialMovement(now);

      // Fade in new environment
      this.environmentGain.gain.cancelScheduledValues(now);
      this.environmentGain.gain.setValueAtTime(0.01, now);
      this.environmentGain.gain.linearRampToValueAtTime(1.0, now + crossfadeSecs);
    }, 850);
  }

  private buildWarmDrone(env: SoundscapeEnvironment, t: number) {
    if (!this.ctx || !this.environmentGain) return;

    // Harmonic ratios for peaceful, non-melodic acoustic resonance
    const ratios = [1.0, 1.498, 2.0, 2.247, 3.0]; // Root, Fifth, Octave, 9th, 12th
    const baseAmps = [0.35, 0.22, 0.16, 0.08, 0.04];

    ratios.forEach((ratio, idx) => {
      if (!this.ctx || !this.environmentGain) return;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      const freq = env.primaryFrequency * ratio;
      osc.frequency.setValueAtTime(freq, t);

      // Micro-detuning creates warm natural chorus shimmer without harsh phasing
      const detuneCents = (idx % 2 === 0 ? 1 : -1) * (2 + idx * 1.5);
      osc.detune.setValueAtTime(detuneCents, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(baseAmps[idx] * 0.5, t);

      // Slow LFO for organic breathing modulation (0.02 - 0.05 Hz)
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.02 + idx * 0.012, t);

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(baseAmps[idx] * 0.2, t);

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.connect(gain);
      gain.connect(this.environmentGain);

      lfo.start(t);
      osc.start(t);

      this.droneOscillators.push(osc);
      this.droneGains.push(gain);
      this.lfoNodes.push(lfo);
    });
  }

  private buildProceduralTexture(env: SoundscapeEnvironment, t: number) {
    if (!this.ctx || !this.environmentGain) return;

    try {
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = sampleRate * 3;
      const noiseBuffer = this.ctx.createBuffer(2, bufferSize, sampleRate);
      const left = noiseBuffer.getChannelData(0);
      const right = noiseBuffer.getChannelData(1);

      // Generate brownian / pink soothing noise (warm low-frequency emphasis)
      let lastOutL = 0.0;
      let lastOutR = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1;
        const whiteR = Math.random() * 2 - 1;

        // Low-pass filter noise into warm brown/pink noise
        lastOutL = (lastOutL + 0.03 * whiteL) / 1.03;
        lastOutR = (lastOutR + 0.03 * whiteR) / 1.03;

        left[i] = lastOutL * 3.5;
        right[i] = lastOutR * 3.5;
      }

      this.noiseSource = this.ctx.createBufferSource();
      this.noiseSource.buffer = noiseBuffer;
      this.noiseSource.loop = true;

      const textureFilter = this.ctx.createBiquadFilter();
      textureFilter.type = 'bandpass';
      textureFilter.frequency.setValueAtTime(env.natureFilterFreq, t);
      textureFilter.Q.setValueAtTime(0.8, t);

      // Modulate filter for wave or wind motion
      const waveLfo = this.ctx.createOscillator();
      waveLfo.type = 'sine';
      // Slower rhythm for wave / leaf movement (e.g. 0.08Hz = ~12 sec cycle)
      waveLfo.frequency.setValueAtTime(env.noiseType === 'waves' ? 0.09 : 0.04, t);

      const waveLfoGain = this.ctx.createGain();
      waveLfoGain.gain.setValueAtTime(env.natureFilterFreq * 0.45, t);

      waveLfo.connect(waveLfoGain);
      waveLfoGain.connect(textureFilter.frequency);

      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.setValueAtTime(0.12, t);

      this.noiseSource.connect(textureFilter);
      textureFilter.connect(this.noiseGain);
      this.noiseGain.connect(this.environmentGain);

      waveLfo.start(t);
      this.noiseSource.start(t);

      this.lfoNodes.push(waveLfo);
    } catch (e) {
      console.warn('Failed to build procedural texture node:', e);
    }
  }

  private buildSpatialMovement(t: number) {
    if (!this.ctx || !this.pannerNode || !this.spatialAudioEnabled) return;

    // Slow stereo panning across left and right ear (-0.35 to +0.35)
    this.panLfo = this.ctx.createOscillator();
    this.panLfo.type = 'sine';
    this.panLfo.frequency.setValueAtTime(0.03, t); // Slow 33s sweep

    const panGain = this.ctx.createGain();
    panGain.gain.setValueAtTime(0.35, t);

    this.panLfo.connect(panGain);
    panGain.connect(this.pannerNode.pan);
    this.panLfo.start(t);

    this.lfoNodes.push(this.panLfo);
  }

  /**
   * Synchronize ambient soundscape dynamics with the user's breathing cycle:
   * - Inhale: sound expands slightly brighter (+20% gain, filter opens)
   * - Hold: suspended motionless
   * - Exhale: softens and creates open spacious feeling
   * - Rest: gentle quiet
   */
  public setBreathingPhase(phase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut' | 'idle') {
    if (!this.ctx || !this.breathGain || !this.filterNode || !this.isPlaying) return;

    const t = this.ctx.currentTime;
    this.breathGain.gain.cancelScheduledValues(t);
    this.filterNode.frequency.cancelScheduledValues(t);

    switch (phase) {
      case 'inhale':
        this.breathGain.gain.linearRampToValueAtTime(1.22, t + 3.5);
        this.filterNode.frequency.linearRampToValueAtTime(this.baseFilterFreq * 1.35, t + 3.5);
        break;
      case 'holdIn':
        this.breathGain.gain.setValueAtTime(1.22, t);
        break;
      case 'exhale':
        this.breathGain.gain.linearRampToValueAtTime(0.78, t + 5.0);
        this.filterNode.frequency.linearRampToValueAtTime(this.baseFilterFreq * 0.85, t + 5.0);
        break;
      case 'holdOut':
      case 'idle':
      default:
        this.breathGain.gain.linearRampToValueAtTime(1.0, t + 1.5);
        this.filterNode.frequency.linearRampToValueAtTime(this.baseFilterFreq, t + 1.5);
        break;
    }
  }

  /**
   * Plays an acoustic Tibetan Singing Bowl chime for transition markers
   */
  public playSingingBowlChime(fundamentalHz: number = 280) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const partials = [1.0, 2.76, 5.4, 8.9];
    const amps = [0.25, 0.12, 0.05, 0.02];

    partials.forEach((partial, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamentalHz * partial, t);

      // Exponential decay ring
      gain.gain.setValueAtTime(amps[i] * 0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 4.5 + i * 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 6.0);
    });
  }

  /**
   * Soft UI tactile tap
   */
  public playWoodTap() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  /**
   * Paper page flip sound
   */
  public playPaperFlip() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start();
    } catch (e) {
      console.warn('Paper flip sound error:', e);
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setRainLevel(level: number) {
    if (this.noiseGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, level));
      this.noiseGain.gain.setValueAtTime(clamped * 0.45, this.ctx.currentTime);
    }
  }

  public setSpatialAudio(enabled: boolean) {
    this.spatialAudioEnabled = enabled;
    if (this.pannerNode && this.ctx) {
      if (!enabled) {
        this.pannerNode.pan.setValueAtTime(0, this.ctx.currentTime);
      }
    }
  }

  public getSpatialAudio(): boolean {
    return this.spatialAudioEnabled;
  }

  public getActiveId(): SoundscapeId {
    return this.activeId;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public stop(fadeSecs: number = 1.5) {
    if (!this.ctx || !this.masterGain) return;
    this.isPlaying = false;

    const t = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(t);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, t);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, t + fadeSecs);

    setTimeout(() => {
      this.cleanActiveNodes();
      if (this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend();
      }
    }, fadeSecs * 1000 + 100);
  }

  private cleanActiveNodes() {
    this.droneOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.lfoNodes.forEach((lfo) => {
      try {
        lfo.stop();
        lfo.disconnect();
      } catch (e) {}
    });
    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
      } catch (e) {}
    }

    this.droneOscillators = [];
    this.droneGains = [];
    this.lfoNodes = [];
    this.noiseSource = null;
    this.noiseGain = null;
    this.panLfo = null;
  }
}

export const globalSoundscape = new SoundscapeEngine();
export default globalSoundscape;
