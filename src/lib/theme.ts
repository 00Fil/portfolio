"use client";

import { useEffect, useState } from "react";
import { shift } from "./shift";

export type Theme = "dark" | "light";
const KEY = "theme";

export const getTheme = (): Theme => (typeof document !== "undefined" && document.documentElement.dataset.theme === "dark" ? "dark" : "light");

/** Cambia tema sotto il velo di adattamento: il ridisegno (fondali WebGL, smussi) avviene coperto. */
export function setTheme(t: Theme) {
  const html = document.documentElement;
  const apply = () => {
    html.classList.add("shifting");
    html.dataset.theme = t;
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* niente */
    }
    window.setTimeout(() => html.classList.remove("shifting"), 600);
  };
  void shift(apply, html.lang || "it");
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
