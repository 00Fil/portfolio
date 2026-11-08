"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/env";

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
    const lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true, syncTouch: false });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => {
      gsap.ticker.remove(raf);
      window.removeEventListener("load", refresh);
      lenis.destroy();
      setLenis(null);
    };
  }, []);
  return null;
}
