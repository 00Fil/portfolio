"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/env";
import { isLow, onLow, probe } from "@/lib/perf";

gsap.registerPlugin(ScrollTrigger);

/** Un solo clock: il ticker di GSAP muove Lenis e ScrollTrigger. */
export function SmoothScroll() {
  useEffect(() => {
    document.documentElement.classList.add("js");
    try {
      const y = sessionStorage.getItem("restoreY");
      if (y) {
        sessionStorage.removeItem("restoreY");
        window.scrollTo(0, Number(y));
      }
    } catch {
      /* niente */
    }
    if (prefersReducedMotion()) return;
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    // misura dei fotogrammi veri: a pagina avviata e al primo scorrimento. Se il dispositivo non regge, passa a "low"
    const idle = window.setTimeout(() => probe(50, 34), Math.max(1500, ((window as unknown as { __introEnd?: number }).__introEnd ?? 0) - performance.now() + 1500));
    const onFirstScroll = () => probe(40, 38);
    window.addEventListener("scroll", onFirstScroll, { once: true, passive: true });
    let lenis: Lenis | null = null;
    let raf: ((time: number) => void) | null = null;
    const stop = () => {
      if (raf) gsap.ticker.remove(raf);
      lenis?.destroy();
      lenis = null;
      raf = null;
      setLenis(null);
    };
    // sui dispositivi lenti lo scorrimento resta quello del sistema: niente interpolazione a ogni fotogramma
    if (!isLow()) {
      lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true, syncTouch: false });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      raf = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }
    const off = onLow(stop);
    return () => {
      off();
      stop();
      window.clearTimeout(idle);
      window.removeEventListener("scroll", onFirstScroll);
      window.removeEventListener("load", refresh);
    };
  }, []);
  return null;
}
