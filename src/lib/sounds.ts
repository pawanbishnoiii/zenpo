// Lightweight in-app sound effects via WebAudio (no external assets).
// Use playSound('scan' | 'success' | 'error' | 'beep') anywhere.

let ctx: AudioContext | null = null;
const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  try {
    const C = window.AudioContext || (window as any).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    return ctx;
  } catch {
    return null;
  }
};

const tone = (freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.15) => {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
};

export type SoundName = 'scan' | 'success' | 'error' | 'beep' | 'cash';

export const playSound = (name: SoundName) => {
  // Respect saved user preference
  try {
    if (localStorage.getItem('ezo_sounds') === 'off') return;
  } catch { /* ignore */ }
  switch (name) {
    case 'scan': tone(1320, 0.08, 'square', 0.18); break;
    case 'beep': tone(880, 0.07, 'sine', 0.15); break;
    case 'success':
      tone(660, 0.09, 'sine', 0.18);
      setTimeout(() => tone(990, 0.13, 'sine', 0.2), 90);
      break;
    case 'cash':
      tone(523, 0.07, 'triangle', 0.18);
      setTimeout(() => tone(659, 0.07, 'triangle', 0.18), 70);
      setTimeout(() => tone(784, 0.14, 'triangle', 0.2), 140);
      break;
    case 'error':
      tone(220, 0.18, 'sawtooth', 0.18);
      setTimeout(() => tone(180, 0.22, 'sawtooth', 0.18), 130);
      break;
  }
};

export const setSoundsEnabled = (enabled: boolean) => {
  try { localStorage.setItem('ezo_sounds', enabled ? 'on' : 'off'); } catch { /* ignore */ }
};

export const areSoundsEnabled = (): boolean => {
  try { return localStorage.getItem('ezo_sounds') !== 'off'; } catch { return true; }
};
