"use client";

import dynamic from "next/dynamic";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import * as si from "simple-icons";
import { Bead } from "@/components/glass/Bead";
import { AI, API, APPS, DESIGN, GEO, HW, SEO, SHOP, StoryV, WEB } from "./Spots";
import { Shape } from "@/components/visual/Shapes";
import { prefersReducedMotion } from "@/lib/env";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, CheckmarkCircle02Icon, Shield01Icon, Wrench01Icon } from "@hugeicons/core-free-icons";
import { SERVICES, type ServiceKey } from "@/content/services";
import { useLocale, useMessages } from "next-intl";

gsap.registerPlugin(useGSAP);

const SloshGauge = dynamic(() => import("@/components/reactbits/SloshGauge"), { ssr: false });

/**
 * Disegni dei servizi, appoggiati direttamente sulla scheda. Ognuno racconta una piccola storia a passaggi
 * (succede una cosa, poi la successiva), invece di un elenco. Sopra lo sfondo colorato della scheda c'è solo
 * vetro scuro o superfici chiare, mai lo stesso colore. Partono da soli quando entrano nello schermo.
 */
export type WidgetText = Record<string, string>;

const SKY = "#5ec4ff";
const WATER = `radial-gradient(circle at 35% 30%, #d9f2ff, ${SKY} 45%, #1f7fb8)`;
const DARK = "rgba(8,9,12,.66)";
const Brand = ({ icon, className = "h-4 w-4" }: { icon: { path: string }; className?: string }) => (
  <svg viewBox="0 0 24 24" className={`fill-current ${className}`} aria-hidden>
    <path d={icon.path} />
  </svg>
);
const WindowsGlyph = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`fill-current ${className}`} aria-hidden>
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <rect x="13" y="3" width="8" height="8" rx="1" />
    <rect x="3" y="13" width="8" height="8" rx="1" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
  </svg>
);
/** Spunta disegnata a mano, usata solo dove conferma qualcosa. */
const Tick = ({ className = "h-3 w-3", w = 3 }: { className?: string; w?: number }) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Il filtro che fa fondere le gocce tra loro; una sola volta nella pagina. */
export function GooDefs() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id="goo" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
        <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" result="g" />
        <feComposite in="SourceGraphic" in2="g" operator="atop" />
      </filter>
    </svg>
  );
}
const Water = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`pointer-events-none absolute inset-0 ${className}`} style={{ filter: "url(#goo)" }}>
    {children}
  </div>
);
const Cursor = ({ className = "" }: { className?: string }) => (
  <svg data-cur viewBox="0 0 16 16" className={`absolute left-0 top-0 z-20 h-4 w-4 opacity-0 drop-shadow-[0_2px_4px_rgba(0,0,0,.6)] ${className}`} aria-hidden>
    <path d="M2 1l11 6-5 1.5L6 14z" fill="#fff" stroke="#000" strokeWidth=".8" />
  </svg>
);

/** Tela fissa W×H scalata nello spazio disponibile; la timeline parte la prima volta che è visibile. */
/* ───────────── Spot: sopra ogni scheda, commenti a tutto quadro su vetro acrilico e la chiusura col marchio ───────────── */

export type SpotCfg = { says: { a: string; b: string; sub?: string }[]; sub: string; href: string; cta: string };
const SpotCtx = createContext<SpotCfg | null>(null);
/** Se impostato, la tela gira solo quando è vero e riparte da capo ogni volta che lo diventa (schede della home). */
const PlayCtx = createContext<boolean | undefined>(undefined);
const SCRIM_OFF = 0.001;
const BLUR = "blur(26px) saturate(1.8) brightness(0.86)";
/** La sfocatura si accende mezzo secondo prima del commento (così è pronta) e si spegne dopo: tenerla sempre accesa
 *  costringe il browser a ricalcolarla a ogni fotogramma dell'animazione sotto. */
const warm = (el: Element, on: boolean) => {
  const st = (el as HTMLElement).style;
  st.setProperty("backdrop-filter", on ? BLUR : "none");
  st.setProperty("-webkit-backdrop-filter", on ? BLUR : "none");
};

/** Un commento: il vetro si accende, le parole salgono una per una, poi si torna alla scena. `keep` lascia il vetro acceso. */
export function addSay(run: gsap.core.Timeline, el: Element, scrim: Element, zoom: Element, at: number, hold = 1.6, keep = false) {
  const w = el.querySelectorAll("[data-sw]");
  run.call(() => warm(scrim, true), undefined, Math.max(0, at - 0.5));
  run
    .to(scrim, { opacity: 1, duration: 0.45, ease: "power2.out" }, at)
    .set(el, { autoAlpha: 1 }, at)
    .fromTo(w, { yPercent: 115 }, { yPercent: 0, duration: 0.75, stagger: 0.05, ease: "expo.out", immediateRender: false }, at + 0.1)
    .to(w, { yPercent: -115, duration: 0.42, stagger: 0.025, ease: "power3.in" }, at + hold)
    .set(el, { autoAlpha: 0 }, at + hold + 0.55);
  if (!keep) run.to(scrim, { opacity: SCRIM_OFF, duration: 0.5, ease: "power2.inOut" }, at + hold + 0.35).call(() => warm(scrim, false), undefined, at + hold + 0.9);
  void zoom;
}
/** La chiusura: marchio, riga del servizio e tasto; poi il vetro si spegne. Restituisce la fine. */
export function addEnd(run: gsap.core.Timeline, q: (s: string) => Element[], at: number, hold = 3.4) {
  const end = q("[data-end]")[0];
  const bits = q("[data-end-in]");
  const scrim = q("[data-scrim]")[0];
  const zoom = q("[data-zoom]")[0];
  run.call(() => warm(scrim, true), undefined, Math.max(0, at - 0.5));
  run
    .to(scrim, { opacity: 1, duration: 0.4 }, at)
    .set(end, { autoAlpha: 1 }, at)
    .fromTo(bits, { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.85, stagger: 0.09, ease: "expo.out", immediateRender: false }, at)
    .to(bits, { autoAlpha: 0, duration: 0.4, stagger: 0.04, ease: "power2.in" }, at + hold)
    .set(end, { autoAlpha: 0 }, at + hold + 0.5)
    .to(scrim, { opacity: SCRIM_OFF, duration: 0.5, ease: "power2.inOut" }, at + hold + 0.2)
    .call(() => warm(scrim, false), undefined, at + hold + 0.8);
  void zoom;
  return at + hold + 0.9;
}
/** Ritmo comune: prima la scena, poi un commento ogni scena, infine il marchio. */
function spotTimeline(q: (s: string) => Element[]) {
  const scrim = q("[data-scrim]")[0];
  const zoom = q("[data-zoom]")[0];
  const says = q("[data-say]");
  const run = gsap.timeline({ repeat: -1 });
  let at = 3.4;
  says.forEach((el) => {
    addSay(run, el, scrim, zoom, at, 1.6);
    at += 2.5 + 4.4;
  });
  const done = addEnd(run, q, at);
  run.to({}, { duration: 0.01 }, done + 0.6);
  return run;
}

function Words({ s, cls = "" }: { s: string; cls?: string }) {
  return (
    <>
      {s.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <span data-sw className={`inline-block ${cls}`}>
            {w}&nbsp;
          </span>
        </span>
      ))}
    </>
  );
}

/** Livello sopra la tela, grande quanto la scheda: vetro, commenti, marchio. Il vetro è sempre lì (quasi trasparente)
 *  così la sfocatura è già pronta e non arriva in ritardo. */
function SpotLayer({ spot }: { spot: SpotCfg }) {
  const router = useRouter();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]" style={{ containerType: "size" }}>
      <div data-scrim className="spot-scrim absolute inset-0" style={{ opacity: SCRIM_OFF }} />
      {spot.says.map((x, i) => (
        <div key={i} data-say className="invisible absolute inset-0 flex flex-col items-center justify-center px-[6cqw] text-center">
          <p className="text-[clamp(24px,7cqw,60px)] font-semibold leading-[1.04] tracking-[-0.045em] text-white">
            <Words s={x.a} />
            <br />
            <Words s={x.b} cls="text-[#8fd8ff]" />
          </p>
          {x.sub && (
            <span className="mt-[2.4cqw] inline-block overflow-hidden">
              <span data-sw className="inline-block text-[clamp(12px,2.1cqw,16px)] text-white/60">
                {x.sub}
              </span>
            </span>
          )}
        </div>
      ))}
      <div data-end className="invisible absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="inline-block overflow-hidden pb-[0.1em]">
          <span data-end-in className="inline-block text-[clamp(30px,8.6cqw,68px)] leading-none tracking-[-0.055em] text-white">
            <span className="font-medium">Filippo</span> <span className="font-normal text-white/60">Corsini</span>
          </span>
        </span>
        <span className="mt-[1.6cqw] inline-block overflow-hidden">
          <span data-end-in className="inline-block text-[clamp(12px,2.2cqw,16px)] text-white/60">
            {spot.sub}
          </span>
        </span>
        <span className="mt-[4cqw] inline-block overflow-hidden p-2">
          <span data-end-in className="inline-block">
            {/* un pulsante, non un link: nella home la scheda è già un link e due link annidati rompono la pagina */}
            <Bead
              as="button"
              type="button"
              onClick={(e: { stopPropagation: () => void; preventDefault: () => void }) => {
                e.preventDefault();
                e.stopPropagation();
                if (spot.href.startsWith("#")) window.location.hash = spot.href.slice(1);
                else router.push(spot.href);
              }}
              tint="color-mix(in srgb, #5ec4ff 46%, transparent)"
              radius={24}
              className="pointer-events-auto flex h-11 items-center gap-2 px-5 text-[14px] font-medium text-white backdrop-blur-md"
            >
              {spot.cta}
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
            </Bead>
          </span>
        </span>
      </div>
    </div>
  );
}

/** Tela fissa W×H scalata nello spazio disponibile; la timeline parte la prima volta che è visibile.
 *  `ownSpot`: la scheda decide da sé quando mostrare i commenti (li sincronizza con le sue scene). */
export function Canvas({ w, h, max = 1, build, children, framed = true, ownSpot = false }: { w: number; h: number; max?: number; build: (q: (s: string) => Element[]) => gsap.core.Timeline; children: ReactNode; framed?: boolean; ownSpot?: boolean }) {
  const spot = useContext(SpotCtx);
  const play = useContext(PlayCtx);
  const timelines = useRef<gsap.core.Timeline[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [win, setWin] = useState(false);
  useEffect(() => {
    const o = box.current!;
    const ro = new ResizeObserver(() => {
      // proporzioni quasi uguali: riempie tutto lo spazio, a filo dei bordi.
      // Altrimenti diventa una finestra con angoli, ombra e margine, invece di un rettangolo tagliato a caso.
      const fit = Math.min(o.clientWidth / w, o.clientHeight / h);
      const fill = Math.max(o.clientWidth / w, o.clientHeight / h);
      const full = fill / fit < 1.1;
      const s = full ? fill : Math.min(max, fit * (framed ? 0.88 : 1));
      setWin(!full && framed);
      stage.current!.style.transform = `translate(-50%, -50%) scale(${s})`;
    });
    ro.observe(o);
    return () => ro.disconnect();
  }, [w, h, max, framed]);
  useGSAP(
    () => {
      const q = gsap.utils.selector(box.current);
      const tl = build(q).pause();
      const cap = spot && !ownSpot ? spotTimeline(q).pause() : null;
      timelines.current = cap ? [tl, cap] : [tl];
      if (prefersReducedMotion()) return void tl.progress(1);
      if (play !== undefined) return;
      // parte la prima volta che si vede e si ferma ogni volta che esce dallo schermo:
      // le animazioni infinite di sette schede non girano più in sottofondo mentre scorri altrove
      let started = false;
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting && (started || e.intersectionRatio >= 0.35)) {
            started = true;
            tl.play();
            cap?.play();
          } else if (!e.isIntersecting && started) {
            tl.pause();
            cap?.pause();
          }
        },
        { threshold: [0, 0.35] },
      );
      io.observe(box.current!);
      return () => io.disconnect();
    },
    { scope: box },
  );
  useEffect(() => {
    if (play === undefined || prefersReducedMotion()) return;
    if (play) {
      // si riparte pulito: niente inquadrature o commenti rimasti a metà dal passaggio precedente
      const q = gsap.utils.selector(box.current);
      gsap.set(q("[data-shot], [data-say], [data-end], [data-card], [data-p-blk], [data-p-maint]"), { autoAlpha: 0 });
      const scrim = q("[data-scrim]")[0];
      if (scrim) {
        gsap.set(scrim, { opacity: SCRIM_OFF });
        warm(scrim, false);
      }
    }
    timelines.current.forEach((t) => (play ? t.restart() : t.pause()));
  }, [play]);
  return (
    <div ref={box} aria-hidden className="pointer-events-none relative h-full w-full min-w-0 select-none">
      <div
        ref={stage}
        className={`absolute left-1/2 top-1/2 ${win ? "overflow-hidden rounded-[22px] bg-[rgba(9,12,16,.72)] shadow-[0_50px_100px_-40px_rgba(0,0,0,.75),0_0_0_1px_rgba(255,255,255,.1)] backdrop-blur-xl" : ""}`}
        style={{ width: w, height: h, transform: "translate(-50%, -50%) scale(0.5)" }}
      >
        <div data-zoom className="absolute inset-0 origin-center">
          {children}
        </div>
      </div>
      {spot && <SpotLayer spot={spot} />}
    </div>
  );
}

const enter = { y: 14, autoAlpha: 0, duration: 0.8, ease: "expo.out" };
const pop = { scale: 0, autoAlpha: 0, duration: 0.9, ease: "elastic.out(1, 0.55)" };

/** Una sola riga che cambia: esce quella vecchia, entra la nuova. È il "passaggio" di ogni storia. */
function step(tl: gsap.core.Timeline, list: Element[], i: number, at: number) {
  tl.to(
    list.filter((_, j) => j !== i),
    { autoAlpha: 0, y: -8, filter: "blur(4px)", duration: 0.3, ease: "power2.in" },
    at,
  ).fromTo(list[i], { autoAlpha: 0, y: 8, filter: "blur(4px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "expo.out", immediateRender: false }, at + 0.18);
}
const Steps = ({ items, attr = "data-cap", className = "" }: { items: ReactNode[]; attr?: string; className?: string }) => (
  <span className={`relative block ${className}`}>
    {items.map((it, i) => (
      <span key={i} {...{ [attr]: "" }} className={`${i ? "absolute inset-x-0 top-0 opacity-0" : "relative"} flex items-center gap-2 whitespace-nowrap`} style={{ justifyContent: "inherit" }}>
        {it}
      </span>
    ))}
  </span>
);
/** Migliaia sempre separate (in italiano Intl non separa i numeri di quattro cifre). */
const num = (v: number, url: string) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, url.endsWith(".it") ? "." : ",");

/* ───────────── Siti e web app: il prodotto in 3D. Sopra il sito e l'app, sotto la logica e i dati che li tengono insieme ───────────── */

function WebV({ t, max }: { t: WidgetText; max?: number }) {
  const labels = [t.webL1, t.webL2, t.webL3];
  const OPEN = [0, 110, 220];
  const SHUT = [0, 26, 52];
  return (
    <Canvas framed={false}
      w={600}
      h={740}
      max={max}
      build={(q) => {
        const pl = q("[data-plane]");
        const tag = q("[data-tag]");
        gsap.set(q("[data-stack]"), { rotationX: 54, rotationZ: -30, transformPerspective: 1800 });
        gsap.set(pl, { z: (i: number) => SHUT[2 - i] });
        const tl = gsap
          .timeline()
          .from(pl, { z: (i: number) => -200 - i * 60, autoAlpha: 0, duration: 1.4, stagger: 0.12, ease: "expo.out" })
          .to(q("[data-stack]"), { rotationZ: -22, rotationX: 50, duration: 7, yoyo: true, repeat: -1, ease: "sine.inOut" }, 1);
        const run = gsap.timeline({ repeat: -1, repeatDelay: 0.4, defaults: { ease: "expo.inOut" } });
        run
          // gli strati si separano
          .to(pl, { z: (i: number) => OPEN[2 - i], duration: 1.5, stagger: 0.07 }, 0)
          .fromTo(tag, { x: -12, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, stagger: 0.1, ease: "expo.out", immediateRender: false }, 0.7)
          // un ordine arriva dai dati, passa dalla logica e compare nel sito e nell'app
          .fromTo(q("[data-row]"), { backgroundColor: "rgba(255,255,255,.14)" }, { backgroundColor: SKY, duration: 0.3, yoyo: true, repeat: 1, immediateRender: false }, 1.8)
          .fromTo(q("[data-ping]"), { scale: 0.4, autoAlpha: 0.9 }, { scale: 2.6, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: "power2.out", immediateRender: false }, 2.1)
          .fromTo(q("[data-new]"), { scaleX: 0 }, { scaleX: 1, transformOrigin: "0 50%", duration: 0.7, stagger: 0.15, ease: "power3.out", immediateRender: false }, 2.6)
          .fromTo(q("[data-badge]"), { scale: 0 }, { scale: 1, duration: 0.6, ease: "back.out(3)", immediateRender: false }, 2.9)
          // si richiudono
          .to(tag, { autoAlpha: 0, x: -8, duration: 0.4 }, 5)
          .to(pl, { z: (i: number) => SHUT[2 - i], duration: 1.3, stagger: { each: 0.07, from: "end" } }, 5)
          .set(q("[data-new]"), { scaleX: 0 }, 6.4)
          .set(q("[data-badge]"), { scale: 0 }, 6.4);
        return tl.add(run, 1.4);
      }}
    >
      <div className="absolute inset-y-0 left-0 right-[150px] flex items-center justify-center">
        <div data-stack className="relative h-[300px] w-[420px] [transform-style:preserve-3d]">
          {/* sopra: il sito e l'app, sullo stesso piano */}
          <div data-plane className="absolute inset-0 [transform-style:preserve-3d]">
            <div className="absolute left-0 top-0 h-[300px] w-[292px] overflow-hidden rounded-[18px] bg-[#f6f3ee] shadow-[0_40px_70px_-20px_rgba(0,0,0,.55)]">
              <div className="flex h-7 items-center gap-1.5 bg-[#e8e3dc] px-3">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 rounded-full bg-black/15" />
                ))}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="h-2.5 w-14 rounded-full bg-[#16161a]" />
                  <span className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-7 rounded-full bg-black/20" />
                    ))}
                  </span>
                </div>
                <span className="mt-6 block h-5 w-[80%] rounded-[5px] bg-[#16161a]" />
                <span className="mt-2 block h-5 w-[56%] rounded-[5px] bg-[#16161a]" />
                <span className="mt-4 block h-2 w-[66%] rounded-full bg-black/20" />
                <span className="mt-5 block h-8 w-28 rounded-full" style={{ background: SKY }} />
                <span className="mt-5 grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="relative h-12 overflow-hidden rounded-[8px] bg-black/[0.06]">
                      {i === 0 && <span data-new className="absolute inset-0" style={{ background: "rgba(94,196,255,.5)", transform: "scaleX(0)" }} />}
                    </span>
                  ))}
                </span>
              </div>
            </div>
            <div className="absolute right-0 top-[20px] h-[260px] w-[116px] overflow-hidden rounded-[24px] border-[5px] border-[#16161a] bg-[#f6f3ee] p-3 shadow-[0_40px_70px_-20px_rgba(0,0,0,.55)]">
              <span className="mx-auto block h-1.5 w-8 rounded-full bg-[#16161a]" />
              <span className="mt-5 block h-3 w-[80%] rounded-[3px] bg-[#16161a]" />
              <span className="mt-1.5 block h-3 w-[56%] rounded-[3px] bg-[#16161a]" />
              <span className="mt-4 block h-16 rounded-[10px] bg-black/[0.06]">
                <span data-new className="block h-full rounded-[10px]" style={{ background: "rgba(94,196,255,.5)", transform: "scaleX(0)" }} />
              </span>
              <span className="mt-3 block h-7 rounded-full" style={{ background: SKY }} />
              <span data-badge className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#16161a] text-[9px] font-semibold text-white" style={{ transform: "scale(0)" }}>
                1
              </span>
            </div>
          </div>
          {/* in mezzo: la logica */}
          <div data-plane className="absolute inset-0 rounded-[22px] bg-[rgba(10,24,36,.7)] shadow-[inset_0_0_0_1px_rgba(255,255,255,.2)]">
            <svg viewBox="0 0 420 300" className="absolute inset-0 h-full w-full" aria-hidden>
              {[
                [90, 90, 210, 150],
                [90, 210, 210, 150],
                [210, 150, 330, 90],
                [210, 150, 330, 210],
              ].map(([a, b, c, d], i) => (
                <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="rgba(158,220,255,.55)" strokeWidth="1.8" />
              ))}
              {[
                [90, 90],
                [90, 210],
                [210, 150],
                [330, 90],
                [330, 210],
              ].map(([x, y], i) => (
                <g key={i}>
                  <circle data-ping cx={x} cy={y} r="12" fill="none" stroke={SKY} strokeWidth="1.8" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
                  <circle cx={x} cy={y} r={i === 2 ? 11 : 7} fill={i === 2 ? SKY : "#d9f2ff"} />
                </g>
              ))}
            </svg>
          </div>
          {/* sotto: i dati */}
          <div data-plane className="absolute inset-0 rounded-[22px] bg-[rgba(6,14,22,.78)] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,.16)]">
            {[0, 1, 2, 3, 4, 5, 6].map((r) => (
              <span key={r} className="mb-[16px] flex gap-3">
                <span className="h-2.5 w-14 rounded-full bg-white/25" />
                <span className="h-2.5 flex-1 rounded-full bg-white/[0.12]" />
                <span {...(r === 3 ? { "data-row": "" } : {})} className="h-2.5 w-16 rounded-full bg-white/[0.14]" />
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* etichette degli strati */}
      <div className="absolute right-0 top-[272px] flex flex-col gap-[70px]">
        {labels.map((l, i) => (
          <span key={l} data-tag className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.14em] text-white/85 opacity-0">
            <span className="h-px w-10 bg-white/45" />
            {l}
            <span className="text-white/40">{String(i + 1).padStart(2, "0")}</span>
          </span>
        ))}
      </div>
    </Canvas>
  );
}

/* ───────────── SEO: la scheda diventa il pannello "Rendimento" di Google Search Console, una metrica alla volta ───────────── */

// mesi fermi su risultati mediocri, poi il lavoro fa effetto e le curve si impennano
const GSC = [
  { c: "#4285f4", pts: [66, 68, 65, 67, 64, 66, 65, 63, 64, 58, 44, 28, 14, 5] },
  { c: "#5e35b1", pts: [62, 63, 61, 64, 62, 63, 60, 61, 58, 53, 41, 30, 19, 11] },
  { c: "#00897b", pts: [60, 58, 61, 59, 60, 58, 59, 57, 56, 51, 43, 36, 29, 24] },
  { c: "#e8710a", pts: [68, 66, 69, 67, 68, 66, 67, 65, 61, 50, 37, 27, 20, 16] },
];
const HI = 11;
function SeoV({ t, max }: { t: WidgetText; max?: number }) {
  const W = 552;
  const H = 140;
  const path = (p: number[]) => p.map((y, i) => `${i ? "L" : "M"}${((i / (p.length - 1)) * W).toFixed(1)} ${(y * 1.9).toFixed(1)}`).join(" ");
  const labels = [t.seoM1, t.seoM2, t.seoM3, t.seoM4];
  const values = [t.seoV1, t.seoV2, t.seoV3, t.seoV4];
  const hx = (HI / (GSC[0].pts.length - 1)) * W;
  return (
    <Canvas
      w={600}
      h={360}
      max={max}
      build={(q) => {
        const tl = gsap.timeline().from(q("[data-tile]"), { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.06, ease: "expo.out" });
        const tiles = q("[data-tile]");
        const n = q("[data-count]")[0];
        const run = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
        GSC.forEach((g, i) => {
          const at = 0.3 + i * 1.15;
          run
            .to(tiles[i], { backgroundColor: g.c, color: "#fff", boxShadow: `0 10px 22px -10px ${g.c}`, duration: 0.35, ease: "power2.out" }, at)
            .fromTo(tiles[i].querySelector("[data-box]"), { backgroundColor: "rgba(255,255,255,0)", color: "rgba(0,0,0,0)" }, { backgroundColor: "#fff", color: g.c, duration: 0.25 }, at)
            .fromTo(tiles[i].querySelector("[data-val]"), { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "expo.out" }, at + 0.1)
            .fromTo(q("[data-gl]")[i], { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1.3, ease: "power1.in" }, at);
        });
        const o = { v: 0 };
        run.fromTo(o, { v: 0 }, { v: 12480, duration: 1.2, ease: "power3.out", onUpdate: () => void (n.textContent = num(o.v, t.url)) }, 0.4);
        run
          .fromTo(q("[data-hover]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 5)
          .fromTo(q("[data-hdot]"), { scale: 0 }, { scale: 1, transformOrigin: "50% 50%", stagger: 0.06, duration: 0.4, ease: "back.out(3)" }, 5.05)
          .fromTo(q("[data-tip]"), { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "expo.out" }, 5.15)
          .to(q("[data-hover], [data-tip]"), { autoAlpha: 0, duration: 0.3 }, 7.6)
          .to(tiles, { backgroundColor: "#fff", color: "#5f6368", boxShadow: "0 0 0 0 rgba(0,0,0,0)", duration: 0.4 }, 7.8)
          .to(q("[data-val]"), { autoAlpha: 0, duration: 0.3 }, 7.8)
          .to(q("[data-box]"), { backgroundColor: "rgba(255,255,255,0)", color: "rgba(0,0,0,0)", duration: 0.3 }, 7.8)
          .to(q("[data-gl]"), { strokeDashoffset: -100, duration: 0.6, ease: "power2.in" }, 7.8);
        return tl.add(run, 0.4);
      }}
    >
      <div className="absolute inset-0 bg-white text-[#202124]">
        <div className="absolute inset-x-6 top-6 flex items-center justify-between text-[13px]">
          <span className="flex items-center gap-2.5 font-medium">
            <Brand icon={si.siGooglesearchconsole} className="h-[18px] w-[18px] text-[#4285f4]" />
            {t.seoTitle}
          </span>
          <span className="rounded-full px-3 py-1 text-[12px] text-[#5f6368] shadow-[inset_0_0_0_1px_#dadce0]">{t.seoRange}</span>
        </div>
        <div className="absolute left-6 top-[66px] flex gap-2">
          {GSC.map((g, i) => (
            <div key={g.c} data-tile className="relative h-[88px] w-[132px] rounded-[10px] px-3 pt-3 text-[#5f6368] shadow-[inset_0_0_0_1px_#dadce0]" style={{ backgroundColor: "#fff" }}>
              <span className="flex items-center gap-1.5 text-[11.5px] leading-tight">
                <span data-box className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] shadow-[inset_0_0_0_1.5px_currentColor]" style={{ color: "rgba(0,0,0,0)" }}>
                  <Tick className="h-3 w-3" w={3.4} />
                </span>
                {labels[i]}
              </span>
              <span data-val className="mt-3 block text-[28px] font-normal leading-none tracking-[-0.02em] tabular-nums opacity-0">
                {i ? values[i] : <span data-count>{values[0]}</span>}
              </span>
            </div>
          ))}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute left-6 top-[186px] overflow-visible" style={{ width: W, height: H }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1="0" x2={W} y1={4 + i * 33} y2={4 + i * 33} stroke="#e8eaed" />
          ))}
          {GSC.map((g) => (
            <path key={g.c} data-gl d={path(g.pts)} fill="none" stroke={g.c} strokeWidth="2.6" strokeLinejoin="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
          ))}
          <g data-hover opacity="0">
            <line x1={hx} x2={hx} y1="0" y2={H} stroke="#9aa0a6" strokeDasharray="2 3" />
            {GSC.map((g) => (
              <circle key={g.c} data-hdot cx={hx} cy={g.pts[HI] * 1.9} r="4.5" fill="#fff" stroke={g.c} strokeWidth="2.4" />
            ))}
          </g>
        </svg>
        <div data-tip className="absolute top-[176px] rounded-[8px] bg-[#3c4043] px-3 py-2 text-[11.5px] leading-[1.5] text-white opacity-0 shadow-lg" style={{ left: 24 + hx - 170 }}>
          <span className="block font-medium">{t.seoTipD}</span>
          {GSC.map((g, i) => (
            <span key={g.c} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: g.c }} />
              {t[`seoT${i + 1}`]}
            </span>
          ))}
        </div>
      </div>
    </Canvas>
  );
}

/* ───────────── GEO: la scheda diventa Claude, che risponde e cita il sito come fonte ───────────── */

const CLAUDE = "#D97757";
const SERIF = { fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', serif" };
function GeoV({ t, max }: { t: WidgetText; max?: number }) {
  const words = t.geoA.split(" ");
  return (
    <Canvas
      w={600}
      h={360}
      max={max}
      build={(q) => {
        const tl = gsap.timeline().from(q("[data-in]"), { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: "expo.out" });
        const run = gsap.timeline({ repeat: -1, repeatDelay: 2 });
        run
          .fromTo(q("[data-q]"), { x: 20, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, ease: "expo.out" }, 0)
          .fromTo(q("[data-star]"), { rotate: -180, scale: 0 }, { rotate: 0, scale: 1, duration: 0.8, ease: "back.out(2)" }, 0.5)
          .to(q("[data-star]"), { rotate: 360, duration: 2.6, ease: "none" }, 1.3)
          .fromTo(q("[data-w]"), { autoAlpha: 0, y: 4, filter: "blur(4px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.25, stagger: 0.045 }, 0.9)
          .fromTo(q("[data-src]"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9, ease: "elastic.out(1, 0.55)" })
          .to(q("[data-src]"), { boxShadow: `0 0 0 1.5px ${CLAUDE}`, duration: 0.6, yoyo: true, repeat: 3 })
          .to(q("[data-q], [data-w], [data-src]"), { autoAlpha: 0, duration: 0.4 }, "+=1.4");
        return tl.add(run, 0.5);
      }}
    >
      <div className="absolute inset-0 bg-[#262624]">
        <div data-in className="absolute inset-x-7 top-6 flex items-center justify-between text-[12.5px] text-[#9a988f]">
          <span className="flex items-center gap-2 text-[#c2c0b6]">
            <Brand icon={si.siClaude} className="h-4 w-4 text-[#D97757]" />
            Claude
          </span>
          <span>Sonnet 5.5</span>
        </div>
        <p data-q className="absolute right-7 top-[70px] max-w-[400px] rounded-[16px] bg-[#141413] px-4 py-2.5 text-[14.5px] text-[#f5f4ef] opacity-0">
          {t.geoQ}
        </p>
        <div className="absolute left-7 right-10 top-[132px] flex gap-3.5">
          <span data-star className="mt-1 h-[22px] w-[22px] shrink-0" style={{ color: CLAUDE }}>
            <Brand icon={si.siClaude} className="h-[22px] w-[22px]" />
          </span>
          <p className="text-[18px] leading-[1.5] text-[#f5f4ef]" style={SERIF}>
            {words.map((w, i) => (
              <span key={i} data-w className="inline-block opacity-0">
                {w}&nbsp;
              </span>
            ))}
            <span data-src className="ml-0.5 inline-flex h-6 items-center rounded-[7px] bg-[#3a3937] px-2 align-middle font-sans text-[12px] text-[#c2c0b6] opacity-0">
              {t.url}
            </span>
          </p>
        </div>
        <div data-in className="absolute inset-x-6 bottom-6 flex h-[54px] items-center gap-3 rounded-[18px] bg-[#30302e] px-5 text-[13.5px] text-[#9a988f] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
          <span className="text-[18px] leading-none">+</span>
          <span className="flex-1">{t.geoReply}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] text-[14px] text-white" style={{ background: "#c6613f" }}>
            ↑
          </span>
        </div>
      </div>
    </Canvas>
  );
}

/* ───────────── App: un aggiornamento parte dall'app e corre sulle linee fino a ogni piattaforma ───────────── */

const PLATFORMS: [string, ReactNode][] = [
  ["Android", <Brand key="a" icon={si.siAndroid} className="h-5 w-5" />],
  ["iOS", <Brand key="i" icon={si.siApple} className="h-5 w-5" />],
  ["macOS", <Brand key="m" icon={si.siMacos} className="h-5 w-8" />],
  ["Windows", <WindowsGlyph key="w" className="h-[18px] w-[18px]" />],
  ["Linux", <Brand key="l" icon={si.siLinux} className="h-5 w-5" />],
];
/** Linee di collegamento: una base sottile disegnata, e sopra una scia di luce che la percorre. */
function Links({ paths, w, h, color = "#fff" }: { paths: string[]; w: number; h: number; color?: string }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
      <defs>
        <filter id="link-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {paths.map((d) => (
        <path key={`b${d}`} data-base d={d} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="1.8" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
      ))}
      {paths.map((d) => (
        <path key={`g${d}`} data-glow d={d} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" pathLength={100} strokeDasharray="16 120" strokeDashoffset="16" opacity="0" filter="url(#link-glow)" />
      ))}
    </svg>
  );
}
const travel = (tl: gsap.core.Timeline, el: Element, at: number, d = 0.75) =>
  tl.set(el, { opacity: 1, strokeDashoffset: 16 }, at).to(el, { strokeDashoffset: -100, duration: d, ease: "power1.inOut" }, at).set(el, { opacity: 0 }, at + d);
const FLASH = "rgba(255,255,255,.34)";

function AppsV({ max }: { max?: number }) {
  const xs = PLATFORMS.map((_, i) => 32 + i * 64);
  const paths = xs.map((x) => `M160 62 C160 92 ${x} 78 ${x} 106`);
  return (
    <Canvas
      w={320}
      h={176}
      max={max}
      build={(q) => {
        const tl = gsap
          .timeline()
          .from(q("[data-core]"), pop)
          .from(q("[data-pf]"), { ...enter, stagger: 0.06 }, 0.2)
          .to(q("[data-base]"), { strokeDashoffset: 0, duration: 0.9, stagger: 0.06, ease: "power2.inOut" }, 0.4);
        const run = gsap.timeline({ repeat: -1, repeatDelay: 1 });
        run.to(q("[data-core]"), { scaleX: 1.1, scaleY: 0.9, duration: 0.16, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0);
        q("[data-glow]").forEach((g, i) => {
          travel(run, g, 0.15 + i * 0.09);
          run.to(q("[data-pfb]")[i], { ["--drop-tint" as string]: FLASH, color: "#fff", scale: 1.08, duration: 0.2, yoyo: true, repeat: 1, repeatDelay: 0.35 }, 0.85 + i * 0.09);
        });
        return tl.add(run, 1.2);
      }}
    >
      <Links paths={paths} w={320} h={176} />
      <img data-core src="/work/relay/icon.webp" alt="" className="absolute left-[134px] top-1 h-[52px] w-[52px] rounded-[15px] shadow-[0_18px_40px_-14px_rgba(0,0,0,.9)]" />
      <div className="absolute inset-x-0 bottom-0 flex justify-between px-1">
        {PLATFORMS.map(([n, ic]) => (
          <div key={n} data-pf className="flex w-[56px] flex-col items-center gap-1.5">
            <Bead data-pfb tint={DARK} radius={14} className="flex h-11 w-11 items-center justify-center text-white/70 backdrop-blur-md">
              {ic}
            </Bead>
            <span className="text-[10px] text-white [text-shadow:0_1px_6px_rgba(0,0,0,.7)]">{n}</span>
          </div>
        ))}
      </div>
    </Canvas>
  );
}

/* ───────────── Integrazioni: il gestionale parla con gli altri programmi, un evento alla volta ───────────── */

const LINKED = [si.siStripe, si.siHubspot, si.siGooglecalendar, si.siWhatsapp];
function ApiV({ t, max }: { t: WidgetText; max?: number }) {
  const names = [t.apiPay, t.apiCrm, t.apiCal, "WhatsApp"];
  const xs = [90, 230, 370, 510];
  const paths = xs.map((x) => `M300 76 C300 118 ${x} 104 ${x} 146`);
  return (
    <Canvas framed={false}
      w={600}
      h={360}
      max={max}
      build={(q) => {
        const tl = gsap
          .timeline()
          .from(q("[data-core]"), pop)
          .from(q("[data-svc]"), { ...enter, stagger: 0.08 }, 0.2)
          .to(q("[data-base]"), { strokeDashoffset: 0, duration: 0.9, stagger: 0.08, ease: "power2.inOut" }, 0.4)
          .from(q("[data-log]"), pop, 0.9);
        const run = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
        const caps = q("[data-cap]");
        q("[data-glow]").forEach((g, i) => {
          const at = i * 1.5;
          run.to(q("[data-core]"), { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1 }, at);
          travel(run, g, at + 0.05, 0.7);
          run.to(q("[data-svcb]")[i], { ["--drop-tint" as string]: FLASH, color: "#fff", scale: 1.1, duration: 0.2, yoyo: true, repeat: 1, repeatDelay: 0.5 }, at + 0.7);
          step(run, caps, i, at + 0.7);
        });
        return tl.add(run, 1.2);
      }}
    >
      <Links paths={paths} w={600} h={360} />
      <Bead data-core tint={DARK} radius={22} className="absolute left-[300px] top-[32px] -ml-[100px] flex h-11 w-[200px] items-center justify-center whitespace-nowrap text-[14px] font-medium text-white backdrop-blur-md">
        {t.apiCore}
      </Bead>
      {LINKED.map((ic, i) => (
        <span key={ic.slug} data-svc className="absolute top-[148px] -ml-[60px] flex w-[120px] flex-col items-center gap-2.5" style={{ left: xs[i] }}>
          <Bead data-svcb tint={DARK} radius={18} className="flex h-14 w-14 items-center justify-center text-white/80 backdrop-blur-md">
            <Brand icon={ic} className="h-6 w-6" />
          </Bead>
          <span className="text-[12.5px] text-white [text-shadow:0_1px_6px_rgba(0,0,0,.7)]">{names[i]}</span>
        </span>
      ))}
      <Bead data-log tint={DARK} radius={22} className="absolute left-[300px] top-[276px] -ml-[160px] flex h-11 w-[320px] items-center justify-center px-4 text-[13px] text-white backdrop-blur-md">
        <Steps items={[t.apiL1, t.apiL2, t.apiL3, t.apiL4].map((l) => <><Tick className="h-3.5 w-3.5 text-[#bfe8ff]" /> {l}</>)} className="justify-center" />
      </Bead>
    </Canvas>
  );
}

/* ───────────── Design: la scheda diventa un editor come Figma. Selezioni, cambi colore, angoli e carattere ───────────── */

const FIG = "#0d99ff";
const FILLS = [SKY, "#16324f", "#111214", "#f5efe6"];
/** Il cursore di chi lavora nel file, con il nome accanto come negli editor condivisi. */
const NamedCursor = ({ name, color, attr = "data-cur" }: { name: string; color: string; attr?: string }) => (
  <span {...{ [attr]: "" }} className="absolute left-0 top-0 z-20 flex items-start opacity-0">
    <svg viewBox="0 0 16 16" className="h-[18px] w-[18px] drop-shadow-[0_2px_4px_rgba(0,0,0,.5)]" aria-hidden>
      <path d="M2 1l11 6-5 1.5L6 14z" fill={color} stroke="#fff" strokeWidth="1" />
    </svg>
    <span className="ml-0.5 mt-3.5 whitespace-nowrap rounded-[6px] px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: color }}>
      {name}
    </span>
  </span>
);
function DesignV({ t, max }: { t: WidgetText; max?: number }) {
  const MX = 258;
  const MY = 80;
  const BTN = { x: MX + 24, y: MY + 128, w: 136, h: 42 };
  const TTL = { x: MX + 24, y: MY + 46, w: 240, h: 36 };
  const box = (r: typeof BTN) => ({ x: r.x - 4, y: r.y - 4, width: r.w + 8, height: r.h + 8 });
  const SW = (i: number) => 24 + 13 + i * 36;
  return (
    <Canvas
      w={600}
      h={360}
      max={max}
      build={(q) => {
        const cur = q("[data-cur]")[0];
        const sel = q("[data-sel]")[0];
        const rad = q("[data-rad]")[0];
        const btn = q("[data-btn]")[0];
        const o = { r: 8 };
        const tl = gsap
          .timeline()
          .from(q("[data-insp] > *"), { x: -12, autoAlpha: 0, duration: 0.7, stagger: 0.05, ease: "expo.out" })
          .from(q("[data-mock]"), { y: 24, autoAlpha: 0, duration: 0.9, ease: "expo.out" }, 0.1);
        const run = gsap.timeline({ repeat: -1, repeatDelay: 0.4, defaults: { ease: "power3.inOut" } });
        const click = (at: number, el?: Element) => {
          run.to(cur, { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1, transformOrigin: "0 0" }, at);
          if (el) run.to(el, { scale: 0.92, duration: 0.1, yoyo: true, repeat: 1 }, at);
        };
        run.set(sel, { ...box(BTN), autoAlpha: 0 }).fromTo(cur, { x: 620, y: 380, autoAlpha: 0 }, { x: BTN.x + 70, y: BTN.y + 22, autoAlpha: 1, duration: 0.9 }, 0.2);
        // 1. seleziono il tasto
        click(1.15);
        run.fromTo(sel, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, 1.2);
        step(run, q("[data-layer]"), 0, 1.2);
        // 2. cambio colore
        run.to(cur, { x: SW(1), y: 105, duration: 0.8 }, 1.6);
        click(2.45, q("[data-fill]")[1]);
        run
          .to(btn, { backgroundColor: FILLS[1], color: "#fff", duration: 0.4, ease: "power2.out" }, 2.5)
          .to(q("[data-fring]"), { x: 36, duration: 0.4, ease: "back.out(2)" }, 2.5)
          // 3. trascino gli angoli
          .to(cur, { x: 32, y: 176, duration: 0.6 }, 2.9)
          .to([cur, q("[data-knob]")[0]], { x: "+=84", duration: 0.9, ease: "power2.inOut" }, 3.6)
          .fromTo(o, { r: 8 }, { r: 21, duration: 0.9, ease: "power2.inOut", onUpdate: () => { rad.textContent = String(Math.round(o.r)); (btn as HTMLElement).style.borderRadius = `${o.r}px`; } }, 3.6)
          // 4. seleziono il titolo e cambio carattere
          .to(cur, { x: TTL.x + 120, y: TTL.y + 18, duration: 0.8 }, 4.7);
        click(5.55);
        run.to(sel, { ...box(TTL), duration: 0.45, ease: "expo.out" }, 5.6);
        step(run, q("[data-layer]"), 1, 5.6);
        run.to(cur, { x: 150, y: 246, duration: 0.8 }, 6);
        click(6.85, q("[data-font]")[1]);
        run.to(q("[data-fpill]"), { x: 80, width: 100, duration: 0.4, ease: "back.out(1.6)" }, 6.9);
        step(run, q("[data-ttl]"), 1, 6.9);
        // si ricomincia
        run
          .to(cur, { x: 620, y: 380, autoAlpha: 0, duration: 0.8 }, 8.6)
          .to(sel, { autoAlpha: 0, duration: 0.3 }, 8.6)
          .to(btn, { backgroundColor: FILLS[0], color: "#16161a", borderRadius: 8, duration: 0.5 }, 8.8)
          .to(q("[data-fring]"), { x: 0, duration: 0.4 }, 8.8)
          .to(q("[data-knob]"), { x: 0, duration: 0.5 }, 8.8)
          .to(q("[data-fpill]"), { x: 0, width: 72, duration: 0.4 }, 8.8)
          .call(() => void (rad.textContent = "8"), [], 8.8);
        step(run, q("[data-ttl]"), 0, 8.8);
        step(run, q("[data-layer]"), 0, 8.8);
        return tl.add(run, 0.9);
      }}
    >
      {/* pannello delle proprietà, a tutta altezza */}
      <div data-insp className="absolute inset-y-0 left-0 w-[214px] bg-[rgba(10,12,16,.78)] text-white shadow-[1px_0_0_rgba(255,255,255,.08)] backdrop-blur-xl">
        <span className="absolute left-6 top-6 flex items-center gap-2.5 text-[13px] font-semibold">
          <span className="h-3 w-3 rounded-[3px] border-[1.5px]" style={{ borderColor: FIG }} />
          <Steps items={[t.dLayer1, t.dLayer2]} attr="data-layer" />
        </span>
        <span className="absolute left-6 top-[70px] text-[11px] text-white/55">{t.dFill}</span>
        <span className="absolute left-6 top-[92px] flex gap-[10px]">
          {FILLS.map((f) => (
            <span key={f} data-fill className="h-[26px] w-[26px] rounded-[7px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.2)]" style={{ background: f }} />
          ))}
          <span data-fring className="absolute -left-[3px] -top-[3px] h-8 w-8 rounded-[9px]" style={{ boxShadow: `0 0 0 1.5px ${FIG}` }} />
        </span>
        <span className="absolute left-6 top-[146px] text-[11px] text-white/55">{t.dRadius}</span>
        <span className="absolute left-6 top-[174px] h-1 w-[124px] rounded-full bg-white/15">
          <span data-knob className="absolute -top-[6px] left-0 h-4 w-4 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.5)]" />
        </span>
        <span data-rad className="absolute left-[164px] top-[166px] w-7 text-right text-[12px] tabular-nums text-white/85">
          8
        </span>
        <span className="absolute left-6 top-[210px] text-[11px] text-white/55">{t.dText}</span>
        <span className="absolute left-6 top-[232px] flex text-[12px]">
          <span data-fpill className="absolute left-0 top-0 h-7 w-[72px] rounded-full bg-white/15" />
          <span data-font className="relative flex h-7 w-[72px] items-center justify-center">
            Geist
          </span>
          <span data-font className="t-serif relative ml-2 flex h-7 w-[100px] items-center justify-center text-[14px]">
            Instrument
          </span>
        </span>
      </div>
      {/* la tela con la schermata in lavorazione */}
      <div data-mock className="absolute h-[204px] w-[300px] rounded-[18px] bg-[#f6f3ee] shadow-[0_30px_60px_-24px_rgba(0,0,0,.8)]" style={{ left: MX, top: MY }} />
      <p className="absolute text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#8a857d]" style={{ left: MX + 24, top: MY + 24 }}>
        {t.dKick}
      </p>
      <div className="absolute text-[28px] leading-[36px] tracking-[-0.03em] text-[#16161a]" style={{ left: TTL.x, top: TTL.y, width: TTL.w, height: TTL.h }}>
        <Steps items={[<span key="a" className="font-semibold">{t.dTitle}</span>, <span key="b" className="t-serif text-[32px]">{t.dTitle}</span>]} attr="data-ttl" />
      </div>
      <p className="absolute text-[12px] text-[#6b6862]" style={{ left: MX + 24, top: MY + 92 }}>
        {t.dSub}
      </p>
      <span data-btn className="absolute flex items-center justify-center text-[13px] font-semibold text-[#16161a]" style={{ left: BTN.x, top: BTN.y, width: BTN.w, height: BTN.h, borderRadius: 8, background: FILLS[0] }}>
        {t.dBtn}
      </span>
      {/* la selezione, come in Figma */}
      <span data-sel className="pointer-events-none absolute left-0 top-0 opacity-0" style={{ boxShadow: `inset 0 0 0 1.5px ${FIG}` }}>
        {["-left-[4px] -top-[4px]", "-right-[4px] -top-[4px]", "-left-[4px] -bottom-[4px]", "-right-[4px] -bottom-[4px]"].map((p) => (
          <span key={p} className={`absolute h-2 w-2 bg-white ${p}`} style={{ boxShadow: `inset 0 0 0 1.5px ${FIG}` }} />
        ))}
      </span>
      <NamedCursor name="Filippo" color={FIG} />
    </Canvas>
  );
}

/* ───────────── AI: la scheda diventa la chat con l'agente (Claude) e lo schermo su cui lavora da solo ───────────── */

const Spinner = () => (
  <svg data-spin viewBox="0 0 16 16" className="absolute inset-0 h-4 w-4" aria-hidden>
    <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="2" />
    <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke={CLAUDE} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
function AiV({ t, max }: { t: WidgetText; max?: number }) {
  const tools = [t.aiT1, t.aiT2, t.aiT3, t.aiT4];
  const fields: [string, string][] = [
    [t.aiF1, t.aiV1],
    [t.aiF2, t.aiV2],
    [t.aiF3, t.aiV3],
    [t.aiF4, t.aiV4],
  ];
  /* tutto in coordinate della finestra di destra (340 × 360) */
  const FX = [20, 180];
  const FY = [110, 180];
  const FW = 140;
  return (
    <Canvas
      w={600}
      h={360}
      max={max}
      build={(q) => {
        const cur = q("[data-agent]")[0];
        const rows = q("[data-tool]");
        const vals = q("[data-val]");
        const reply = q("[data-reply]")[0];
        const run = gsap.timeline({ repeat: -1, repeatDelay: 0.3 });
        const type = (el: Element, text: string, at: number, d: number) => {
          const o = { n: 0 };
          run.fromTo(o, { n: 0 }, { n: text.length, duration: d, ease: "none", immediateRender: false, onUpdate: () => void (el.textContent = text.slice(0, Math.round(o.n))) }, at);
        };
        const tool = (i: number, on: number, off: number) =>
          run
            .fromTo(rows[i], { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out", immediateRender: false }, on)
            .fromTo(rows[i].querySelector("[data-spin]"), { autoAlpha: 1, rotate: 0 }, { rotate: 360 * 3, duration: off - on, ease: "none", transformOrigin: "50% 50%", immediateRender: false }, on)
            .to(rows[i].querySelector("[data-spin]"), { autoAlpha: 0, duration: 0.15 }, off)
            .fromTo(rows[i].querySelector("[data-ok]"), { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(3)", immediateRender: false }, off);
        const go = (x: number, y: number, at: number, d = 0.6) => run.to(cur, { x, y, duration: d, ease: "power3.inOut" }, at);
        const press = (at: number, el?: Element) => {
          run.to(cur, { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1, transformOrigin: "0 0" }, at);
          if (el) run.to(el, { scale: 0.93, duration: 0.1, yoyo: true, repeat: 1 }, at);
        };
        const view = (i: number, at: number) =>
          run
            .to(q("[data-view]"), { autoAlpha: (j: number) => (j === i ? 1 : 0), duration: 0.35 }, at)
            .to(q("[data-tabpill]"), { x: i ? 74 : 0, width: i ? 104 : 70, duration: 0.4, ease: "back.out(1.6)" }, at)
            .to(q("[data-tab]"), { color: (j: number) => (j === i ? "#fff" : "rgba(255,255,255,.5)"), duration: 0.3 }, at);

        const tl = gsap
          .timeline()
          .from(q("[data-chat]"), { autoAlpha: 0, duration: 0.8, ease: "power2.out" })
          .from(q("[data-win]"), { autoAlpha: 0, duration: 0.8, ease: "power2.out" }, 0.1);
        run
          .set(rows, { autoAlpha: 0 })
          .set(q("[data-ok]"), { scale: 0 })
          .set(q("[data-mark]"), { scaleX: 0 })
          .set(q("[data-replybox]"), { autoAlpha: 0, y: 8 })
          .set(q("[data-toast]"), { autoAlpha: 0 })
          .call(() => {
            vals.forEach((v) => (v.textContent = ""));
            reply.textContent = "";
          }, [], 0);
        view(0, 0);
        step(run, q("[data-send]"), 0, 0);
        run
          .fromTo(q("[data-user]"), { autoAlpha: 0, x: 14 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: "expo.out", immediateRender: false }, 0.1)
          .fromTo(q("[data-star]"), { rotate: 0 }, { rotate: 360, duration: 9, ease: "none", immediateRender: false }, 0.4)
          .fromTo(cur, { x: 360, y: 380, autoAlpha: 0 }, { x: 200, y: 150, autoAlpha: 1, duration: 0.8, ease: "power3.out", immediateRender: false }, 0.6);
        // 1. legge l'email
        tool(0, 0.6, 2);
        run.to(q("[data-mark]"), { scaleX: 1, duration: 0.45, stagger: 0.45, ease: "power2.inOut" }, 1.1);
        go(250, 158, 1.1, 0.8);
        // 2. apre il gestionale
        tool(1, 2.1, 2.9);
        go(150, 32, 2.1);
        press(2.75, q("[data-tab]")[1]);
        view(1, 2.8);
        // 3. compila e salva
        tool(2, 3, 5.6);
        fields.forEach(([, v], i) => {
          const at = 3.05 + i * 0.5;
          go(FX[i % 2] + FW / 2, FY[Math.floor(i / 2)] + 38, at, 0.35);
          type(vals[i], v, at + 0.3, 0.2 + v.length * 0.02);
        });
        go(276, 318, 5.05, 0.4);
        press(5.45, q("[data-save]")[0]);
        run.fromTo(q("[data-toast]"), { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: "expo.out", immediateRender: false }, 5.5);
        // 4. risponde al cliente
        tool(3, 5.8, 8.4);
        go(55, 32, 5.8);
        press(6.3, q("[data-tab]")[0]);
        view(0, 6.35);
        run.to(q("[data-replybox]"), { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" }, 6.5);
        go(150, 262, 6.5, 0.4);
        type(reply, t.aiReply, 6.8, 1.2);
        go(266, 310, 7.9, 0.4);
        press(8.3, q("[data-sendb]")[0]);
        step(run, q("[data-send]"), 1, 8.3);
        run.to(cur, { x: 360, y: 380, autoAlpha: 0, duration: 0.7, ease: "power3.in" }, 9.4).to([...q("[data-user]"), ...rows], { autoAlpha: 0, duration: 0.4 }, 10);
        return tl.add(run, 0.6);
      }}
    >
      {/* la chat con l'agente */}
      <div data-chat className="absolute inset-y-0 left-0 w-[260px] bg-[#262624] shadow-[1px_0_0_rgba(255,255,255,.08)]">
        <p className="absolute left-5 top-5 flex items-center gap-2 text-[12px] text-[#9a988f]">
          <Brand icon={si.siClaude} className="h-3.5 w-3.5 text-[#D97757]" />
          Claude
        </p>
        <p data-user className="absolute right-5 top-[52px] max-w-[210px] rounded-[14px] bg-[#141413] px-3.5 py-2.5 text-[12.5px] leading-[1.45] text-[#f5f4ef] opacity-0">
          {t.aiUser}
        </p>
        <div className="absolute left-5 right-5 top-[128px] flex gap-3">
          <span data-star className="mt-[2px] h-4 w-4 shrink-0" style={{ color: CLAUDE }}>
            <Brand icon={si.siClaude} className="h-4 w-4" />
          </span>
          <div className="flex-1 space-y-2.5">
            {tools.map((x) => (
              <div key={x} data-tool className="flex h-5 items-center gap-2.5 text-[12.5px] text-[#c2c0b6] opacity-0">
                <span className="relative h-4 w-4 shrink-0">
                  <Spinner />
                  <span data-ok className="absolute inset-0 flex scale-0 items-center justify-center rounded-full text-[#262624]" style={{ background: CLAUDE }}>
                    <Tick className="h-2.5 w-2.5" w={3.4} />
                  </span>
                </span>
                {x}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-x-4 bottom-4 flex h-11 items-center gap-2.5 rounded-[14px] bg-[#30302e] px-4 text-[12px] text-[#9a988f] shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]">
          <span className="flex-1">{t.geoReply}</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[12px] text-white" style={{ background: "#c6613f" }}>
            ↑
          </span>
        </div>
      </div>
      {/* lo schermo su cui lavora */}
      <div data-win className="absolute inset-y-0 left-[260px] right-0 overflow-hidden bg-[#16171a] text-white">
        <div className="relative flex h-16 items-center gap-2 border-b border-white/[0.07] px-5 text-[12.5px]">
          <span data-tabpill className="absolute left-5 top-[19px] h-[26px] w-[70px] rounded-full bg-white/10" />
          <span data-tab className="relative flex h-[26px] w-[70px] items-center justify-center">
            {t.aiTab1}
          </span>
          <span data-tab className="relative ml-1 flex h-[26px] w-[104px] items-center justify-center text-white/50">
            {t.aiTab2}
          </span>
        </div>
        {/* posta */}
        <div data-view className="absolute inset-x-0 bottom-0 top-16">
          <p className="absolute left-5 right-5 top-5 flex justify-between text-[12.5px]">
            <span className="font-semibold">{t.aiFrom}</span>
            <span className="text-white/45">09:41</span>
          </p>
          <p className="absolute left-5 top-[44px] text-[13px] font-medium text-white/90">{t.aiSubj}</p>
          <p className="absolute left-5 right-5 top-[70px] text-[12.5px] leading-[1.6] text-white/70">
            {t.aiMailA}{" "}
            <span className="relative whitespace-nowrap text-white">
              <span data-mark className="absolute -inset-x-0.5 inset-y-0 origin-left rounded-[3px] bg-[rgba(217,119,87,.4)]" />
              <span className="relative">{t.aiMailB}</span>
            </span>{" "}
            {t.aiMailC}{" "}
            <span className="relative whitespace-nowrap text-white">
              <span data-mark className="absolute -inset-x-0.5 inset-y-0 origin-left rounded-[3px] bg-[rgba(217,119,87,.4)]" />
              <span className="relative">{t.aiMailD}</span>
            </span>
            {t.aiMailE}
          </p>
          <div data-replybox className="absolute bottom-5 left-5 right-5 h-[110px] rounded-[14px] bg-white/[0.06] p-3.5 opacity-0">
            <p data-reply className="text-[12.5px] leading-[1.5] text-white/90" />
            <span data-sendb className="absolute bottom-3 right-3 flex h-8 w-[84px] items-center justify-center rounded-full bg-white text-[12px] font-semibold text-[#16161a]">
              <Steps items={[t.aiSendBtn, t.aiSentBtn]} attr="data-send" className="justify-center" />
            </span>
          </div>
        </div>
        {/* gestionale */}
        <div data-view className="absolute inset-x-0 bottom-0 top-16 opacity-0">
          <p className="absolute left-5 top-5 text-[13.5px] font-semibold">{t.aiNew}</p>
          {fields.map(([l], i) => (
            <div key={l} className="absolute" style={{ left: FX[i % 2], top: FY[Math.floor(i / 2)] - 64, width: FW }}>
              <p className="text-[11px] text-white/50">{l}</p>
              <p data-val className="mt-1.5 flex h-[34px] items-center rounded-[8px] bg-white/[0.07] px-3 text-[12.5px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]" />
            </div>
          ))}
          <p data-toast className="absolute bottom-[30px] left-5 flex items-center gap-1.5 text-[12px] text-[#86efac] opacity-0">
            <Tick className="h-3.5 w-3.5" />
            {t.aiSaved}
          </p>
          <span data-save className="absolute bottom-5 right-5 flex h-9 w-[88px] items-center justify-center rounded-full text-[12.5px] font-semibold text-[#16161a]" style={{ background: CLAUDE }}>
            {t.aiSave}
          </span>
        </div>
        <NamedCursor name="Claude" color={CLAUDE} attr="data-agent" />
      </div>
    </Canvas>
  );
}

/* ───────────── E-commerce: il prodotto galleggia, Apple Pay, il pagamento si chiude con una spunta ───────────── */

const Vase = () => (
  <svg viewBox="0 0 100 120" className="h-full w-full overflow-visible" aria-hidden>
    <defs>
      <linearGradient id="vase-b" x1="0" x2="1">
        <stop offset="0" stopColor="#1f7fb8" />
        <stop offset=".45" stopColor="#5ec4ff" />
        <stop offset=".7" stopColor="#d9f2ff" />
        <stop offset="1" stopColor="#3a9fd8" />
      </linearGradient>
    </defs>
    <path d="M38 10h24c-2 10-1 16 6 26 9 13 12 26 8 44-3 16-12 30-26 30S27 96 24 80c-4-18-1-31 8-44 7-10 8-16 6-26z" fill="url(#vase-b)" />
    <ellipse cx="50" cy="10" rx="12" ry="3" fill="#0e4f75" />
    <path d="M34 44c-6 12-6 26-2 38" stroke="#fff" strokeOpacity=".6" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);
function ShopV({ t, max }: { t: WidgetText; max?: number }) {
  return (
    <Canvas
      w={560}
      h={176}
      max={max}
      build={(q) => {
        const tl = gsap
          .timeline()
          .from(q("[data-prod]"), { y: 40, rotate: -12, autoAlpha: 0, duration: 1.4, ease: "expo.out" })
          .from(q("[data-panel]"), { x: 30, autoAlpha: 0, duration: 1, ease: "expo.out" }, 0.2)
          .from(q("[data-info] > *"), { ...enter, stagger: 0.08 }, 0.3)
          .from(q("[data-pay]"), { ...pop, stagger: 0.1 }, 0.6)
          .to(q("[data-prod]"), { y: -8, rotate: 4, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" }, 1.4)
          .to(q("[data-shadow]"), { scaleX: 0.8, opacity: 0.5, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" }, 1.4);
        const run = gsap.timeline({ repeat: -1, repeatDelay: 1.6 });
        run
          .fromTo(q("[data-cur]"), { x: 560, y: 170, autoAlpha: 0 }, { x: 470, y: 54, autoAlpha: 1, duration: 0.9, ease: "power3.inOut" }, 0.6)
          .to(q("[data-apple]"), { scale: 0.94, duration: 0.1, yoyo: true, repeat: 1 }, 1.5)
          .to(q("[data-cur]"), { autoAlpha: 0, duration: 0.2 }, 1.7)
          .fromTo(q("[data-splash]"), { scale: 0, autoAlpha: 1 }, { scale: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" }, 1.6)
          .fromTo(q("[data-tick]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" }, 2)
          .fromTo(q("[data-done]"), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 2.1)
          .to(q("[data-splash], [data-done], [data-tickwrap]"), { autoAlpha: 0, duration: 0.4 }, 4.4)
          .set(q("[data-tickwrap]"), { autoAlpha: 1 }, 4.9)
          .set(q("[data-tick]"), { strokeDashoffset: 100 }, 4.9);
        return tl.add(run, 0.8);
      }}
    >
      <span data-shadow className="absolute left-[30px] top-[158px] h-3 w-[100px] rounded-full bg-black/60 blur-md" />
      <span data-prod className="absolute left-[30px] top-0 block h-[150px] w-[100px] drop-shadow-[0_30px_40px_rgba(0,0,0,.45)]">
        <Vase />
      </span>
      <Bead data-panel tint={DARK} radius={20} className="absolute bottom-0 left-[160px] right-0 top-0 block backdrop-blur-md" />
      <div data-info className="absolute left-[182px] top-[30px]">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-white/70">{t.shopNew}</p>
        <p className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-white">{t.shopName}</p>
        <p className="text-[12px] text-white/60">{t.shopSub}</p>
        <p className="tabular-nums mt-3 text-[20px] font-medium text-white">€ 89,00</p>
      </div>
      <div className="absolute right-4 top-[30px] flex w-[170px] flex-col gap-2.5">
        <span data-pay data-apple className="flex h-10 items-center justify-center gap-1 rounded-[11px] bg-black text-[15px] font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,.2),0_18px_30px_-14px_rgba(0,0,0,.9)]">
          <Brand icon={si.siApple} className="h-4 w-4 -translate-y-px" />
          Pay
        </span>
        <span data-pay className="flex h-10 items-center justify-center rounded-[11px] bg-white text-[12.5px] font-semibold text-[#16161a]">
          {t.shopPay} € 89,00
        </span>
        <p data-pay className="text-center text-[10px] text-white/55">
          {t.shopOr}
        </p>
      </div>
      <Water className="z-[1]">
        <span data-splash className="absolute right-[50px] top-[22px] h-[100px] w-[100px] rounded-full opacity-0" style={{ background: WATER }} />
      </Water>
      <svg data-tickwrap viewBox="0 0 100 100" className="absolute right-[50px] top-[22px] z-[2] h-[100px] w-[100px]">
        <path data-tick d="M30 52l13 13 27-30" fill="none" stroke="#06263a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
      </svg>
      <p data-done className="absolute right-4 top-[130px] z-[2] w-[170px] text-center text-[12px] font-medium text-white opacity-0">
        {t.shopDone}
      </p>
      <Cursor className="z-[3]" />
    </Canvas>
  );
}

/* ───────────── Gestione: uno spot essenziale, come un'app Apple. Tre oggetti soli (la rete, lo scudo, i server),
   tanto spazio, un solo punto d'attenzione per scena; tra le scene il commento prende tutto il quadro;
   in chiusura il marchio e il tasto per la pagina del servizio ───────────── */

const OW = 700;
const OH = 440;
const NODE_Y = 206;
const GLOBE = { x: 140, y: NODE_Y, r: 32 };
const SHIELD = { x: 340, y: NODE_Y };
const RACK = { x: 500, w: 128 };
const UNIT_H = 32;
const SRV_Y = [NODE_Y - 44, NODE_Y, NODE_Y + 44];
const UNDER = NODE_Y + 92;
const AQUA = "#7fd0ff";
const RED = "#ff5a52";
const AMBER = "#f5a524";
const GREEN = "#34d399";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const PER_SRV = 3;
const ATTACKS = 5;

const fullPath = (y: number) => `M${GLOBE.x + GLOBE.r + 6} ${NODE_Y} L${SHIELD.x + 60} ${NODE_Y} C${SHIELD.x + 100} ${NODE_Y} ${RACK.x - 50} ${y} ${RACK.x + 4} ${y}`;
const attackPath = (k: number) => {
  const dy = (k - (ATTACKS - 1) / 2) * 12;
  return `M${GLOBE.x + GLOBE.r + 4} ${NODE_Y + dy * 0.4} C${GLOBE.x + 90} ${NODE_Y + dy * 1.8} ${SHIELD.x - 90} ${NODE_Y + dy * 1.4} ${SHIELD.x - 40} ${NODE_Y + dy * 0.6}`;
};
const SHIELD_D = `M${SHIELD.x} ${NODE_Y - 46} L${SHIELD.x + 36} ${NODE_Y - 32} V${NODE_Y + 2} C${SHIELD.x + 36} ${NODE_Y + 25} ${SHIELD.x + 19} ${NODE_Y + 40} ${SHIELD.x} ${NODE_Y + 48} C${SHIELD.x - 19} ${NODE_Y + 40} ${SHIELD.x - 36} ${NODE_Y + 25} ${SHIELD.x - 36} ${NODE_Y + 2} V${NODE_Y - 32} Z`;

/** Una scia di luce: testa brillante e coda sfumata sullo stesso cavo. */
function Comet({ d, color, attr }: { d: string; color: string; attr: string }) {
  return (
    <g {...{ [attr]: "" }} opacity="0">
      <path d={d} pathLength={100} fill="none" stroke={color} strokeOpacity=".35" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="16 300" strokeDashoffset="16" />
      <path d={d} pathLength={100} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="2.5 300" strokeDashoffset="2.5" />
    </g>
  );
}

/** Un server sottile, come in un armadio: solo la spia e il nome. */
function Unit({ i, y }: { i: number; y: number }) {
  const x = RACK.x + 10;
  const w = RACK.w - 20;
  return (
    <g data-unit>
      <rect x={x} y={y - UNIT_H / 2} width={w} height={UNIT_H} rx="9" fill="url(#ops-unit)" stroke="rgba(255,255,255,.16)" />
      <rect data-unit-tint x={x} y={y - UNIT_H / 2} width={w} height={UNIT_H} rx="9" fill={RED} opacity="0" />
      <circle data-led cx={x + 14} cy={y} r="3.2" fill={GREEN} />
      <text x={x + 26} y={y + 3.5} fill="rgba(255,255,255,.8)" fontSize="10" fontFamily={MONO} letterSpacing=".05em">
        SRV-0{i + 1}
      </text>
      {[0, 1, 2].map((k) => (
        <rect key={k} x={x + w - 30 + k * 7} y={y - 6} width="3" height="12" rx="1.5" fill="rgba(255,255,255,.1)" />
      ))}
    </g>
  );
}

/** Etichetta sotto l'oggetto in scena: una riga, un numero o uno stato. */
function Pill({ attr, x, children }: { attr: string; x: number; children: ReactNode }) {
  return (
    <span {...{ [attr]: "" }} className="absolute -translate-x-1/2 opacity-0" style={{ left: x, top: UNDER }}>
      <Bead tint="rgba(10,16,24,.55)" radius={16} className="flex h-8 items-center gap-2 whitespace-nowrap px-3.5 text-[12.5px] text-white backdrop-blur-xl">
        {children}
      </Bead>
    </span>
  );
}

function OpsV({ t, max }: { t: WidgetText; max?: number }) {
  const links = [`M${GLOBE.x + GLOBE.r + 6} ${NODE_Y} L${SHIELD.x - 40} ${NODE_Y}`, ...SRV_Y.map((y) => `M${SHIELD.x + 40} ${NODE_Y} L${SHIELD.x + 60} ${NODE_Y} C${SHIELD.x + 100} ${NODE_Y} ${RACK.x - 50} ${y} ${RACK.x + 4} ${y}`)];
  const rackX = RACK.x + RACK.w / 2;
  return (
    <Canvas
      framed={false}
      ownSpot
      w={OW}
      h={OH}
      max={max}
      build={(q) => {
        const scrim = q("[data-scrim]")[0];
        const says = q("[data-say]");
        const stage = q("[data-zoom]")[0];
        const units = q("[data-unit]");
        const leds = q("[data-led]");
        const tints = q("[data-unit-tint]");
        const legit = q("[data-legit]");
        const atk = q("[data-atk]");
        const flash = q("[data-impact]")[0];
        const blkPill = q("[data-p-blk]")[0];
        const blk = q("[data-blk]")[0];
        const maintPill = q("[data-p-maint]")[0];
        const card = q("[data-card]")[0];
        const timer = q("[data-timer]")[0];
        const [stAlert, stWork, stOk] = q("[data-st]");
        const merid = q("[data-merid]");
        const fmt = (n: number) => Math.round(n).toLocaleString("it-IT");
        const mmss = (v: number) => `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(Math.floor(v % 60)).padStart(2, "0")}`;
        const m = { blk: 12380, clock: 0, spin: 0 };
        const LOOP = 25.2;

        const tl = gsap
          .timeline()
          .from(q("[data-node]"), { y: 14, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: "expo.out" })
          .to(q("[data-base]"), { strokeDashoffset: 0, duration: 0.9, stagger: 0.06, ease: "power2.inOut" }, 0.3);
        const run = gsap.timeline({ repeat: -1 });

        // il globo gira piano per tutto lo spot
        run.to(m, { spin: Math.PI * 2, duration: LOOP, ease: "none", onUpdate: () => merid.forEach((el, k) => el.setAttribute("rx", String(Math.abs(Math.cos(m.spin + (k * Math.PI) / 3)) * GLOBE.r))) }, 0);

        const say = (i: number, at: number, hold = 1.6, keep = false) => says[i] && addSay(run, says[i], scrim, stage, at, hold, keep);
        const show = (el: Element, at: number) => run.fromTo(el, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out", immediateRender: false }, at);
        const hide = (el: Element, at: number) => run.to(el, { autoAlpha: 0, y: -6, duration: 0.35, ease: "power2.in" }, at);

        const flow = (from: number, to: number, targets: number[], gap = 0.32) => {
          let n = 0;
          for (let s = from; s < to; s += gap, n++) {
            const k = targets[n % targets.length];
            const c = legit[k * PER_SRV + (Math.floor(n / targets.length) % PER_SRV)];
            const [tail, head] = c.children;
            run
              .set(c, { opacity: 1 }, s)
              .fromTo(head, { strokeDashoffset: 2.5 }, { strokeDashoffset: -100, duration: 1.3, ease: "power1.inOut", immediateRender: false }, s)
              .fromTo(tail, { strokeDashoffset: 16 }, { strokeDashoffset: -86.5, duration: 1.3, ease: "power1.inOut", immediateRender: false }, s)
              .set(c, { opacity: 0 }, s + 1.32);
          }
        };
        const attack = (at: number) => {
          atk.forEach((c, i) => {
            const [tail, head] = c.children;
            const s = at + i * 0.12;
            run
              .set(c, { opacity: 1 }, s)
              .fromTo(head, { strokeDashoffset: 2.5 }, { strokeDashoffset: -97.5, duration: 0.7, ease: "power2.in", immediateRender: false }, s)
              .fromTo(tail, { strokeDashoffset: 16 }, { strokeDashoffset: -84, duration: 0.7, ease: "power2.in", immediateRender: false }, s)
              .to(c, { opacity: 0, duration: 0.15 }, s + 0.68)
              .fromTo(flash, { opacity: 0.8 }, { opacity: 0, duration: 0.5, ease: "power2.out", immediateRender: false }, s + 0.68);
          });
          run.to(m, { blk: `+=${ATTACKS * 73}`, duration: 0.6 + ATTACKS * 0.12, ease: "none", onUpdate: () => void (blk.textContent = fmt(m.blk)) }, at + 0.6);
        };

        // 1 · gli attacchi si fermano sullo scudo, il traffico vero passa
        say(0, 0, 1.6);
        show(blkPill, 2.5);
        attack(2.7);
        attack(3.7);
        flow(2.8, 5.4, [0, 1, 2]);
        hide(blkPill, 5.6);

        // 2 · aggiornamento: un server esce sulle guide, gli altri due tengono il sito acceso
        say(1, 5.9, 1.6);
        run.to(units[1], { x: 18, duration: 0.8, ease: "power3.inOut" }, 8.2).to(leds[1], { attr: { fill: AMBER }, duration: 0.2 }, 8.2);
        show(maintPill, 8.4);
        flow(8.3, 10.6, [0, 2], 0.28);
        hide(maintPill, 10.6);
        run.to(units[1], { x: 0, duration: 0.8, ease: "power3.inOut" }, 10.7).to(leds[1], { attr: { fill: GREEN }, duration: 0.2 }, 11.3);

        // 3 · guasto alle 03:12, preso in carico dal tecnico reperibile
        say(2, 11.6, 1.4);
        run
          .to(leds[2], { attr: { fill: RED }, duration: 0.1, repeat: 5, yoyo: true }, 13.7)
          .set(leds[2], { attr: { fill: RED } }, 14.3)
          .to(tints[2], { opacity: 0.24, duration: 0.3 }, 13.7)
          .set(m, { clock: 0 }, 13.7)
          .set(timer, { textContent: "00:00" }, 13.7)
          .set([stWork, stOk], { autoAlpha: 0 }, 13.7)
          .set(stAlert, { autoAlpha: 1 }, 13.7);
        flow(13.8, 16.9, [0, 1], 0.3);
        show(card, 14.1);
        run
          .to(m, { clock: 238, duration: 2.7, ease: "power1.in", onUpdate: () => void (timer.textContent = mmss(m.clock)) }, 14.3)
          .to(stAlert, { autoAlpha: 0, duration: 0.2 }, 15.2)
          .to(stWork, { autoAlpha: 1, duration: 0.3 }, 15.3)
          .to(leds[2], { attr: { fill: GREEN }, duration: 0.2 }, 17.0)
          .to(tints[2], { opacity: 0, duration: 0.4 }, 17.0)
          .to(stWork, { autoAlpha: 0, duration: 0.2 }, 17.0)
          .to(stOk, { autoAlpha: 1, duration: 0.3 }, 17.1);
        flow(17.0, 18.6, [0, 1, 2]);
        hide(card, 18.7);

        // 4 · chiusura
        say(3, 19.0, 1.6, true);
        addEnd(run, q, 21.1, 3.2);
        run.to({}, { duration: 0.01 }, LOOP - 0.01);
        return tl.add(run, 1.0);
      }}
    >
      <div data-stage className="absolute inset-0 origin-center">
        <Links paths={links} w={OW} h={OH} />
        <svg viewBox={`0 0 ${OW} ${OH}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id="ops-unit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1f3a4f" stopOpacity=".9" />
              <stop offset="1" stopColor="#0d1a25" stopOpacity=".9" />
            </linearGradient>
            <linearGradient id="ops-glass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#bfe8ff" stopOpacity=".5" />
              <stop offset=".55" stopColor="#3ea4dc" stopOpacity=".3" />
              <stop offset="1" stopColor="#0b2f45" stopOpacity=".55" />
            </linearGradient>
            <radialGradient id="ops-impact" cx="0" cy=".5" r=".9">
              <stop offset="0" stopColor={RED} stopOpacity=".9" />
              <stop offset=".6" stopColor={RED} stopOpacity=".15" />
              <stop offset="1" stopColor={RED} stopOpacity="0" />
            </radialGradient>
            <pattern id="ops-hex" width="10" height="17.32" patternUnits="userSpaceOnUse">
              <path d="M5 0 L10 2.89 V8.66 L5 11.55 L0 8.66 V2.89 Z M0 14.43 L5 17.32 M10 14.43 L5 17.32 M5 11.55 V17.32" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth=".6" />
            </pattern>
            <clipPath id="ops-shield-clip">
              <path d={SHIELD_D} />
            </clipPath>
          </defs>

          {/* la rete */}
          <g data-node>
            <circle cx={GLOBE.x} cy={GLOBE.y} r={GLOBE.r} fill="rgba(8,20,30,.45)" stroke="rgba(255,255,255,.6)" strokeWidth="1.2" />
            {[-0.5, 0, 0.5].map((f) => (
              <ellipse key={f} cx={GLOBE.x} cy={GLOBE.y + f * GLOBE.r * 1.15} rx={GLOBE.r * Math.sqrt(1 - (f * 1.15) ** 2 * 0.75)} ry={GLOBE.r * 0.16} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".8" />
            ))}
            {[0, 1, 2].map((k) => (
              <ellipse key={k} data-merid cx={GLOBE.x} cy={GLOBE.y} rx={GLOBE.r * Math.abs(Math.cos((k * Math.PI) / 3))} ry={GLOBE.r} fill="none" stroke={AQUA} strokeOpacity=".6" strokeWidth=".9" />
            ))}
          </g>

          {/* lo scudo */}
          <g data-node>
            <path d={SHIELD_D} fill="url(#ops-glass)" stroke="rgba(255,255,255,.6)" strokeWidth="1.2" />
            <g clipPath="url(#ops-shield-clip)">
              <rect x={SHIELD.x - 40} y={NODE_Y - 50} width="80" height="100" fill="url(#ops-hex)" />
              <rect data-impact x={SHIELD.x - 40} y={NODE_Y - 50} width="80" height="100" fill="url(#ops-impact)" opacity="0" />
            </g>
            <path d={`M${SHIELD.x - 11} ${NODE_Y + 1} l7 7 l15 -15`} fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* i server */}
          <g data-node>
            <rect x={RACK.x} y={SRV_Y[0] - UNIT_H / 2 - 10} width={RACK.w} height={SRV_Y[2] - SRV_Y[0] + UNIT_H + 20} rx="18" fill="rgba(6,12,18,.4)" stroke="rgba(255,255,255,.12)" />
            {SRV_Y.map((y, i) => (
              <Unit key={y} i={i} y={y} />
            ))}
          </g>

          {Array.from({ length: ATTACKS }).map((_, k) => (
            <Comet key={`a${k}`} d={attackPath(k)} color={RED} attr="data-atk" />
          ))}
          {SRV_Y.flatMap((y, k) => Array.from({ length: PER_SRV }).map((_, j) => <Comet key={`l${k}${j}`} d={fullPath(y)} color={AQUA} attr="data-legit" />))}
        </svg>

        {/* un'etichetta per scena, sotto l'oggetto che conta */}
        <Pill attr="data-p-blk" x={SHIELD.x}>
          <HugeiconsIcon icon={Shield01Icon} size={14} strokeWidth={1.8} className="text-[#8fd8ff]" />
          <span data-blk className="font-mono tabular-nums">12.380</span>
          <span className="text-white/60">{t.opsBlockedN}</span>
        </Pill>
        <Pill attr="data-p-maint" x={rackX}>
          <HugeiconsIcon icon={Wrench01Icon} size={14} strokeWidth={1.8} className="text-[#f5c46b]" />
          <span>{t.opsMaintLine}</span>
        </Pill>

        {/* il tecnico reperibile: come una notifica, sotto i server */}
        <div data-card className="absolute -translate-x-1/2 opacity-0" style={{ left: rackX - 40, top: UNDER - 6, width: 292 }}>
          <Bead tint="rgba(12,18,26,.8)" radius={20} className="flex items-center gap-3 p-2.5 pr-3.5 text-white">
            <span className="relative shrink-0">
              <span className="block h-10 w-10 overflow-hidden rounded-full bg-[linear-gradient(160deg,#bfe8ff,#5ec4ff_55%,#1f7fb8)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/visual/agent.svg" alt="" className="h-full w-full translate-y-[2px] scale-110" draggable={false} />
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#30d158] shadow-[0_0_0_2px_rgba(10,16,24,.9)]" />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-[13.5px] font-semibold tracking-[-0.01em]">{t.opsAgent}</span>
              <span className="relative mt-0.5 block h-[16px] text-[12px]">
                <span data-st className="absolute inset-0 truncate text-[#ffb4ae]">{t.opsAgentAlert}</span>
                <span data-st className="absolute inset-0 truncate text-white/70 opacity-0">{t.opsAgentWork}</span>
                <span data-st className="absolute inset-0 flex items-center gap-1 truncate text-[#8ff0ad] opacity-0">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} strokeWidth={2} />
                  {t.opsAgentOk}
                </span>
              </span>
            </span>
            <span data-timer className="self-start font-mono text-[12px] tabular-nums text-white/55">
              00:00
            </span>
          </Bead>
        </div>
      </div>

    </Canvas>
  );
}

/* ───────────── Hardware: la cella frigo dal vivo; il sensore è un livello di liquido che sale con la temperatura ───────────── */

/** Il sensore: il liquido sale e oscilla con la temperatura, e cambia colore quando è troppo caldo. */
function Gauge({ hook }: { hook: { current: ((v: number) => void) | null } }) {
  const [v, setV] = useState(39);
  useEffect(() => {
    hook.current = (temp: number) => setV(Math.round(temp * 10));
    return () => void (hook.current = null);
  }, [hook]);
  return <SloshGauge value={v} showValue={false} liquidColor={v > 55 ? "#fbbf24" : "#e6f6ff"} glassColor="rgba(8,9,12,.62)" width={64} height={180} radius={22} ticks={5} viscosity={0.08} splash={0.6} tilt={0.7} />;
}

function HwV({ t, max }: { t: WidgetText; max?: number }) {
  const level = useRef<((v: number) => void) | null>(null);
  const pts = [18, 16, 17, 15, 16, 15, 14, 15, 16, 15, 14, 15];
  const W = 218;
  const d = pts.map((y, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * W} ${y * 1.6}`).join(" ");
  const WARN = "#fbbf24";
  return (
    <Canvas
      w={560}
      h={180}
      max={max}
      build={(q) => {
        const temp = q("[data-temp]")[0];
        const dec = t.url.endsWith(".it") ? "," : ".";
        const o = { v: 3.9 };
        const show = () => {
          temp.textContent = o.v.toFixed(1).replace(".", dec);
          level.current?.(o.v);
        };
        const tl = gsap
          .timeline()
          .from(q("[data-panel]"), { x: -20, autoAlpha: 0, duration: 1, ease: "expo.out" })
          .from(q("[data-gauge]"), { y: 30, autoAlpha: 0, duration: 1, ease: "expo.out" }, 0.15)
          .fromTo(q("[data-spark]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, 0.3);
        const run = gsap.timeline({ repeat: -1 });
        const caps = q("[data-cap]");
        step(run, caps, 0, 0);
        run
          .fromTo(o, { v: 3.9 }, { v: 4.1, duration: 1.2, yoyo: true, repeat: 1, ease: "sine.inOut", onUpdate: show }, 0)
          // la porta resta aperta: la temperatura sale
          .to(o, { v: 7.8, duration: 2.6, ease: "power1.in", onUpdate: show }, 2.6)
          .to(q("[data-tempw]"), { color: WARN, duration: 0.6 }, 3.6)
          .to(q("[data-dot]"), { backgroundColor: WARN, duration: 0.4 }, 3.6);
        step(run, caps, 1, 3.6);
        run
          .fromTo(q("[data-notif]"), { y: -24, scale: 0.9, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: "elastic.out(1, 0.6)" }, 4.2)
          // qualcuno la chiude: torna giù
          .to(q("[data-notif]"), { y: -16, autoAlpha: 0, duration: 0.4 }, 7.2)
          .to(o, { v: 4, duration: 2.6, ease: "power2.out", onUpdate: show }, 7.2)
          .to(q("[data-tempw]"), { color: "#fff", duration: 0.8 }, 8);
        step(run, caps, 2, 7.2);
        run.to(q("[data-dot]"), { backgroundColor: "#5ec4ff", duration: 0.5 }, 9.4);
        step(run, caps, 0, 10);
        return tl.add(run.to({}, { duration: 1.4 }), 0.6);
      }}
    >
      <Bead data-panel tint={DARK} radius={18} className="absolute left-0 top-0 block h-[180px] w-[252px] p-4 text-white backdrop-blur-md">
        <span className="flex items-center gap-2 text-[11.5px] text-white/75">
          <span data-dot className="h-2 w-2 rounded-full" style={{ background: "#5ec4ff" }} />
          {t.hwPlace}
        </span>
        <span data-tempw className="tabular-nums mt-2 block text-[50px] font-medium leading-none tracking-[-0.045em] text-white">
          <span data-temp>3,9</span>
          <span className="text-[20px] opacity-60"> °C</span>
        </span>
        <svg viewBox={`0 0 ${W} 32`} className="mt-3 h-[26px] overflow-visible" style={{ width: W }} aria-hidden>
          <path data-spark d={d} fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="1.8" strokeLinecap="round" pathLength={100} strokeDasharray="100" />
        </svg>
        <Steps items={[t.hwOk, t.hwWarn, t.hwBack]} className="mt-3 text-[11.5px] font-medium text-white" />
      </Bead>
      <div data-gauge className="absolute left-[276px] top-0 h-[180px] w-[64px] overflow-hidden rounded-[22px] shadow-[0_0_0_1px_rgba(255,255,255,.14),0_30px_50px_-20px_rgba(0,0,0,.9)] backdrop-blur-md">
        <Gauge hook={level} />
      </div>
      <Bead data-notif tint="rgba(20,22,26,.78)" radius={18} className="absolute left-[360px] top-[10px] flex w-[200px] items-start gap-2.5 p-3 text-white opacity-0 backdrop-blur-xl">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-[15px] font-semibold text-[#06263a]" style={{ background: "#5ec4ff" }}>
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
            <path d="M10 3v9.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="10" cy="14.5" r="3" fill="currentColor" />
          </svg>
        </span>
        <span className="min-w-0 text-[11.5px] leading-snug">
          <span className="flex justify-between">
            <span className="font-semibold">{t.hwApp}</span>
            <span className="text-white/55">{t.aiNow}</span>
          </span>
          <span className="block text-white/85">{t.hwNotif}</span>
        </span>
      </Bead>
    </Canvas>
  );
}

export function ServiceVisual({ k, t, max, play }: { k: ServiceKey; t: WidgetText; max?: number; play?: boolean }) {
  const pathname = usePathname();
  const locale = useLocale();
  const spots = (useMessages() as unknown as { services: { spots: Record<string, { s: [string, string, string?][]; sub: string }> } }).services.spots;
  const cfg = spots?.[k];
  const slug = SERVICES.find((x) => x.key === k)?.slug ?? "";
  const onPage = pathname.includes(`/servizi/${slug}`);
  const spot: SpotCfg | null = cfg
    ? {
        says: cfg.s.map(([a, b, sub]) => ({ a, b, sub })),
        sub: cfg.sub,
        href: onPage ? `#brief-${k}` : `/${locale}/servizi/${slug}`,
        cta: onPage ? t.spotBook : t.spotCta,
      }
    : null;
  return (
    <PlayCtx.Provider value={play}>
      <SpotCtx.Provider value={spot}>{visual(k, t, max)}</SpotCtx.Provider>
    </PlayCtx.Provider>
  );
}

function visual(k: ServiceKey, t: WidgetText, max?: number) {
  switch (k) {
    case "web":
      return <StoryV shots={WEB} max={max} />;
    case "seo":
      return <StoryV shots={SEO} max={max} />;
    case "geo":
      return <StoryV shots={GEO} max={max} />;
    case "apps":
      return <StoryV shots={APPS} max={max} />;
    case "design":
      return <StoryV shots={DESIGN} max={max} />;
    case "ai":
      return <StoryV shots={AI} max={max} />;
    case "hw":
      return <StoryV shots={HW} max={max} />;
    case "api":
      return <StoryV shots={API} max={max} />;
    case "shop":
      return <StoryV shots={SHOP} max={max} />;
    case "ops":
      return <OpsV t={t} max={max} />;
  }
}
