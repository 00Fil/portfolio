import { soundOn } from "./sound";

/**
 * Colonna sonora del video: La minore e un solo tempo (120 bpm), così ogni suono cade sul ritmo e suona bene
 * con gli altri. Si sente solo con l'audio del sito attivo.
 * Il tema è di pubblico dominio: l'attacco di «Per Elisa» di Beethoven, che tutti riconoscono al volo, su un
 * ritmo house (cassa a quattro, battiti di mani, controtempi); il colpo finale cita le quattro note della Quinta.
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
   * Base musicale: 120 battiti al minuto, giri di 4 battute (Canone di Pachelbel in La).
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

/** Giro del Canone in La: La Mi | Fa#m Do#m | Re La | Re Mi, due accordi per battuta. */
const AM = [220, 261.63, 329.63, 493.88];
const E7 = [164.81, 246.94, 293.66, 415.3];
/** Quattro battute di tema, da «Per Elisa»: passo (sedicesimo) → semitoni da La4. a, b, a, chiusura. */
const HOOK: Record<number, number>[] = [
  { 0: 7, 1: 6, 2: 7, 3: 6, 4: 7, 5: 2, 6: 5, 7: 3, 8: 0 },
  { 0: -9, 1: -5, 2: 0, 4: 2, 8: -5, 9: -1, 10: 2, 12: 3 },
  { 0: 7, 1: 6, 2: 7, 3: 6, 4: 7, 5: 2, 6: 5, 7: 3, 8: 0 },
  { 0: -5, 1: -1, 2: 2, 4: 3, 8: 2, 10: 0 },
];
/** Le quattro note della Quinta (tre uguali e una più bassa) sul colpo finale. */
const FIN: Record<number, number> = { 2: 7, 4: 7, 6: 7, 8: 3 };

function step(c: AudioContext, m: { out: GainNode; verb: ConvolverNode; echo: DelayNode }, n: number, at: number) {
  const s = n % 16;
  const bar = Math.floor(n / 16);
  const k = bar % 4; // 2 a · 3 b · 0 a · 1 chiusura
  const ended = bar >= 17;
  if (ended && s) return;
  const e7 = bar < 15 && ((k === 3 && s >= 8) || (k === 1 && s < 8));
  const chord = e7 ? E7 : AM;
  const root = e7 ? 82.41 : 110;
  // 0 intro · 1 ingresso della cassa · 2 pieno · 3 stacco (senza cassa, rullo) · 4 colpo finale · 5 coda
  const sect = bar < 1 ? 0 : bar < 2 ? 1 : bar < 9 ? 2 : bar < 11 ? 3 : bar < 15 ? 2 : bar < 16 ? 4 : 5;
  const tone = (fr: number, type: OscillatorType, peak: number, atk: number, dec: number, lp: number, wet = 0.3, echo = 0) => {
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
    if (wet) {
      const w = c.createGain();
      w.gain.value = wet;
      g.connect(w).connect(m.verb);
    }
    if (echo) {
      const e = c.createGain();
      e.gain.value = echo;
      g.connect(e).connect(m.echo);
    }
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
  // pad: accordo morbido a inizio battuta e al cambio
  const change = e7 !== (bar < 15 && ((k === 3 && s - 1 >= 8) || (k === 1 && s - 1 < 8)));
  if (s === 0 || (s === 8 && change)) chord.forEach((fr, i) => tone(fr, "triangle", sect === 4 ? 0.05 : 0.026, 0.02, (sect >= 4 ? 3 : 1.1) + i * 0.08, 1100, 0.5));
  if (sect === 5) return;
  // cassa a quattro; nell'ingresso a metà, nello stacco ferma tranne l'ultimo quarto
  if ((sect === 2 || sect === 4) && s % 4 === 0) kickAt(c, m.out, at, s % 8 === 0 ? 1 : 0.85);
  if (sect === 1 && s % 4 === 0) kickAt(c, m.out, at, 0.5);
  if (sect === 3 && bar === 10 && s >= 12 && s % 2 === 0) kickAt(c, m.out, at, 0.4 + (s - 12) * 0.1);
  // battito di mani sul 2 e sul 4; nello stacco un rullo che sale
  if ((sect === 2 || sect === 4) && (s === 4 || s === 12)) {
    burst("bandpass", 1600, 0.8, 0.13, 0.12);
    burst("highpass", 3200, 0.7, 0.05, 0.09);
  }
  if (sect === 3 && bar === 10 && s >= 8) burst("bandpass", 1800, 0.9, 0.04 + (s - 8) * 0.012, 0.06);
  // controtempi: piatto aperto sull'«e», chiuso sui sedicesimi
  if (sect >= 1 && s % 4 === 2) burst("highpass", 7200, 0.7, 0.07, 0.1);
  else if (sect >= 1 && s % 2 === 1) burst("highpass", 8400, 0.7, sect === 2 ? 0.03 : 0.015, 0.03);
  // basso sui controtempi, con una nota in anticipo
  if ((sect === 2 || sect === 4) && s % 4 === 2) tone(root * (s === 14 ? 1.5 : 1), "sine", 0.17, 0.006, 0.2, 520, 0.04);
  // colpi di accordo sull'«e» del 2 e del 4
  if (sect === 2 && bar >= 6 && (s === 6 || s === 14)) chord.slice(0, 3).forEach((fr) => tone(fr, "triangle", 0.03, 0.004, 0.13, 2600, 0.25));
  // tema: pizzicato brillante, un'ottava sopra nella parte alta, eco a croma puntata
  const mel = sect === 4 ? FIN : HOOK[(bar + 2) % 4];
  const mn = bar >= 2 ? mel[s] : undefined;
  if (mn !== undefined) {
    let nx = 16 - s;
    for (let j = s + 1; j < 16; j++) if (mel[j] !== undefined) { nx = j - s; break; }
    const dec = Math.min(0.7, Math.max(0.16, nx * 0.125 * 1.5));
    const fr = 440 * 2 ** (mn / 12);
    tone(fr, "sine", 0.085, 0.004, dec, 3200, 0.45, 0.5);
    tone(fr * 2, "triangle", 0.018, 0.004, dec * 0.7, 3600, 0.4);
    if (bar >= 6 && sect !== 4) tone(fr * 2, "sine", 0.03, 0.004, dec * 0.8, 4200, 0.4, 0.3);
    if (sect === 4) {
      tone(fr / 2, "sine", 0.1, 0.004, dec + 0.2, 900, 0.3);
      tone(fr * 2, "sine", 0.05, 0.004, dec, 3800, 0.4);
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
