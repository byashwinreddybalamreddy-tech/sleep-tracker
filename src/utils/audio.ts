// Web Audio API Synthesizer for Alarms, Reminders, and Ambient Focus Sound
import { RingtoneId } from '../types';

let audioCtx: AudioContext | null = null;
let activeAlarmTimer: number | null = null;
let activeAmbientSource: AudioNode | null = null;
let ambientGainNode: GainNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a synthesized alarm ringtone continuously until stopped
 */
export function startAlarmAudio(type: RingtoneId = 'gentle'): void {
  stopAlarmAudio();
  const ctx = getAudioContext();

  const playIteration = () => {
    const now = ctx.currentTime;

    switch (type) {
      case 'gentle': {
        // Multi-frequency mellow chime chords (E5, G#5, B5, E6)
        const freqs = [659.25, 830.61, 987.77, 1318.51];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.18);

          gain.gain.setValueAtTime(0, now + idx * 0.18);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.18 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 1.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.18);
          osc.stop(now + idx * 0.18 + 1.3);
        });
        break;
      }

      case 'digital': {
        // High-energy digital double-beep (880Hz, 880Hz)
        [0, 0.15, 0.3, 0.45].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(980, now + offset);

          gain.gain.setValueAtTime(0.15, now + offset);
          gain.gain.setValueAtTime(0, now + offset + 0.08);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + offset);
          osc.stop(now + offset + 0.09);
        });
        break;
      }

      case 'synth': {
        // Upbeat arpeggiated electronic wakeup
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.12);

          gain.gain.setValueAtTime(0.2, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.45);
        });
        break;
      }

      case 'bowl': {
        // Resonant Tibetan Singing Bowl (fundamental 220Hz + overtone 660Hz)
        const fundamental = 216;
        [fundamental, fundamental * 2.76, fundamental * 5.4].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);

          const volume = idx === 0 ? 0.25 : 0.08;
          gain.gain.setValueAtTime(volume, now);
          gain.gain.exponentialRampToValueAtTime(0.0005, now + 2.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 2.6);
        });
        break;
      }
    }
  };

  playIteration();
  const intervalMs = type === 'bowl' ? 3000 : type === 'gentle' ? 2200 : 1600;
  activeAlarmTimer = window.setInterval(playIteration, intervalMs);
}

/**
 * Halts active alarm ringtone
 */
export function stopAlarmAudio(): void {
  if (activeAlarmTimer !== null) {
    clearInterval(activeAlarmTimer);
    activeAlarmTimer = null;
  }
}

/**
 * Preview a ringtone for 2 seconds
 */
export function previewRingtone(type: RingtoneId): void {
  startAlarmAudio(type);
  setTimeout(() => {
    stopAlarmAudio();
  }, 2200);
}

/**
 * Short chime for reminders or timer finish
 */
export function playChime(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(587.33, now); // D5
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.85);
}

/**
 * Warning alert sound when reels quota exceeded
 */
export function playDoomscrollAlert(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  [0, 0.14].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now + offset);
    osc.frequency.exponentialRampToValueAtTime(180, now + offset + 0.1);

    gain.gain.setValueAtTime(0.12, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + offset);
    osc.stop(now + offset + 0.13);
  });
}

/**
 * Ambient focus audio for study sessions (White Noise, Rain, Alpha Waves)
 */
export function startAmbientSound(mode: 'rain' | 'whitenoise' | 'alpha'): void {
  stopAmbientSound();
  const ctx = getAudioContext();

  if (mode === 'alpha') {
    // Binaural alpha rhythm (base 200Hz, left 200, right 210 = 10Hz alpha difference)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.value = 200;
    osc2.frequency.value = 210;

    gain.gain.value = 0.08;
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    activeAmbientSource = gain;
    ambientGainNode = gain;
  } else {
    // Noise buffer generation
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (mode === 'rain') {
        // Pink/Brownian filter for soothing rain sound
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      } else {
        // Soft white noise
        output[i] = white * 0.15;
      }
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = mode === 'rain' ? 'lowpass' : 'bandpass';
    filter.frequency.value = mode === 'rain' ? 800 : 1200;

    const gain = ctx.createGain();
    gain.gain.value = 0.08;

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
    activeAmbientSource = whiteNoise;
    ambientGainNode = gain;
  }
}

export function stopAmbientSound(): void {
  if (activeAmbientSource) {
    try {
      if ('stop' in activeAmbientSource) {
        (activeAmbientSource as any).stop();
      }
      activeAmbientSource.disconnect();
    } catch {
      // Ignored
    }
    activeAmbientSource = null;
  }
}
