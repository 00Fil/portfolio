"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { landed, shiftStore } from "@/lib/shift";

/**
 * Velo dei cambi di tema e lingua. Sta in cima al body: quando la lingua cambia l'albero si rimonta
 * (e con lui <html>), quindi qui si rimettono subito sul documento il tema scelto prima del primo disegno.
 */
export function ShiftVeil({ locale }: { locale: string }) {
  const s = useSyncExternalStore(shiftStore.subscribe, shiftStore.get, shiftStore.server);

  useLayoutEffect(() => {
    const d = document.documentElement;
    if (!d.dataset.theme) {
      let t = "light";
      try {
        t = localStorage.getItem("theme") === "dark" ? "dark" : "light";
      } catch {
        /* niente */
      }
      d.dataset.theme = t;
    }
  }, [locale]);

  useEffect(() => {
    if (document.documentElement.lang === locale) landed(locale);
  }, [locale]);

  if (s.phase === "off") return null;
  return (
    <div className="shift-veil fixed inset-0 z-[300] flex items-center justify-center" data-phase={s.phase} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-5">
        <span className="shift-ring" aria-hidden />
        <p className="shift-label text-[15px] font-medium tracking-[-0.01em]">{s.label}</p>
      </div>
    </div>
  );
}
