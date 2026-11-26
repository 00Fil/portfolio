"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { settled } from "@/lib/intro";

/** Attesa massima per ciò che serve alla prima schermata, oltre l'ingresso del nome. */
const MAX_WAIT_MS = 1000;

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const loaded = () => new Promise<void>((r) => (document.readyState === "complete" ? r() : window.addEventListener("load", () => r(), { once: true })));

/**
 * Schermata d'apertura, solo alla prima pagina della visita: il nome a tutta larghezza, come in fondo al sito.
 * Tutto è animato in CSS con sole trasformazioni: gira sul compositore e parte col primo disegno,
 * quindi non scatta mentre il browser è occupato a caricare e avviare la pagina.
 * La misura del nome è in vw, già giusta prima che arrivi il JavaScript.
 */
export function Preloader({ label }: { label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [first, ...rest] = label.split(" ");
  const last = rest.join(" ");
  const total = first.length + last.length;

  useEffect(() => {
    const html = document.documentElement;
    const el = root.current!;
    let alive = true;
    const lift = () => {
      html.dataset.lift = "1";
      window.dispatchEvent(new Event("intro:lift"));
    };
    const finish = () => {
      if (!alive) return;
      html.dataset.intro = "done";
      window.dispatchEvent(new Event("intro:done"));
    };

    // visite successive: una copertura del colore della pagina, tolta appena l'avvio è finito (al massimo 1 s)
    if (html.dataset.intro === "quick") {
      Promise.race([settled(), wait(MAX_WAIT_MS)]).then(() => {
        lift();
        el.classList.add("pre-fade");
        window.setTimeout(finish, 450);
      });
      return () => void (alive = false);
    }
    if (html.dataset.intro !== "run") return;

    // il nome entra in due tempi, nome e poi cognome: una tendina morbida da sinistra con un lieve scivolamento, veloce
    const spans = Array.from(el.querySelectorAll<HTMLElement>(".pre-ch"));
    const tl = gsap.timeline({ delay: 0.1 });
    spans.forEach((sp, i) => {
      tl.fromTo(
        sp,
        { opacity: 1, clipPath: "inset(-30% 100% -50% -12%)", xPercent: -7, scale: 1.04 },
        { clipPath: "inset(-30% -12% -50% -12%)", xPercent: 0, scale: 1, duration: 0.95, ease: "expo.out" },
        i * 0.2,
      );
    });
    const entered = new Promise<void>((r) => tl.call(r, undefined, 1.0));
    const ready = entered.then(() => Promise.race([Promise.all([document.fonts?.ready, loaded()]).then(settled), wait(MAX_WAIT_MS)]));
    ready.then(() => {
      if (!alive) return;
      lift();
      el.classList.add("pre-out");
      window.setTimeout(finish, 1200);
    });
    return () => {
      alive = false;
      tl.kill();
    };
  }, [total]);

  /* la parola intera in un solo pezzo: il font del marchio collega le lettere, separarle le sfalserebbe */
  let k = 0;
  const chars = (s: string, light = false) => (
    <span data-script className={`pre-ch inline-block ${light ? "font-normal" : ""}`} style={{ ["--i" as string]: (k += 5) }}>
      {s}
    </span>
  );

  return (
    <div ref={root} role="img" aria-label={label} className="preloader fixed inset-0 z-[200] items-center bg-[var(--bg-canvas)]">
      <div data-sig className="relative isolate w-full overflow-hidden">
        <div aria-hidden className="absolute inset-x-0 inset-y-[3px] overflow-hidden bg-[#0b2f45]">
          <div className="pre-flow" />
        </div>
        <div aria-hidden className="giant-mask pointer-events-none relative flex justify-center">
          <p className="whitespace-nowrap text-[13vw] font-normal leading-[0.9]" style={{ fontFamily: "var(--font-logo), var(--font-sans)", fontSynthesis: "none", letterSpacing: "normal" }}>
            <span className="inline-block pb-[0.42em] pt-[0.14em] align-bottom">
              {chars(first)} {chars(last, true)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
