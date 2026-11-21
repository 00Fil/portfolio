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

/* Effetti del film: suoni disegnati a parte (scripts/film-sfx.py) e caricati una volta. Se non sono ancora pronti, si tace. */
const SFX = ["click", "key1", "key2", "key3", "pop", "swoosh-up", "swoosh-down", "chime", "glass", "thump", "thump-big", "riser", "shine", "sigh"] as const;
type SfxName = (typeof SFX)[number];
const sfxBuf: Partial<Record<SfxName, AudioBuffer>> = {};
let sfxLoading = false;
function loadSfx(c: AudioContext) {
  if (sfxLoading) return;
  sfxLoading = true;
  SFX.forEach((n) =>
    fetch(`/sfx/film/${n}.mp3`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
      .then((a) => c.decodeAudioData(a))
      .then((b) => void (sfxBuf[n] = b))
      .catch(() => {}),
  );
}
let lastKey = 0;
function play(n: SfxName, vel = 1, rate = 1, pan = 0) {
  const c = ac();
  if (!c || !bus) return;
  loadSfx(c);
  const b = sfxBuf[n];
  if (!b) return;
  const s = c.createBufferSource();
  s.buffer = b;
  s.playbackRate.value = rate;
  const g = c.createGain();
  g.gain.value = Math.min(1.4, vel);
  const p = c.createStereoPanner();
  p.pan.value = pan;
  s.connect(g).connect(p).connect(bus);
  s.start();
}

export const fx = {
  /** Tasto: per la scrittura (tre tasti diversi, mai due uguali di fila). */
  pluck(_deg = 0, vel = 1, _dec = 0) {
    lastKey = (lastKey + 1 + Math.floor(Math.random() * 2)) % 3;
    play((["key1", "key2", "key3"] as const)[lastKey], 0.55 * vel, 0.96 + Math.random() * 0.08, (Math.random() - 0.5) * 0.3);
  },
  /** Colpo profondo e morbido. */
  kick(vel = 1) {
    play("thump", 0.8 * vel);
  },
  /** Aria che passa, accompagna un movimento. */
  whoosh(dur = 0.55, up = true, vel = 1) {
    play(up ? "swoosh-up" : "swoosh-down", 0.7 * vel, Math.max(0.7, Math.min(1.4, 0.55 / dur)));
  },
  /** Lo sbuffo di chi si è stufato. */
  sigh(vel = 1) {
    play("sigh", vel);
  },
  /** La firma: un respiro luminoso. */
  shine(vel = 1) {
    play("shine", 0.9 * vel);
  },
  /** Salita prima di un colpo. */
  riser(dur = 1.6) {
    play("riser", 0.8, Math.max(0.7, Math.min(1.4, 1.6 / dur)));
  },
  /** Conferma. */
  chord(_degs: number[] = [], vel = 1) {
    play("chime", 0.7 * vel);
  },
  /** Comparsa. */
  bell(_deg = 7, vel = 1) {
    play("pop", 0.6 * vel);
  },
  /** Clic. */
  tick(vel = 1) {
    play("click", 0.65 * vel);
  },
  /** Una pagina che appare. */
  glass(vel = 1) {
    play("glass", 0.6 * vel);
  },
  /** Stacco forte. */
  boom(vel = 1) {
    play("thump-big", vel);
  },
  sync(t: number, run: boolean) {
    if (!run) return;
    const c = ac();
    if (!c || !bus) return;
    // c'è il brano prodotto: suona quello, agganciato al tempo del video (i suoni d'effetto restano sopra)
    if (useTrack(c)) {
      if (trackSrc && Math.abs(c.currentTime - trackT0 - t) > 0.12) stopTrack();
      if (!trackSrc && trackBuf && t < trackBuf.duration) startTrack(c, t);
      return;
    }
    const m = music(c);
    const STEP = 60 / BPM / 4;
    let n = Math.max(last + 1, Math.floor((t - 0.04) / STEP) + 1);
    if (t < lastT - 0.3) n = Math.floor(t / STEP) + 1;
    lastT = t;
    for (; n * STEP < t + 0.18; n++) {
      last = n;
      const at = c.currentTime + Math.max(0, n * STEP - t);
      step(c, m, n, at);
    }
  },
  /** Scarica il brano prima che parta il film: la prima parola non deve perdersi. */
  preload() {
    const c = ac();
    if (c) useTrack(c);
  },
  /** Il brano è pronto (o non serve): il film può partire. */
  ready() {
    if (!soundOn() || muted) return true;
    return !!trackBuf || trackMissing;
  },
  /** Finito il film: una musica chill, in loop, resta sotto la pagina. */
  chill(on: boolean) {
    const c = ac();
    if (!c || !bus) return;
    if (!on) {
      stopChill();
      return;
    }
    if (chillSrc) return;
    const go = (b: AudioBuffer) => {
      if (chillSrc || !bus) return;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.linearRampToValueAtTime(0.42, c.currentTime + 2.4);
      const src = c.createBufferSource();
      src.buffer = b;
      src.loop = true;
      src.connect(g).connect(bus);
      src.start();
      chillSrc = src;
      chillGain = g;
    };
    if (chillBuf) return go(chillBuf);
    fetch("/sfx/chill.mp3")
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
      .then((a) => c.decodeAudioData(a))
      .then((b) => {
        chillBuf = b;
        if (chillWant) go(b);
      })
      .catch(() => {});
    chillWant = true;
  },
  /** Riporta la base all'inizio (nuova riproduzione). */
  reset() {
    stopChill();
    stopTrack();
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
    if (on) stopTrack();
    if (!ctx || !mbus) return;
    const t = ctx.currentTime;
    mbus.gain.cancelScheduledValues(t);
    mbus.gain.linearRampToValueAtTime(on ? 0.0001 : 0.5, t + 0.2);
  },
};

/* Il brano vero del film (generato e prodotto fuori): se il file c'è, sostituisce la musica sintetizzata. */
/** in italiano il brano ha anche la voce narrante (Antonio Farina, ElevenLabs), mixata sopra la musica */
const trackUrl = () => (typeof document !== "undefined" && document.documentElement.lang === "it" ? "/sfx/film-web-it.mp3" : "/sfx/film-web.mp3");
let trackBuf: AudioBuffer | null = null;
let trackLoading = false;
let trackMissing = false;
let trackSrc: AudioBufferSourceNode | null = null;
let trackT0 = 0;
function useTrack(c: AudioContext) {
  if (trackBuf) return true;
  if (!trackLoading && !trackMissing) {
    trackLoading = true;
    fetch(trackUrl())
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
      .then((a) => c.decodeAudioData(a))
      .then((b) => void (trackBuf = b))
      .catch(() => void (trackMissing = true))
      .finally(() => void (trackLoading = false));
  }
  return trackLoading && !trackMissing ? true : false;
}
function startTrack(c: AudioContext, t: number) {
  if (!trackBuf || !bus) return;
  const s = c.createBufferSource();
  s.buffer = trackBuf;
  const g = c.createGain();
  // di sottofondo: dà il ritmo, gli effetti stanno sopra
  g.gain.value = 0.5;
  s.connect(g).connect(bus);
  s.start(c.currentTime + 0.02, Math.max(0, t));
  trackSrc = s;
  trackT0 = c.currentTime + 0.02 - t;
}
function stopTrack() {
  try {
    trackSrc?.stop();
  } catch {
    /* già fermo */
  }
  trackSrc = null;
}

let chillBuf: AudioBuffer | null = null;
let chillSrc: AudioBufferSourceNode | null = null;
let chillGain: GainNode | null = null;
let chillWant = false;
function stopChill() {
  chillWant = false;
  const c = ctx;
  if (!chillSrc || !c || !chillGain) {
    chillSrc = null;
    return;
  }
  const s = chillSrc;
  chillGain.gain.cancelScheduledValues(c.currentTime);
  chillGain.gain.setValueAtTime(chillGain.gain.value, c.currentTime);
  chillGain.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.6);
  window.setTimeout(() => {
    try {
      s.stop();
    } catch {
      /* già fermo */
    }
  }, 700);
  chillSrc = null;
}

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
/** Tempo del film: musica, tagli e movimenti cadono su questa griglia. */
export const BPM = 128;
export type Mood = "calm" | "doubt" | "tense" | "stop" | "rise" | "drive" | "light" | "end";
const N = (m: number) => 440 * 2 ** ((m - 69) / 12);
type Chord = { notes: number[]; root: number };
const C = (root: number, ...notes: number[]): Chord => ({ root, notes });
/*
 * Il tema è l'«Inno alla gioia» di Beethoven (Nona sinfonia, 1824, pubblico dominio): lo conoscono tutti, si canta da solo.
 * Nella parte del problema va in minore (stesse note, il Fa# diventa Fa), nel nuovo sito torna maggiore.
 * Sempre a due voci: la nota e la sua terza sotto. Giro: D A D A D A G D.
 */
const D_ = (m: boolean) => (m ? [62, 65, 69] : [62, 66, 69]);
const A_ = [61, 64, 69];
const G_ = (m: boolean) => (m ? [62, 67, 70] : [62, 67, 71]);
const prog = (m: boolean): Chord[] => [C(26, ...D_(m)), C(33, ...A_), C(26, ...D_(m)), C(33, ...A_), C(26, ...D_(m)), C(33, ...A_), C(31, ...G_(m)), C(26, ...D_(m))];
const PROG: Record<"a" | "b" | "c", Chord[]> = { a: prog(false), b: prog(true), c: prog(false) };
const GROUP: Record<Mood, "a" | "b" | "c"> = { calm: "a", doubt: "b", tense: "b", stop: "b", rise: "c", drive: "c", light: "c", end: "c" };
/** Le otto battute del tema (sedicesimo → nota, in Re maggiore). */
const ODE: Record<number, number>[] = [
  { 0: 78, 4: 78, 8: 79, 12: 81 },
  { 0: 81, 4: 79, 8: 78, 12: 76 },
  { 0: 74, 4: 74, 8: 76, 12: 78 },
  { 0: 78, 6: 76, 8: 76 },
  { 0: 78, 4: 78, 8: 79, 12: 81 },
  { 0: 81, 4: 79, 8: 78, 12: 76 },
  { 0: 74, 4: 74, 8: 76, 12: 78 },
  { 0: 76, 6: 74, 8: 74 },
];
/** terza sotto, nella scala del momento */
const THIRD: Record<number, [number, number]> = { 81: [78, 77], 79: [76, 76], 78: [74, 74], 77: [74, 74], 76: [73, 72], 74: [71, 70] };
function melAt(minor: boolean, bar: number, s: number): [number, number] | null {
  let k = ODE[bar % 8][s];
  if (k === undefined) return null;
  if (minor && k === 78) k = 77;
  const t = THIRD[k];
  return [k, minor ? t[1] : t[0]];
}

let cues: { beat: number; mood: Mood }[] = [];
/** Il video chiede un umore al tempo t (secondi del film): parte sul battito successivo. */
export function cue(mood: Mood, t: number) {
  const beat = Math.max(0, Math.ceil(t / (60 / BPM) - 0.08));
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
  const ch = PROG[g][bar % 8];
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
  const pluck = (k: number, vel: number) => voice(N(k), "sawtooth", 0.06 * vel, 0.004, 0.38, 3000, { wet: 0.3, echo: 0.18, det: [-12, 0, 12], pumped: true, lpEnd: 500 });
  /** la melodia a due voci: nota e terza sotto, mai una nota sola */
  const duet = (minor: boolean, how: "piano" | "pluck" | "both", vel = 1) => {
    const m = melAt(minor, bar, s);
    if (!m) return;
    const long = s === 8 && (bar % 4 === 3) ? 1.4 : 0.55;
    if (how !== "pluck") m.forEach((k, i) => piano(k, (i ? 0.55 : 0.8) * vel, long, i * 0.006));
    if (how !== "piano") m.forEach((k, i) => pluck(k, (i ? 0.6 : 0.85) * vel));
  };
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
    piano(74, 0.8, 4, 0.05);
    piano(69, 0.6, 4, 0.06);
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
    duet(false, "piano", 0.7);
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
    if (s === 0 || s === 8) duet(true, "piano", tense ? 0.55 : 0.65);
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
    duet(false, "piano", 0.8);
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
  duet(false, drive ? "both" : "piano", drive ? 1 : 0.9);
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
