"use client";

import { useEffect, useRef, useState } from "react";

type PonteWin = Window & { ponteSet?: (p: Record<string, unknown>) => void };

/**
 * La visuale di Relay (GhostFibers in WebGL2) con il passaggio in caratteri ASCII: fa da sfondo all'hero
 * come le nuvole a pixel di andreas.vision. Si ferma quando esce dallo schermo.
 */
export function Fibers() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSrc(`/visual/gradient.html?shape=hero&bg=000000&touch=0&ascii=1&cell=9${reduce ? "&intro=0" : ""}`);
  }, []);

  useEffect(() => {
    const f = ref.current;
    if (!f || !src) return;
    const io = new IntersectionObserver(([e]) => {
      try {
        (f.contentWindow as PonteWin | null)?.ponteSet?.({ paused: !e.isIntersecting });
      } catch {
        /* iframe non pronto */
      }
    });
    io.observe(f);
    return () => io.disconnect();
  }, [src]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        maskImage: "radial-gradient(120% 80% at 50% 50%, #000 40%, transparent 85%)",
        WebkitMaskImage: "radial-gradient(120% 80% at 50% 50%, #000 40%, transparent 85%)",
      }}
    >
      {src && <iframe ref={ref} src={src} title="" tabIndex={-1} className="h-full w-full border-0 opacity-60" />}
    </div>
  );
}
