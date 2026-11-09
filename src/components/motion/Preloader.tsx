"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * Schermata d'apertura, solo alla prima pagina della visita: il nome sale lettera per lettera,
 * il contatore arriva a 100 e il telo si alza sul sito.
 */
export function Preloader({ first, last }: { first: string; last: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const html = document.documentElement;
      if (html.dataset.intro !== "run") return;
      const num = root.current!.querySelector<HTMLElement>("[data-pn]")!;
      const o = { v: 0 };
      gsap
        .timeline({ onComplete: () => void (html.dataset.intro = "done") })
        .from("[data-pc]", { yPercent: 115, duration: 1.1, stagger: 0.035, ease: "expo.out" }, 0.1)
        .fromTo("[data-pbar]", { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: "power2.inOut" }, 0.1)
        .to(o, { v: 100, duration: 1.5, ease: "power2.inOut", onUpdate: () => void (num.textContent = String(Math.round(o.v)).padStart(3, "0")) }, 0.1)
        .to("[data-pc]", { yPercent: -115, duration: 0.6, stagger: 0.015, ease: "power3.in" }, 1.6)
        .to("[data-pfoot]", { autoAlpha: 0, duration: 0.3 }, 1.6)
        .to(root.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.8, ease: "expo.inOut" }, 1.75);
    },
    { scope: root },
  );
  const chars = (s: string, cls: string) =>
    Array.from(s).map((c, i) => (
      <span key={i} data-pc className={`inline-block ${cls}`}>
        {c}
      </span>
    ));
  return (
    <div ref={root} aria-hidden className="preloader fixed inset-0 z-[200] flex-col items-center justify-center bg-[#050506] text-white [clip-path:inset(0_0_0_0)]">
      <p className="overflow-hidden whitespace-nowrap pb-[0.06em] text-[clamp(44px,9vw,148px)] font-medium leading-[1] tracking-[-0.055em]">
        {chars(first, "")}
        <span className="inline-block w-[0.24em]" />
        {chars(last, "text-white/45")}
      </p>
      <div data-pfoot className="absolute inset-x-5 bottom-6 flex items-end justify-between gap-6 sm:inset-x-8 sm:bottom-8">
        <span data-pn className="font-mono text-[13px] tabular-nums tracking-[0.1em] text-white/60">
          000
        </span>
        <span className="relative h-px flex-1 bg-white/12">
          <span data-pbar className="absolute inset-0 origin-left bg-white/80" />
        </span>
      </div>
    </div>
  );
}
