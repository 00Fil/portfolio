"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";
const KEY = "theme";

export const getTheme = (): Theme => (typeof document !== "undefined" && document.documentElement.dataset.theme === "dark" ? "dark" : "light");

/**
 * Cambia tema. Dove c'è la View Transition il nuovo tema si apre a cerchio dal tasto premuto: il browser
 * fotografa le due pagine e anima solo l'immagine, quindi non scatta. Altrove il cambio è immediato
 * (le transizioni di colore su ogni elemento erano proprio ciò che faceva scattare la pagina).
 */
export function setTheme(t: Theme, from?: { x: number; y: number }) {
  const html = document.documentElement;
  const apply = () => {
    html.dataset.theme = t;
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* niente */
    }
  };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply();
    return;
  }
  const x = from?.x ?? window.innerWidth - 40;
  const y = from?.y ?? 40;
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  html.classList.add("theme-vt");
  const vt = doc.startViewTransition(apply);
  vt.ready
    .then(() =>
      html
        .animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] }, { duration: 750, easing: "cubic-bezier(.65,0,.2,1)", pseudoElement: "::view-transition-new(root)" })
        .finished,
    )
    .catch(() => {})
    .finally(() => html.classList.remove("theme-vt"));
}

/** Tema corrente, aggiornato quando cambia (da qualsiasi tasto). */
export function useTheme(): Theme {
  const [t, setT] = useState<Theme>("light");
  useEffect(() => {
    setT(getTheme());
    const mo = new MutationObserver(() => setT(getTheme()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return t;
}
