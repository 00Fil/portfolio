/**
 * Suoni dell'interfaccia. Spenti di default; si accendono solo dal tasto nella barra.
 * Sintetizzati con Web Audio finché non ci sono i file ElevenLabs in /public/sfx (stessi nomi).
 */
export type Sfx = "tick" | "press" | "toggle" | "copy" | "open" | "key" | "click" | "whoosh" | "notify" | "success" | "send" | "say";

const KEY = "sound";
let ctx: AudioContext | null = null;
let enabled = false;
const last: Record<string, number> = {};
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

let bus: GainNode | null = null;
/** Altezza del suono in corso: chi chiama può alzarlo o abbassarlo per seguire il movimento (una scala di loghi, un conteggio). */
let P = 1;
/** Un'unica uscita morbida: taglia le alte, comprime appena, così ogni suono è pieno e mai tagliente. */
function master(c: AudioContext) {
  if (bus && bus.context === c) return bus;
  const g = c.createGain();
  g.gain.value = 0.9;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 6800;
  lp.Q.value = 0.5;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.ratio.value = 3;
  comp.attack.value = 0.003;
  comp.release.value = 0.12;
  g.connect(lp);
  lp.connect(comp);
  comp.connect(c.destination);
  bus = g;
  return g;
}

/** Una nota: attacco morbido, caduta naturale; opzionale scivolata di altezza. */
function note(c: AudioContext, f: number, peak: number, decay: number, o: { at?: number; to?: number; attack?: number; type?: OscillatorType } = {}) {
  const t = c.currentTime + (o.at ?? 0);
  const a = o.attack ?? 0.005;
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + decay);
  g.connect(master(c));
  const osc = c.createOscillator();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(f * P, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to * P, t + a + decay * 0.8);
  osc.connect(g);
  osc.start(t);
  osc.stop(t + a + decay + 0.03);
}
/** Vetro: fondamentale più una parziale inarmonica che svanisce prima, come un bicchiere toccato. */
function glass(c: AudioContext, f: number, peak: number, decay: number, at = 0) {
  note(c, f, peak, decay, { at });
  note(c, f * 2.76, peak * 0.22, decay * 0.35, { at });
  note(c, f * 5.4, peak * 0.06, decay * 0.18, { at });
}
/** Colpo solido e sordo: il corpo dell'oggetto, con un velo di vetro sopra. */
function thock(c: AudioContext, f: number, peak: number, at = 0) {
  note(c, f, peak, 0.07, { at, to: f * 0.55, attack: 0.002 });
  note(c, f * 7, peak * 0.1, 0.03, { at, attack: 0.001 });
}

export function play(name: Sfx, pitch = 1) {
  if (!enabled) return;
  const now = performance.now();
  if (now - (last[name] ?? 0) < (name === "key" ? 28 : 80)) return;
  last[name] = now;
  const c = ensure();
  if (!c) return;
  P = pitch;
  switch (name) {
    case "tick":
      glass(c, 2093, 0.02, 0.08);
      break;
    case "press":
      thock(c, 220, 0.07);
      break;
    case "click":
      // il tocco: corpo solido e un accenno di vetro nello stesso istante
      thock(c, 260, 0.08);
      glass(c, 1760, 0.012, 0.06);
      break;
    case "toggle":
      glass(c, 880, 0.03, 0.14);
      glass(c, 1175, 0.026, 0.18, 0.06);
      break;
    case "copy":
      glass(c, 1568, 0.03, 0.26);
      glass(c, 2093, 0.018, 0.3, 0.07);
      break;
    case "open":
      note(c, 330, 0.02, 0.28, { to: 520, attack: 0.05 });
      glass(c, 1047, 0.014, 0.22, 0.12);
      break;
    case "key": {
      const j = 1 + (Math.random() - 0.5) * 0.14;
      thock(c, 520 * j, 0.03);
      break;
    }
    case "whoosh":
      // segue l'entrata (parte veloce e si assesta): inizio pieno, altezza che scende, chiude con un tocco di vetro
      note(c, 620, 0.024, 0.38, { to: 240, attack: 0.012 });
      glass(c, 1319, 0.01, 0.16, 0.22);
      break;
    case "say":
      note(c, 392, 0.018, 0.42, { attack: 0.06 });
      glass(c, 784, 0.014, 0.4, 0.04);
      break;
    case "notify":
      glass(c, 1319, 0.034, 0.34);
      glass(c, 1760, 0.03, 0.5, 0.11);
      break;
    case "success":
      [1047, 1319, 1568].forEach((f, i) => glass(c, f, 0.028, 0.5, i * 0.085));
      break;
    case "send":
      note(c, 520, 0.022, 0.16, { to: 1040, attack: 0.012 });
      glass(c, 1568, 0.018, 0.2, 0.09);
      break;
  }
}
