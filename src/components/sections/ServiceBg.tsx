"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ServiceKey } from "@/content/services";
import { prefersReducedMotion } from "@/lib/env";
import { isLow } from "@/lib/perf";

/*
 * Un solo colore, l'azzurro del sito, in quattro sfumature appena diverse (più chiara, più profonda,
 * verso il ciano, verso il blu): le schede si distinguono per luce e direzione, non per tinta.
 */
const T = {
  sky: ["#03080d", "#0a2a40", "#1f6f9e", "#5ec4ff", "#cfeeff"],
  deep: ["#02060b", "#071d33", "#155a8a", "#3f9fe0", "#bfe2fb"],
  cyan: ["#02090c", "#082b38", "#16708a", "#5ccde6", "#cff3fa"],
  blue: ["#03060d", "#0a1f40", "#1d5596", "#5aa8ff", "#cde4ff"],
};
const PICK: Record<ServiceKey, keyof typeof T> = {
  web: "sky",
  seo: "deep",
  geo: "blue",
  ai: "cyan",
  design: "deep",
  api: "blue",
  ops: "sky",
  hw: "cyan",
  apps: "blue",
  shop: "deep",
};
export const HUE = Object.fromEntries(Object.entries(PICK).map(([k, v]) => [k, T[v][3]])) as Record<ServiceKey, string>;

const Grainient = dynamic(() => import("@/components/reactbits/Grainient"), { ssr: false });

const ANGLE: Record<ServiceKey, number> = { web: 35, seo: 145, geo: 60, ai: 160, hw: 25, apps: 120, api: 70, design: 150, ops: 40, shop: 110 };

const RAMPS = Object.keys(T) as (keyof typeof T)[];

function Scene({ k, live, v = 0, paused = false }: { k: ServiceKey; live?: boolean; v?: number; paused?: boolean }) {
  const colors = T[v ? RAMPS[(RAMPS.indexOf(PICK[k]) + v) % RAMPS.length] : PICK[k]];
  const angle = (ANGLE[k] + v * 65) % 360;
  return <Grainient colors={colors} angle={angle} speed={0.55} flow={0.55} silk={0.3} grainAmount={0.05} contrast={0.95} interactive={!!live} stir={1.6} clickSwirl={!!live} intro={false} dpr={0.6} paused={paused} />;
}

/** Lo stesso gradiente, fermo e senza WebGL: per il telefono, dove dieci contesti costano troppo. */
function stillBg(k: ServiceKey, v: number) {
  const c = T[v ? RAMPS[(RAMPS.indexOf(PICK[k]) + v) % RAMPS.length] : PICK[k]];
  const a = (ANGLE[k] + v * 65) % 360;
  return `radial-gradient(90% 70% at ${50 + 40 * Math.cos((a * Math.PI) / 180)}% ${30 - 20 * Math.sin((a * Math.PI) / 180)}%, ${c[3]}cc 0%, ${c[2]}aa 32%, transparent 72%), radial-gradient(90% 90% at 15% 105%, ${c[2]}88, transparent 60%), linear-gradient(${a}deg, ${c[0]}, ${c[1]})`;
}

/**
 * Sfondo React Bits della scheda. Il contesto WebGL esiste solo mentre la scheda è vicina allo schermo,
 * così dieci schede non tengono aperti dieci contesti insieme.
 */
export function ServiceBg({ k, live = false, v = 0, active = true, still: fixed = false, paused = false }: { k: ServiceKey; live?: boolean; v?: number; active?: boolean; still?: boolean; paused?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (fixed) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { rootMargin: "200px" });
    io.observe(box.current!);
    return () => io.disconnect();
  }, [fixed]);
  // movimento ridotto o dispositivo lento: resta il gradiente fermo, nessun contesto WebGL
  const still = typeof window !== "undefined" && (prefersReducedMotion() || isLow());
  return (
    <div ref={box} aria-hidden className="pointer-events-none absolute inset-0" style={{ background: stillBg(k, v) }}>
      {on && active && !still && (
        <div className="absolute inset-0 animate-[fadeIn_1s_ease_both]">
          <Scene k={k} live={live} v={v} paused={paused} />
        </div>
      )}
    </div>
  );
}
