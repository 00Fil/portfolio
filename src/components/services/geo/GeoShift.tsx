"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { ENGINES, type GeoContent } from "@/content/geo";
import { prefersReducedMotion } from "@/lib/env";
import { Bead } from "@/components/glass/Bead";
import { BrandTile } from "./BrandTile";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export function GeoShift({ content }: { content: GeoContent["shift"] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      const split = SplitText.create(q("[data-shift-tx]"), { type: "words" });
      gsap.fromTo(
        split.words,
        { opacity: 0.24 },
        {
          opacity: 1,
          stagger: 0.06,
          ease: "none",
          scrollTrigger: {
            trigger: q("[data-shift-wrap]")[0],
            start: "top 86%",
            end: "top 42%",
            scrub: 0.4,
          },
        },
      );

      gsap.fromTo(
        q("[data-shift-tile]"),
        { scale: 0.65, y: 10, autoAlpha: 0 },
        {
          scale: 1,
          y: 0,
          autoAlpha: 1,
          duration: 0.65,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: q("[data-shift-wrap]")[0], start: "top 78%", once: true },
        },
      );

      gsap.fromTo(
        q("[data-fact]"),
        { y: 26, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: q("[data-facts]")[0], start: "top 86%", once: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-40">
      {/* Contrast Pill */}
      <div className="mb-8 flex flex-wrap items-center gap-3 sm:mb-12">
        <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">{content.eyebrow}</span>
        <span className="h-px w-6 bg-[var(--hair-strong)]" />
        <Bead className="inline-flex items-center gap-2.5 px-3.5 py-1.5 text-[12.5px] font-medium text-ink-2">
          <span className="line-through decoration-[var(--label-tertiary)] opacity-75">{content.beforeLabel}</span>
          <ArrowRight size={13} strokeWidth={1.9} className="text-[var(--sky)]" aria-hidden />
          <span className="text-ink">{content.afterLabel}</span>
        </Bead>
      </div>

      {/* Manifesto */}
      <div data-shift-wrap>
        <p className="max-w-[24ch] text-[clamp(28px,4.1vw,60px)] font-medium leading-[1.12] tracking-[-0.042em] text-ink">
          <span data-shift-tx>{content.statementStart} </span>
          <span data-shift-tx className="text-ink-2">
            {content.statementMid}{" "}
          </span>
          <span className="mx-1 inline-flex -space-x-1.5 align-middle" aria-hidden>
            {ENGINES.map((e) => (
              <span key={e.id} data-shift-tile className="inline-flex">
                <BrandTile
                  engine={e.id}
                  interactive
                  radius={11}
                  sizeClass="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-[var(--bg-canvas)]"
                />
              </span>
            ))}
          </span>{" "}
          <span data-shift-tx className="text-[var(--sky)]">
            {content.statementEnd}
          </span>
        </p>
      </div>

      {/* 3 Pillars */}
      <div data-facts className="mt-16 grid gap-10 sm:mt-24 sm:grid-cols-3 sm:gap-8">
        {content.facts.map((f) => (
          <div key={f.value} data-fact className="border-t border-[var(--hair-strong)] pt-6">
            <p className="text-[clamp(38px,4.8vw,72px)] font-medium leading-none tracking-[-0.055em] text-ink">{f.value}</p>
            <p className="mt-4 max-w-[30ch] text-[16px] leading-[1.55] text-ink-2">{f.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
