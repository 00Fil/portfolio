"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/** RollingText di Relay per un valore che cambia: le cifre cambiate rotolano su o giù, 380 ms, scaglionate di 28 ms. */
export function RollingNumber({ value, suffix = "", className = "" }: { value: number; suffix?: string; className?: string }) {
  const digits = String(value).split("");
  const root = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const cols = root.current?.querySelectorAll<HTMLElement>("[data-col]");
    cols?.forEach((c, i) => gsap.to(c, { yPercent: -Number(c.dataset.col) * 10, duration: 0.38, delay: Math.min(i, 4) * 0.028, ease: "power2.out" }));
  }, [value]);
  return (
    <span ref={root} className={`inline-flex ${className}`} aria-label={`${value}${suffix}`}>
      {digits.map((d, i) => (
        <span key={digits.length - i} aria-hidden className="relative inline-block overflow-hidden" style={{ height: "1em", lineHeight: "1em" }}>
          <span data-col={d} className="flex flex-col">
            {"0123456789".split("").map((n) => (
              <span key={n} className="block" style={{ height: "1em" }}>
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
      <span aria-hidden style={{ lineHeight: "1em" }}>{suffix}</span>
    </span>
  );
}
