"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Bordo a blocchi tra il nero e il blu, come le transizioni a pixel di andreas.vision.
 * Ogni colonna ha un profilo a gradini; i blocchi compaiono con lo scroll.
 */
export function PixelEdge({ side, color = "#2F5FFF", cell = 16 }: { side: "top" | "bottom"; color?: string; cell?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let cols = 0;
    let rows = 0;
    let seeds: number[] = [];
    let prog = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
    const hash = (x: number, y: number) => {
      const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return s - Math.floor(s);
    };
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth;
      const h = c.clientHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
      // profilo a gradini: rumore liscio per colonna
      seeds = Array.from({ length: cols }, (_, x) => {
        const a = Math.sin(x * 0.21) * 0.5 + Math.sin(x * 0.073 + 1.7) * 0.35 + (hash(x, 3) - 0.5) * 0.5;
        return Math.max(0, Math.min(1, 0.45 + a * 0.4));
      });
      draw();
    };
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      for (let x = 0; x < cols; x++) {
        const fill = seeds[x] * rows;
        for (let y = 0; y < rows; y++) {
          const depth = side === "top" ? rows - 1 - y : y; // 0 = vicino al blu
          if (depth > fill) continue;
          const t = hash(x, y) * 0.6 + (depth / rows) * 0.4;
          if (t > prog) continue;
          ctx.globalAlpha = depth > fill - 1 ? 0.55 : 1;
          ctx.fillStyle = color;
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
      ctx.globalAlpha = 1;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const st = ScrollTrigger.create({
      trigger: c,
      start: "top 95%",
      end: "bottom 35%",
      scrub: 0.3,
      onUpdate: (s) => {
        prog = s.progress * 1.05;
        draw();
      },
    });
    return () => {
      ro.disconnect();
      st.kill();
    };
  }, [cell, color, side]);
  return <canvas ref={ref} aria-hidden className="block h-24 w-full sm:h-32" style={{ imageRendering: "pixelated" }} />;
}
