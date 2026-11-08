export const isBrowser = typeof window !== "undefined";

export const prefersReducedMotion = () =>
  isBrowser && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Rifrazione dentro backdrop-filter: solo Chromium. */
export const supportsBackdropLens = () => {
  if (!isBrowser) return false;
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
  return !!brands?.some((b) => /Chromium/i.test(b.brand));
};

/** Filtri SVG su elementi HTML (la bolla che rifrange la barra): Chromium e Firefox. Safari escluso. */
export const supportsElementLens = () => {
  if (!isBrowser) return false;
  const ua = navigator.userAgent;
  const safari = /Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\/|Firefox\//.test(ua);
  return !safari;
};

export const vibrate = (ms = 8) => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* non disponibile */
  }
};

export function lerpColor(a: [number, number, number], b: [number, number, number], t: number) {
  const k = Math.min(1, Math.max(0, t));
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)}, ${Math.round(a[1] + (b[1] - a[1]) * k)}, ${Math.round(a[2] + (b[2] - a[2]) * k)})`;
}

export const INK_2: [number, number, number] = [0xa6, 0xa6, 0xa1];
export const ACCENT: [number, number, number] = [0x2f, 0x5f, 0xff];
export const ON_SUBTLE: [number, number, number] = [0xb4, 0xd2, 0xff];
