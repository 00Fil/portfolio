"use client";

import { useEffect, useRef } from "react";
import { SPR, Spring } from "@/lib/spring";
import { bevelImage } from "@/lib/glass";
import { play } from "@/lib/sound";
import { prefersReducedMotion, vibrate } from "@/lib/env";

type Opts = {
  /** Deformazione del contenitore alla pressione: Relay usa +10% / +6% (dropDeform). */
  deform?: [number, number];
  /** Raggio per lo smusso; di default capsula. */
  radius?: number;
  bevel?: boolean;
  sound?: boolean;
};

/**
 * Tocco di una goccia (dropGestures): si gonfia con `press`, al rilascio torna ondeggiando con `release`.
 * Anche un tocco rapido arriva a pressione piena (140 ms) prima di rilasciare.
 */
export function useDrop<T extends HTMLElement>({ deform = [0.1, 0.06], radius, bevel = true, sound = true }: Opts = {}) {
  const ref = useRef<T>(null);
  const [dx, dy] = deform;
  const spring = useRef<Spring | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const s = new Spring(0);
    spring.current = s;
    const reduce = prefersReducedMotion();
    const unsub = s.subscribe((p) => {
      el.style.setProperty("--p", p.toFixed(4));
      if (!reduce && (dx || dy)) el.style.transform = `scale(${1 + dx * p}, ${1 + dy * p})`;
      el.style.setProperty("--gr", `${Math.max(el.offsetWidth, el.offsetHeight) * (0.55 + 0.5 * Math.min(Math.max(p, 0), 1))}px`);
    });

    let ro: ResizeObserver | null = null;
    if (bevel) {
      const bake = () => {
        const url = bevelImage(el.offsetWidth, el.offsetHeight, radius);
        if (url) {
          el.style.setProperty("--bevel", url);
          el.dataset.bevel = "1";
        }
      };
      bake();
      ro = new ResizeObserver(bake);
      ro.observe(el);
    }

    let down = false;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      down = true;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--gx", `${e.clientX - r.left}px`);
      el.style.setProperty("--gy", `${e.clientY - r.top}px`);
      vibrate(6);
      if (sound) play("press");
      s.to(1, SPR.press);
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      if (s.value < 0.9) s.tweenTo(1, 140, () => s.to(0, SPR.release));
      else s.to(0, SPR.release);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      el.style.setProperty("--gx", "50%");
      el.style.setProperty("--gy", "50%");
      s.tweenTo(1, 140, () => s.to(0, SPR.release));
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    el.addEventListener("keydown", onKey);
    return () => {
      unsub();
      s.stop();
      ro?.disconnect();
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      el.removeEventListener("keydown", onKey);
    };
  }, [bevel, radius, sound, dx, dy]);

  return { ref, spring };
}
