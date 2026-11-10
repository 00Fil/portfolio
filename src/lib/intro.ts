/** Secondi che mancano alla fine della schermata di caricamento (0 se non c'è o è già finita). */
export function introDelay(): number {
  if (typeof window === "undefined") return 0;
  const end = (window as unknown as { __introEnd?: number }).__introEnd ?? 0;
  return Math.max(0, (end - performance.now()) / 1000);
}

/**
 * Esegue `cb` quando la schermata d'apertura è finita (subito, se non c'è).
 * Restituisce la funzione per annullare: va bene come ritorno di useEffect.
 */
export function afterIntro(cb: () => void, extraMs = 0): () => void {
  if (typeof window === "undefined") return () => {};
  let t = 0;
  const run = () => void (t = window.setTimeout(cb, extraMs));
  if (!introPending()) {
    run();
    return () => window.clearTimeout(t);
  }
  window.addEventListener("intro:done", run, { once: true });
  return () => {
    window.removeEventListener("intro:done", run);
    window.clearTimeout(t);
  };
}

/** Come afterIntro, ma scatta quando il telo inizia ad alzarsi: per le animazioni d'ingresso della pagina. */
export function onIntroLift(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const d = document.documentElement.dataset;
  if (!introPending() || d.lift) {
    cb();
    return () => {};
  }
  window.addEventListener("intro:lift", cb, { once: true });
  return () => window.removeEventListener("intro:lift", cb);
}

/** Vero finché c'è un telo d'apertura (il nome alla prima visita, o la copertura breve alle successive). */
export function introPending(): boolean {
  const v = document.documentElement.dataset.intro;
  return v === "run" || v === "quick";
}

const idle = (timeout: number) =>
  new Promise<void>((r) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(() => r(), { timeout }) : setTimeout(r, 50)));
const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/**
 * Si risolve quando la pagina ha finito il lavoro pesante dell'avvio: idratazione, misure di ScrollTrigger
 * al caricamento, primi contesti WebGL. Si aspetta che il thread principale torni libero due volte di fila,
 * così le animazioni d'ingresso partono su un thread scarico e non scattano.
 */
export function settled(): Promise<void> {
  const load = new Promise<void>((r) => (document.readyState === "complete" ? r() : window.addEventListener("load", () => r(), { once: true })));
  return load
    .then(frame)
    .then(() => idle(500))
    .then(frame)
    .then(() => idle(300))
    .then(frame);
}
