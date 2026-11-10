"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";

const Grainient = dynamic(() => import("@/components/reactbits/Grainient"), { ssr: false });

/** Gradiente React Bits del progetto, coi suoi colori: compare in hover sulla copertina. */
const RAMP: Record<string, string[]> = {
  creacloud: ["#08091a", "#10122A", "#5F6BA3", "#D98A6C", "#F4C9B6"],
  relay: ["#02040a", "#05070F", "#18348f", "#2F5FFF", "#a9c4ff"],
  unispace: ["#050b0b", "#0B1414", "#2E8F8A", "#EE8A6C", "#BFE7E2"],
};

/**
 * Identità dei progetti, tutte con l'impianto di Relay: sfondo a fibre nei colori del progetto,
 * icona dell'app, nome nel carattere del prodotto, due pillole di vetro.
 * Le parti che volano dalla copertina alla pagina portano data-flip (icona e nome).
 */
type Brand = {
  bg: string;
  fibers: string;
  live: string;
  icon: string;
  glow: string;
  name: string;
  /** carattere del nome: lo stesso nella copertina e nel titolo della pagina */
  font: string;
};

export const BRANDS: Record<string, Brand> = {
  creacloud: {
    bg: "#10122A",
    fibers: "/work/creacloud/fibers.webp",
    live: "bg=10122a&glow=5F6BA3&sec=D98A6C&line=F4C9B6",
    icon: "/work/creacloud/icon.svg",
    glow: "#7C89C4",
    name: "CreaCloud",
    font: "t-serif tracking-[-0.03em] leading-[0.9]",
  },
  relay: {
    bg: "#05070F",
    fibers: "/work/relay/fibers.webp",
    live: "bg=05070f",
    icon: "/work/relay/icon.webp",
    glow: "#2F5FFF",
    name: "Relay",
    font: "font-medium tracking-[-0.06em] leading-[0.9]",
  },
  unispace: {
    bg: "#0B1414",
    fibers: "/work/unispace/fibers.webp",
    live: "bg=0b1414&glow=2E8F8A&sec=EE8A6C&line=BFE7E2",
    icon: "/work/unispace/mascot-base.webp",
    glow: "#3F9C97",
    name: "uniSpace",
    font: "font-[family-name:var(--font-anton)] uppercase tracking-[-0.005em] leading-[0.95]",
  },
};

/** Il sottotitolo sotto il nome, breve come quelli dei prodotti Apple. */
export const TAGLINE: Record<string, { it: string; en: string }> = {
  relay: { it: "Un solo flusso. Su tutti i tuoi dispositivi.", en: "One flow. Across every device you own." },
  creacloud: { it: "Il calendario che si organizza da solo.", en: "The schedule that organises itself." },
  unispace: { it: "Ogni lezione. Senza un secondo sprecato.", en: "Every lecture. Not a second wasted." },
};

/** Sfondo: fibre ferme, e su richiesta l'animazione vera sopra. */
export function BrandBackdrop({ slug, live, hot }: { slug: string; live?: boolean; hot?: boolean }) {
  const b = BRANDS[slug];
  // il contesto WebGL nasce al primo hover e se ne va poco dopo l'uscita
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (hot) return setMounted(true);
    const id = window.setTimeout(() => setMounted(false), 1400);
    return () => window.clearTimeout(id);
  }, [hot]);
  return (
    <div className="absolute inset-0" style={{ background: b.bg }}>
      <img src={b.fibers} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      {hot !== undefined && (
        <div data-hot aria-hidden className="absolute inset-0" style={{ clipPath: "circle(0% at 50% 50%)" }}>
          {mounted && <Grainient colors={RAMP[slug]} angle={30} speed={0.7} flow={0.7} silk={0.35} grainAmount={0.05} contrast={1} interactive stir={1.8} intro={false} dpr={1} />}
        </div>
      )}
      {live && (
        <iframe
          title=""
          aria-hidden
          tabIndex={-1}
          src={`/visual/gradient.html?shape=hero&touch=0&intro=0&${b.live}`}
          className="pointer-events-none absolute inset-0 h-full w-full border-0 opacity-0 transition-opacity duration-1000"
          onLoad={(e) => (e.currentTarget.style.opacity = "1")}
        />
      )}
    </div>
  );
}

/** Icona dell'app con il suo alone. */
export function BrandIcon({ slug, className = "", style }: { slug: string; className?: string; style?: CSSProperties }) {
  const b = BRANDS[slug];
  return (
    <span data-flip="icon" className={`relative block shrink-0 ${className}`} style={style}>
      <span aria-hidden className="absolute inset-[-30%] rounded-full opacity-50 blur-[40px]" style={{ background: b.glow }} />
      <img src={b.icon} alt="" className="relative h-full w-full drop-shadow-[0_20px_30px_rgba(0,0,0,.55)]" draggable={false} />
    </span>
  );
}

/**
 * Copertina della scheda: icona e nome centrati, pillole sotto il nome.
 * Tutte le misure sono in cqw, frazioni della larghezza della copertina: la composizione resta identica a ogni misura.
 * `mini`: solo l'icona al centro (miniature del menu).
 */
export function Cover({ slug, mini, hot }: { slug: string; mini?: boolean; hot?: boolean }) {
  const b = BRANDS[slug];
  const locale = useLocale() as "it" | "en";
  return (
    <div className="absolute inset-0 [container-type:size]">
      <BrandBackdrop slug={slug} hot={hot} />
      <div className="absolute inset-0 flex items-center justify-center">
        {mini ? (
          <BrandIcon slug={slug} className="h-[46cqh] w-[46cqh]" />
        ) : (
          <div className="flex items-center gap-[4cqw]">
            <BrandIcon slug={slug} className="h-[19cqw] w-[19cqw]" />
            <div className="flex flex-col items-start gap-[2.6cqw]">
              <span data-flip="name" className={`block whitespace-nowrap text-[11.5cqw] text-[#F2F2F0] ${b.font}`}>
                {b.name}
              </span>
              <span className="block max-w-[26ch] text-[3.3cqw] font-semibold leading-[1.15] tracking-[-0.025em] text-white/90">{TAGLINE[slug]?.[locale]}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export type HeroText = { def: string; label: string; scroll: string };

/**
 * Apertura della pagina progetto, condivisa tra la pagina e la copertina in volo:
 * stesse posizioni al pixel, così il passaggio dall'una all'altra non si vede.
 * Icona e nome allineati alla griglia del sito, in basso a sinistra; a destra resta lo sfondo vivo.
 */
export function HeroArt({ slug, live, text }: { slug: string; live?: boolean; text: HeroText }) {
  const b = BRANDS[slug];
  return (
    <div className="absolute inset-0">
      <BrandBackdrop slug={slug} live={live} />
      <div aria-hidden data-hero-shade className="absolute inset-x-0 bottom-0 h-[60%] bg-[linear-gradient(to_top,rgba(0,0,0,.55),transparent)]" />
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto w-full max-w-[1280px] px-5 pb-10 sm:px-8 sm:pb-14">
          <BrandIcon slug={slug} className="h-[clamp(72px,8vw,120px)] w-[clamp(72px,8vw,120px)]" />
          <h1 data-flip="name" className={`mt-6 whitespace-nowrap text-[clamp(50px,11vw,172px)] text-[#F2F2F0] ${b.font}`}>
            {b.name}
          </h1>
          <div data-hero-rest className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="max-w-[48ch] text-[clamp(16px,1.5vw,21px)] leading-[1.45] text-white/85">{text.def}</p>
              <p className="t-label mt-4 text-white/60">{text.label}</p>
            </div>
            <span className="drop flex h-11 items-center gap-2 px-4 text-[14px] text-white" style={{ ["--drop-tint" as string]: "rgba(0,0,0,.35)" }}>
              {text.scroll}
              <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
