"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HeroArt, type HeroText } from "./Covers";
import { CoverArrived, useCoverTransition } from "./CoverTransition";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Apertura della pagina progetto. Se si arriva dalla copertina, il volo ha già messo tutto al suo posto
 * e qui non parte nessuna entrata; altrimenti icona, nome e testo entrano in sequenza.
 * Scorrendo, l'apertura si stacca dai bordi e si arrotonda.
 */
export function ProjectHero({ slug, text }: { slug: string; text: HeroText }) {
  const root = useRef<HTMLElement>(null);
  const { flying } = useCoverTransition();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!flying()) {
          gsap.from('[data-flip="icon"]', { y: 30, scale: 0.8, autoAlpha: 0, duration: 1, ease: "power3.out", delay: 0.15 });
          gsap.from('[data-flip="name"]', { yPercent: 40, autoAlpha: 0, duration: 1.1, ease: "power4.out", delay: 0.25 });
          gsap.from("[data-hero-rest]", { y: 20, autoAlpha: 0, duration: 0.9, ease: "power3.out", delay: 0.5 });
        }
        const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
        gsap.fromTo("[data-art]", { scale: 1, borderRadius: 0 }, { scale: 0.92, borderRadius: 36, ease: "none", scrollTrigger: st });
        gsap.to("[data-hero-rest], [data-flip]", { y: -80, autoAlpha: 0, ease: "none", scrollTrigger: { ...st, end: "55% top" } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label={text.def} className="relative h-[100svh]">
      <CoverArrived />
      <div data-art className="absolute inset-0 overflow-hidden will-change-transform">
        <HeroArt slug={slug} live text={text} />
      </div>
    </section>
  );
}
