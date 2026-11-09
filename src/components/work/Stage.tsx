"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Palco a misura fissa (1600×1000) scalato per stare nel contenitore.
 * Le copertine si compongono in pixel esatti e restano identiche a ogni dimensione.
 */
export const STAGE_W = 1600;
export const STAGE_H = 1000;

export function Stage({ children, fit = "contain", className = "" }: { children: ReactNode; fit?: "contain" | "cover"; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      const sx = width / STAGE_W;
      const sy = height / STAGE_H;
      setK(fit === "contain" ? Math.min(sx, sy) : Math.max(sx, sy));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  return (
    <div ref={box} className={`absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${k})`, opacity: k ? 1 : 0 }}
      >
        {children}
      </div>
    </div>
  );
}
