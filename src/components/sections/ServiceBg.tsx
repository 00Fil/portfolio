"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ServiceKey } from "@/content/services";
import { prefersReducedMotion } from "@/lib/env";

/* Ogni scheda ha il suo colore: lo sfondo è quel colore, quello che ci sta sopra è vetro scuro o chiaro, mai lo stesso tono. */
export const HUE: Record<ServiceKey, string> = {
  web: "#ff4d8d",
  seo: "#4285f4",
  geo: "#d97757",
  ai: "#9b6bff",
  hw: "#22d3ee",
  apps: "#a3e635",
  api: "#fbbf24",
  design: "#ff4b3e",
  ops: "#10b981",
  shop: "#aeb6c2",
};

const Grainient = dynamic(() => import("@/components/reactbits/Grainient"), { ssr: false });

/* Uno sfondo solo (Grainient di React Bits), cambia la tavolozza: dal quasi nero al colore della scheda. */
const RAMP: Record<ServiceKey, [string[], number]> = {
  web: [["#0d0408", "#3d0a22", "#b0174f", "#ff4d8d", "#ffb3cf"], 35],
  seo: [["#03060f", "#0b2156", "#1a56db", "#4285f4", "#b9d1ff"], 145],
  geo: [["#0d0604", "#3a140a", "#9a3412", "#d97757", "#f3c4ad"], 60],
  ai: [["#08040f", "#250d52", "#6127c9", "#9b6bff", "#d9ccff"], 160],
  hw: [["#020b0c", "#06343a", "#0e7490", "#22d3ee", "#bff3fb"], 25],
  apps: [["#060a02", "#1a3108", "#4d7c0f", "#a3e635", "#e4f8c2"], 120],
  api: [["#0d0802", "#3d2208", "#b45309", "#fbbf24", "#fde6a8"], 70],
  design: [["#0d0303", "#420a07", "#b91c1c", "#ff4b3e", "#ffc6c0"], 150],
  ops: [["#020c08", "#04362a", "#047857", "#10b981", "#bff2dc"], 40],
  shop: [["#060708", "#1f2329", "#525a66", "#aeb6c2", "#e9edf2"], 110],
};

function Scene({ k }: { k: ServiceKey }) {
  const [colors, angle] = RAMP[k];
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
