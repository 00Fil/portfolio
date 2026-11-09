"use client";

import { useEffect, useRef, useState } from "react";
import type { ServiceKey } from "@/content/services";
import Aurora from "@/components/reactbits/Aurora";
import Silk from "@/components/reactbits/Silk";
import Orb from "@/components/reactbits/Orb";
import Galaxy from "@/components/reactbits/Galaxy";
import DarkVeil from "@/components/reactbits/DarkVeil";
import Prism from "@/components/reactbits/Prism";
import RippleGrid from "@/components/reactbits/RippleGrid";
import Plasma from "@/components/reactbits/Plasma";
import FaultyTerminal from "@/components/reactbits/FaultyTerminal";
import Waves from "@/components/reactbits/Waves";

const SKY = "#5ec4ff";

/** Uno sfondo di React Bits diverso per ogni servizio, tutti nei toni dell'azzurro cielo. */
function Bg({ k }: { k: ServiceKey }) {
  const cls = "absolute inset-0";
  switch (k) {
    case "web":
      return <Aurora className={cls} colorStops={["#0a2633", SKY, "#1f7fb8"]} amplitude={1.1} blend={0.6} speed={0.6} mouseInteraction={false} />;
    case "seo":
      return <Waves className={cls} lineColor="#1d4e66" accentColor={SKY} amplitude={28} speed={0.6} mouseInteraction={false} />;
    case "geo":
      return <Orb className={cls} colors={[SKY, "#9edcff", "#1f7fb8"]} hue={0} size={0.9} followCursor={false} rotateOnHover={false} clickPulse={false} />;
    case "apps":
      return <Galaxy className={cls} hueShift={200} saturation={0.5} density={1.2} glowIntensity={0.35} mouseInteraction={false} mouseRepulsion={false} />;
    case "design":
      return <Prism className={cls} colors={["#0a2633", SKY, "#d9f2ff"]} saturation={0.8} glow={0.9} animationType="rotate" interactive={false} />;
    case "ai":
      return <Plasma className={cls} color={SKY} speed={0.5} brightness={0.9} mouseInteractive={false} />;
    case "hw":
      return <FaultyTerminal className={cls} tint={SKY} brightness={0.55} scale={1.4} timeScale={0.25} mouseReact={false} glyphs="characters" />;
    case "api":
      return <RippleGrid className={cls} color={SKY} variant="dots" cellSize={40} glow={0.7} mouseInteraction={false} clickRipple={false} />;
    case "shop":
      return <Silk className={cls} color="#0e3346" sheenColor="#9edcff" speed={3} sheen={0.6} mouseInteraction={false} clickRipple={false} />;
    case "ops":
      return <DarkVeil className={cls} color={SKY} speed={0.35} glow={0.5} mouseInteraction={false} />;
  }
}

/** Montato solo quando l'apertura è visibile e se il movimento è permesso; sfuma nel nero della pagina in basso. */
export function ServiceBackdrop({ k }: { k: ServiceKey }) {
  const root = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "100px" });
    io.observe(root.current!);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={root} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`absolute inset-0 transition-opacity duration-[1200ms] ${on ? "opacity-70" : "opacity-0"}`}>{on && <Bg k={k} />}</div>
      <div className="absolute inset-0 [background:radial-gradient(60%_50%_at_50%_52%,rgba(0,0,0,.7),transparent_100%),linear-gradient(to_bottom,rgba(0,0,0,.2),transparent_30%,transparent_60%,#000)]" />
    </div>
  );
}
