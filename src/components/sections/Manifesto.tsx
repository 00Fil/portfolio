"use client";

import { useRef } from "react";
import { useMessages } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Cover } from "@/components/work/Covers";
import { Shape, type ShapeKind } from "@/components/visual/Shapes";
import { prefersReducedMotion } from "@/lib/env";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Un pezzo del nastro: parola, copertina di un progetto o forma. "*parola" va in corsivo. */
type Token = string;

function Piece({ tok, k }: { tok: Token; k: string }) {
  if (tok.startsWith("@")) {
    return (
      <span className="relative mx-[0.12em] inline-block h-[0.78em] w-[1.25em] shrink-0 overflow-hidden rounded-[0.16em] align-middle shadow-[0_0_0_1px_rgba(255,255,255,.1),0_20px_40px_-20px_rgba(0,0,0,.9)]">
        <Cover slug={tok.slice(1)} mini />
      </span>
    );
  }
  if (tok.startsWith("#")) {
    return (
      <span data-shape className="mx-[0.1em] inline-block h-[0.82em] w-[0.82em] shrink-0 align-middle">
        <Shape kind={tok.slice(1) as ShapeKind} id={`sh-${k}`} className="h-full w-full" />
      </span>
    );
  }
  const em = tok.startsWith("*");
  return <span className={`mx-[0.12em] shrink-0 whitespace-nowrap ${em ? "t-serif italic text-[var(--sky)]" : ""}`}>{em ? tok.slice(1) : tok}</span>;
}

/**
 * Due nastri di testo che scorrono in versi opposti, con le copertine dei progetti e forme in mezzo, come sulla home di GSAP.
 * Scorrendo la pagina accelerano; le forme girano e ondeggiano per conto loro.
 */
export function Manifesto() {
  const rows = (useMessages() as unknown as { manifesto: { rows: Token[][]; label: string } }).manifesto;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const loops = gsap.utils.toArray<HTMLElement>("[data-row]").map((row, i) => {
        const dir = i % 2 ? 1 : -1;
        return gsap.fromTo(row, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, duration: 38 + i * 6, ease: "none", repeat: -1 });
      });
      gsap.utils.toArray<HTMLElement>("[data-shape]").forEach((s, i) => {
        gsap.to(s, { rotate: i % 2 ? -360 : 360, duration: 14 + (i % 4) * 3, ease: "none", repeat: -1 });
        gsap.fromTo(s, { y: "-0.04em" }, { y: "0.04em", duration: 1.6 + (i % 3) * 0.4, ease: "sine.inOut", repeat: -1, yoyo: true });
      });
      // più si scorre veloce, più corrono i nastri; poi tornano alla loro andatura
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const boost = 1 + Math.min(5, Math.abs(self.getVelocity()) / 350);
          loops.forEach((l) => gsap.to(l, { timeScale: boost, duration: 0.2, overwrite: true, onComplete: () => void gsap.to(l, { timeScale: 1, duration: 1.2, ease: "power2.out" }) }));
        },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label={rows.label} className="relative overflow-hidden py-6 sm:py-10">
      <div className="flex flex-col gap-2 text-[clamp(52px,9vw,148px)] font-medium leading-[1.05] tracking-[-0.05em] text-ink sm:gap-4">
        {rows.rows.map((r, i) => (
          <div key={i} className="flex w-max" data-row aria-hidden>
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center pr-[0.3em]">
                {r.map((tok, j) => (
                  <Piece key={j} tok={tok} k={`${i}-${copy}-${j}`} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
