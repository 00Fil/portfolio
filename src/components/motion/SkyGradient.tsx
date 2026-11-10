"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/env";
import { afterIntro } from "@/lib/intro";

const Grainient = dynamic(() => import("@/components/reactbits/Grainient"), { ssr: false });

/** I colori del sito, dal blu notte all'azzurro chiaro. */
export const SKY_RAMP = ["#05131d", "#0b3550", "#1f7fb8", "#5ec4ff", "#d9f2ff"];

/**
 * Gradiente React Bits con i colori del sito. Il contesto WebGL nasce solo quando il riquadro
 * è vicino allo schermo e la schermata d'apertura è finita; prima c'è un gradiente CSS equivalente.
 */
export function SkyGradient({ angle = 25, interactive = true }: { angle?: number; interactive?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => afterIntro(() => setReady(true)), []);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "200px" });
    io.observe(box.current!);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={box} aria-hidden className="pointer-events-auto absolute inset-0" style={{ background: "radial-gradient(120% 140% at 90% 0%, #5ec4ff, #1f7fb8 40%, #0b3550 70%, #05131d)" }}>
      {on && ready && (
        <div className="absolute inset-0 animate-[fadeIn_.8s_ease-out]">
          <Grainient colors={SKY_RAMP} angle={angle} speed={0.6} flow={0.7} silk={0.4} grainAmount={0.05} interactive={interactive} stir={1.6} intro={false} dpr={1} />
        </div>
      )}
    </div>
  );
}
