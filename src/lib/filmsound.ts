import { soundOn } from "./sound";

/**
 * Colonna sonora del video: una sola tonalità (La minore pentatonica) e un solo tempo, così ogni suono
 * cade sul ritmo e suona bene con gli altri. Si sente solo con l'audio del sito attivo.
 */
let ctx: AudioContext | null = null;
let bus: GainNode | null = null;
let noise: AudioBuffer | null = null;

const PENT = [0, 3, 5, 7, 10];
/** Frequenza del grado d della scala (5 gradi per ottava). */
export const fq = (d: number, base = 220) => base * 2 ** ((PENT[((d % 5) + 5) % 5] + 12 * Math.floor(d / 5)) / 12);

function ac() {
  if (!soundOn()) return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    bus = ctx.createGain();
    bus.gain.value = 0.85;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.ratio.value = 4;
    bus.connect(comp);
    comp.connect(ctx.destination);
    const len = Math.floor(ctx.sampleRate * 1.6);
    noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

const env = (g: GainNode, t: number, peak: number, atk: number, dec: number) => {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + atk);
  g.gain.exponentialRampToValueAtTime(0.0001, t + atk + dec);
};

export const fx = {
  /** Nota pizzicata: per i tasti, le comparse, i passaggi. */
  pluck(deg: number, vel = 1, dec = 0.32) {
    const c = ac();
    if (!c || !bus) return;
    const t = c.currentTime;
    const g = c.createGain();
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 2600;
    env(g, t, 0.13 * vel, 0.004, dec);
    g.connect(f).connect(bus);
    for (const [m, ty, k] of [[1, "triangle", 1], [2, "sine", 0.4]] as const) {
      const o = c.createOscillator();
      o.type = ty;
      o.frequency.value = fq(deg) * m;
      const og = c.createGain();
      og.gain.value = k;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + dec + 0.05);
    }
  },
  /** Colpo basso sul ritmo. */
  kick(vel = 1) {
    const c = ac();
    if (!c || !bus) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(46, t + 0.14);
    env(g, t, 0.55 * vel, 0.003, 0.42);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 0.5);
  },
  /** Spostamento d'aria che accompagna un movimento di camera. */
  whoosh(dur = 0.55, up = true, vel = 1) {
    const c = ac();
    if (!c || !bus || !noise) return;
    const t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = noise;
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 1.1;
    f.frequency.setValueAtTime(up ? 400 : 3200, t);
    f.frequency.exponentialRampToValueAtTime(up ? 3200 : 400, t + dur);
    const g = c.createGain();
    env(g, t, 0.16 * vel, dur * 0.4, dur * 0.7);
    s.connect(f).connect(g).connect(bus);
    s.start(t);
    s.stop(t + dur * 1.2);
  },
  /** Salita di tensione prima di un colpo. */
  riser(dur = 1.6) {
    const c = ac();
    if (!c || !bus || !noise) return;
    const t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = noise;
    const f = c.createBiquadFilter();
    f.type = "highpass";
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(5200, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.13, t + dur);
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.04);
    s.connect(f).connect(g).connect(bus);
    s.start(t);
    s.stop(t + dur + 0.1);
    const o = c.createOscillator();
    const og = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(fq(0, 110), t);
    o.frequency.exponentialRampToValueAtTime(fq(5, 110), t + dur);
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.07, t + dur);
    og.gain.linearRampToValueAtTime(0.0001, t + dur + 0.04);
    o.connect(og).connect(bus);
    o.start(t);
    o.stop(t + dur + 0.1);
  },
  /** Accordo di conferma: tre note insieme, lunghe. */
  chord(degs = [0, 2, 4, 5], vel = 1) {
    degs.forEach((d, i) => this.pluck(d + 5, 0.8 * vel, 1.1 + i * 0.1));
    this.kick(0.7 * vel);
  },
  /** Campanello di una notifica. */
  bell(deg = 7, vel = 1) {
    const c = ac();
    if (!c || !bus) return;
    const t = c.currentTime;
    for (const [m, k, d] of [[1, 1, 0.9], [2.76, 0.35, 0.5], [5.4, 0.15, 0.3]] as const) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.value = fq(deg, 440) * m;
      env(g, t, 0.07 * k * vel, 0.003, d);
      o.connect(g).connect(bus);
      o.start(t);
      o.stop(t + d + 0.05);
    }
  },
  /** Tocco secco: un clic. */
  tick(vel = 1) {
    const c = ac();
    if (!c || !bus || !noise) return;
    const t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = noise;
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 3400;
    f.Q.value = 2;
    const g = c.createGain();
    env(g, t, 0.18 * vel, 0.001, 0.04);
    s.connect(f).connect(g).connect(bus);
    s.start(t);
    s.stop(t + 0.08);
  },
  /**
   * Base musicale: 120 battiti al minuto, giri di 4 battute (La min, Fa, Do, Sol).
   * Non ha un orologio suo: segue il tempo del video, così si ferma in pausa e riparte allineata.
   * Si costruisce per gradi: prima solo accordi e un battito leggero, poi cassa, tocco, basso e arpeggio.
   */
  sync(t: number, run: boolean) {
    if (!run) return;
    const c = ac();
    if (!c || !bus) return;
    const m = music(c);
    const STEP = 0.125;
    let n = Math.max(last + 1, Math.floor((t - 0.04) / STEP) + 1);
    if (t < lastT - 0.3) n = Math.floor(t / STEP) + 1;
    lastT = t;
    for (; n * STEP < t + 0.18; n++) {
      last = n;
      const at = c.currentTime + Math.max(0, n * STEP - t);
      step(c, m, n, at);
    }
  },
  /** Riporta la base all'inizio (nuova riproduzione). */
  reset() {
    last = -1;
    lastT = 0;
  },
  /** Silenzia la base mentre il video è fermo. */
  duck(on: boolean) {
    if (!ctx || !mbus) return;
    const t = ctx.currentTime;
    mbus.gain.cancelScheduledValues(t);
    mbus.gain.linearRampToValueAtTime(on ? 0.0001 : 0.5, t + 0.2);
  },
};

let last = -1;
let lastT = 0;
let mbus: GainNode | null = null;
let verb: ConvolverNode | null = null;
let echo: DelayNode | null = null;

function music(c: AudioContext) {
  if (!mbus) {
    mbus = c.createGain();
    mbus.gain.value = 0.5;
    mbus.connect(bus!);
    verb = c.createConvolver();
    const len = Math.floor(c.sampleRate * 1.8);
    const ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    verb.buffer = ir;
    const vg = c.createGain();
    vg.gain.value = 0.55;
    verb.connect(vg).connect(mbus);
    // eco a croma puntata (3/16 di battuta a 120 bpm): dà respiro alla melodia
    echo = c.createDelay(1);
    echo.delayTime.value = 0.375;
    const fb = c.createGain();
    fb.gain.value = 0.36;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2200;
    echo.connect(lp).connect(fb).connect(echo);
    lp.connect(mbus);
  }
  return { out: mbus, verb: verb!, echo: echo! };
}

const ROOT = [110, 87.31, 130.81, 98];
/** Am9, Fmaj7, Cmaj9, G6/9: accordi con la nona e la settima, morbidi. */
const CH = [
  [220, 261.63, 329.63, 392, 493.88],
  [174.61, 220, 261.63, 329.63],
  [261.63, 329.63, 392, 493.88, 587.33],
  [196, 246.94, 293.66, 329.63, 440],
];
/** Melodia di 8 battute: passo (sedicesimo) → semitoni da La4. Prima frase in basso, la risposta un'ottava sopra. */
const MEL: Record<number, number>[] = [
  { 0: 7, 3: 5, 6: 3, 10: 5, 12: 2 },
  { 0: 0, 3: 3, 6: 5, 8: 3, 12: 0 },
  { 0: 7, 4: 10, 7: 7, 10: 5, 12: 7 },
  { 0: 5, 3: 7, 6: 5, 8: 2, 11: 0, 14: 2 },
  { 0: 12, 3: 10, 6: 7, 10: 10, 12: 5 },
  { 0: 12, 3: 15, 6: 12, 8: 10, 12: 8 },
  { 0: 14, 3: 12, 6: 10, 10: 7, 12: 10 },
  { 0: 12, 3: 10, 6: 7, 8: 5, 11: 7, 14: 2 },
];

function step(c: AudioContext, m: { out: GainNode; verb: ConvolverNode; echo: DelayNode }, n: number, at: number) {
  const s = n % 16;
  const bar = Math.floor(n / 16);
  const ch = bar % 4;
  const lvl = bar < 1 ? 0 : bar < 2 ? 1 : bar < 15 ? 2 : 1;
  const ended = bar >= 16;
  if (ended && s) return;
  const tone = (fr: number, type: OscillatorType, peak: number, atk: number, dec: number, lp: number, wet = 0.3) => {
    const o = c.createOscillator();
    const g = c.createGain();
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = lp;
    o.type = type;
    o.frequency.value = fr;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(peak, at + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, at + atk + dec);
    o.connect(f).connect(g);
    g.connect(m.out);
    const w = c.createGain();
    w.gain.value = wet;
    g.connect(w).connect(m.verb);
    o.start(at);
    o.stop(at + atk + dec + 0.05);
  };
  const burst = (type: BiquadFilterType, fr: number, q: number, peak: number, dec: number) => {
    if (!noise) return;
    const sn = c.createBufferSource();
    sn.buffer = noise;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = fr;
    f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(peak, at + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dec);
    sn.connect(f).connect(g).connect(m.out);
    sn.start(at, Math.random() * 0.8);
    sn.stop(at + dec + 0.03);
  };
  // accordo lungo a inizio battuta
  if (s === 0) CH[ch].forEach((fr, i) => tone(fr, "triangle", 0.036, 0.3, 1.9 + i * 0.1, 1000, 0.55));
  if (ended) return;
  // basso sul primo e sul terzo battito, con una nota in anticipo
  if (lvl >= 2 && (s === 0 || s === 6 || s === 10 || s === 14)) tone(ROOT[ch] * (s === 10 ? 1.5 : 1), "sine", 0.16, 0.008, s === 0 ? 0.5 : 0.28, 400, 0.05);
  // cassa
  if (lvl >= 1 && s % 8 === 0 && bar >= 2) kickAt(c, m.out, at, lvl >= 2 && s % 8 === 0 ? 1 : 0.7);
  if (lvl >= 2 && s % 4 === 0 && s % 8 !== 0) kickAt(c, m.out, at, 0.45);
  // tocco sul secondo e quarto battito
  if (lvl >= 2 && (s === 4 || s === 12)) burst("bandpass", 1700, 0.9, 0.12, 0.11);
  // piatto chiuso sui controtempi, più fitto nella parte alta
  if (s % 4 === 2) burst("highpass", 7200, 0.7, lvl >= 1 ? 0.07 : 0.035, 0.05);
  else if (lvl >= 2 && s % 2 === 1) burst("highpass", 8200, 0.7, 0.022, 0.03);
  // arpeggio sottile sui controtempi
  if (lvl >= 1 && bar >= 1 && s % 4 === 2) tone(CH[ch][(s / 4 + bar) % CH[ch].length] * 2, "sine", 0.02, 0.004, 0.3, 3000, 0.45);
  // melodia: sinusoide con una nota armonica sopra, mandata anche all'eco
  const mn = bar >= 2 && bar < 16 ? MEL[(bar - 2) % 8][s] : undefined;
  if (mn !== undefined) {
    const fr = 440 * 2 ** (mn / 12);
    for (const [k, ty, pk] of [[1, "sine", 0.07], [2, "triangle", 0.012]] as const) {
      const o = c.createOscillator();
      const g = c.createGain();
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 2600;
      o.type = ty;
      o.frequency.value = fr * k;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(pk, at + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.7);
      o.connect(f).connect(g);
      g.connect(m.out);
      const w = c.createGain();
      w.gain.value = 0.5;
      g.connect(w).connect(m.verb);
      const e = c.createGain();
      e.gain.value = 0.55;
      g.connect(e).connect(m.echo);
      o.start(at);
      o.stop(at + 0.8);
    }
  }
}

function kickAt(c: AudioContext, out: GainNode, at: number, vel: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(125, at);
  o.frequency.exponentialRampToValueAtTime(44, at + 0.13);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(0.5 * vel, at + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.34);
  o.connect(g).connect(out);
  o.start(at);
  o.stop(at + 0.4);
}
