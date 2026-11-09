"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ServiceKey } from "@/content/services";
import { prefersReducedMotion } from "@/lib/env";

/*
 * Tavolozza stretta, intonata all'azzurro del sito: quattro toni freddi vicini (cielo, cobalto, ottanio, pervinca)
 * e un solo caldo complementare (albicocca). Le schede vicine non ripetono lo stesso tono.
 */
const T = {
  sky: ["#03080d", "#0a2a40", "#1f6f9e", "#5ec4ff", "#cfeeff"],
  cobalt: ["#03050d", "#0c1d4d", "#2448b8", "#5b86ff", "#c9d8ff"],
  teal: ["#020a0b", "#06303a", "#0f6b78", "#3cc8d0", "#c4f1f3"],
  periwinkle: ["#05050d", "#191a48", "#3f45a8", "#8b97ff", "#d9ddff"],
  apricot: ["#0c0604", "#3a1a0c", "#a2481f", "#ff9a62", "#ffdcc7"],
};
const PICK: Record<ServiceKey, keyof typeof T> = {
  web: "sky",
  seo: "cobalt",
  geo: "apricot",
  ai: "periwinkle",
  hw: "teal",
  apps: "cobalt",
  api: "apricot",
  design: "sky",
  ops: "teal",
  shop: "periwinkle",
};
export const HUE = Object.fromEntries(Object.entries(PICK).map(([k, v]) => [k, T[v][3]])) as Record<ServiceKey, string>;

const Grainient = dynamic(() => import("@/components/reactbits/Grainient"), { ssr: false });

const ANGLE: Record<ServiceKey, number> = { web: 35, seo: 145, geo: 60, ai: 160, hw: 25, apps: 120, api: 70, design: 150, ops: 40, shop: 110 };

function Scene({ k }: { k: ServiceKey }) {
  const colors = T[PICK[k]];
  const angle = ANGLE[k];
  return <Grainient colors={colors} angle={angle} speed={0.55} flow={0.55} silk={0.3} grainAmount={0.05} contrast={0.95} interactive={false} clickSwirl={false} intro={false} dpr={1} />;
}

/**
 * Sfondo React Bits della scheda. Il contesto WebGL esiste solo mentre la scheda è vicina allo schermo,
 * così dieci schede non tengono aperti dieci contesti insieme.
 */
export function ServiceBg({ k }: { k: ServiceKey }) {
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "120px" });
    io.observe(box.current!);
    return () => io.disconnect();
  }, []);
  const still = typeof window !== "undefined" && prefersReducedMotion();
  return (
    <div ref={box} aria-hidden className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(120% 90% at 70% 20%, color-mix(in srgb, ${HUE[k]} 30%, #050506), #050506)` }}>
      {on && !still && (
        <div className="absolute inset-0 animate-[fadeIn_1s_ease_both]">
          <Scene k={k} />
        </div>
      )}
    </div>
  );
}
