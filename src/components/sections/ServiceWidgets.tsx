"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import * as si from "simple-icons";
import { Bell, Check, FileText, Sparkles } from "lucide-react";
import { Bead } from "@/components/glass/Bead";
import { Shape, type ShapeKind } from "@/components/visual/Shapes";
import { prefersReducedMotion } from "@/lib/env";
import type { ServiceKey } from "@/content/services";

gsap.registerPlugin(useGSAP);

/**
 * Disegni dei servizi, appoggiati direttamente sulla scheda: niente riquadri dentro i riquadri.
 * Tasti ed etichette sono gocce di vetro (lo stesso materiale di Relay); i dati si muovono come gocce d'acqua
 * che si staccano e si fondono (filtro "goo"). Partono da soli quando entrano nello schermo.
 */
export type WidgetText = Record<string, string>;

const SKY = "#5ec4ff";
const WATER = `radial-gradient(circle at 35% 30%, #d9f2ff, ${SKY} 45%, #1f7fb8)`;
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
/** Livello d'acqua: le gocce dentro si fondono quando si toccano. */
const Water = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`pointer-events-none absolute inset-0 ${className}`} style={{ filter: "url(#goo)" }}>
    {children}
  </div>
);
const Blob = ({ size = 18, ...rest }: { size?: number } & Record<string, unknown>) => (
  <span {...rest} className="absolute left-0 top-0 rounded-full" style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, background: WATER, transform: "scale(0)" }} />
);
const Cursor = ({ className = "" }: { className?: string }) => (
  <svg data-cur viewBox="0 0 16 16" className={`absolute left-0 top-0 h-4 w-4 opacity-0 drop-shadow-[0_2px_4px_rgba(0,0,0,.6)] ${className}`} aria-hidden>
    <path d="M2 1l11 6-5 1.5L6 14z" fill="#fff" stroke="#000" strokeWidth=".8" />
  </svg>
);

/** Tela fissa W×H scalata nello spazio disponibile; la timeline parte la prima volta che è visibile. */
function Canvas({ w, h, max = 1, build, children }: { w: number; h: number; max?: number; build: (q: (s: string) => Element[]) => gsap.core.Timeline; children: ReactNode }) {
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
        { threshold: 0.35 },
      );
      io.observe(box.current!);
      return () => io.disconnect();
    },
    { scope: box },
  );
  return (
    <div ref={box} aria-hidden className="pointer-events-none relative h-full w-full min-w-0 select-none">
      <div ref={stage} className="absolute left-1/2 top-1/2" style={{ width: w, height: h, transform: "translate(-50%, -50%) scale(0.5)" }}>
        {children}
      </div>
    </div>
  );
}

const enter = { y: 14, autoAlpha: 0, duration: 0.8, ease: "expo.out" };
const pop = { scale: 0, autoAlpha: 0, duration: 0.9, ease: "elastic.out(1, 0.55)" };
const TINT_ON = "rgba(94,196,255,.42)";
const TINT_DARK = "rgba(10,12,16,.62)";

/* Siti e web app: il sito di un'azienda (inventata) in prospettiva, che scorre da solo e riceve una richiesta. */
function WebV({ t, max }: { t: WidgetText; max?: number }) {
  return (
    <Canvas
      w={460}
      h={300}
      max={max}
      build={(q) => {
        const tl = gsap
          .timeline()
          .from(q("[data-win]"), { y: 60, rotateX: 30, autoAlpha: 0, duration: 1.4, ease: "expo.out" })
          .to(q("[data-win]"), { rotateY: -8, rotateX: 5, duration: 4, yoyo: true, repeat: -1, ease: "sine.inOut" }, 1.4);
        const loop = gsap.timeline({ repeat: -1, repeatDelay: 1.4, defaults: { ease: "power2.inOut" } });
        loop
          .to(q("[data-page]"), { y: -150, duration: 1.8 }, 1)
          .to(q("[data-page]"), { y: 0, duration: 1.6 }, 3.6)
          .fromTo(q("[data-cur]"), { x: 420, y: 260, autoAlpha: 0 }, { x: 452, y: 50, autoAlpha: 1, duration: 1 }, 5.2)
          .to(q("[data-cta]"), { scale: 0.9, duration: 0.12, yoyo: true, repeat: 1 }, 6.25)
          .to(q("[data-cur]"), { autoAlpha: 0, duration: 0.3 }, 6.5)
          .fromTo(q("[data-toast]"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9, ease: "elastic.out(1, 0.55)" }, 6.4)
          .to(q("[data-toast]"), { scale: 0.6, autoAlpha: 0, duration: 0.4 }, 8.6);
        return tl.add(loop, 1);
      }}
    >
      <div className="absolute inset-0 [perspective:1100px]">
        <div
          data-win
          className="absolute left-0 top-2 h-[330px] w-[520px] origin-[30%_50%] overflow-hidden rounded-[14px] bg-[#070b10] shadow-[0_0_0_1px_rgba(255,255,255,.1),0_50px_100px_-30px_rgba(0,0,0,1),0_0_80px_-30px_rgba(94,196,255,.5)]"
          style={{ transform: "rotateY(-14deg) rotateX(8deg)" }}
        >
          <div className="relative z-[1] flex h-8 items-center gap-1.5 bg-[rgba(14,16,20,.92)] px-3">
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <span key={c} className="h-2.5 w-2.5 rounded-full opacity-70" style={{ background: c }} />
            ))}
            <Bead className="mx-auto flex h-5 w-44 items-center justify-center font-mono text-[10px] text-ink-2">aster-energy.com</Bead>
          </div>
          <div className="relative h-[298px] overflow-hidden">
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
                <Bead data-cta tint="sky" className="flex h-6 items-center px-3 font-medium text-ink">
                  {t.webCta}
                </Bead>
              </div>
              <div className="mt-5 grid grid-cols-[1.1fr_1fr] gap-4">
                <div>
                  <p className="font-mono text-[8.5px] tracking-[0.14em]" style={{ color: SKY }}>
                    {t.webKicker}
                  </p>
                  <p className="mt-2 text-[24px] font-medium leading-[1.02] tracking-[-0.035em] text-ink">{t.webTitle}</p>
                  <div className="mt-3 flex gap-1.5 text-[9.5px]">
                    <Bead tint="sky" className="flex h-6 items-center px-3 font-medium text-ink">
                      {t.webBtn1}
                    </Bead>
                    <Bead className="flex h-6 items-center px-3 text-ink">{t.webBtn2}</Bead>
                  </div>
                </div>
                <div className="relative h-[126px] overflow-hidden rounded-[10px]">
                  <img src="/visual/fibers-sky.webp" alt="" className="h-full w-full object-cover" />
                  <span className="absolute bottom-2 right-2 h-10 w-10">
                    <Shape kind="ring" id="web-ring" className="h-full w-full" />
                  </span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 pt-1">
                {[
                  ["120+", t.webStat1],
                  ["14", t.webStat2],
                  ["24/7", t.webStat3],
                ].map(([v, l]) => (
                  <div key={l}>
                    <p className="t-fig text-[18px] font-medium text-ink">{v}</p>
                    <p className="text-[9px] text-ink-3">{l}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[15px] font-medium tracking-[-0.02em] text-ink">{t.webSec}</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(["star", "flower", "burst"] as ShapeKind[]).map((k, i) => (
                  <Bead key={k} radius={12} className="block p-2.5">
                    <span className="block h-6 w-6">
                      <Shape kind={k} id={`web-${k}`} className="h-full w-full" />
                    </span>
                    <span className="mt-2 block text-[10px] font-medium text-ink">{[t.webCard1, t.webCard2, t.webCard3][i]}</span>
                    <span className="mt-0.5 block text-[8.5px] leading-snug text-ink-3">{t.webCardSub}</span>
                  </Bead>
                ))}
              </div>
            </div>
            <Cursor />
          </div>
        </div>
        <Bead data-toast tint={TINT_DARK} className="absolute bottom-6 left-6 flex h-10 items-center gap-2 px-4 text-[12px] text-ink opacity-0">
          <span className="flex h-5 w-5 items-center justify-center rounded-full text-black" style={{ background: SKY }}>
            <Check size={12} strokeWidth={3} />
          </span>
          {t.webToast}
        </Bead>
      </div>
    </Canvas>
  );
}

/* SEO: le visite crescono lungo la curva; dai punti della curva cadono gocce che diventano i controlli di Google superati. */
function SeoV({ t, max }: { t: WidgetText; max?: number }) {
  const pts = [96, 92, 94, 84, 80, 74, 66, 58, 50, 42, 30, 18];
  const W = 330;
  const line = pts.map((y, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * W} ${y}`).join(" ");
  const drops = [2, 6, 10].map((i) => ({ x: 220 + (i / (pts.length - 1)) * W, y: pts[i] + 18 }));
  return (
    <Canvas
      w={560}
      h={180}
      max={max}
      build={(q) => {
        const n = q("[data-clicks]")[0];
        const o = { v: 0 };
        const tl = gsap
          .timeline()
          .from(q("[data-kpi]"), { ...enter, stagger: 0.1 })
          .to(o, { v: 12480, duration: 2.2, ease: "power3.out", onUpdate: () => void (n.textContent = Math.round(o.v).toLocaleString("it-IT")) }, 0.2)
          .fromTo(q("[data-line]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" }, 0.2)
          .from(q("[data-area]"), { autoAlpha: 0, duration: 1.4 }, 0.9);
        drops.forEach((d, i) => {
          const at = 0.8 + i * 0.6;
          const b = q("[data-blob]")[i];
          tl.fromTo(b, { x: d.x, y: d.y, scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(2)" }, at)
            .to(b, { y: 150, scaleY: 1.3, duration: 0.7, ease: "power2.in" }, at + 0.35)
            .to(b, { scale: 0, duration: 0.25 }, at + 1)
            .from(q("[data-vital]")[i], pop, at + 0.95);
        });
        return tl.to(q("[data-dot]"), { scale: 1.6, autoAlpha: 0.4, transformOrigin: "50% 50%", duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut" }, 2.4);
      }}
    >
      <div className="absolute left-0 top-4 w-[210px]">
        <p data-kpi className="text-[11px] text-ink-3">
          {t.seoClicks}
        </p>
        <p data-kpi className="t-fig mt-1 text-[44px] font-medium leading-none tracking-[-0.045em] text-ink">
          <span data-clicks>12.480</span>
        </p>
        <Bead data-kpi tint="sky" className="mt-3 inline-flex h-7 items-center px-3 text-[12px] font-medium text-ink">
          ↑ 212% · {t.seoPos} 3,8
        </Bead>
      </div>
      <svg viewBox={`0 0 ${W} 110`} className="absolute left-[220px] top-[18px] h-[110px] overflow-visible" style={{ width: W }}>
        <defs>
          <linearGradient id="seo-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SKY} stopOpacity=".38" />
            <stop offset="1" stopColor={SKY} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path data-area d={`${line} L${W} 110 L0 110 Z`} fill="url(#seo-fill)" />
        <path data-line d={line} fill="none" stroke={SKY} strokeWidth="2.5" strokeLinecap="round" pathLength={100} strokeDasharray="100" style={{ filter: `drop-shadow(0 0 6px ${SKY})` }} />
        <circle data-dot cx={W} cy={pts[pts.length - 1]} r="5" fill={SKY} />
      </svg>
      <Water>
        {drops.map((_, i) => (
          <Blob key={i} data-blob size={16} />
        ))}
      </Water>
      {drops.map((d, i) => (
        <Bead key={i} data-vital tint={TINT_DARK} className="absolute top-[140px] flex h-8 -translate-x-1/2 items-center gap-1.5 px-3 font-mono text-[11px] text-ink" style={{ left: d.x }}>
          <Check size={12} strokeWidth={3} style={{ color: SKY }} />
          {["LCP", "INP", "CLS"][i]}
        </Bead>
      ))}
    </Canvas>
  );
}

/* GEO: Claude, riconoscibile, risponde e cita il sito come fonte. */
const CLAUDE = "#D97757";
const SERIF = { fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', serif" };
function GeoV({ t, max }: { t: WidgetText; max?: number }) {
  const words = t.geoA.split(" ");
  return (
    <Canvas
      w={560}
      h={180}
      max={max}
      build={(q) =>
        gsap
          .timeline()
          .from(q("[data-q]"), { ...enter, x: 20, y: 0 })
          .from(q("[data-input]"), enter, 0.2)
          .from(q("[data-star]"), { rotate: -180, scale: 0, duration: 0.8, ease: "back.out(2)" }, 0.5)
          .to(q("[data-star]"), { rotate: "+=360", duration: 3, ease: "none" }, 1.2)
          .from(q("[data-w]"), { autoAlpha: 0, y: 4, filter: "blur(4px)", duration: 0.25, stagger: 0.045 }, 0.9)
          .from(q("[data-src]"), { ...pop })
          .to(q("[data-src]"), { boxShadow: `0 0 0 1px ${CLAUDE}, 0 0 24px -4px ${CLAUDE}`, duration: 0.6, yoyo: true, repeat: 3 })
      }
    >
      <p data-q className="absolute right-0 top-0 max-w-[340px] rounded-[14px] bg-[#30302e] px-3.5 py-2 text-[12.5px] text-[#f5f4ef]">
        {t.geoQ}
      </p>
      <div className="absolute left-0 right-6 top-[50px] flex gap-3">
        <span data-star className="mt-1 h-[18px] w-[18px] shrink-0" style={{ color: CLAUDE }}>
          <Brand icon={si.siClaude} className="h-[18px] w-[18px]" />
        </span>
        <p className="text-[15px] leading-[1.5] text-[#f5f4ef]" style={SERIF}>
          {words.map((w, i) => (
            <span key={i} data-w className="inline-block">
              {w}&nbsp;
            </span>
          ))}
          <span data-src className="ml-0.5 inline-flex h-5 items-center rounded-[6px] bg-[#3a3937] px-1.5 align-middle font-sans text-[10.5px] text-[#c2c0b6]">
            {t.url}
          </span>
        </p>
      </div>
      <div data-input className="absolute inset-x-0 bottom-0 flex h-10 items-center gap-2.5 rounded-[16px] bg-[#30302e]/90 px-4 text-[11.5px] text-[#9a988f] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-20px_rgba(0,0,0,.9)] backdrop-blur">
        <span className="text-[15px] leading-none">+</span>
        <span className="flex-1">{t.geoReply}</span>
        <span className="text-[#c2c0b6]">Sonnet 5.5</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-[7px] text-[12px] text-white" style={{ background: "#c6613f" }}>
          ↑
        </span>
      </div>
    </Canvas>
  );
}

/* App multipiattaforma: dall'app si staccano gocce che raggiungono ogni piattaforma e la accendono. */
const PLATFORMS: [string, ReactNode][] = [
  ["Android", <Brand key="a" icon={si.siAndroid} className="h-5 w-5" />],
  ["iOS", <Brand key="i" icon={si.siApple} className="h-5 w-5" />],
  ["macOS", <Brand key="m" icon={si.siMacos} className="h-5 w-8" />],
  ["Windows", <WindowsGlyph key="w" className="h-[18px] w-[18px]" />],
  ["Linux", <Brand key="l" icon={si.siLinux} className="h-5 w-5" />],
];
function AppsV({ max }: { max?: number }) {
  const xs = PLATFORMS.map((_, i) => 32 + i * 64);
  return (
    <Canvas
      w={320}
      h={176}
      max={max}
      build={(q) => {
        const tl = gsap.timeline().from(q("[data-core]"), pop).from(q("[data-pf]"), { ...enter, stagger: 0.06 }, 0.2);
        const run = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
        run.to(q("[data-core]"), { scaleX: 1.12, scaleY: 0.88, duration: 0.18, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0);
        q("[data-blob]").forEach((b, i) => {
          run
            .fromTo(b, { x: 160, y: 40, scale: 0.4 }, { scale: 1, duration: 0.3 }, i * 0.18)
            .to(b, { x: xs[i], y: 128, duration: 0.8, ease: "power2.inOut" }, i * 0.18 + 0.2)
            .to(b, { scale: 0, duration: 0.25 }, i * 0.18 + 0.95)
            .to(q("[data-pf]")[i], { color: "#f2f2f0", ["--drop-tint" as string]: TINT_ON, duration: 0.3, yoyo: true, repeat: 1, repeatDelay: 0.6 }, i * 0.18 + 0.95);
        });
        return tl.add(run, 0.8);
      }}
    >
      <Water>
        <span className="absolute left-[160px] top-[28px] -ml-5 -mt-5 h-10 w-10 rounded-full" style={{ background: WATER }} />
        {PLATFORMS.map((_, i) => (
          <Blob key={i} data-blob size={14} />
        ))}
      </Water>
      <img data-core src="/work/relay/icon.webp" alt="" className="absolute left-[132px] top-0 h-14 w-14 rounded-[16px] shadow-[0_18px_40px_-14px_rgba(0,0,0,.9),0_0_40px_-10px_rgba(94,196,255,.6)]" />
      <div className="absolute inset-x-0 bottom-0 flex justify-between px-1">
        {PLATFORMS.map(([n, ic]) => (
          <div key={n} className="flex w-[56px] flex-col items-center gap-1.5">
            <Bead data-pf radius={14} className="flex h-11 w-11 items-center justify-center text-ink-3">
              {ic}
            </Bead>
            <span className="text-[10px] text-ink-3">{n}</span>
          </div>
        ))}
      </div>
    </Canvas>
  );
}

/* Design: la palette nasce da un'unica goccia che si divide; le forme cadono e rimbalzano; i componenti prendono vita. */
function DesignV({ t, max }: { t: WidgetText; max?: number }) {
  const sw = ["#0a2633", "#1f7fb8", "#5ec4ff", "#d9f2ff", "#f2f2f0"];
  const shapes: [ShapeKind, number, number, number][] = [
    ["star", 214, 14, 50],
    ["squiggle", 268, 64, 60],
    ["flower", 330, 10, 56],
    ["pill", 224, 96, 46],
    ["ring", 380, 76, 50],
  ];
  return (
    <Canvas
      w={560}
      h={176}
      max={max}
      build={(q) => {
        const tl = gsap
          .timeline()
          .from(q("[data-aa]"), { yPercent: 60, autoAlpha: 0, skewY: 8, duration: 1, ease: "expo.out" })
          .fromTo(q("[data-sw]"), { x: (i: number) => (2 - i) * 36 }, { x: 0, duration: 1.2, stagger: 0.05, ease: "elastic.out(1, 0.45)" }, 0.5)
          .from(q("[data-sh]"), { y: -160, rotate: () => gsap.utils.random(-160, 160), autoAlpha: 0, duration: 1.2, stagger: 0.12, ease: "bounce.out" }, 0.4)
          .from(q("[data-ui]"), { ...pop, stagger: 0.12 }, 1.2);
        q("[data-sh]").forEach((s, i) => tl.to(s, { rotate: i % 2 ? -360 : 360, duration: 14 + i * 2, ease: "none", repeat: -1 }, 2.2));
        q("[data-sh]").forEach((s, i) => tl.to(s, { y: "+=8", duration: 1.6 + i * 0.2, ease: "sine.inOut", repeat: -1, yoyo: true }, 2.2));
        return tl.to(q("[data-toggle]"), { x: 16, duration: 0.5, repeat: -1, yoyo: true, repeatDelay: 1.4, ease: "back.inOut(2)" }, 2);
      }}
    >
      <div className="absolute left-0 top-2">
        <span data-aa className="t-serif block text-[78px] italic leading-none text-ink">
          Aa
        </span>
        <span className="mt-1 block font-mono text-[10px] text-ink-3">{t.designType}</span>
        <div className="relative mt-4 h-7 w-[180px]" style={{ filter: "url(#goo)" }}>
          {sw.map((c, i) => (
            <span key={c} data-sw className="absolute top-0 h-6 w-6 rounded-full" style={{ left: i * 36, background: c }} />
          ))}
        </div>
      </div>
      {shapes.map(([k, x, y, s]) => (
        <span key={k} data-sh className="absolute" style={{ left: x, top: y, width: s, height: s }}>
          <Shape kind={k} id={`design-${k}`} className="h-full w-full" />
        </span>
      ))}
      <div className="absolute right-0 top-1/2 flex w-[118px] -translate-y-1/2 flex-col gap-2.5">
        <Bead data-ui tint="sky" className="flex h-9 items-center justify-center text-[11.5px] font-medium text-ink">
          {t.designCta}
        </Bead>
        <Bead data-ui className="flex h-9 items-center justify-center text-[11.5px] text-ink">
          {t.designGhost}
        </Bead>
        <span data-ui className="flex items-center justify-between px-1 text-[10.5px] text-ink-3">
          {t.designToggle}
          <Bead tint="sky" className="relative block h-[18px] w-[34px]">
            <span data-toggle className="absolute left-[2px] top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow" />
          </Bead>
        </span>
      </div>
    </Canvas>
  );
}

/* AI: il documento scorre come una goccia dentro l'assistente, che lo divide in tre risultati; tu approvi e il cliente è avvisato. */
function AiV({ t, max }: { t: WidgetText; max?: number }) {
  const outs = [t.aiS3, t.aiS4, t.aiDone];
  const ys = [26, 85, 144];
  return (
    <Canvas
      w={560}
      h={170}
      max={max}
      build={(q) => {
        const tl = gsap
          .timeline()
          .from(q("[data-doc]"), { ...enter, x: -20, y: 0 })
          .from(q("[data-orb]"), pop, 0.2)
          .from(q("[data-out]"), { ...enter, x: 20, y: 0, stagger: 0.1 }, 0.3)
          .to(q("[data-orb]"), { scale: 1.06, duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut" }, 1);
        const run = gsap.timeline({ repeat: -1, repeatDelay: 1.4 });
        q("[data-in]").forEach((b, i) => run.fromTo(b, { x: 100, y: 85, scale: 0.3 }, { x: 250, y: 85, scale: 1, duration: 0.7, ease: "power2.in" }, i * 0.14).set(b, { scale: 0 }, i * 0.14 + 0.72));
        run.to(q("[data-orb-core]"), { rotate: "+=360", duration: 1.2, ease: "power2.inOut" }, 0.6);
        q("[data-outb]").forEach((b, i) => run.fromTo(b, { x: 290, y: 85, scale: 0.5 }, { x: 330, y: ys[i], scale: 1, duration: 0.6, ease: "power3.out" }, 1.7 + i * 0.25).set(b, { scale: 0 }, 2.3 + i * 0.25));
        q("[data-out]").forEach((o, i) =>
          run
            .fromTo(o, { ["--drop-tint" as string]: TINT_DARK }, { ["--drop-tint" as string]: "rgba(94,196,255,.32)", duration: 0.3 }, 2.3 + i * 0.25)
            .fromTo(o.querySelector("[data-ok]"), { scale: 0 }, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" }, 2.3 + i * 0.25),
        );
        run
          .fromTo(q("[data-cur]"), { x: 560, y: 160, autoAlpha: 0 }, { x: 478, y: 92, autoAlpha: 1, duration: 0.7, ease: "power3.inOut" }, 2.6)
          .to(q("[data-approve]"), { scale: 0.88, duration: 0.12, yoyo: true, repeat: 1 }, 3.3)
          .to(q("[data-approve]"), { autoAlpha: 0, scale: 0.6, duration: 0.25 }, 3.5)
          .to(q("[data-cur]"), { autoAlpha: 0, duration: 0.3 }, 3.6)
          .to(q("[data-out]"), { ["--drop-tint" as string]: TINT_DARK, duration: 0.5 }, 5.6)
          .to(q("[data-ok]"), { scale: 0, duration: 0.3 }, 5.6)
          .set(q("[data-approve]"), { autoAlpha: 1, scale: 1 }, 6);
        return tl.add(run, 0.8);
      }}
    >
      <Bead data-doc tint={TINT_DARK} radius={16} className="absolute left-0 top-[40px] flex h-[90px] w-[86px] flex-col items-center justify-center gap-2 text-ink-2">
        <FileText size={26} strokeWidth={1.4} />
        <span className="font-mono text-[9.5px] text-ink-3">{t.aiDoc}</span>
      </Bead>
      <Water>
        {[0, 1, 2, 3].map((i) => (
          <Blob key={`i${i}`} data-in size={16 - i * 2} />
        ))}
        {[0, 1, 2].map((i) => (
          <Blob key={`o${i}`} data-outb size={14} />
        ))}
        <span data-orb className="absolute left-[263px] top-[85px] -ml-[38px] -mt-[38px] h-[76px] w-[76px] rounded-full" style={{ background: WATER }} />
      </Water>
      <span data-orb-core className="absolute left-[263px] top-[85px] -ml-[11px] -mt-[11px] flex h-[22px] w-[22px] items-center justify-center text-[#06263a]">
        <Sparkles size={22} strokeWidth={2} />
      </span>
      <p className="absolute left-[263px] top-[132px] -translate-x-1/2 whitespace-nowrap text-[10.5px] text-ink-3">{t.aiAgent}</p>
      {outs.map((o, i) => (
        <Bead key={o} data-out tint={TINT_DARK} className="absolute left-[340px] flex h-9 -translate-y-1/2 items-center gap-2 whitespace-nowrap pl-2 pr-2 text-[11.5px] text-ink" style={{ top: ys[i] }}>
          <span data-ok className="flex h-5 w-5 items-center justify-center rounded-full text-black" style={{ background: SKY }}>
            <Check size={11} strokeWidth={3} />
          </span>
          {o}
          {i === 1 && (
            <Bead data-approve tint="sky" className="ml-1 flex h-6 items-center px-2.5 text-[10.5px] font-medium text-ink">
              {t.aiApprove}
            </Bead>
          )}
        </Bead>
      ))}
      <Cursor />
    </Canvas>
  );
}

/* Integrazioni: il gestionale al centro; i dati scorrono come gocce verso i programmi collegati. */
const LINKED = [si.siStripe, si.siHubspot, si.siGooglecalendar, si.siWhatsapp];
function ApiV({ t, max }: { t: WidgetText; max?: number }) {
  const names = [t.apiPay, t.apiCrm, t.apiCal, "WhatsApp"];
  const xs = [40, 120, 200, 280];
  return (
    <Canvas
      w={320}
      h={176}
      max={max}
      build={(q) => {
        const tl = gsap.timeline().from(q("[data-core]"), pop).from(q("[data-svc]"), { ...enter, stagger: 0.08 }, 0.2).from(q("[data-link]"), { autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.4);
        const run = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
        q("[data-pk]").forEach((p, i) =>
          run
            .fromTo(p, { offsetDistance: "0%", scale: 0.4 }, { offsetDistance: "100%", scale: 1, duration: 1, ease: "power1.inOut" }, i * 0.4)
            .to(p, { scale: 0, duration: 0.2 }, i * 0.4 + 1)
            .to(q("[data-svcb]")[i], { ["--drop-tint" as string]: TINT_ON, color: "#f2f2f0", duration: 0.25, yoyo: true, repeat: 1, repeatDelay: 0.3 }, i * 0.4 + 0.95),
        );
        return tl.add(run, 1).from(q("[data-log]"), pop, 1.4);
      }}
    >
      <svg viewBox="0 0 320 176" className="absolute inset-0 h-full w-full">
        {xs.map((x) => (
          <path key={x} data-link d={`M160 24 C160 54 ${x} 48 ${x} 80`} fill="none" stroke="rgba(94,196,255,.3)" strokeDasharray="2 5" />
        ))}
      </svg>
      <Water>
        {xs.map((x) => (
          <span
            key={x}
            data-pk
            className="absolute left-0 top-0 h-3.5 w-3.5 rounded-full"
            style={{ background: WATER, offsetPath: `path("M160 24 C160 54 ${x} 48 ${x} 80")`, offsetRotate: "0deg", transform: "scale(0)" }}
          />
        ))}
      </Water>
      <Bead data-core tint="sky" className="absolute left-1/2 top-1.5 flex h-9 -translate-x-1/2 items-center gap-2 whitespace-nowrap px-4 text-[12px] font-medium text-ink">
        {t.apiCore}
      </Bead>
      {LINKED.map((ic, i) => (
        <span key={ic.slug} data-svc className="absolute top-[80px] flex w-[72px] -translate-x-1/2 flex-col items-center gap-1" style={{ left: xs[i] }}>
          <Bead data-svcb radius={14} className="flex h-11 w-11 items-center justify-center text-ink-2">
            <Brand icon={ic} className="h-[18px] w-[18px]" />
          </Bead>
          <span className="text-[9.5px] text-ink-3">{names[i]}</span>
        </span>
      ))}
      <Bead data-log tint={TINT_DARK} className="absolute bottom-0 left-1/2 flex h-8 -translate-x-1/2 items-center gap-1.5 whitespace-nowrap px-3.5 text-[11px] text-ink">
        <Check size={12} strokeWidth={2.8} style={{ color: SKY }} />
        {t.apiLog}
      </Bead>
    </Canvas>
  );
}

/* Negozi online: il prodotto galleggia; Apple Pay, e il pagamento si chiude con una goccia che diventa una spunta. */
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
      <span data-shadow className="absolute left-[38px] top-[158px] h-3 w-[100px] rounded-full bg-black/60 blur-md" />
      <span data-prod className="absolute left-[38px] top-0 block h-[150px] w-[100px] drop-shadow-[0_30px_40px_rgba(94,196,255,.25)]">
        <Vase />
      </span>
      <div data-info className="absolute left-[176px] top-[30px]">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.1em]" style={{ color: SKY }}>
          {t.shopNew}
        </p>
        <p className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-ink">{t.shopName}</p>
        <p className="text-[12px] text-ink-3">{t.shopSub}</p>
        <p className="t-fig mt-3 text-[20px] font-medium text-ink">€ 89,00</p>
      </div>
      <div className="absolute right-0 top-[30px] flex w-[170px] flex-col gap-2.5">
        <span data-pay data-apple className="flex h-10 items-center justify-center gap-1 rounded-[11px] bg-black text-[15px] font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,.16),0_18px_30px_-14px_rgba(0,0,0,.9)]">
          <Brand icon={si.siApple} className="h-4 w-4 -translate-y-px" />
          Pay
        </span>
        <Bead data-pay tint="sky" radius={11} className="flex h-10 items-center justify-center text-[12.5px] font-semibold text-ink">
          {t.shopPay} € 89,00
        </Bead>
        <p data-pay className="text-center text-[10px] text-ink-3">
          {t.shopOr}
        </p>
      </div>
      <Water className="z-[1]">
        <span data-splash className="absolute right-[34px] top-[22px] h-[100px] w-[100px] rounded-full opacity-0" style={{ background: WATER }} />
      </Water>
      <svg data-tickwrap viewBox="0 0 100 100" className="absolute right-[34px] top-[22px] z-[2] h-[100px] w-[100px]">
        <path data-tick d="M30 52l13 13 27-30" fill="none" stroke="#06263a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
      </svg>
      <p data-done className="absolute right-0 top-[130px] z-[2] w-[170px] text-center text-[12px] font-medium text-ink opacity-0">
        {t.shopDone}
      </p>
      <Cursor className="z-[3]" />
    </Canvas>
  );
}

/* Gestione: tutto funziona, detto semplice; le ultime settimane online e i controlli di ogni notte. */
function OpsV({ t, max }: { t: WidgetText; max?: number }) {
  const bars = Array.from({ length: 52 });
  return (
    <Canvas
      w={560}
      h={170}
      max={max}
      build={(q) =>
        gsap
          .timeline()
          .from(q("[data-head]"), enter)
          .from(q("[data-bar]"), { scaleY: 0, transformOrigin: "50% 100%", duration: 0.8, stagger: 0.012, ease: "elastic.out(1, 0.6)" }, 0.2)
          .from(q("[data-row]"), { ...pop, stagger: 0.15 }, 0.9)
          .to(q("[data-ping]"), { scale: 3, autoAlpha: 0, duration: 1.6, repeat: -1, ease: "power1.out" }, 0.6)
          .to(q("[data-bar]"), { scaleY: 0.8, duration: 0.7, stagger: { each: 0.03, repeat: -1, yoyo: true }, ease: "sine.inOut" }, 1.8)
      }
    >
      <div data-head className="absolute left-0 top-0 flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span data-ping className="absolute inset-0 rounded-full" style={{ background: SKY }} />
          <span className="relative h-3 w-3 rounded-full" style={{ background: SKY, boxShadow: `0 0 12px ${SKY}` }} />
        </span>
        <span className="text-[24px] font-medium tracking-[-0.03em] text-ink">{t.opsAll}</span>
        <span className="text-[11px] text-ink-3">
          {t.url} · <span className="t-fig">99,98%</span> {t.opsUp}
        </span>
      </div>
      <div className="absolute inset-x-0 top-[50px] flex h-[52px] items-end gap-[3px]">
        {bars.map((_, i) => (
          <span key={i} data-bar className="h-full flex-1 rounded-full" style={{ background: `linear-gradient(to top, #1f7fb8, ${SKY})`, opacity: i === 37 ? 0.4 : 1 }} />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex gap-2">
        {[t.opsR1, t.opsR2, t.opsR3].map((r) => (
          <Bead key={r} data-row tint={TINT_DARK} className="flex h-10 flex-1 items-center gap-2 px-3 text-[10.5px] leading-tight text-ink">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-black" style={{ background: SKY }}>
              <Check size={10} strokeWidth={3.2} />
            </span>
            {r}
          </Bead>
        ))}
      </div>
    </Canvas>
  );
}

/* Hardware: il sensore pulsa come una goccia nell'acqua; la temperatura arriva dal vivo, accanto il grafico della giornata. */
function HwV({ t, max }: { t: WidgetText; max?: number }) {
  const pts = [18, 16, 17, 13, 14, 15, 12, 14, 13, 15, 12, 13];
  const W = 280;
  const d = pts.map((y, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * W} ${y * 2.6}`).join(" ");
  return (
    <Canvas
      w={560}
      h={170}
      max={max}
      build={(q) => {
        const tl = gsap.timeline().from(q("[data-sensor]"), pop).from(q("[data-info] > *"), { ...enter, stagger: 0.08 }, 0.2);
        tl.fromTo(q("[data-spark]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut" }, 0.4).from(q("[data-chip]"), { ...pop, stagger: 0.12 }, 1);
        q("[data-ripple]").forEach((r, i) => tl.fromTo(r, { scale: 0.4, autoAlpha: 0.8 }, { scale: 2.4, autoAlpha: 0, duration: 2.4, repeat: -1, ease: "power1.out" }, 0.4 + i * 0.8));
        const temp = q("[data-temp]")[0];
        const o = { v: 3.9 };
        const dec = t.url.endsWith(".it") ? "," : ".";
        tl.to(o, { v: 4.4, duration: 2.6, repeat: -1, yoyo: true, ease: "sine.inOut", onUpdate: () => void (temp.textContent = o.v.toFixed(1).replace(".", dec)) }, 1);
        return tl;
      }}
    >
      <div className="absolute left-[30px] top-[52px]">
        {[0, 1, 2].map((i) => (
          <span key={i} data-ripple className="absolute -left-[30px] -top-[30px] h-[60px] w-[60px] rounded-full" style={{ boxShadow: `inset 0 0 0 1.5px ${SKY}` }} />
        ))}
        <span data-sensor className="absolute -left-[22px] -top-[22px] h-[44px] w-[44px] rounded-full" style={{ background: WATER, boxShadow: `0 0 40px -6px ${SKY}` }} />
      </div>
      <div data-info className="absolute left-[86px] top-[8px]">
        <p className="text-[12px] text-ink-2">
          {t.hwPlace} · <span className="text-ink-3">{t.hwWhere}</span>
        </p>
        <p className="t-fig mt-1 text-[48px] font-medium leading-none tracking-[-0.045em] text-ink">
          <span data-temp>3,9</span>
          <span className="text-[20px] text-ink-3"> °C</span>
        </p>
      </div>
      <svg viewBox={`0 0 ${W} 50`} className="absolute right-0 top-[26px] h-[56px] overflow-visible" style={{ width: W }} aria-hidden>
        <line x1="0" x2={W} y1="10" y2="10" stroke="rgba(255,255,255,.18)" strokeDasharray="3 4" />
        <path data-spark d={d} fill="none" stroke={SKY} strokeWidth="2.2" strokeLinecap="round" pathLength={100} strokeDasharray="100" style={{ filter: `drop-shadow(0 0 6px ${SKY})` }} />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex gap-2">
        <Bead data-chip tint="sky" className="flex h-9 items-center gap-2 px-3.5 text-[11.5px] font-medium text-ink">
          <Check size={13} strokeWidth={3} />
          {t.hwOk}
        </Bead>
        <Bead data-chip tint={TINT_DARK} className="flex h-9 items-center gap-2 px-3.5 text-[11.5px] text-ink">
          <Bell size={13} style={{ color: SKY }} />
          {t.hwAlert}
        </Bead>
        <Bead data-chip tint={TINT_DARK} className="ml-auto flex h-9 items-center px-3.5 text-[11.5px] text-ink-2">
          {t.hwOnline}
        </Bead>
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
