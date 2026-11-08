"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/env";

type Props = { a: [string, string]; b: [string, string] };

/**
 * Titolo che alterna due frasi, come MorphText di Relay: le parole in uscita si sfocano e si allargano,
 * quelle in entrata si mettono a fuoco. Tra le due righe una goccia di vetro con la visuale di Relay.
 */
export function HeroTitle({ a, b }: Props) {
  const root = useRef<HTMLHeadingElement>(null);
  const [state, setState] = useState(0);
  const lines = state === 0 ? a : b;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      const el = root.current;
      if (!el) return;
      const words = el.querySelectorAll<HTMLElement>("[data-w]");
      gsap.to(words, {
        opacity: 0,
        filter: "blur(10px)",
        scale: 1.06,
        duration: 0.32,
        ease: "power2.in",
        stagger: 0.025,
        onComplete: () => setState((s) => 1 - s),
      });
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const words = el.querySelectorAll<HTMLElement>("[data-w]");
    gsap.fromTo(
      words,
      { opacity: 0, filter: "blur(10px)", scale: 0.92, yPercent: 12 },
      { opacity: 1, filter: "blur(0px)", scale: 1, yPercent: 0, duration: 0.6, ease: "power3.out", stagger: 0.04, clearProps: "filter" },
    );
  }, [state]);

  const render = (text: string, k: string) =>
    text.split(" ").map((w, i) => (
      <span key={`${k}-${i}-${w}`} data-w className="inline-block whitespace-pre will-change-[filter,opacity,transform]">
        {w}
        {" "}
      </span>
    ));

  return (
    <h1 ref={root} aria-label={`${lines[0]} ${lines[1]}`} className="t-serif text-center text-[clamp(48px,8.4vw,128px)] leading-[0.98] text-ink">
      <span aria-hidden className="block">
        {render(lines[0], `l0${state}`)}
      </span>
      <span aria-hidden className="block">
        {render(lines[1], `l1${state}`)}
      </span>
    </h1>
  );
}
