"use client";

import { useEffect, useRef, useState } from "react";
import Dither from "@/components/reactbits/Dither";
import { useTheme } from "@/lib/theme";

/**
 * Cielo a pixel dell'hero (Dither di React Bits): onde azzurro cielo su nero, retinate in Bayer.
 * Al centro il nero resta pieno per il titolo, come lo spazio bianco tra le nuvole di andreas.vision.
 */
export function HeroSky() {
  const [ready, setReady] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [small, setSmall] = useState(false);
  const theme = useTheme();
  // la comparsa graduale vale solo al primo ingresso: cambiando tema il cielo nuovo è già pieno
  const first = useRef<string | null>(null);
  if (ready) first.current ??= theme;
  const swapped = first.current !== null && first.current !== theme;
  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setSmall(window.innerWidth < 1024);
    setReady(true);
  }, []);
  return (
    <div aria-hidden className="absolute inset-0">
      {ready && (
        <Dither
          key={theme}
          className="absolute inset-0 [&_canvas]:[image-rendering:pixelated]"
          dpr={small ? 1 : undefined}
          palette={theme === "light" ? ["#f6f6f3", "#dcefff", "#9ed6f7", "#4fb4ea", "#1f7fb8"] : ["#000000", "#06263A", "#0F5C88", "#3BA9E6", "#9EDCFF"]}
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
          intro={!reduce && !swapped}
        />
      )}
      {/* al centro un'isola di nero per il titolo; in basso il cielo sfuma nel nero della pagina */}
      <div className="absolute inset-0 [background:radial-gradient(78%_44%_at_50%_50%,color-mix(in_srgb,var(--bg-canvas)_94%,transparent)_50%,transparent_100%),linear-gradient(to_bottom,transparent_70%,var(--bg-canvas))]" />
    </div>
  );
}
