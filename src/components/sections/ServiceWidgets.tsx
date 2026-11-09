"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import * as si from "simple-icons";
import { Bell, Check, Sparkles } from "lucide-react";
import { Shape, type ShapeKind } from "@/components/visual/Shapes";
import { prefersReducedMotion } from "@/lib/env";
import type { ServiceKey } from "@/content/services";

gsap.registerPlugin(useGSAP);

/**
 * Disegni dei servizi: pannelli di vetro con contenuti veri, su un fondo di fibre azzurre.
 * Non si toccano: partono da soli quando entrano nello schermo e mostrano cosa fa il servizio.
 * Ognuno è disegnato su una tela fissa e scalato per stare nello spazio che ha.
 */
export type WidgetText = Record<string, string>;

const SKY = "#5ec4ff";
const glass = "rounded-[16px] bg-[rgba(14,16,20,.66)] backdrop-blur-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,.09),0_24px_60px_-24px_rgba(0,0,0,.95)]";
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

/** Tela fissa W×H scalata nello spazio disponibile; la timeline parte la prima volta che è visibile. */
function Canvas({
  w,
  h,
  max = 1,
  build,
  children,
}: {
  w: number;
  h: number;
  max?: number;
  build: (q: (s: string) => Element[]) => gsap.core.Timeline;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const o = box.current!;
    const ro = new ResizeObserver(() => {
      const s = Math.min(max, o.clientWidth / w, o.clientHeight / h);
      stage.current!.style.transform = `translate(-50%, -50%) scale(${s})`;
    });
    ro.observe(o);
    return () => ro.disconnect();
  }, [w, h, max]);
  useGSAP(
    () => {
      const tl = build(gsap.utils.selector(stage.current)).pause();
      if (prefersReducedMotion()) return void tl.progress(1);
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            tl.play();
            io.disconnect();
          }
        },
        { threshold: 0.4 },
      );
      io.observe(box.current!);
      return () => io.disconnect();
    },
    { scope: box },
  );
  return (
    <div ref={box} aria-hidden className="pointer-events-none relative h-full w-full min-w-0 select-none overflow-hidden">
      <div ref={stage} className="absolute left-1/2 top-1/2" style={{ width: w, height: h, transform: "translate(-50%, -50%) scale(0.5)" }}>
        {children}
      </div>
    </div>
  );
}

const enter = { y: 12, autoAlpha: 0, duration: 0.7, ease: "power3.out" };


const Cursor = ({ className = "" }: { className?: string }) => (
  <svg data-cur viewBox="0 0 16 16" className={`absolute h-4 w-4 drop-shadow-[0_2px_4px_rgba(0,0,0,.6)] ${className}`} aria-hidden>
    <path d="M2 1l11 6-5 1.5L6 14z" fill="#fff" stroke="#000" strokeWidth=".8" />
  </svg>
);

/* Siti e web app: il sito di un'azienda (inventata) che scorre da solo, come lo vedrebbe un visitatore. */
function WebV({ t, max }: { t: WidgetText; max?: number }) {
  return (
    <Canvas
      w={440}
      h={310}
      max={max}
      build={(q) => {
        const tl = gsap.timeline().from(q("[data-win]"), { ...enter, y: 20, duration: 0.9 }).from(q("[data-hero] > *"), { ...enter, stagger: 0.08 }, 0.4);
        const loop = gsap.timeline({ repeat: -1, repeatDelay: 1.2, defaults: { ease: "power2.inOut" } });
        loop
          .to(q("[data-page]"), { y: -150, duration: 1.6 }, 1.2)
          .from(q("[data-card]"), { y: 16, autoAlpha: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }, 2)
          .fromTo(q("[data-cur]"), { x: 330, y: 230, autoAlpha: 0 }, { x: 200, y: 175, autoAlpha: 1, duration: 1 }, 2.4)
          .to(q("[data-card]")[1], { y: -4, boxShadow: `inset 0 0 0 1px ${SKY}, 0 20px 40px -20px ${SKY}`, duration: 0.4 }, 3.3)
          .to(q("[data-card]")[1], { y: 0, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)", duration: 0.4 }, 4.6)
          .to(q("[data-cur]"), { autoAlpha: 0, duration: 0.3 }, 4.6)
          .to(q("[data-page]"), { y: 0, duration: 1.6 }, 4.8);
        return tl.add(loop, 1);
      }}
    >
      <div data-win className={`absolute inset-0 overflow-hidden ${glass}`}>
        <div className="relative z-[1] flex h-8 items-center gap-1.5 border-b border-white/[0.06] bg-[rgba(14,16,20,.8)] px-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/15" />
          ))}
          <span className="mx-auto flex h-5 w-40 items-center justify-center rounded-md bg-white/[0.06] font-mono text-[10px] text-ink-3">aster-energy.com</span>
        </div>
        <div className="relative h-[278px] overflow-hidden bg-[#070b10]">
          <div data-page className="absolute inset-x-0 top-0 px-5 pt-3">
            <div className="flex items-center justify-between text-[9.5px] text-ink-3">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] text-ink">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: SKY }} />
                ASTER
              </span>
              <span className="flex gap-3">
                <span>{t.webNav1}</span>
                <span>{t.webNav2}</span>
                <span>{t.webNav3}</span>
              </span>
              <span className="rounded-full px-2.5 py-1 font-medium text-black" style={{ background: SKY }}>
                {t.webCta}
              </span>
            </div>
            <div data-hero className="mt-5 grid grid-cols-[1.15fr_1fr] gap-4">
              <div>
                <p className="font-mono text-[8.5px] tracking-[0.14em]" style={{ color: SKY }}>
                  {t.webKicker}
                </p>
                <p className="mt-2 text-[22px] font-medium leading-[1.05] tracking-[-0.03em] text-ink">{t.webTitle}</p>
                <div className="mt-3 flex gap-1.5 text-[9.5px]">
                  <span className="rounded-full px-2.5 py-1 font-medium text-black" style={{ background: SKY }}>
                    {t.webBtn1}
                  </span>
                  <span className="rounded-full bg-white/[0.07] px-2.5 py-1 text-ink">{t.webBtn2}</span>
                </div>
              </div>
              <div className="relative h-[118px] overflow-hidden rounded-[10px]">
                <img src="/visual/fibers-sky.webp" alt="" className="h-full w-full object-cover" />
                <span className="absolute bottom-2 right-2 h-10 w-10">
                  <Shape kind="ring" id="web-ring" className="h-full w-full" />
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-3">
              {[
                ["120+", t.webStat1],
                ["14", t.webStat2],
                ["24/7", t.webStat3],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="t-fig text-[17px] font-medium text-ink">{v}</p>
                  <p className="text-[9px] text-ink-3">{l}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[15px] font-medium tracking-[-0.02em] text-ink">{t.webSec}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(["star", "flower", "burst"] as ShapeKind[]).map((k, i) => (
                <div key={k} data-card className="rounded-[10px] bg-white/[0.04] p-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
                  <span className="block h-6 w-6">
                    <Shape kind={k} id={`web-${k}`} className="h-full w-full" />
                  </span>
                  <p className="mt-2 text-[10px] font-medium text-ink">{[t.webCard1, t.webCard2, t.webCard3][i]}</p>
                  <p className="mt-0.5 text-[8.5px] leading-snug text-ink-3">{t.webCardSub}</p>
                </div>
              ))}
            </div>
          </div>
          <Cursor className="left-0 top-0" />
        </div>
      </div>
    </Canvas>
  );
}

/* SEO: la dashboard dei risultati, le visite da Google che crescono e i controlli di Google superati. */
function SeoV({ t, max }: { t: WidgetText; max?: number }) {
  const pts = [86, 82, 84, 74, 70, 66, 58, 52, 44, 38, 26, 16];
  const line = pts.map((y, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * 260} ${y}`).join(" ");
  return (
    <Canvas
      w={560}
      h={150}
      max={max}
      build={(q) => {
        const tl = gsap.timeline().from(q("[data-panel]"), enter);
        const n = q("[data-clicks]")[0];
        const o = { v: 0 };
        return tl
          .to(o, { v: 12480, duration: 2, ease: "power2.out", onUpdate: () => void (n.textContent = Math.round(o.v).toLocaleString("it-IT")) }, 0.3)
          .fromTo(q("[data-line]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 2, ease: "power2.out" }, 0.3)
          .from(q("[data-area]"), { autoAlpha: 0, duration: 1.2 }, 1)
          .from(q("[data-dot]"), { scale: 0, duration: 0.4, ease: "back.out(3)" }, 2.1)
          .from(q("[data-vital]"), { autoAlpha: 0, x: 8, duration: 0.4, stagger: 0.12 }, 1.2);
      }}
    >
      <div data-panel className={`absolute inset-0 grid grid-cols-[130px_1fr_128px] gap-5 p-4 ${glass}`}>
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-[10.5px] text-ink-3">{t.seoClicks}</p>
            <p className="t-fig mt-1 text-[24px] font-medium leading-none tracking-[-0.03em] text-ink">
              <span data-clicks>12.480</span>
            </p>
            <p className="t-fig mt-1 text-[11px]" style={{ color: SKY }}>
              ↑ 212%
            </p>
          </div>
          <div>
            <p className="text-[10.5px] text-ink-3">{t.seoPos}</p>
            <p className="t-fig mt-1 text-[17px] font-medium text-ink">3,8</p>
          </div>
        </div>
        <div className="relative">
          <svg viewBox="0 0 260 100" preserveAspectRatio="none" className="absolute inset-x-0 top-1 h-[96px] w-full overflow-visible">
            {[25, 50, 75].map((y) => (
              <line key={y} x1="0" x2="260" y1={y} y2={y} stroke="rgba(255,255,255,.05)" vectorEffect="non-scaling-stroke" />
            ))}
            <defs>
              <linearGradient id="seo-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={SKY} stopOpacity=".35" />
                <stop offset="1" stopColor={SKY} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path data-area d={`${line} L260 100 L0 100 Z`} fill="url(#seo-fill)" />
            <path data-line d={line} fill="none" stroke={SKY} strokeWidth="2" pathLength={100} strokeDasharray="100" vectorEffect="non-scaling-stroke" />
          </svg>
          <span data-dot className="absolute right-0 top-[14px] h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full" style={{ background: SKY, boxShadow: `0 0 0 4px rgba(94,196,255,.2)` }} />
          <div className="absolute inset-x-0 bottom-0 flex justify-between font-mono text-[9px] text-ink-3">
            {t.seoMonths.split(" ").map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between border-l border-white/[0.07] pl-4">
          <p className="text-[10.5px] text-ink-3">Core Web Vitals</p>
          <p className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
            <Check size={14} strokeWidth={2.6} style={{ color: SKY }} />
            {t.seoPass}
          </p>
          {["LCP", "INP", "CLS"].map((k) => (
            <p key={k} data-vital className="flex items-center justify-between font-mono text-[10px] text-ink-3">
              {k}
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: SKY }} />
            </p>
          ))}
        </div>
      </div>
    </Canvas>
  );
}

/* GEO: la conversazione in Claude, riconoscibile: la risposta si scrive e cita il sito come fonte. */
const CLAUDE = "#D97757";
function GeoV({ t, max }: { t: WidgetText; max?: number }) {
  const words = t.geoA.split(" ");
  return (
    <Canvas
      w={560}
      h={170}
      max={max}
      build={(q) =>
        gsap
          .timeline()
          .from(q("[data-app]"), enter)
          .from(q("[data-q]"), { ...enter, y: 8 }, 0.3)
          .from(q("[data-star]"), { rotate: -90, scale: 0.4, autoAlpha: 0, duration: 0.6, ease: "power3.out" }, 0.8)
          .to(q("[data-star]"), { rotate: 360, duration: 2.4, ease: "none" }, 1)
          .from(q("[data-w]"), { autoAlpha: 0, duration: 0.05, stagger: 0.05 }, 1)
          .from(q("[data-src]"), { ...enter, y: 4, duration: 0.4 })
      }
    >
      <div data-app className="absolute inset-0 flex flex-col overflow-hidden rounded-[16px] bg-[#262624] px-5 pb-3 pt-3.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,.95),inset_0_0_0_1px_rgba(255,255,255,.06)]">
        <p data-q className="self-end rounded-[12px] bg-[#141413] px-3 py-1.5 text-[11.5px] text-[#f5f4ef]">
          {t.geoQ}
        </p>
        <div className="mt-2.5 flex gap-2.5">
          <span data-star className="mt-0.5 h-4 w-4 shrink-0" style={{ color: CLAUDE }}>
            <Brand icon={si.siClaude} className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[14px] leading-[1.5] text-[#f5f4ef]" style={{ fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', serif" }}>
              {words.map((w, i) => (
                <span key={i} data-w>
                  {w}{" "}
                </span>
              ))}
              <span data-src className="ml-0.5 inline-flex h-[18px] items-center rounded-[6px] bg-[#3a3937] px-1.5 align-middle font-sans text-[10px] text-[#c2c0b6]">
                {t.url}
              </span>
            </p>
          </div>
        </div>
        <div className="mt-auto flex h-8 items-center gap-2 rounded-[12px] bg-[#30302e] px-3 text-[10.5px] text-[#9a988f] shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]">
          <span className="text-[13px] leading-none">+</span>
          <span className="flex-1">{t.geoReply}</span>
          <span className="text-[#c2c0b6]">Sonnet 5.5</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-[6px] text-[11px] text-white" style={{ background: "#c6613f" }}>
            ↑
          </span>
        </div>
      </div>
    </Canvas>
  );
}

/* Design: le forme entrano, rimbalzano e si compongono in un manifesto, con caratteri e colori del progetto. */
function DesignV({ t, max }: { t: WidgetText; max?: number }) {
  const shapes: [ShapeKind, string][] = [
    ["star", "left-[214px] top-[22px] h-[46px] w-[46px]"],
    ["squiggle", "left-[268px] top-[60px] h-[56px] w-[56px]"],
    ["flower", "left-[330px] top-[18px] h-[52px] w-[52px]"],
    ["pill", "left-[228px] top-[88px] h-[44px] w-[44px]"],
    ["ring", "left-[388px] top-[74px] h-[46px] w-[46px]"],
  ];
  return (
    <Canvas
      w={560}
      h={150}
      max={max}
      build={(q) => {
        const tl = gsap
          .timeline()
          .from(q("[data-panel]"), enter)
          .from(q("[data-aa]"), { yPercent: 40, autoAlpha: 0, duration: 0.8, ease: "expo.out" }, 0.3)
          .from(q("[data-sw]"), { scale: 0, duration: 0.5, stagger: 0.07, ease: "back.out(2)" }, 0.5)
          .from(q("[data-sh]"), { y: -120, rotate: () => gsap.utils.random(-120, 120), autoAlpha: 0, duration: 1.1, stagger: 0.12, ease: "bounce.out" }, 0.6)
          .from(q("[data-ui]"), { ...enter, x: 12, y: 0 }, 1.4);
        q("[data-sh]").forEach((s, i) => tl.to(s, { rotate: i % 2 ? -360 : 360, duration: 14 + i * 2, ease: "none", repeat: -1 }, 2.2));
        return tl.to(q("[data-toggle]"), { x: 14, duration: 0.4, repeat: -1, yoyo: true, repeatDelay: 1.4, ease: "power2.inOut" }, 2);
      }}
    >
      <div data-panel className={`absolute inset-0 overflow-hidden ${glass}`}>
        <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:14px_14px]" />
        <div className="absolute left-5 top-4 flex flex-col">
          <span data-aa className="t-serif text-[64px] italic leading-none text-ink">
            Aa
          </span>
          <span className="mt-1 font-mono text-[9.5px] text-ink-3">{t.designType}</span>
          <span className="mt-3 flex gap-1.5">
            {["#0a2633", "#1f7fb8", "#5ec4ff", "#d9f2ff", "#f2f2f0"].map((c) => (
              <span key={c} data-sw className="h-5 w-5 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,.12)]" style={{ background: c }} />
            ))}
          </span>
        </div>
        {shapes.map(([k, pos]) => (
          <span key={k} data-sh className={`absolute ${pos}`}>
            <Shape kind={k} id={`design-${k}`} className="h-full w-full" />
          </span>
        ))}
        <div data-ui className="absolute right-4 top-1/2 flex w-[104px] -translate-y-1/2 flex-col gap-2.5">
          <span className="flex h-7 items-center justify-center rounded-full text-[10.5px] font-medium text-black" style={{ background: SKY }}>
            {t.designCta}
          </span>
          <span className="flex h-7 items-center justify-center rounded-full bg-white/[0.07] text-[10.5px] text-ink">{t.designGhost}</span>
          <span className="flex items-center justify-between text-[10px] text-ink-3">
            {t.designToggle}
            <span className="relative h-4 w-[30px] rounded-full" style={{ background: "rgba(94,196,255,.35)" }}>
              <span data-toggle className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white" />
            </span>
          </span>
        </div>
      </div>
    </Canvas>
  );
}

/* AI: un ordine arriva in PDF, l'agente lo legge e controlla, lo prepara nel gestionale e chiede l'ok; tu approvi, il cliente viene avvisato. */
function AiV({ t, max }: { t: WidgetText; max?: number }) {
  const steps = [t.aiS1, t.aiS2, t.aiS3, t.aiS4];
  return (
    <Canvas
      w={560}
      h={150}
      max={max}
      build={(q) => {
        const tl = gsap.timeline().from(q("[data-col]"), { ...enter, stagger: 0.12 });
        const run = gsap.timeline({ repeat: -1, repeatDelay: 1.6 });
        run
          .fromTo(q("[data-scan]"), { top: "8%", autoAlpha: 1 }, { top: "88%", duration: 1.1, ease: "power1.inOut" })
          .to(q("[data-scan]"), { autoAlpha: 0, duration: 0.2 })
          .fromTo(q("[data-hl]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.15 }, 0.4);
        q("[data-step]").forEach((s, i) => {
          const at = 1 + i * 0.55;
          run
            .fromTo(s, { autoAlpha: 0.35 }, { autoAlpha: 1, duration: 0.3 }, at)
            .fromTo(s.querySelector("[data-ok]"), { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(3)" }, at + 0.3);
        });
        run
          .fromTo(q("[data-card]"), { boxShadow: "inset 0 0 0 1px rgba(255,255,255,.09)" }, { boxShadow: `inset 0 0 0 1px ${SKY}, 0 0 30px -10px ${SKY}`, duration: 0.4 }, 3.2)
          .fromTo(q("[data-cur]"), { x: 160, y: 130, autoAlpha: 0 }, { x: 96, y: 94, autoAlpha: 1, duration: 0.8, ease: "power3.inOut" }, 3.3)
          .to(q("[data-approve]"), { scale: 0.94, duration: 0.1, yoyo: true, repeat: 1 }, 4.15)
          .set(q("[data-approve]"), { autoAlpha: 0 }, 4.4)
          .fromTo(q("[data-done]"), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 4.4)
          .to(q("[data-cur]"), { autoAlpha: 0, duration: 0.3 }, 4.6)
          .to(q("[data-hl], [data-done]"), { autoAlpha: 0, duration: 0.4 }, 6.4)
          .set(q("[data-approve]"), { autoAlpha: 1 }, 6.8)
          .set(q("[data-card]"), { boxShadow: "inset 0 0 0 1px rgba(255,255,255,.09)" }, 6.8);
        return tl.add(run, 0.8);
      }}
    >
      <div className="absolute inset-0 grid grid-cols-[118px_1fr_168px] gap-3">
        <div data-col className={`relative overflow-hidden p-3 ${glass}`}>
          <p className="truncate font-mono text-[9.5px] text-ink-3">{t.aiDoc}</p>
          <div className="mt-2 space-y-1.5">
            {[
              [t.aiF1, "w-[70%]"],
              [t.aiF2, "w-[50%]"],
              [t.aiF3, "w-[60%]"],
            ].map(([f, w]) => (
              <div key={f} className="relative">
                <p className="text-[8.5px] text-ink-3">{f}</p>
                <span className={`mt-1 block h-1.5 rounded-full bg-white/15 ${w}`} />
                <span data-hl className={`absolute -inset-x-1 -bottom-0.5 top-2.5 rounded-[4px] opacity-0 ${w}`} style={{ boxShadow: `inset 0 0 0 1px ${SKY}`, background: "rgba(94,196,255,.1)" }} />
              </div>
            ))}
          </div>
          <span data-scan className="absolute inset-x-0 h-px opacity-0" style={{ background: SKY, boxShadow: `0 0 12px ${SKY}` }} />
        </div>
        <div data-col className={`flex flex-col justify-center gap-2 px-4 ${glass}`}>
          <p className="mb-0.5 flex items-center gap-1.5 text-[10.5px] text-ink-3">
            <Sparkles size={12} style={{ color: SKY }} />
            {t.aiAgent}
          </p>
          {steps.map((s) => (
            <p key={s} data-step className="flex items-center gap-2 text-[11.5px] text-ink">
              <span data-ok className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-black" style={{ background: SKY }}>
                <Check size={9} strokeWidth={3.2} />
              </span>
              {s}
            </p>
          ))}
        </div>
        <div data-col data-card className={`relative flex flex-col justify-between p-3.5 ${glass}`}>
          <div>
            <p className="text-[10px] text-ink-3">{t.aiAsk}</p>
            <p className="mt-1 text-[12px] font-medium text-ink">{t.aiCustomer}</p>
            <p className="t-fig text-[18px] font-medium tracking-[-0.02em] text-ink">€ 1.240,00</p>
          </div>
          <div className="relative h-7">
            <span data-approve className="absolute inset-0 flex items-center justify-center rounded-full text-[11px] font-medium text-black" style={{ background: SKY }}>
              {t.aiApprove}
            </span>
            <span data-done className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-full bg-white/[0.07] text-[10.5px] text-ink opacity-0">
              <Check size={12} strokeWidth={2.6} style={{ color: SKY }} />
              {t.aiDone}
            </span>
          </div>
          <Cursor className="left-0 top-0 opacity-0" />
        </div>
      </div>
    </Canvas>
  );
}

/* Integrazioni: il gestionale al centro, i programmi collegati; i dati passano da soli. */
const LINKED = [si.siStripe, si.siHubspot, si.siGooglecalendar, si.siWhatsapp];
function ApiV({ t, max }: { t: WidgetText; max?: number }) {
  const names = [t.apiPay, t.apiCrm, t.apiCal, "WhatsApp"];
  return (
    <Canvas
      w={320}
      h={170}
      max={max}
      build={(q) => {
        const tl = gsap.timeline().from(q("[data-core]"), enter).from(q("[data-svc]"), { ...enter, stagger: 0.08 }, 0.2).from(q("[data-link]"), { strokeDashoffset: 100, duration: 0.6, stagger: 0.08 }, 0.4);
        const run = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
        q("[data-pk]").forEach((p, i) => run.fromTo(p, { offsetDistance: "0%", autoAlpha: 1 }, { offsetDistance: "100%", duration: 0.9, ease: "power1.inOut" }, i * 0.45).set(p, { autoAlpha: 0 }));
        return tl.add(run, 1).from(q("[data-log]"), enter, 1.2);
      }}
    >
      <svg viewBox="0 0 320 170" className="absolute inset-0 h-full w-full">
        {[40, 120, 200, 280].map((x) => (
          <path key={x} data-link d={`M160 22 C160 52 ${x} 46 ${x} 76`} fill="none" stroke="rgba(94,196,255,.35)" pathLength={100} strokeDasharray="100" />
        ))}
      </svg>
      {[40, 120, 200, 280].map((x) => (
        <span
          key={x}
          data-pk
          className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full opacity-0"
          style={{ background: SKY, boxShadow: `0 0 10px ${SKY}`, offsetPath: `path("M160 22 C160 52 ${x} 46 ${x} 76")`, offsetRotate: "0deg" }}
        />
      ))}
      <span data-core className={`absolute left-1/2 top-0 flex h-9 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-[11.5px] font-medium text-ink ${glass}`}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: SKY }} />
        {t.apiCore}
      </span>
      {LINKED.map((ic, i) => (
        <span key={ic.slug} data-svc className="absolute top-[76px] flex w-[72px] -translate-x-1/2 flex-col items-center gap-1" style={{ left: 40 + i * 80 }}>
          <span className={`flex h-10 w-10 items-center justify-center text-ink-2 ${glass} rounded-[12px]`}>
            <Brand icon={ic} className="h-[18px] w-[18px]" />
          </span>
          <span className="text-[9.5px] text-ink-3">{names[i]}</span>
        </span>
      ))}
      <span data-log className={`absolute bottom-0 left-1/2 flex h-7 -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[10.5px] text-ink ${glass}`}>
        <Check size={12} strokeWidth={2.6} style={{ color: SKY }} />
        {t.apiLog}
      </span>
    </Canvas>
  );
}

/* Negozi online: scheda prodotto e pagamento in stile Apple Pay / Stripe, chiari e familiari. */
const Vase = () => (
  <svg viewBox="0 0 100 120" className="h-full w-full" aria-hidden>
    <defs>
      <linearGradient id="vase-b" x1="0" x2="1">
        <stop offset="0" stopColor="#1f7fb8" />
        <stop offset=".45" stopColor="#5ec4ff" />
        <stop offset=".7" stopColor="#bfe8ff" />
        <stop offset="1" stopColor="#3a9fd8" />
      </linearGradient>
    </defs>
    <ellipse cx="50" cy="112" rx="26" ry="4" fill="rgba(0,0,0,.12)" />
    <path d="M38 10h24c-2 10-1 16 6 26 9 13 12 26 8 44-3 16-12 30-26 30S27 96 24 80c-4-18-1-31 8-44 7-10 8-16 6-26z" fill="url(#vase-b)" />
    <ellipse cx="50" cy="10" rx="12" ry="3" fill="#0e4f75" />
    <path d="M34 44c-6 12-6 26-2 38" stroke="#fff" strokeOpacity=".55" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);
function ShopV({ t, max }: { t: WidgetText; max?: number }) {
  return (
    <Canvas
      w={560}
      h={150}
      max={max}
      build={(q) => {
        const tl = gsap.timeline().from(q("[data-sheet]"), enter).from(q("[data-prod]"), { scale: 0.85, autoAlpha: 0, duration: 0.8, ease: "expo.out" }, 0.3);
        const run = gsap.timeline({ repeat: -1, repeatDelay: 1.6 });
        run
          .fromTo(q("[data-cur]"), { x: 520, y: 140, autoAlpha: 0 }, { x: 430, y: 40, autoAlpha: 1, duration: 0.9, ease: "power3.inOut" }, 0.6)
          .to(q("[data-apple]"), { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1 }, 1.5)
          .to(q("[data-cur]"), { autoAlpha: 0, duration: 0.2 }, 1.7)
          .fromTo(q("[data-ok]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 1.7)
          .fromTo(q("[data-ring]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.6, ease: "power2.out" }, 1.8)
          .fromTo(q("[data-tick]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" }, 2.2)
          .to(q("[data-ok]"), { autoAlpha: 0, duration: 0.4 }, 4.2);
        return tl.add(run, 0.6);
      }}
    >
      <div data-sheet className="absolute inset-0 grid grid-cols-[1fr_200px] overflow-hidden rounded-[16px] bg-[#fbfbfd] text-[#1d1d1f] shadow-[0_24px_60px_-24px_rgba(0,0,0,.95)]">
        <div className="flex items-center gap-4 p-3.5">
          <div className="flex h-[122px] w-[112px] shrink-0 items-center justify-center rounded-[12px] bg-[linear-gradient(160deg,#eef7fc,#dcebf3)] p-3">
            <span data-prod className="block h-full w-full">
              <Vase />
            </span>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#6e6e73]">{t.shopNew}</p>
            <p className="mt-1 text-[16px] font-semibold tracking-[-0.02em]">{t.shopName}</p>
            <p className="text-[11px] text-[#6e6e73]">{t.shopSub}</p>
            <p className="t-fig mt-2 text-[15px] font-medium">€ 89,00</p>
            <p className="mt-2 flex gap-1.5">
              {["#5ec4ff", "#1d1d1f", "#e8e3da"].map((c) => (
                <span key={c} className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10 ring-offset-1" style={{ background: c }} />
              ))}
            </p>
          </div>
        </div>
        <div className="relative flex flex-col justify-center gap-2 border-l border-black/[0.06] bg-white p-3.5">
          <span data-apple className="flex h-8 items-center justify-center gap-1 rounded-[8px] bg-black text-[13px] font-medium text-white">
            <Brand icon={si.siApple} className="h-3.5 w-3.5 -translate-y-px" />
            Pay
          </span>
          <p className="flex items-center gap-2 text-[9.5px] text-[#86868b]">
            <span className="h-px flex-1 bg-black/10" />
            {t.shopOr}
            <span className="h-px flex-1 bg-black/10" />
          </p>
          <span className="flex h-7 items-center rounded-[7px] px-2.5 font-mono text-[10px] text-[#86868b] shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)]">1234 1234 1234 1234</span>
          <span className="flex h-8 items-center justify-center rounded-[8px] text-[11.5px] font-semibold text-white" style={{ background: "#1f7fb8" }}>
            {t.shopPay} € 89,00
          </span>
          <div data-ok className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white opacity-0">
            <svg viewBox="0 0 40 40" className="h-10 w-10">
              <circle data-ring cx="20" cy="20" r="17" fill="none" stroke="#1f7fb8" strokeWidth="2.5" pathLength={100} strokeDasharray="100" />
              <path data-tick d="M13 20.5l5 5 9-10" fill="none" stroke="#1f7fb8" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="100" />
            </svg>
            <p className="text-[12px] font-semibold">{t.shopDone}</p>
          </div>
        </div>
        <Cursor className="left-0 top-0 opacity-0" />
      </div>
    </Canvas>
  );
}

/* Gestione: il sito è online e al sicuro, detto semplice; sotto, i controlli che faccio ogni giorno. */
function OpsV({ t, max }: { t: WidgetText; max?: number }) {
  const bars = Array.from({ length: 45 });
  return (
    <Canvas
      w={560}
      h={150}
      max={max}
      build={(q) =>
        gsap
          .timeline()
          .from(q("[data-panel]"), enter)
          .from(q("[data-bar]"), { scaleY: 0, transformOrigin: "50% 100%", duration: 0.4, stagger: 0.015, ease: "power2.out" }, 0.3)
          .from(q("[data-row]"), { autoAlpha: 0, x: 8, duration: 0.4, stagger: 0.18 }, 0.8)
          .to(q("[data-ping]"), { scale: 2.6, autoAlpha: 0, duration: 1.4, repeat: -1, ease: "power1.out" }, 0.8)
      }
    >
      <div data-panel className={`absolute inset-0 grid grid-cols-[1fr_210px] gap-6 p-4 ${glass}`}>
        <div className="flex flex-col justify-between">
          <div>
            <p className="flex items-center gap-2 text-[15px] font-medium tracking-[-0.01em] text-ink">
              <span className="relative flex h-2.5 w-2.5">
                <span data-ping className="absolute inset-0 rounded-full" style={{ background: SKY }} />
                <span className="relative h-2.5 w-2.5 rounded-full" style={{ background: SKY }} />
              </span>
              {t.opsAll}
            </p>
            <p className="mt-0.5 text-[10.5px] text-ink-3">{t.url} · {t.opsDays}</p>
          </div>
          <div className="flex h-[46px] items-end gap-[3px]">
            {bars.map((_, i) => (
              <span key={i} data-bar className="h-full flex-1 rounded-[2px]" style={{ background: i === 31 ? "rgba(94,196,255,.45)" : SKY }} />
            ))}
          </div>
          <p className="flex justify-between text-[9.5px] text-ink-3">
            <span>{t.opsAgo}</span>
            <span className="t-fig">99,98% {t.opsUp}</span>
            <span>{t.opsToday}</span>
          </p>
        </div>
        <div className="flex flex-col justify-center gap-2.5 border-l border-white/[0.07] pl-5">
          {[t.opsR1, t.opsR2, t.opsR3].map((r) => (
            <p key={r} data-row className="flex items-start gap-2 text-[11px] leading-snug text-ink">
              <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-black" style={{ background: SKY }}>
                <Check size={9} strokeWidth={3.2} />
              </span>
              {r}
            </p>
          ))}
        </div>
      </div>
    </Canvas>
  );
}

/* Hardware: un sensore in una cella frigo; la temperatura arriva dal vivo e c'è un avviso se esce dai limiti. */
function HwV({ t, max }: { t: WidgetText; max?: number }) {
  const pts = [18, 16, 17, 13, 14, 15, 12, 14, 13, 15, 12, 13];
  const d = pts.map((y, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * 200} ${y * 2.4}`).join(" ");
  return (
    <Canvas
      w={560}
      h={150}
      max={max}
      build={(q) => {
        const tl = gsap.timeline().from(q("[data-panel]"), { ...enter, stagger: 0.12 });
        tl.fromTo(q("[data-spark]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1.6, ease: "power1.inOut" }, 0.6);
        const temp = q("[data-temp]")[0];
        const o = { v: 3.9 };
        const dec = t.url.endsWith(".it") ? "," : ".";
        const live = gsap.timeline({ repeat: -1, yoyo: true });
        live.to(o, { v: 4.4, duration: 2.6, ease: "sine.inOut", onUpdate: () => void (temp.textContent = o.v.toFixed(1).replace(".", dec)) });
        tl.add(live, 1);
        return tl.to(q("[data-ping]"), { scale: 2.6, autoAlpha: 0, duration: 1.4, repeat: -1, ease: "power1.out" }, 1);
      }}
    >
      <div className="absolute inset-0 flex items-stretch gap-3">
        <div data-panel className={`flex w-[196px] flex-col justify-between p-4 ${glass}`}>
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-ink">{t.hwPlace}</span>
            <span className="relative flex h-2 w-2">
              <span data-ping className="absolute inset-0 rounded-full" style={{ background: SKY }} />
              <span className="relative h-2 w-2 rounded-full" style={{ background: SKY }} />
            </span>
          </div>
          <p className="text-[10.5px] text-ink-3">{t.hwWhere}</p>
          <div className="flex items-end justify-between">
            <span className="t-fig text-[32px] font-medium leading-none tracking-[-0.03em] text-ink">
              <span data-temp>3,9</span>
              <span className="text-[15px] text-ink-3"> °C</span>
            </span>
            <span className="rounded-full bg-[rgba(94,196,255,.12)] px-2 py-0.5 text-[10px]" style={{ color: SKY }}>
              {t.hwOk}
            </span>
          </div>
        </div>
        <div data-panel className={`flex flex-1 flex-col justify-between p-4 ${glass}`}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-ink-2">{t.hwChart}</span>
            <span className="text-ink-3">{t.hwOnline}</span>
          </div>
          <svg viewBox="0 0 200 50" preserveAspectRatio="none" className="h-[52px] w-full overflow-visible" aria-hidden>
            <defs>
              <linearGradient id="hw-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={SKY} stopOpacity=".35" />
                <stop offset="1" stopColor={SKY} stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" x2="200" y1="10" y2="10" stroke="rgba(255,255,255,.18)" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
            <path d={`${d} L200 50 L0 50 Z`} fill="url(#hw-fill)" opacity=".5" />
            <path data-spark d={d} fill="none" stroke={SKY} strokeWidth="1.6" pathLength={100} strokeDasharray="100" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="flex w-max items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-[10.5px] text-ink-2">
            <Bell size={11} style={{ color: SKY }} />
            {t.hwAlert}
          </span>
        </div>
      </div>
    </Canvas>
  );
}

export function ServiceVisual({ k, t, max }: { k: ServiceKey; t: WidgetText; max?: number }) {
  switch (k) {
    case "web":
      return <WebV t={t} max={max} />;
    case "seo":
      return <SeoV t={t} max={max} />;
    case "geo":
      return <GeoV t={t} max={max} />;
    case "apps":
      return <AppsV max={max} />;
    case "design":
      return <DesignV t={t} max={max} />;
    case "ai":
      return <AiV t={t} max={max} />;
    case "hw":
      return <HwV t={t} max={max} />;
    case "api":
      return <ApiV t={t} max={max} />;
    case "shop":
      return <ShopV t={t} max={max} />;
    case "ops":
      return <OpsV t={t} max={max} />;
  }
}
/* App multipiattaforma: un'app al centro, le piattaforme si accendono una a una. */
const PLATFORMS: [string, ReactNode][] = [
  ["Android", <Brand key="a" icon={si.siAndroid} className="h-5 w-5" />],
  ["iOS", <Brand key="i" icon={si.siApple} className="h-5 w-5" />],
  ["macOS", <Brand key="m" icon={si.siMacos} className="h-5 w-8" />],
  ["Windows", <WindowsGlyph key="w" className="h-[18px] w-[18px]" />],
  ["Linux", <Brand key="l" icon={si.siLinux} className="h-5 w-5" />],
];
function AppsV({ max }: { max?: number }) {
  return (
    <Canvas
      w={320}
      h={170}
      max={max}
      build={(q) =>
        gsap
          .timeline()
          .from(q("[data-core]"), { ...enter, scale: 0.85 })
          .from(q("[data-link]"), { strokeDashoffset: 100, duration: 0.7, stagger: 0.1, ease: "power2.out" }, 0.4)
          .to(q("[data-pf]"), { color: "#f2f2f0", boxShadow: "inset 0 0 0 1px rgba(94,196,255,.55)", duration: 0.4, stagger: 0.1 }, 0.8)
      }
    >
      <img data-core src="/work/relay/icon.webp" alt="" className="absolute left-1/2 top-0 h-14 w-14 -translate-x-1/2 rounded-[16px] shadow-[0_18px_40px_-14px_rgba(0,0,0,.9)]" />
      <svg viewBox="0 0 320 170" className="absolute inset-0 h-full w-full">
        {PLATFORMS.map((_, i) => {
          const x = 32 + i * 64;
          return <path key={i} data-link d={`M160 58 C160 86 ${x} 82 ${x} 106`} fill="none" stroke="rgba(94,196,255,.35)" pathLength={100} strokeDasharray="100" />;
        })}
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex justify-between px-1">
        {PLATFORMS.map(([n, ic]) => (
          <div key={n} className="flex w-[56px] flex-col items-center gap-1.5">
            <span data-pf className={`flex h-11 w-11 items-center justify-center text-ink-3 ${glass} rounded-[12px]`}>
              {ic}
            </span>
            <span className="text-[10px] text-ink-3">{n}</span>
          </div>
        ))}
      </div>
    </Canvas>
  );
}

