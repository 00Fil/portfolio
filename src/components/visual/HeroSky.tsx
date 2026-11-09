"use client";

import { useEffect, useState } from "react";
import Dither from "@/components/reactbits/Dither";

/**
 * Cielo a pixel dell'hero (Dither di React Bits): onde azzurro cielo su nero, retinate in Bayer.
 * Al centro il nero resta pieno per il titolo, come lo spazio bianco tra le nuvole di andreas.vision.
 */
export function HeroSky() {
  const [ready, setReady] = useState(false);
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setReady(true);
  }, []);
  return (
    <div aria-hidden className="absolute inset-0">
      {ready && (
        <Dither
          className="absolute inset-0"
          palette={["#000000", "#06263A", "#0F5C88", "#3BA9E6", "#9EDCFF"]}
          ditherMode="bayer4"
          pixelSize={5}
          waveSpeed={0.03}
          waveFrequency={2.4}
          waveAmplitude={0.32}
          contrast={1.25}
          brightness={-0.02}
          enableMouseInteraction
          mouseEffect="erase"
          mouseRadius={0.28}
          trail={0.6}
          disableAnimation={reduce}
          intro={!reduce}
        />
      )}
      {/* il cielo resta in alto e in basso; dietro i nastri si scurisce, poi sfuma nel nero della pagina */}
      <div className="absolute inset-0 [background:linear-gradient(to_bottom,rgba(0,0,0,.15),rgba(0,0,0,.86)_30%,rgba(0,0,0,.86)_70%,#000)]" />
    </div>
  );
}
