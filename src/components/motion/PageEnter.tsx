"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { SPR, Spring } from "@/lib/spring";
import { prefersReducedMotion } from "@/lib/env";

/** Ingresso di una pagina come ModuleSwitch: dissolvenza 260 ms e scorrimento di 1/6 con molla (1, 380). */
export function PageEnter({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    window.scrollTo(0, 0);
    const s = new Spring(1);
    const w = Math.min(window.innerWidth, 1200) / 6;
    const un = s.subscribe((v) => (el.style.transform = v > 0.0005 ? `translate3d(${v * w}px,0,0)` : ""));
    el.style.transform = `translate3d(${w}px,0,0)`;
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: "cubic-bezier(0.4,0,0.2,1)" });
    s.to(0, SPR.page);
    return () => {
      un();
      s.stop();
    };
  }, []);
  return <div ref={ref}>{children}</div>;
}
