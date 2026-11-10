"use client";

/*
 * Cambi d'ambiente (tema, lingua): un velo del colore della pagina copre il lavoro pesante
 * (ridisegno dei fondali WebGL, nuova pagina nell'altra lingua) e si toglie quando tutto è pronto.
 * Lo stato vive nel modulo, quindi sopravvive al rimontaggio dell'albero quando cambia la lingua.
 */

export type ShiftPhase = "off" | "in" | "hold" | "out";
type State = { phase: ShiftPhase; label: string; lang?: string };

export const SHIFT_LABEL: Record<string, string> = {
  it: "Prepariamo la tua esperienza",
  en: "Preparing your experience",
};

const FADE_IN = 240;
const FADE_OUT = 420;
const MIN_HOLD = 520;
const MAX_LANG_WAIT = 6000;

let state: State = { phase: "off", label: "" };
let since = 0;
const subs = new Set<() => void>();
const set = (s: Partial<State>) => {
  state = { ...state, ...s };
  subs.forEach((f) => f());
};

export const shiftStore = {
  subscribe: (f: () => void) => {
    subs.add(f);
    return () => void subs.delete(f);
  },
  get: () => state,
  server: () => state,
};

export const shifting = () => state.phase !== "off";

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
const idle = (timeout: number) =>
  new Promise<void>((r) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(() => r(), { timeout }) : window.setTimeout(r, 60)));

/** Aspetta che la pagina abbia ridisegnato tutto e che il thread principale sia di nuovo libero. */
async function settle() {
  await frame();
  await frame();
  await idle(500);
  await frame();
  const left = MIN_HOLD - (performance.now() - since);
  if (left > 0) await wait(left);
}

async function close() {
  await settle();
  set({ phase: "out" });
  await wait(FADE_OUT);
  set({ phase: "off", lang: undefined });
}

async function open(label: string) {
  if (state.phase !== "off") return false;
  since = performance.now();
  set({ phase: "in", label });
  await frame();
  await wait(FADE_IN);
  set({ phase: "hold" });
  return true;
}

/** Copre, esegue `work` (il cambio vero e proprio), aspetta il ridisegno e scopre. */
export async function shift(work: () => void, locale: string) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return work();
  if (!(await open(SHIFT_LABEL[locale] ?? SHIFT_LABEL.it))) return work();
  work();
  await close();
}

/**
 * Cambio di lingua: copre con la frase nella lingua d'arrivo e naviga.
 * La nuova pagina rimonta il velo e lo chiude da sé (`landed`), quando la lingua del documento è quella giusta.
 */
export async function shiftLocale(target: string, go: () => void) {
  try {
    localStorage.setItem("lang", target);
  } catch {
    /* niente */
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !(await open(SHIFT_LABEL[target] ?? SHIFT_LABEL.it))) return go();
  set({ lang: target });
  go();
  // se la navigazione non arriva, il velo non resta su per sempre
  window.setTimeout(() => state.lang === target && state.phase === "hold" && void close(), MAX_LANG_WAIT);
}

/** Chiamata dal velo quando la pagina nella nuova lingua è montata. */
export function landed(lang: string) {
  if (state.phase === "hold" && state.lang === lang) {
    set({ lang: undefined });
    void close();
  }
}
