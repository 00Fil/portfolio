"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/env";

/** Timeline in loop dentro [scope], in pausa fuori dallo schermo e ferma con reduced motion. */
export function useLoop<T extends HTMLElement>(build: (root: T, tl: gsap.core.Timeline) => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, paused: true });
      build(root, tl);
      if (prefersReducedMotion()) {
        tl.progress(0.6).pause();
        return;
      }
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()), { threshold: 0.15 });
      io.observe(root);
      return () => io.disconnect();
    }, root);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}
