"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "lucide-react";
import { Cover } from "./Covers";
import { CoverArrived } from "./CoverTransition";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Apertura della pagina progetto: la stessa copertina della home, a tutto schermo.
 * Scorrendo si stacca dai bordi e si arrotonda, e il colore della pagina prende il posto senza stacchi.
 */
export function ProjectHero({ slug, name, def, label, scroll }: { slug: string; name: string; def: string; label: string; scroll: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo("[data-hch]", { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.035, delay: 0.35 });
        gsap.fromTo("[data-hl]", { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.6 });
        const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
        gsap.fromTo("[data-cover]", { scale: 1, borderRadius: 0 }, { scale: 0.9, borderRadius: 36, ease: "none", scrollTrigger: st });
        gsap.fromTo("[data-htext]", { y: 0, autoAlpha: 1 }, { y: -120, autoAlpha: 0, ease: "none", scrollTrigger: { ...st, end: "60% top" } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label={name} className="relative h-[100svh]">
      <CoverArrived />
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div data-cover className="absolute inset-0 overflow-hidden will-change-transform">
          <Cover slug={slug} live hero />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(to_top,rgba(0,0,0,.62),transparent)]" />
        </div>
        <div data-htext className="absolute inset-x-0 bottom-0">
          <div className="mx-auto w-full max-w-[1280px] px-5 pb-10 sm:px-8 sm:pb-14">
            <p data-hl className="t-label mb-4 text-white/70">
              {label}
            </p>
            <h1 className="overflow-hidden pb-[0.04em] text-[clamp(56px,10vw,160px)] font-medium leading-[0.9] tracking-[-0.06em] text-white" aria-label={name}>
              <span aria-hidden>
                {[...name].map((c, i) => (
                  <span key={i} data-hch className="inline-block">
                    {c}
                  </span>
                ))}
              </span>
            </h1>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
              <p data-hl className="max-w-[48ch] text-[clamp(17px,1.5vw,21px)] leading-[1.45] text-white/85">
                {def}
              </p>
              <span data-hl className="drop flex h-11 items-center gap-2 px-4 text-[14px] text-white" style={{ ["--drop-tint" as string]: "rgba(0,0,0,.35)" }}>
                {scroll}
                <ArrowDown size={15} strokeWidth={1.8} aria-hidden />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
