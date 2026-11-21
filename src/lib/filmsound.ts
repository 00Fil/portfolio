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
  /** Tocco: un piccolo colpo morbido (aria e un tonfo leggero), per i tasti e le comparse. Niente note: la melodia è della musica. */
  pluck(_deg = 0, vel = 1, _dec = 0) {
    const c = ac();
    if (!c || !bus || !noise) return;
    const t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = noise;
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 2400;
    f.Q.value = 0.9;
    const g = c.createGain();
    env(g, t, 0.05 * vel, 0.002, 0.05);
    s.connect(f).connect(g).connect(bus);
    s.start(t, Math.random());
    s.stop(t + 0.08);
    const o = c.createOscillator();
    const og = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(190, t);
    o.frequency.exponentialRampToValueAtTime(90, t + 0.06);
    env(og, t, 0.08 * vel, 0.002, 0.07);
    o.connect(og).connect(bus);
    o.start(t);
    o.stop(t + 0.1);
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
  /** Lo sbuffo di chi si è stufato di aspettare: «pff…», aria tra le labbra che scende e si spegne, con un filo di voce. */
  sigh(vel = 1) {
    const c = ac();
    if (!c || !bus || !noise) return;
    const t = c.currentTime;
    // la «p»: un piccolo colpo d'aria chiuso
    const p0 = c.createBufferSource();
    p0.buffer = noise;
    const pl = c.createBiquadFilter();
    pl.type = "lowpass";
    pl.frequency.value = 420;
    const pg = c.createGain();
    pg.gain.setValueAtTime(0.0001, t);
    pg.gain.linearRampToValueAtTime(0.5 * vel, t + 0.006);
    pg.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    p0.connect(pl).connect(pg).connect(bus);
    p0.start(t, 0.3);
    p0.stop(t + 0.1);
    // il soffio: rumore attraverso due formanti che scendono
    const s = c.createBufferSource();
    s.buffer = noise;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t + 0.02);
    g.gain.linearRampToValueAtTime(0.42 * vel, t + 0.12);
    g.gain.setValueAtTime(0.42 * vel, t + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);
    [
      [1500, 520, 1.4],
      [2600, 1300, 2.2],
    ].forEach(([a, b, q]) => {
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.Q.value = q;
      f.frequency.setValueAtTime(a, t);
      f.frequency.exponentialRampToValueAtTime(b, t + 1.1);
      s.connect(f).connect(g);
    });
    g.connect(bus);
    s.start(t + 0.02, 0.5);
    s.stop(t + 1.2);
    // un filo di voce sotto, che cala: «uff»
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(165, t + 0.1);
    o.frequency.exponentialRampToValueAtTime(105, t + 0.95);
    const vf = c.createBiquadFilter();
    vf.type = "bandpass";
    vf.frequency.value = 650;
    vf.Q.value = 3;
    const vg = c.createGain();
    vg.gain.setValueAtTime(0.0001, t + 0.1);
    vg.gain.linearRampToValueAtTime(0.05 * vel, t + 0.25);
    vg.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
    o.connect(vf).connect(vg).connect(bus);
    o.start(t + 0.1);
    o.stop(t + 1);
  },
  /** La firma: un respiro d'aria che sale e si apre in un accordo luminoso, lungo. */
  shine(vel = 1) {
    const c = ac();
    if (!c || !bus || !noise) return;
    const t = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = noise;
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 0.8;
    f.frequency.setValueAtTime(600, t);
    f.frequency.exponentialRampToValueAtTime(6000, t + 0.6);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12 * vel, t + 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    s.connect(f).connect(g).connect(bus);
    s.start(t);
    s.stop(t + 1.4);
    [72, 76, 79, 83, 88].forEach((m, i) => {
      const o = c.createOscillator();
      const og = c.createGain();
      o.type = "sine";
      o.frequency.value = 440 * 2 ** ((m - 69) / 12);
      og.gain.setValueAtTime(0.0001, t + 0.45 + i * 0.04);
      og.gain.linearRampToValueAtTime(0.035 * vel, t + 0.6 + i * 0.04);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
      o.connect(og).connect(bus!);
      o.start(t + 0.45);
      o.stop(t + 3.3);
    });
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
  chord(_degs: number[] = [], vel = 1) {
    // gli accordi li suona la musica: qui solo l'impatto
    this.kick(0.6 * vel);
  },
  /** Campanello di una notifica. */
  bell(_deg = 7, vel = 1) {
    this.pluck(0, vel);
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
 * Colonna sonora a 120 bpm (battuta = 2 s, sedicesimo = 0,125 s), costruita come quelle degli spot in motion graphics:
 * pad caldi, pianoforte, sub, pluck filtrati con il respiro della cassa, impatti e salite nei passaggi.
 * L'umore segue la scena che si sta guardando; il video lo chiede con cue(), e cambia sul battito successivo.
 *   calm   · la ricerca: piano e pad, sospeso
 *   doubt  · in fondo ai risultati: minore, pulsazione bassa, un orologio
 *   tense  · il sito lento: bordone, battito del cuore, ticchettio
 *   stop   · cliente perso: un colpo, poi solo la coda del riverbero
 *   rise   · il nuovo sito: maggiore, il piano accelera, sale
 *   drive  · veloce, costruito, ogni schermo: cassa dritta, basso che respira, melodia
 *   light  · lo cambi tu, l'AI ti consiglia: più leggero, piano in primo piano
 *   end    · accordo pieno che resta
 */
export type Mood = "calm" | "doubt" | "tense" | "stop" | "rise" | "drive" | "light" | "end";
const N = (m: number) => 440 * 2 ** ((m - 69) / 12);
type Chord = { notes: number[]; root: number };
const C = (root: number, ...notes: number[]): Chord => ({ root, notes });
const PROG: Record<"a" | "b" | "c", Chord[]> = {
  // calm: Fmaj7 Am7 Dm9 G6
  a: [C(41, 57, 60, 64, 65), C(45, 57, 60, 64, 67), C(38, 57, 60, 62, 65), C(43, 55, 59, 62, 64)],
  // doubt / tense: Dm Bb Gm A
  b: [C(38, 57, 62, 65), C(34, 58, 62, 65), C(43, 58, 62, 67), C(45, 57, 61, 64)],
  // nuovo sito: C G/B Am F
  c: [C(36, 60, 64, 67, 71), C(35, 59, 62, 67, 69), C(45, 60, 64, 67, 69), C(41, 60, 65, 69, 72)],
};
const GROUP: Record<Mood, "a" | "b" | "c"> = { calm: "a", doubt: "b", tense: "b", stop: "b", rise: "c", drive: "c", light: "c", end: "c" };
/** Melodia del nuovo sito, otto battute (nota MIDI per sedicesimo). */
const MEL: Record<number, number>[] = [
  { 0: 76, 3: 79, 6: 84, 10: 83, 12: 79 },
  { 0: 74, 3: 79, 6: 83, 10: 81, 12: 79 },
  { 0: 72, 3: 76, 6: 81, 10: 79, 12: 76 },
  { 0: 77, 3: 81, 6: 84, 10: 81, 12: 79 },
  { 0: 76, 2: 79, 4: 84, 8: 86, 12: 88 },
  { 0: 86, 4: 83, 8: 79, 12: 83, 14: 86 },
  { 0: 84, 4: 83, 6: 81, 10: 76 },
  { 0: 77, 2: 81, 4: 84, 12: 79 },
];

let cues: { beat: number; mood: Mood }[] = [];
/** Il video chiede un umore al tempo t (secondi del film): parte sul battito successivo. */
export function cue(mood: Mood, t: number) {
  const beat = Math.max(0, Math.ceil(t * 2 - 0.08));
  cues = cues.filter((q) => q.beat < beat).concat({ beat, mood });
}
export function resetCues() {
  cues = [];
}
const moodAt = (beat: number): { mood: Mood; since: number } => {
  let m: Mood = "calm";
  let since = 0;
  for (const q of cues) if (q.beat <= beat) (m = q.mood), (since = q.beat);
  return { mood: m, since };
};
/** Prima battuta del gruppo armonico in corso (per far ripartire il giro da capo quando cambia tonalità). */
const groupStart = (beat: number, g: "a" | "b" | "c") => {
  let st = 0;
  let prev: "a" | "b" | "c" | null = null;
  for (const q of cues) {
    if (q.beat > beat) break;
    const gg = GROUP[q.mood];
    if (gg !== prev) st = q.beat;
    prev = gg;
  }
  return prev === g ? st : 0;
};

type Mus = { out: GainNode; pump: GainNode; verb: ConvolverNode; echo: DelayNode };

function step(c: AudioContext, m: Mus, n: number, at: number) {
  const s = n % 16;
  const beat = Math.floor(n / 4);
  const { mood, since } = moodAt(beat);
  const g = GROUP[mood];
  const st = groupStart(beat, g);
  const bar = Math.max(0, Math.floor((beat - st) / 4));
  const ch = PROG[g][bar % 4];
  const fresh = beat === since && n % 4 === 0; // primo battito del nuovo umore

  const voice = (fr: number, type: OscillatorType, peak: number, atk: number, dec: number, lp: number, o2: { wet?: number; echo?: number; det?: number[]; pumped?: boolean; lpEnd?: number; when?: number } = {}) => {
    const { wet = 0.3, echo = 0, det = [0], pumped = false, lpEnd, when = 0 } = o2;
    const t = at + when;
    const gn = c.createGain();
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(lp, t);
    if (lpEnd) f.frequency.exponentialRampToValueAtTime(lpEnd, t + atk + dec);
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.linearRampToValueAtTime(peak / Math.sqrt(det.length), t + atk);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + atk + dec);
    f.connect(gn);
    gn.connect(pumped ? m.pump : m.out);
    for (const d of det) {
      const o = c.createOscillator();
      o.type = type;
      o.frequency.value = fr;
      o.detune.value = d;
      o.connect(f);
      o.start(t);
      o.stop(t + atk + dec + 0.05);
    }
    if (wet) {
      const w = c.createGain();
      w.gain.value = wet;
      gn.connect(w).connect(m.verb);
    }
    if (echo) {
      const e = c.createGain();
      e.gain.value = echo;
      gn.connect(e).connect(m.echo);
    }
  };
  const noiseHit = (type: BiquadFilterType, fr: number, q: number, peak: number, dec: number, when = 0) => {
    if (!noise) return;
    const t = at + when;
    const sn = c.createBufferSource();
    sn.buffer = noise;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = fr;
    f.Q.value = q;
    const gn = c.createGain();
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.linearRampToValueAtTime(peak, t + 0.002);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dec);
    sn.connect(f).connect(gn).connect(m.out);
    sn.start(t, Math.random() * 0.8);
    sn.stop(t + dec + 0.03);
  };
  /** Pianoforte: armoniche che si spengono a velocità diverse, attacco morbido. */
  const piano = (k: number, vel: number, dur = 1.6, when = 0) => {
    const fr = N(k);
    [
      [1, 1, 1],
      [2, 0.42, 0.6],
      [3, 0.18, 0.4],
      [4, 0.08, 0.28],
    ].forEach(([h, a, d]) => voice(fr * h, "sine", 0.07 * vel * a, 0.004, dur * d, 4200, { wet: 0.38, when }));
  };
  /** Pluck da spot: sega filtrata che si chiude subito, con il respiro della cassa e un'eco. */
  const pluck = (k: number, vel: number) => voice(N(k), "sawtooth", 0.07 * vel, 0.003, 0.32, 3400, { wet: 0.25, echo: 0.18, det: [-8, 8], pumped: true, lpEnd: 380 });
  const pad = (lp: number, lpEnd: number, peak = 0.026, pumped = false) =>
    ch.notes.forEach((k) => voice(N(k), "sawtooth", peak, 0.35, 2.1, lp, { wet: 0.55, det: [-10, 10], pumped, lpEnd }));
  const sub = (peak: number, dec: number, oct = 0) => voice(N(ch.root + 12 * oct), "sine", peak, 0.008, dec, 400, { wet: 0 });
  const pumpIt = (depth: number) => {
    const gp = m.pump.gain;
    gp.setValueAtTime(depth, at);
    gp.linearRampToValueAtTime(1, at + 0.26);
  };
  const impact = (v: number) => {
    kickAt(c, m.out, at, 1.1 * v);
    voice(N(28), "sine", 0.32 * v, 0.005, 1.6, 300, { wet: 0.2 });
    noiseHit("lowpass", 900, 0.6, 0.22 * v, 1.2);
    noiseHit("highpass", 4000, 0.5, 0.06 * v, 1.6);
  };

  if (mood === "end") {
    if (!fresh || beat !== since) return;
    impact(1);
    [36, 48, 55, 60, 64, 67, 71, 74].forEach((k, i) => (k < 50 ? voice(N(k), "sine", 0.2, 0.01, 4.5, 300, { wet: 0.4 }) : piano(k, 1.1, 4, i * 0.012)));
    PROG.c[0].notes.forEach((k) => voice(N(k), "sawtooth", 0.03, 0.4, 4.5, 1200, { wet: 0.7, det: [-10, 10], lpEnd: 400 }));
    return;
  }
  if (mood === "stop") {
    if (fresh) impact(1.2);
    return;
  }

  if (mood === "calm") {
    if (s === 0) {
      pad(700, 1100, 0.022);
      ch.notes.forEach((k, i) => piano(k, 0.9, 2.2, i * 0.025));
      sub(0.12, 1.8, 1);
    }
    if (s === 8) piano(ch.notes[ch.notes.length - 1] + 12, 0.6, 1.2);
    if (s === 12) piano(ch.notes[1] + 12, 0.45, 1);
    return;
  }

  if (mood === "doubt" || mood === "tense") {
    const tense = mood === "tense";
    if (s === 0) {
      pad(tense ? 500 : 650, tense ? 380 : 800, 0.026);
      sub(0.16, 1.9);
      if (tense) voice(N(ch.root + 12), "sawtooth", 0.05, 0.6, 1.8, 260, { wet: 0.3, det: [-14, 14], lpEnd: 520 }); // bordone che si apre
    }
    // pulsazione bassa a ottavi, chiusa
    if (s % 2 === 0) voice(N(ch.root + 12), "sawtooth", tense ? 0.05 : 0.04, 0.004, 0.16, 340, { wet: 0.05, lpEnd: 140 });
    // orologio: un colpetto secco su ogni battito, più fitto quando cresce la tensione
    if (s % 4 === 0 || (tense && s % 2 === 0)) noiseHit("bandpass", tense ? 3800 : 3000, 6, tense ? 0.05 : 0.035, 0.03);
    // cuore: due colpi
    if (tense && (s === 0 || s === 3)) kickAt(c, m.out, at, s === 0 ? 0.75 : 0.5);
    if (!tense && s === 0) kickAt(c, m.out, at, 0.45);
    if (!tense && s === 8) piano(ch.notes[2] + 12, 0.5, 1.4);
    return;
  }

  // gruppo del nuovo sito
  if (mood === "rise") {
    if (fresh) impact(0.6);
    if (s === 0) pad(900, 2400, 0.024);
    // il piano ribatte l'accordo a ottavi e cresce
    if (s % 2 === 0) ch.notes.forEach((k, i) => piano(k + 12, 0.35 + 0.08 * (s / 2) + 0.15 * bar, 0.5, i * 0.008));
    if (s === 0) sub(0.15, 1.6);
    if (bar >= 1 && s % 4 === 0) kickAt(c, m.out, at, 0.7);
    if (s === 12) noiseHit("highpass", 2000, 0.6, 0.05, 0.5);
    return;
  }

  const drive = mood === "drive";
  if (fresh && drive) impact(0.8);
  if (s === 0) pad(drive ? 1100 : 900, drive ? 2600 : 1800, 0.026, true);
  if (s % 4 === 0 && (drive || s % 8 === 0)) {
    pumpIt(drive ? 0.3 : 0.55);
    kickAt(c, m.out, at, s === 0 ? 1 : 0.85);
  }
  if (drive && (s === 4 || s === 12)) {
    noiseHit("bandpass", 1500, 0.8, 0.12, 0.13);
    noiseHit("highpass", 3200, 0.7, 0.05, 0.1);
  }
  if (s % 4 === 2) noiseHit("highpass", 7600, 0.7, drive ? 0.06 : 0.04, 0.09);
  else if (drive && s % 2 === 1) noiseHit("highpass", 9000, 0.7, 0.018, 0.03);
  // basso che respira: sul controtempo
  if (s % 4 === 2) {
    voice(N(ch.root + 12), "sine", 0.17, 0.006, 0.22, 600, { wet: 0 });
    voice(N(ch.root + 12), "sawtooth", 0.05, 0.006, 0.2, 700, { wet: 0, lpEnd: 180 });
  }
  const mel = MEL[bar % 8][s];
  if (mel !== undefined) {
    if (drive) pluck(mel, 1);
    else piano(mel, 0.9, 1.2);
  }
  if (!drive && s === 0) ch.notes.forEach((k, i) => piano(k, 0.5, 1.8, i * 0.02));
  if (s === 0 && bar % 4 === 0) noiseHit("highpass", 5200, 0.5, 0.08, 1.4);
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
