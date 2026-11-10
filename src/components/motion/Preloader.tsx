"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { settled } from "@/lib/intro";

gsap.registerPlugin(useGSAP);

/** Attesa massima, oltre l'ingresso del nome, per ciò che serve alla prima schermata. */
const MAX_WAIT_MS = 1000;

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const loaded = () => new Promise<void>((r) => (document.readyState === "complete" ? r() : window.addEventListener("load", () => r(), { once: true })));

/**
 * Schermata d'apertura, solo alla prima pagina della visita: il nome a tutta larghezza, come in fondo al sito.
 * Le lettere salgono una dopo l'altra e sono finestre su un gradiente azzurro che scorre; poi escono verso
 * l'alto e il telo si alza. Il gradiente è solo CSS: nessun WebGL mentre la pagina si sta ancora caricando.
 */
export function Preloader({ label }: { label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLParagraphElement>(null);
  const [first, ...rest] = label.split(" ");

  // il nome riempie sempre la larghezza
  useEffect(() => {
    const el = text.current!;
    const fit = () => {
      el.style.fontSize = "100px";
      el.style.fontSize = `${(100 * band.current!.clientWidth * 0.94) / el.scrollWidth}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

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

      const chars = gsap.utils.toArray<HTMLElement>("[data-ch]");
      const IN_S = 1.1 + chars.length * 0.045;
      const ready = Promise.race([Promise.all([document.fonts?.ready, loaded()]).then(settled), wait(IN_S * 1000 + MAX_WAIT_MS)]);

      const exit = () =>
        gsap
          .timeline({ onStart: lift, onComplete: finish })
          .to(chars, { yPercent: -105, rotate: -4, duration: 0.6, stagger: 0.022, ease: "power3.in" })
          .to(root.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.85, ease: "expo.inOut" }, 0.3);

      gsap
        .timeline({ delay: 0.12 })
        .fromTo(chars, { yPercent: 100, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.045, ease: "expo.out" })
        .add(() => void ready.then(() => wait(200)).then(exit));
    },
    { scope: root },
  );

  const chars = (s: string, light = false) =>
    Array.from(s).map((c, i) => (
      <span key={i} data-ch className={`inline-block ${light ? "font-normal" : ""}`} style={{ transform: "translateY(100%)" }}>
        {c === " " ? " " : c}
      </span>
    ));

  return (
    <div ref={root} role="img" aria-label={label} className="preloader fixed inset-0 z-[200] items-center bg-[var(--bg-canvas)] [clip-path:inset(0_0_0_0)]">
      <div ref={band} data-sig className="relative isolate w-full overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[#0b2f45]">
          <div className="pre-flow" />
        </div>
        <div aria-hidden className="giant-mask pointer-events-none relative flex justify-center">
          <p ref={text} className="whitespace-nowrap py-[0.02em] text-[100px] font-medium leading-[0.86] tracking-[-0.06em]">
            <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              {chars(first)} {chars(rest.join(" "), true)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
