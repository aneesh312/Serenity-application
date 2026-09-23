/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Voice Guide Engine for Serenity
// Handles server-generated Gemini high-definition meditation voices and enhanced client-side acoustic speech

class VoiceGuideService {
  private currentAudio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private onCaptionCallback: ((text: string) => void) | null = null;
  private isSpeaking = false;
  private voiceSpeed = 0.82; // 130-145 WPM meditative slow cadence

  public setCaptionListener(cb: ((text: string) => void) | null) {
    this.onCaptionCallback = cb;
  }

  public setSpeed(speed: number) {
    this.voiceSpeed = Math.max(0.6, Math.min(1.2, speed));
  }

  public async speak(text: string, voiceName: 'Kore' | 'Puck' | 'Aoede' | 'Zephyr' = 'Kore'): Promise<void> {
    this.stop();
    this.isSpeaking = true;

    if (this.onCaptionCallback) {
      this.onCaptionCallback(text);
    }

    try {
      // 1. Try high-definition server-side TTS first
      const res = await fetch('/api/voice-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: voiceName }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          await this.playBase64Audio(data.audio, data.rate || 24000);
          return;
        }
      }
    } catch (e) {
      console.warn('Voice guide server speech unavailable, using acoustic client speech synthesis.');
    }

    // 2. Fallback to enhanced acoustic Web Speech synthesis
    this.speakClientSpeech(text);
  }

  private playBase64Audio(base64: string, sampleRate = 24000): Promise<void> {
    return new Promise((resolve) => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!this.audioCtx || this.audioCtx.state === 'closed') {
          this.audioCtx = new AudioContextClass({ sampleRate });
        }

        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        // Convert raw 16-bit PCM little endian into Float32Array
        const int16Array = new Int16Array(bytes.buffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768;
        }

        const buffer = this.audioCtx.createBuffer(1, float32Array.length, sampleRate);
        buffer.getChannelData(0).set(float32Array);

        const source = this.audioCtx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = this.voiceSpeed / 0.82;

        // Warm studio acoustic low-pass filter (cuts harsh digital high frequencies)
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 5200;

        const gainNode = this.audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.9, this.audioCtx.currentTime);

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        source.onended = () => {
          this.isSpeaking = false;
          resolve();
        };

        source.start();
      } catch (err) {
        console.error('Error playing raw PCM audio stream:', err);
        this.speakClientSpeech(base64);
        resolve();
      }
    });
  }

  private speakClientSpeech(text: string) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Clean text for natural breathing flow
    const cleanText = text.replace(/[*_#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.rate = this.voiceSpeed;
    utterance.pitch = 0.96; // slightly warm lower pitch

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.name.includes('Natural') ||
        v.name.includes('Aria') ||
        v.name.includes('Samantha') ||
        v.name.includes('Google US English') ||
        (v.lang.startsWith('en') && !v.name.includes('Zira'))
    );

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      this.isSpeaking = false;
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
    };

    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    this.isSpeaking = false;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.audioCtx && this.audioCtx.state === 'running') {
      try {
        this.audioCtx.close();
        this.audioCtx = null;
      } catch (e) {}
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const globalVoiceGuide = new VoiceGuideService();
export default globalVoiceGuide;
