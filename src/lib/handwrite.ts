import { gsap } from "gsap";

/**
 * Il corsivo del marchio si scrive «a mano»: il tratto avanza da sinistra a destra con il bordo inclinato come la scrittura,
 * a passo irregolare (parte deciso, rallenta nelle curve, si ferma nel fondo). Una sola regola per tutte le scritte nel font del marchio.
 * Lo stato di partenza è sulla variabile --w (0 = niente, 130 = tutta la parola); senza animazione la parola resta intera.
 */
const EDGE = "linear-gradient(104deg, #000 calc(var(--w, 130) * 1% - 16%), transparent calc(var(--w, 130) * 1%))";
export const WRITE_STYLE = { WebkitMaskImage: EDGE, maskImage: EDGE } as const;

/** Quanto dura scrivere una parola: più lunga, più tempo, ma mai lenta da annoiare. */
export const writeTime = (el: Element) => Math.min(1.6, Math.max(0.5, 0.28 + (el.textContent?.length ?? 6) * 0.075));

/** Aggiunge alla timeline la scrittura di una parola. */
export const writeOn = (L: gsap.core.Timeline, el: Element, at: number, dur = writeTime(el)) =>
  L.fromTo(el, { "--w": 0 }, { keyframes: [{ "--w": 58, duration: dur * 0.5, ease: "power1.out" }, { "--w": 92, duration: dur * 0.3, ease: "sine.inOut" }, { "--w": 130, duration: dur * 0.2, ease: "power1.out" }] }, at);

/** Per le pagine: ogni parola in corsivo si scrive quando entra nello schermo. */
export const writeOnScroll = (els: Element[], delay = 0.3) => {
  els.forEach((e, i) => {
    const d = writeTime(e);
    gsap.fromTo(e, { "--w": 0 }, { keyframes: [{ "--w": 58, duration: d * 0.5, ease: "power1.out" }, { "--w": 92, duration: d * 0.3, ease: "sine.inOut" }, { "--w": 130, duration: d * 0.2, ease: "power1.out" }], delay: delay + i * 0.18, overwrite: true });
  });
};
