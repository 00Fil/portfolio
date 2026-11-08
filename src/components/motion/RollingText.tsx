"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * RollingText di Relay: ogni cifra è una colonna 0–9 che rotola fino al valore, 380 ms, scaglionate di 28 ms da sinistra.
 * Parte quando entra in vista; il resto dei caratteri resta fermo.
 */
export function RollingText({ text, className = "" }: { text: string; className?: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (!ready || !root.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cols = root.current.querySelectorAll<HTMLElement>("[data-col]");
    cols.forEach((c) => gsap.set(c, { yPercent: 0 }));
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top 90%",
      once: true,
      onEnter: () => {
        cols.forEach((c, i) => {
          const d = Number(c.dataset.col);
          gsap.to(c, { yPercent: -d * 10, duration: 0.38, delay: Math.min(i, 4) * 0.028, ease: "power2.out" });
        });
      },
    });
    return () => st.kill();
  }, [ready]);

  if (!ready) return <span className={className}>{text}</span>;
  return (
    <span ref={root} className={`inline-flex ${className}`} aria-label={text}>
      {[...text].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} aria-hidden className="relative inline-block overflow-hidden" style={{ height: "1em", lineHeight: "1em" }}>
            <span data-col={ch} className="flex flex-col" style={{ transform: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? `translateY(-${Number(ch) * 10}%)` : undefined }}>
              {"0123456789".split("").map((d) => (
                <span key={d} className="block" style={{ height: "1em" }}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden style={{ whiteSpace: "pre" }}>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
