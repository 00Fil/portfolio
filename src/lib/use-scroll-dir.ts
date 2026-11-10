"use client";

import { useEffect, useState } from "react";

/**
 * true mentre si scorre verso il basso (oltre `from` px), false risalendo o in cima.
 * Serve alle barre su telefono per farsi da parte mentre si legge.
 */
export function useScrollingDown(from = 140, enabled = true): boolean {
  const [down, setDown] = useState(false);
  useEffect(() => {
    if (!enabled) return setDown(false);
    let last = window.scrollY;
    let acc = 0;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const y = window.scrollY;
      const dy = y - last;
      last = y;
      // accumula un po' di movimento per non tremolare a ogni pixel
      acc = Math.sign(dy) === Math.sign(acc) ? acc + dy : dy;
      if (y < from) setDown(false);
      else if (acc > 24) setDown(true);
      else if (acc < -24) setDown(false);
    };
    const on = () => void (raf ||= requestAnimationFrame(tick));
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, [from, enabled]);
  return down;
}
