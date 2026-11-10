"use client";

import { useEffect, useRef } from "react";
import { settled } from "@/lib/intro";

/** Attesa massima per ciò che serve alla prima schermata, oltre l'ingresso del nome. */
const MAX_WAIT_MS = 1000;
/** Ritardo tra una lettera e la successiva, in secondi (lo stesso del CSS). */
const STAGGER = 0.045;

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

    // l'ingresso del nome è già partito in CSS: qui si aspetta la fine e che la pagina sia pronta
    const inMs = (0.12 + total * STAGGER + 1.1) * 1000 - performance.now();
    const ready = Promise.all([wait(Math.max(0, inMs)), Promise.race([Promise.all([document.fonts?.ready, loaded()]).then(settled), wait(Math.max(0, inMs) + MAX_WAIT_MS)])]);
    ready.then(() => {
      if (!alive) return;
      lift();
      el.classList.add("pre-out");
      window.setTimeout(finish, 1200);
    });
    return () => void (alive = false);
  }, [total]);

  let k = 0;
  const chars = (s: string, light = false) =>
    Array.from(s).map((c, i) => (
      <span key={i} className={`pre-ch inline-block ${light ? "font-normal" : ""}`} style={{ ["--i" as string]: k++ }}>
        {c === " " ? " " : c}
      </span>
    ));

  return (
    <div ref={root} role="img" aria-label={label} className="preloader fixed inset-0 z-[200] items-center bg-[var(--bg-canvas)]">
      <div data-sig className="relative isolate w-full overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[#0b2f45]">
          <div className="pre-flow" />
        </div>
        <div aria-hidden className="giant-mask pointer-events-none relative flex justify-center">
          <p className="whitespace-nowrap text-[16.2vw] font-medium leading-[0.86] tracking-[-0.06em]">
            <span className="inline-block overflow-hidden pb-[0.2em] pt-[0.04em] align-bottom">
              {chars(first)} {chars(last, true)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
