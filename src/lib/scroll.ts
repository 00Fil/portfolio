import type Lenis from "lenis";

/** Lenis condiviso: la barra lo usa per scorrere alle sezioni. Senza Lenis (reduced motion) si usa lo scroll nativo. */
let lenis: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  lenis = l;
};
export const getLenis = () => lenis;

export function scrollToY(y: number, onComplete?: () => void) {
  if (lenis) {
    lenis.scrollTo(y, {
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      onComplete: () => onComplete?.(),
    });
  } else {
    // senza Lenis (dispositivi lenti, movimento ridotto) scorre il sistema: morbido dove è permesso
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    if (reduce) onComplete?.();
    else window.setTimeout(() => onComplete?.(), 700);
  }
}
