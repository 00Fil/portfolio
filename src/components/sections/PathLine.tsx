"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Linea del percorso: si riempie con lo scroll, con il gradiente di marca (un indicatore, come in Relay). */
export function PathLine() {
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        fill.current,
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: track.current, start: "top 70%", end: "bottom 60%", scrub: 0.4 } },
      );
    });
  });
  return (
    <div ref={track} aria-hidden className="absolute bottom-3 left-[5px] top-3 w-px bg-line">
      <div ref={fill} className="h-full w-full origin-top" style={{ background: "var(--brand-gradient)" }} />
    </div>
  );
}
