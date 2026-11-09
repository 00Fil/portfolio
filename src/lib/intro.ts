/** Secondi che mancano alla fine della schermata di caricamento (0 se non c'è o è già finita). */
export function introDelay(): number {
  if (typeof window === "undefined") return 0;
  const end = (window as unknown as { __introEnd?: number }).__introEnd ?? 0;
  return Math.max(0, (end - performance.now()) / 1000);
}
