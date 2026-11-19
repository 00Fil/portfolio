import { soundOn } from "./sound";

/**
 * Colonna sonora del video: La minore e un solo tempo (120 bpm), così ogni suono cade sul ritmo e suona bene
 * con gli altri. Si sente solo con l'audio del sito attivo.
 * Brano originale in stile house melodico: giro Am F C G, pad a sega, basso sincopato con sub, cassa a quattro
 * che fa "respirare" il resto, tema di quattro battute con ritmo 3+3+2 che si ripete. Nessun brano esistente.
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
    if (pump && ctx) {
      pump.gain.cancelScheduledValues(ctx.currentTime);
      pump.gain.setValueAtTime(1, ctx.currentTime);
    }
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
let pump: GainNode | null = null;
let verb: ConvolverNode | null = null;
let echo: DelayNode | null = null;

function music(c: AudioContext) {
  if (!mbus) {
    mbus = c.createGain();
    mbus.gain.value = 0.5;
    mbus.connect(bus!);
    pump = c.createGain();
    pump.connect(mbus);
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
  return { out: mbus, pump: pump!, verb: verb!, echo: echo! };
}

/** Giro in La minore, una battuta per accordo: Am | F | C | G. Triadi per il pad e fondamentale per il basso. */
const CH = [
  { pad: [220, 261.63, 329.63], root: 110 },
  { pad: [174.61, 220, 261.63], root: 87.31 },
  { pad: [261.63, 329.63, 392], root: 130.81 },
  { pad: [196, 246.94, 293.66], root: 98 },
];
/** Tema originale di quattro battute (passo = sedicesimo, valore = semitoni da La4). Ritmo 3+3+2, sempre uguale: si canticchia dopo un ascolto. */
const LEAD: Record<number, number>[] = [
  { 0: 7, 3: 12, 6: 10, 8: 7, 12: 3 },
  { 0: 8, 3: 12, 6: 10, 8: 8, 12: 3 },
  { 0: 7, 3: 12, 6: 14, 8: 12, 10: 10, 12: 7 },
  { 0: 10, 3: 14, 6: 12, 8: 10, 10: 7, 14: 7 },
];
/** Colpo finale su La minore: tre note ribattute e una discesa. */
const FIN: Record<number, number> = { 0: 12, 2: 12, 4: 12, 8: 7 };
/** Ritmo del basso: sedicesimi su cui cade la fondamentale (sincopato, con salto d'ottava). */
const BASS = [0, 3, 6, 8, 10, 14];

type Mus = { out: GainNode; pump: GainNode; verb: ConvolverNode; echo: DelayNode };

function step(c: AudioContext, m: Mus, n: number, at: number) {
  const s = n % 16;
  const bar = Math.floor(n / 16);
  const ended = bar >= 17;
  if (ended && s) return;
  // 0 intro · 1 ingresso della cassa · 2 pieno · 3 stacco (senza cassa, rullo) · 4 colpo finale · 5 coda
  const sect = bar < 1 ? 0 : bar < 2 ? 1 : bar < 9 ? 2 : bar < 11 ? 3 : bar < 15 ? 2 : bar < 16 ? 4 : 5;
  const ch = sect >= 4 ? CH[0] : CH[(bar + 2) % 4];
  /** Voce di sintetizzatore: più oscillatori leggermente scordati, filtro, eco e riverbero. `pumped` la fa respirare con la cassa. */
  const tone = (fr: number, type: OscillatorType, peak: number, atk: number, dec: number, lp: number, o2: { wet?: number; echo?: number; det?: number[]; pumped?: boolean; lpEnd?: number } = {}) => {
    const { wet = 0.3, echo = 0, det = [0], pumped = false, lpEnd } = o2;
    const g = c.createGain();
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(lp, at);
    if (lpEnd) f.frequency.exponentialRampToValueAtTime(lpEnd, at + atk + dec);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(peak / Math.sqrt(det.length), at + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, at + atk + dec);
    f.connect(g);
    g.connect(pumped ? m.pump : m.out);
    for (const d of det) {
      const o = c.createOscillator();
      o.type = type;
      o.frequency.value = fr;
      o.detune.value = d;
      o.connect(f);
      o.start(at);
      o.stop(at + atk + dec + 0.05);
    }
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
  const kicks = sect === 2 || sect === 4;
  // respiro: a ogni quarto la parte armonica si abbassa e risale (la cassa "spinge" il resto)
  if ((kicks || sect === 1) && s % 4 === 0) {
    const gp = m.pump.gain;
    gp.setValueAtTime(sect === 1 ? 0.7 : 0.32, at);
    gp.linearRampToValueAtTime(1, at + 0.24);
  }
  // pad: tre voci a sega scordate, a inizio battuta; si apre da solo con un filtro che sale
  if (s === 0) ch.pad.forEach((fr) => tone(fr, "sawtooth", sect >= 4 ? 0.05 : 0.036, 0.05, sect >= 4 ? 3.2 : 1.9, 500, { wet: 0.5, det: [-9, 9], pumped: true, lpEnd: sect === 3 ? 600 : 1500 }));
  if (sect === 5) return;
  // cassa a quattro; nell'ingresso a metà, nello stacco ferma tranne l'ultimo quarto
  if (kicks && s % 4 === 0) kickAt(c, m.out, at, s % 8 === 0 ? 1 : 0.88);
  if (sect === 1 && s % 4 === 0) kickAt(c, m.out, at, 0.5);
  if (sect === 3 && bar === 10 && s >= 12 && s % 2 === 0) kickAt(c, m.out, at, 0.4 + (s - 12) * 0.1);
  // battito di mani sul 2 e sul 4; nello stacco un rullo che sale
  if (kicks && (s === 4 || s === 12)) {
    burst("bandpass", 1600, 0.8, 0.13, 0.12);
    burst("highpass", 3200, 0.7, 0.05, 0.09);
  }
  if (sect === 3 && bar === 10 && s >= 8) burst("bandpass", 1800, 0.9, 0.04 + (s - 8) * 0.012, 0.06);
  // controtempi: piatto aperto sull'«e», chiuso sui sedicesimi
  if (sect >= 1 && s % 4 === 2) burst("highpass", 7200, 0.7, 0.07, 0.1);
  else if (sect >= 1 && s % 2 === 1) burst("highpass", 8400, 0.7, sect === 2 ? 0.03 : 0.015, 0.03);
  // basso: sub sinusoidale più sega filtrata, sincopato; ottava sopra sull'ultimo colpo della battuta
  if (kicks && BASS.includes(s)) {
    const up = s === 14 ? 2 : 1;
    tone(ch.root * up, "sine", 0.2, 0.006, s === 8 ? 0.34 : 0.22, 700, { wet: 0 });
    tone(ch.root * up, "sawtooth", 0.07, 0.006, 0.2, 420, { wet: 0, lpEnd: 160 });
  }
  // stoccate d'accordo sull'«e» del 2 e del 4, dalla seconda strofa
  if (sect === 2 && bar >= 4 && (s === 6 || s === 14)) ch.pad.forEach((fr) => tone(fr * 2, "sawtooth", 0.034, 0.004, 0.16, 2600, { wet: 0.25, det: [-7, 7], pumped: true, lpEnd: 900 }));
  // arpeggio sui sedicesimi pari, nello stacco (leggero) e dalla terza battuta del pieno
  if ((sect === 3 || (sect === 2 && bar >= 6)) && s % 2 === 0) {
    const a = ch.pad[(s / 2) % 3];
    tone(a * 4, "triangle", 0.03, 0.003, 0.14, 4200, { wet: 0.35, echo: 0.25 });
  }
  // tema: sega scordata filtrata, pizzicata, con eco a croma puntata. Entra alla terza battuta, un'ottava sopra dopo lo stacco
  const mel = sect === 4 ? FIN : LEAD[(bar + 2) % 4];
  const mn = bar >= 2 ? mel[s] : undefined;
  if (mn !== undefined) {
    let nx = 16 - s;
    for (let j = s + 1; j < 16; j++) if (mel[j] !== undefined) { nx = j - s; break; }
    const dec = Math.min(0.7, Math.max(0.18, nx * 0.125 * 1.4));
    const fr = 440 * 2 ** (mn / 12);
    tone(fr, "sawtooth", 0.07, 0.006, dec, 3400, { wet: 0.4, echo: 0.45, det: [-8, 8], lpEnd: 1200 });
    tone(fr, "square", 0.02, 0.006, dec * 0.8, 2200, { wet: 0.3 });
    if (bar >= 11 && sect !== 4) tone(fr * 2, "sine", 0.035, 0.004, dec * 0.8, 4200, { wet: 0.4, echo: 0.3 });
    if (sect === 4) {
      tone(fr / 2, "sawtooth", 0.09, 0.004, dec + 0.4, 900, { wet: 0.3, det: [-6, 6] });
      tone(55, "sine", 0.3, 0.004, 1.6, 200, { wet: 0 });
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
