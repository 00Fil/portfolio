"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Telefono, PC e server disegnati a blocchi: con lo scroll i pixel arrivano dai lati e si compongono,
 * poi i pacchetti corrono sulle linee in entrambi i versi (rete locale e hub), come in Relay.
 */
export function PixelNetwork() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const G = 64; // griglia logica 64 × 36
    const H = 36;
    const cells: { x: number; y: number; sx: number; sy: number; d: number; tone: number }[] = [];
    const mark = (x: number, y: number, tone = 1) => cells.push({ x, y, sx: 0, sy: 0, d: 0, tone });
    const rect = (x0: number, y0: number, w: number, h: number, tone = 1, fill = false) => {
      for (let x = x0; x < x0 + w; x++)
        for (let y = y0; y < y0 + h; y++) if (fill || x === x0 || y === y0 || x === x0 + w - 1 || y === y0 + h - 1) mark(x, y, tone);
    };
    // PC
    rect(4, 9, 20, 13);
    rect(6, 11, 16, 9, 0.35, true);
    rect(12, 22, 4, 2);
    rect(9, 24, 10, 1);
    // telefono
    rect(48, 7, 10, 18);
    rect(50, 9, 6, 13, 0.35, true);
    mark(53, 23);
    // server
    rect(28, 28, 8, 7);
    for (let x = 30; x < 34; x++) mark(x, 30, 0.6), mark(x, 32, 0.6);
    // linee
    const lines: [number, number, number, number][] = [
      [25, 15, 47, 15],
      [16, 25, 30, 28],
      [53, 26, 34, 28],
    ];
    const linePts = lines.map(([x0, y0, x1, y1]) => {
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      return Array.from({ length: n + 1 }, (_, i) => [Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n)] as [number, number]);
    });
    linePts.forEach((pts) => pts.forEach(([x, y], i) => i % 2 === 0 && mark(x, y, 0.4)));
    cells.forEach((cl) => {
      const a = Math.random() * Math.PI * 2;
      const r = 20 + Math.random() * 40;
      cl.sx = cl.x + Math.cos(a) * r;
      cl.sy = cl.y + Math.sin(a) * r * 0.5;
      cl.d = Math.random() * 0.45;
    });

    let prog = reduce ? 1 : 0;
    let t = 0;
    let raf = 0;
    let visible = false;
    const draw = () => {
      const w = c.clientWidth;
      const h = c.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (c.width !== Math.round(w * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const s = Math.min(w / G, h / H);
      const ox = (w - G * s) / 2;
      const oy = (h - H * s) / 2;
      for (const cl of cells) {
        const k = Math.min(1, Math.max(0, (prog - cl.d) / 0.55));
        const e = 1 - Math.pow(1 - k, 3);
        if (k <= 0) continue;
        const x = cl.sx + (cl.x - cl.sx) * e;
        const y = cl.sy + (cl.y - cl.sy) * e;
        ctx.fillStyle = `rgba(255,255,255,${cl.tone * (0.25 + 0.75 * e)})`;
        ctx.fillRect(Math.round(ox + x * s), Math.round(oy + y * s), Math.ceil(s) - 1, Math.ceil(s) - 1);
      }
      if (prog >= 0.98) {
        linePts.forEach((pts, li) => {
          for (const dir of [1, -1]) {
            const phase = ((t * 0.6 + li * 0.37 + (dir < 0 ? 0.5 : 0)) % 1 + 1) % 1;
            const i = Math.floor((dir > 0 ? phase : 1 - phase) * (pts.length - 1));
            const [x, y] = pts[i];
            ctx.fillStyle = dir > 0 ? "#ffffff" : "#9EDCFF";
            ctx.fillRect(Math.round(ox + x * s - s * 0.5), Math.round(oy + y * s - s * 0.5), Math.ceil(s * 2) - 1, Math.ceil(s * 2) - 1);
          }
        });
      }
    };
    const loop = (now: number) => {
      t = now / 1000;
      draw();
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    });
    io.observe(c);
    const st = ScrollTrigger.create({ trigger: c, start: "top 90%", end: "center 55%", scrub: 0.4, onUpdate: (s) => (prog = reduce ? 1 : s.progress) });
    draw();
    return () => {
      io.disconnect();
      st.kill();
      cancelAnimationFrame(raf);
    };
  }, []);
  return <canvas ref={ref} aria-hidden className="block aspect-[16/9] w-full max-w-[900px]" />;
}
