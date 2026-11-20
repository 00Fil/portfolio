import { soundOn } from "./sound";

/**
 * Colonna sonora del video: La minore e un solo tempo (120 bpm), così ogni suono cade sul ritmo e suona bene
 * con gli altri. Si sente solo con l'audio del sito attivo.
 * Tema di Grieg «Nella sala del re della montagna» (pubblico dominio), che tutti riconoscono, su base elettronica
 * scura: pad a sega, basso sincopato con sub, cassa a quattro che fa "respirare" il resto, colpo finale su La.
 */
let ctx: AudioContext | null = null;
let muted = false;
/** Per i film dentro le schede: niente suono, anche se è acceso. */
export const filmMute = (m: boolean) => void (muted = m);
let bus: GainNode | null = null;
let noise: AudioBuffer | null = null;

const PENT = [0, 3, 5, 7, 10];
/** Frequenza del grado d della scala (5 gradi per ottava). */
export const fq = (d: number, base = 220) => base * 2 ** ((PENT[((d % 5) + 5) % 5] + 12 * Math.floor(d / 5)) / 12);

function ac() {
  if (!soundOn() || muted) return null;
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
    resetCues();
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

/*
 * Colonna sonora a 120 bpm, sedicesimi da 0,125 s, una battuta = 2 s. Due tempi, come il racconto:
 *  A · il problema: La minore (Am F Dm E), pulsazione trattenuta, cassa a metà tempo, un tema che scende;
 *  stacco · il cliente perso: solo il pad, sospeso;
 *  B · il nuovo sito: Do maggiore (C G Am F), cassa dritta, battiti di mani, arpeggio e una melodia piena di otto battute;
 *  fine · un accordo di Do che resta nell'aria.
 * I passaggi tra le parti li decide il video con fx.cue(): cadono sempre a inizio battuta.
 */
const N = (m: number) => 440 * 2 ** ((m - 69) / 12); // nota MIDI → Hz
type Chord = { notes: number[]; root: number };
const A_CH: Chord[] = [
  { notes: [57, 60, 64], root: 45 }, // Am
  { notes: [57, 60, 65], root: 41 }, // F
  { notes: [57, 62, 65], root: 38 }, // Dm
  { notes: [56, 59, 64], root: 40 }, // E
];
const B_CH: Chord[] = [
  { notes: [60, 64, 67, 71], root: 36 }, // Cmaj7
  { notes: [59, 62, 67, 69], root: 43 }, // G(add9)
  { notes: [57, 60, 64, 67], root: 45 }, // Am7
  { notes: [57, 60, 65, 69], root: 41 }, // F
];
/** Tema del problema: poche note, scende. Chiave = sedicesimo, valore = nota MIDI. */
const A_MEL: Record<number, number>[] = [
  { 0: 69, 6: 72, 8: 76, 12: 74 },
  { 0: 72, 4: 69, 8: 65 },
  { 0: 74, 6: 72, 8: 69, 12: 67 },
  { 0: 68, 4: 71, 8: 64 },
];
/** Melodia del nuovo sito: otto battute, domanda e risposta. */
const B_MEL: Record<number, number>[] = [
  { 0: 76, 4: 79, 6: 84, 10: 83, 12: 79 },
  { 0: 74, 4: 79, 6: 83, 10: 81, 12: 79 },
  { 0: 72, 4: 76, 6: 81, 10: 79, 12: 76 },
  { 0: 77, 4: 81, 6: 84, 10: 81, 12: 79 },
  { 0: 76, 2: 79, 4: 84, 8: 86, 12: 88 },
  { 0: 86, 4: 83, 8: 79, 12: 83, 14: 86 },
  { 0: 84, 4: 83, 6: 81, 10: 76 },
  { 0: 77, 2: 81, 4: 84, 12: 79 },
];
/** Arpeggio a sedicesimi: indici nelle note dell'accordo (un'ottava sopra). */
const ARP = [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 2, 1, 3];

const cues = { stop: Infinity, drop: Infinity, end: Infinity };
export function cue(k: keyof typeof cues, t: number) {
  // la parte cambia alla battuta successiva (o a questa, se è appena iniziata)
  cues[k] = Math.max(0, Math.ceil(t / 2 - 0.12));
}
export function resetCues() {
  cues.stop = cues.drop = cues.end = Infinity;
}

type Mus = { out: GainNode; pump: GainNode; verb: ConvolverNode; echo: DelayNode };

function step(c: AudioContext, m: Mus, n: number, at: number) {
  const s = n % 16;
  const bar = Math.floor(n / 16);
  const sect = bar >= cues.end ? "end" : bar >= cues.drop ? "b" : bar >= cues.stop ? "stop" : "a";
  if (sect === "end" && (bar > cues.end || s)) return;
  const bb = bar - (Number.isFinite(cues.drop) ? cues.drop : 0); // battute dall'inizio di B
  const ch = sect === "a" ? A_CH[bar % 4] : sect === "stop" ? A_CH[0] : sect === "end" ? B_CH[0] : B_CH[bb % 4];
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
  const lead = (mel: Record<number, number>, peak: number, bright: boolean) => {
    const mn = mel[s];
    if (mn === undefined) return;
    let nx = 16 - s;
    for (let j = s + 1; j < 16; j++)
      if (mel[j] !== undefined) {
        nx = j - s;
        break;
      }
    const dec = Math.min(0.9, Math.max(0.2, nx * 0.125 * 0.9));
    const fr = N(mn);
    tone(fr, "sawtooth", peak, 0.01, dec, bright ? 2600 : 1500, { wet: 0.35, echo: 0.2, det: [-7, 7], lpEnd: bright ? 900 : 600 });
    tone(fr, "triangle", peak * 0.6, 0.006, dec, 3000, { wet: 0.3 });
  };

  /* fine: un accordo pieno che resta */
  if (sect === "end") {
    [36, 48, 60, 64, 67, 71, 74].forEach((k) => tone(N(k), k < 50 ? "sine" : "sawtooth", k < 50 ? 0.22 : 0.05, 0.02, 4.5, 1800, { wet: 0.6, det: k < 50 ? [0] : [-8, 8], lpEnd: 500 }));
    kickAt(c, m.out, at, 1);
    burst("highpass", 5000, 0.5, 0.12, 1.4);
    return;
  }

  /* pad: a inizio battuta, sempre */
  if (s === 0)
    ch.notes.forEach((k) =>
      tone(N(k), "sawtooth", sect === "b" ? 0.032 : 0.03, sect === "stop" ? 0.6 : 0.08, sect === "stop" ? 2.6 : 1.9, 500, { wet: 0.55, det: [-9, 9], pumped: sect === "b", lpEnd: sect === "b" ? 1700 : 900 }),
    );
  if (sect === "stop") {
    // sospeso: solo il pad e un battito lontano
    if (s === 0) tone(N(33), "sine", 0.16, 0.01, 1.2, 200, { wet: 0 });
    return;
  }

  if (sect === "a") {
    // cuore che batte: cassa sull'1 e sull'«e» del 2
    if (s === 0 || s === 6) kickAt(c, m.out, at, s === 0 ? 0.8 : 0.5);
    if (s % 4 === 2) burst("highpass", 8000, 0.7, 0.025, 0.04);
    // pulsazione a ottavi sulla fondamentale, chiusa
    if (s % 2 === 0) tone(N(ch.root + 12), "sawtooth", 0.06, 0.004, 0.18, 380, { wet: 0.1, lpEnd: 160 });
    if (s === 0) tone(N(ch.root), "sine", 0.18, 0.01, 1.6, 300, { wet: 0 });
    if (bar >= 2) lead(A_MEL[bar % 4], 0.07, false);
    return;
  }

  /* B: il nuovo sito */
  if (s % 4 === 0) {
    const gp = m.pump.gain;
    gp.setValueAtTime(0.35, at);
    gp.linearRampToValueAtTime(1, at + 0.24);
    kickAt(c, m.out, at, s === 0 ? 1 : 0.88);
  }
  if (s === 4 || s === 12) {
    burst("bandpass", 1600, 0.8, 0.13, 0.12);
    burst("highpass", 3200, 0.7, 0.05, 0.09);
  }
  if (s % 4 === 2) burst("highpass", 7200, 0.7, 0.07, 0.1);
  else if (s % 2 === 1) burst("highpass", 8400, 0.7, 0.025, 0.03);
  // basso a ottavi, con l'ottava sull'«e»
  if (s % 2 === 0) {
    const up = s % 4 === 2 ? 2 : 1;
    tone(N(ch.root) * up, "sine", 0.18, 0.006, 0.2, 700, { wet: 0 });
    tone(N(ch.root) * up, "sawtooth", 0.06, 0.006, 0.18, 500, { wet: 0, lpEnd: 160 });
  }
  // arpeggio a sedicesimi, morbido, dalla seconda battuta
  if (bb >= 1) tone(N(ch.notes[ARP[s] % ch.notes.length] + 12), "square", 0.018, 0.004, 0.12, 2400, { wet: 0.3, echo: 0.12, pumped: true });
  // melodia: otto battute; al secondo giro raddoppiata all'ottava
  lead(B_MEL[bb % 8], 0.085, true);
  if (bb >= 8 && B_MEL[bb % 8][s] !== undefined) tone(N(B_MEL[bb % 8][s] + 12), "triangle", 0.03, 0.006, 0.3, 3200, { wet: 0.4, echo: 0.15 });
  // piatto all'inizio di ogni frase
  if (s === 0 && bb % 4 === 0) burst("highpass", 5200, 0.5, 0.1, 1.2);
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
