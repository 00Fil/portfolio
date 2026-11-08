"use client";

import { useEffect, useRef, useState } from "react";

type PonteWin = Window & { ponteSet?: (p: Record<string, unknown>) => void };

/** La visuale di Relay (GhostFibers, WebGL2) in una fascia in fondo all'hero. Si ferma quando esce dallo schermo. */
export function Fibers({ shape = "band", className = "" }: { shape?: "band" | "hero"; className?: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSrc(`/visual/gradient.html?shape=${shape}&bg=000000&touch=0${reduce ? "&intro=0" : ""}`);
  }, [shape]);

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
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-[58svh] ${className}`}
      style={{ maskImage: "linear-gradient(180deg, transparent, #000 40%)", WebkitMaskImage: "linear-gradient(180deg, transparent, #000 40%)" }}
    >
      {src && <iframe ref={ref} src={src} title="" tabIndex={-1} loading="eager" className="h-full w-full border-0 opacity-80" />}
    </div>
  );
}
