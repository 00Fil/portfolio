"use client";

import { useEffect, useRef, type ElementType, type HTMLAttributes } from "react";
import { bevelImage } from "@/lib/glass";

/**
 * Goccia ferma: lo stesso vetro dei tasti di Relay (smusso cotto in WebGL, lucido sul bordo alto),
 * per pillole, tessere ed etichette dentro i disegni. Non reagisce al tocco.
 */
export function Bead({
  as: As = "span",
  className = "",
  tint,
  radius,
  style,
  children,
  ...rest
}: Omit<HTMLAttributes<HTMLElement>, "onClick"> & { as?: ElementType; tint?: "sky" | "dark" | string; radius?: number; [k: string]: unknown }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // La misura arriva dal ResizeObserver (anche la prima): nessuna lettura forzata del layout.
    // Con decine di gocce montate insieme, leggere e scrivere a turno costringeva il browser a ricalcolare a ogni goccia.
    const ro = new ResizeObserver(([e]) => {
      const b = e.borderBoxSize?.[0];
      const w = b ? b.inlineSize : el.offsetWidth;
      const h = b ? b.blockSize : el.offsetHeight;
      const url = bevelImage(Math.round(w), Math.round(h), radius);
      if (url) {
        el.style.setProperty("--bevel", url);
        el.dataset.bevel = "1";
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [radius]);
  const t = tint === "sky" ? "color-mix(in srgb, #5ec4ff 42%, transparent)" : tint === "dark" ? "rgba(10,12,16,.62)" : tint;
  return (
    <As
      ref={ref}
      className={`drop ${className}`}
      style={{ ...(t ? { ["--drop-tint" as string]: t } : {}), ...(radius != null ? { borderRadius: radius } : {}), ...style }}
      {...rest}
    >
      {children}
    </As>
  );
}
