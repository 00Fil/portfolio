"use client";

import { useEffect, useState } from "react";
import Dither from "@/components/reactbits/Dither";

/**
 * Cielo a pixel dell'hero (Dither di React Bits): onde blu di Relay su nero, retinate in Bayer.
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
          palette={["#000000", "#11244F", "#1F44CC", "#2F5FFF", "#5C9DFF"]}
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
      {/* lo spazio del titolo: un'isola di nero a blocchi */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(46% 34% at 50% 48%, #000 62%, transparent 100%)",
        }}
      />
    </div>
  );
}
