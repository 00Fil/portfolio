"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";
const KEY = "theme";

export const getTheme = (): Theme => (typeof document !== "undefined" && document.documentElement.dataset.theme === "dark" ? "dark" : "light");

export function setTheme(t: Theme) {
  const html = document.documentElement;
  html.classList.add("theme-anim");
  html.dataset.theme = t;
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* niente */
  }
  window.setTimeout(() => html.classList.remove("theme-anim"), 600);
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
