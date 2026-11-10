"use client";

import { useId, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { SIGNATURE } from "@/content/signature";
import { settled } from "@/lib/intro";

gsap.registerPlugin(useGSAP);

/** Spessore del pennino nella maschera: copre tutta la larghezza del tratto della lettera. */
const PEN = 16;
/** A che punto del contorno la lettera è già tutta scritta (il contorno gira attorno al tratto). */
const DONE_AT = 0.56;
/** Durata della scrittura e attesa massima, oltre la scrittura, per ciò che serve alla prima schermata. */
const WRITE_S = 2.1;
const MAX_WAIT_MS = 1000;
const [X, Y, W, H] = SIGNATURE.viewBox.split(" ").map(Number);

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const loaded = () => new Promise<void>((r) => (document.readyState === "complete" ? r() : window.addEventListener("load", () => r(), { once: true })));

/**
 * Schermata d'apertura, solo alla prima pagina della visita: il nome si scrive con una sola linea continua,
 * come l'"hello" di Apple. Intanto si scaricano font e componenti della prima schermata, così quando il telo
 * si alza la pagina è già pronta e l'arrivo resta fluido.
 */
export function Preloader({ label }: { label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  useGSAP(
    () => {
      const html = document.documentElement;
      const lift = () => {
        html.dataset.lift = "1";
        window.dispatchEvent(new Event("intro:lift"));
      };
      const finish = () => {
        html.dataset.intro = "done";
        window.dispatchEvent(new Event("intro:done"));
      };

      // visite successive: una copertura del colore della pagina, tolta appena l'avvio è finito (al massimo 1 s)
      if (html.dataset.intro === "quick") {
        Promise.race([settled(), wait(MAX_WAIT_MS)]).then(() => {
          lift();
          gsap.to(root.current, { autoAlpha: 0, duration: 0.45, ease: "power2.out", onComplete: finish });
        });
        return;
      }
      if (html.dataset.intro !== "run") return;
      const pens = gsap.utils.toArray<SVGPathElement>("[data-pen]");

      // ciò che serve subito dopo: font, pagina caricata, componenti WebGL della prima vista
      const ready = Promise.race([
        Promise.all([document.fonts?.ready, loaded(), import("@/components/reactbits/Grainient")]).then(settled),
        wait(WRITE_S * 1000 + MAX_WAIT_MS),
      ]);

      // un'unica linea: ogni lettera occupa un tratto della corsa in proporzione alla sua lunghezza
      const lens = pens.map((p) => p.getTotalLength() * DONE_AT);
      const total = lens.reduce((a, b) => a + b, 0);
      const starts = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));
      const o = { p: 0 };
      const draw = () => {
        const at = o.p * total;
        pens.forEach((p, i) => {
          const k = gsap.utils.clamp(0, 1, (at - starts[i]) / lens[i]);
          p.style.strokeDashoffset = String(1 - k * DONE_AT);
        });
      };

      const exit = () =>
        gsap
          .timeline({
            onStart: lift,
            onComplete: finish,
          })
          .to("[data-sig]", { y: -18, autoAlpha: 0, duration: 0.5, ease: "power2.in" })
          .to(root.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.8, ease: "expo.inOut" }, 0.2);

      gsap
        .timeline({ delay: 0.15 })
        .to(o, { p: 1, duration: WRITE_S, ease: "power1.inOut", onUpdate: draw })
        .add(() => {
          pens.forEach((p) => (p.style.strokeDashoffset = "0"));
          ready.then(() => wait(250)).then(exit);
        });
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
