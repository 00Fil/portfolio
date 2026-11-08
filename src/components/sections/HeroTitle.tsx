"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Dither from "@/components/reactbits/Dither";
import DitherVeil from "@/components/reactbits/DitherVeil";
import { prefersReducedMotion } from "@/lib/env";

type Props = { a: [string, string, string]; b: [string, string, string]; photo?: string };

/**
 * Titolo come in andreas.vision: "Parola [immagine] resto / seconda riga", che alterna due frasi.
 * Le parole in uscita si sfocano e si allargano, quelle in entrata si mettono a fuoco (MorphText di Relay).
 * Nel tassello: la foto retinata (si colora sotto il cursore) o, senza foto, il cielo a pixel.
 */
export function HeroTitle({ a, b, photo }: Props) {
  const root = useRef<HTMLHeadingElement>(null);
  const chip = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState(0);
  const lines = state === 0 ? a : b;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      const el = root.current;
      if (!el) return;
      gsap.to(el.querySelectorAll("[data-w]"), {
        opacity: 0,
        filter: "blur(10px)",
        scale: 1.06,
        duration: 0.32,
        ease: "power2.in",
        stagger: 0.025,
        onComplete: () => setState((s) => 1 - s),
      });
      gsap.to(chip.current, { scaleX: 0.6, scaleY: 0.85, duration: 0.3, ease: "power2.in" });
    }, 4600);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    gsap.fromTo(
      el.querySelectorAll("[data-w]"),
      { opacity: 0, filter: "blur(10px)", scale: 0.92, yPercent: 12 },
      { opacity: 1, filter: "blur(0px)", scale: 1, yPercent: 0, duration: 0.6, ease: "power3.out", stagger: 0.04, clearProps: "filter" },
    );
    gsap.to(chip.current, { scaleX: 1, scaleY: 1, duration: 0.9, ease: "elastic.out(1, 0.55)", delay: 0.1 });
  }, [state]);

  const words = (text: string, k: string) =>
    text.split(" ").map((w, i) => (
      <span key={`${k}-${i}-${w}`} data-w className="inline-block whitespace-pre">
        {w}
        {" "}
      </span>
    ));

  return (
    <h1 ref={root} aria-label={`${lines[0]} ${lines[1]} ${lines[2]}`} className="t-serif text-center text-[clamp(44px,7vw,112px)] leading-[1] text-ink">
      <span aria-hidden className="block lg:whitespace-nowrap">
        {words(lines[0], `a${state}`)}
        <span
          ref={chip}
          className="relative mx-[0.06em] inline-block h-[0.72em] w-[1.25em] -translate-y-[0.04em] overflow-hidden rounded-[0.18em] align-baseline shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
        >
          {photo ? (
            <DitherVeil src={photo} className="absolute inset-0" pixelSize={3} inkColor="#F2F2F0" paperColor="#11244F" revealRadius={0.5} />
          ) : (
            <Dither
              className="absolute inset-0"
              palette={["#11244F", "#1F44CC", "#2F5FFF", "#5C9DFF", "#EAF1FF"]}
              ditherMode="bayer4"
              pixelSize={4}
              waveSpeed={0.06}
              waveFrequency={3}
              enableMouseInteraction={false}
            />
          )}
        </span>{" "}
        {words(lines[1], `b${state}`)}
      </span>
      <span aria-hidden className="block">
        {words(lines[2], `c${state}`)}
      </span>
    </h1>
  );
}
