"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentType } from "react";
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

/* eslint-disable @typescript-eslint/no-explicit-any */
const load = (f: () => Promise<{ default: ComponentType<any> }>) => dynamic(f, { ssr: false });
const Grainient = load(() => import("@/components/reactbits/Grainient"));
const LineWaves = load(() => import("@/components/reactbits/LineWaves"));
const SoftAurora = load(() => import("@/components/reactbits/SoftAurora"));
const PlasmaWave = load(() => import("@/components/reactbits/PlasmaWave"));
const PixelBlast = load(() => import("@/components/reactbits/PixelBlast"));
const LightRays = load(() => import("@/components/reactbits/LightRays"));
const GradientBlinds = load(() => import("@/components/reactbits/GradientBlinds"));
const Balatro = load(() => import("@/components/reactbits/Balatro"));
const LightPillar = load(() => import("@/components/reactbits/LightPillar"));
const LiquidChrome = load(() => import("@/components/reactbits/LiquidChrome"));

function Scene({ k }: { k: ServiceKey }) {
  const c = HUE[k];
  switch (k) {
    case "web":
      return <Grainient colors={["#1a0510", c, "#5c0f33", "#ffb3cf", "#2a0718"]} speed={0.4} grainAmount={0.06} interactive={false} clickSwirl={false} intro={false} dpr={1} />;
    case "seo":
      return <LineWaves color1={c} color2="#1a3fa0" color3="#8ab4f8" speed={0.5} enableMouseInteraction={false} clickRipple={false} intro={false} maxDevicePixelRatio={1} />;
    case "geo":
      return <SoftAurora color1={c} color2="#7a2e18" brightness={1.5} speed={0.5} enableMouseInteraction={false} clickPulse={false} intro={false} />;
    case "ai":
      return <PlasmaWave colors={[c, "#4c1d95"]} speed={0.6} mouseInteraction={false} intro={false} dpr={1} />;
    case "hw":
      return <PixelBlast variant="circle" color={c} pixelSize={4} patternScale={3} patternDensity={1.1} speed={0.5} enableRipples autoRipple={0.6} hoverEffect="none" edgeFade={0.25} glow={0.6} intro={false} dpr={1} />;
    case "apps":
      return <LightRays raysColor={c} raysOrigin="top-center" raysSpeed={0.7} lightSpread={1.1} followMouse={false} clickPulse={false} intro={false} maxDevicePixelRatio={1} />;
    case "api":
      return <GradientBlinds gradientColors={["#3d2401", c, "#7c4a03"]} angle={20} blindCount={10} hoverTilt={0} clickEffect="none" idle="drift" spotlightOpacity={0.6} intro={false} dpr={1} />;
    case "design":
      return <Balatro color1={c} color2="#f5e6c8" color3="#160807" speed={0.5} mouseInteraction={false} clickSwirl={false} intro={false} maxDevicePixelRatio={1} />;
    case "ops":
      return <LightPillar topColor={c} bottomColor="#064e3b" intensity={0.9} interactive={false} clickPulse={false} intro={false} quality="low" />;
    case "shop":
      return <LiquidChrome color="#8d96a3" speed={0.5} exposure={0.75} interactive={false} intro={false} maxDevicePixelRatio={1} />;
  }
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
