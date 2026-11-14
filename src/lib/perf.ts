/**
 * Livello di prestazioni del dispositivo. "low" spegne ciò che costa a ogni fotogramma e non cambia il contenuto:
 * sfocature di sfondo, shader animati, scorrimento addolcito. Lo decide lo script in testa (memoria, processore,
 * risparmio dati) e, se serve, una misura dei fotogrammi veri a pagina avviata.
 */
const isBrowser = typeof window !== "undefined";
let low = isBrowser && document.documentElement.dataset.perf === "low";
const subs = new Set<() => void>();

export const isLow = () => low;

/** Chiama `cb` quando il dispositivo viene riconosciuto lento (subito, se lo è già). */
export function onLow(cb: () => void) {
  if (low) {
    cb();
    return () => {};
  }
  subs.add(cb);
  return () => void subs.delete(cb);
}

export function setLow() {
  if (low || !isBrowser) return;
  low = true;
  document.documentElement.dataset.perf = "low";
  try {
    sessionStorage.setItem("perf", "low");
  } catch {
    /* niente */
  }
  subs.forEach((f) => f());
  subs.clear();
}

/**
 * Misura i fotogrammi reali: se la mediana supera `limit` ms il dispositivo passa a "low".
 * Si usa due volte: a pagina ferma dopo l'avvio e al primo scorrimento.
 */
export function probe(frames = 50, limit = 30) {
  if (low || !isBrowser) return;
  try {
    // per le prove: sessionStorage.perf = "high" tiene il livello pieno
    if (sessionStorage.getItem("perf") === "high") return;
  } catch {
    /* niente */
  }
  const d: number[] = [];
  let last = 0;
  const f = (t: number) => {
    if (low) return;
    if (document.hidden) {
      last = 0;
      d.length = 0;
    } else if (last) d.push(t - last);
    last = t;
    if (d.length < frames) requestAnimationFrame(f);
    else {
      d.sort((a, b) => a - b);
      if (d[Math.floor(d.length / 2)] > limit) setLow();
    }
  };
  requestAnimationFrame(f);
}
