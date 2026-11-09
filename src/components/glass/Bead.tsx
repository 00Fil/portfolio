"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { bevelImage } from "@/lib/glass";

/**
 * Goccia ferma: lo stesso vetro dei tasti di Relay (smusso cotto in WebGL, lucido sul bordo alto),
 * per pillole, tessere ed etichette dentro i disegni. Non reagisce al tocco.
 */
export function Bead({
  className = "",
  tint,
  radius,
  style,
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tint?: "sky" | "dark" | string; radius?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const bake = () => {
      const url = bevelImage(el.offsetWidth, el.offsetHeight, radius);
      if (url) {
        el.style.setProperty("--bevel", url);
        el.dataset.bevel = "1";
      }
    };
    bake();
    const ro = new ResizeObserver(bake);
    ro.observe(el);
    return () => ro.disconnect();
  }, [radius]);
  const t = tint === "sky" ? "color-mix(in srgb, #5ec4ff 42%, transparent)" : tint === "dark" ? "rgba(10,12,16,.62)" : tint;
  return (
    <span
      ref={ref}
      className={`drop ${className}`}
      style={{ ...(t ? { ["--drop-tint" as string]: t } : {}), ...(radius != null ? { borderRadius: radius } : {}), ...style }}
      {...rest}
    >
      {children}
    </span>
  );
}
