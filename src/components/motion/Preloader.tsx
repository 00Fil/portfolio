"use client";

import { useId, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { SIGNATURE } from "@/content/signature";

gsap.registerPlugin(useGSAP);

/** Spessore del pennino nella maschera: copre tutta la larghezza del tratto della lettera. */
const PEN = 16;
const [X, Y, W, H] = SIGNATURE.viewBox.split(" ").map(Number);

/**
 * Schermata d'apertura, solo alla prima pagina della visita: il nome si scrive a mano, lettera dopo lettera,
 * come un pennino che segue il tratto; poi il telo si alza sul sito.
 */
export function Preloader({ label }: { label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  useGSAP(
    () => {
      const html = document.documentElement;
      if (html.dataset.intro !== "run") return;
      const pens = gsap.utils.toArray<SVGPathElement>("[data-pen]");
      const tl = gsap.timeline({ onComplete: () => void (html.dataset.intro = "done") });
      let at = 0.25;
      pens.forEach((p) => {
        const len = p.getTotalLength();
        // il contorno gira attorno alla lettera: a metà percorso la lettera è già tutta scritta
        const dur = Math.min(0.45, Math.max(0.14, len / 3200));
        tl.to(p, { strokeDashoffset: 0.42, duration: dur, ease: "none" }, at);
        at += dur * 0.82;
      });
      tl.set(pens, { strokeDashoffset: 0 }, at)
        .to("[data-sig]", { scale: 0.96, autoAlpha: 0, filter: "blur(6px)", duration: 0.55, ease: "power2.in" }, at + 0.45)
        .to(root.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.85, ease: "expo.inOut" }, at + 0.7);
    },
    { scope: root },
  );
  return (
    <div ref={root} role="img" aria-label={label} className="preloader fixed inset-0 z-[200] items-center justify-center bg-[#050506] [clip-path:inset(0_0_0_0)]">
      <svg data-sig viewBox={SIGNATURE.viewBox} className="w-[min(86vw,980px)] overflow-visible" aria-hidden>
        <defs>
          {SIGNATURE.glyphs.map((d, i) => (
            <mask key={i} id={`${id}m${i}`} maskUnits="userSpaceOnUse" x={X - 200} y={Y - 200} width={W + 400} height={H + 400}>
              <path data-pen d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1} fill="none" stroke="#fff" strokeWidth={PEN} strokeLinecap="round" strokeLinejoin="round" />
            </mask>
          ))}
        </defs>
        {SIGNATURE.glyphs.map((d, i) => (
          <path key={i} d={d} fill="#fff" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" mask={`url(#${id}m${i})`} />
        ))}
      </svg>
    </div>
  );
}
