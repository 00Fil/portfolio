/**
 * Suoni dell'interfaccia. Spenti di default; si accendono solo dal tasto nella barra.
 * Sintetizzati con Web Audio finché non ci sono i file ElevenLabs in /public/sfx (stessi nomi).
 */
export type Sfx = "tick" | "press" | "toggle" | "copy" | "open";

const KEY = "sound";
let ctx: AudioContext | null = null;
let enabled = false;
let last = 0;
const listeners = new Set<(on: boolean) => void>();

export function loadSoundPref() {
  try {
    enabled = localStorage.getItem(KEY) === "1";
  } catch {
    enabled = false;
  }
  return enabled;
}

export const soundOn = () => enabled;

export function setSound(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* archiviazione non disponibile */
  }
  if (on) ensure();
  listeners.forEach((fn) => fn(on));
}

export function onSound(fn: (on: boolean) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function env(c: AudioContext, peak: number, attack: number, decay: number) {
  const g = c.createGain();
  const t = c.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  g.connect(c.destination);
  return g;
}

function noise(c: AudioContext, seconds: number) {
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  return src;
}

function tone(c: AudioContext, freq: number, to: number, out: AudioNode, dur: number) {
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(freq, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(to, c.currentTime + dur);
  o.connect(out);
  o.start();
  o.stop(c.currentTime + dur + 0.02);
}

export function play(name: Sfx) {
  if (!enabled) return;
  const now = performance.now();
  if (now - last < 80) return;
  last = now;
  const c = ensure();
  if (!c) return;
  switch (name) {
    case "tick": {
      const g = env(c, 0.05, 0.001, 0.03);
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 3400;
      f.Q.value = 2.2;
      f.connect(g);
      const n = noise(c, 0.04);
      n.connect(f);
      n.start();
      break;
    }
    case "press": {
      tone(c, 540, 360, env(c, 0.035, 0.002, 0.07), 0.08);
      break;
    }
    case "toggle": {
      tone(c, 620, 480, env(c, 0.03, 0.002, 0.05), 0.06);
      window.setTimeout(() => c && tone(c, 820, 640, env(c, 0.026, 0.002, 0.05), 0.06), 70);
      break;
    }
    case "copy": {
      const g = env(c, 0.028, 0.004, 0.32);
      tone(c, 880, 880, g, 0.34);
      tone(c, 1320, 1320, env(c, 0.012, 0.004, 0.26), 0.28);
      break;
    }
    case "open": {
      const g = env(c, 0.02, 0.04, 0.2);
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(400, c.currentTime);
      f.frequency.exponentialRampToValueAtTime(2400, c.currentTime + 0.2);
      f.connect(g);
      const n = noise(c, 0.26);
      n.connect(f);
      n.start();
      break;
    }
  }
}
