"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import * as si from "simple-icons";
import { Bead } from "@/components/glass/Bead";
import { Shape } from "@/components/visual/Shapes";
import { prefersReducedMotion } from "@/lib/env";
import type { ServiceKey } from "@/content/services";

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

/* ───────────── Siti e web app: un negozio online vero, dal colore scelto al carrello ───────────── */

const PHONES = [
  ["#2d2e33", "#17181b", "#4a4b52"],
  ["#dcc9a6", "#b39d78", "#efe3cc"],
  ["#2a4a7a", "#172b4a", "#4a6ea6"],
];
const Phones = ({ c }: { c: string[] }) => (
  <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible" aria-hidden>
    <path d="M44 112C44 46 156 46 156 112" fill="none" stroke={c[1]} strokeWidth="13" strokeLinecap="round" />
    <path d="M44 112C44 50 156 50 156 112" fill="none" stroke={c[0]} strokeWidth="9" strokeLinecap="round" />
    <path d="M70 62c18-12 42-12 60 0" fill="none" stroke={c[2]} strokeWidth="3" strokeLinecap="round" opacity=".7" />
    {[24, 136].map((x) => (
      <g key={x}>
        <rect x={x} y="98" width="40" height="70" rx="19" fill={c[0]} />
        <rect x={x + (x < 100 ? 26 : 0)} y="104" width="14" height="58" rx="7" fill={c[1]} />
        <rect x={x + (x < 100 ? 6 : 20)} y="108" width="5" height="34" rx="2.5" fill={c[2]} opacity=".55" />
      </g>
    ))}
  </svg>
);
const Bag = ({ className = "h-[18px] w-[18px]" }: { className?: string }) => (
  <svg viewBox="0 0 20 20" className={className} aria-hidden>
    <path d="M4 7h12l-1 10H5z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M7 7V5.5a3 3 0 0 1 6 0V7" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);
function WebV({ t, max }: { t: WidgetText; max?: number }) {
  const names = [t.webC1, t.webC2, t.webC3];
  const sw = [292, 326, 360];
  return (
    <Canvas
      w={540}
      h={440}
      max={max}
      build={(q) => {
        const tl = gsap
          .timeline()
          .from(q("[data-win]"), { y: 70, rotateX: 24, autoAlpha: 0, duration: 1.4, ease: "expo.out" })
          .to(q("[data-win]"), { rotateY: -4, rotateX: 3, duration: 5, yoyo: true, repeat: -1, ease: "sine.inOut" }, 1.4);
        const cur = q("[data-cur]")[0];
        const ph = q("[data-ph]");
        const caps = q("[data-cname]");
        const click = (at: number, el: Element[]) => run.to(el, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 }, at);
        const run = gsap.timeline({ repeat: -1, repeatDelay: 0.8, defaults: { ease: "power3.inOut" } });
        run.set(cur, { x: 560, y: 420, autoAlpha: 0 }).to(cur, { x: sw[1], y: 244, autoAlpha: 1, duration: 0.9 }, 0.3);
        // scelgo il colore: il prodotto cambia, il nome del colore pure
        [1, 2].forEach((c, n) => {
          const at = 1.3 + n * 1.4;
          if (n) run.to(cur, { x: sw[c], duration: 0.6 }, at - 0.65);
          click(at, [q("[data-sw]")[c]]);
          run
            .to(q("[data-ring]"), { x: sw[c] - sw[0], duration: 0.5, ease: "back.out(2)" }, at)
            .to(ph, { autoAlpha: (i: number) => (i === c ? 1 : 0), duration: 0.5, ease: "power1.inOut" }, at)
            .fromTo(ph[c], { scale: 0.92, rotate: -6 }, { scale: 1, rotate: 0, duration: 0.9, ease: "elastic.out(1, 0.6)" }, at);
          step(run, caps, c, at);
        });
        // aggiungo al carrello: una miniatura vola nella borsa
        run.to(cur, { x: 400, y: 292, duration: 0.7 }, 3.5);
        click(4.25, q("[data-add]"));
        step(run, q("[data-addl]"), 1, 4.3);
        run
          .fromTo(q("[data-fly]"), { x: 0, y: 0, scale: 1, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 4.35)
          .to(q("[data-fly]"), { x: 352, duration: 0.85, ease: "power2.inOut" }, 4.4)
          .to(q("[data-fly]"), { y: -160, duration: 0.85, ease: "back.in(1.4)" }, 4.4)
          .to(q("[data-fly]"), { scale: 0.2, autoAlpha: 0, duration: 0.25 }, 5.05)
          .fromTo(q("[data-badge]"), { scale: 0 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }, 5.2)
          .to(q("[data-bag]"), { rotate: 12, duration: 0.12, yoyo: true, repeat: 3, ease: "sine.inOut" }, 5.2)
          // si apre il carrello e vado al pagamento
          .fromTo(q("[data-drawer]"), { xPercent: 105 }, { xPercent: 0, duration: 0.8, ease: "expo.out" }, 5.7)
          .fromTo(q("[data-drawer] [data-in]"), { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.5, ease: "expo.out" }, 5.9)
          .to(cur, { x: 425, y: 214, duration: 0.8 }, 6.2);
        click(7.05, q("[data-checkout]"));
        run
          .to(cur, { autoAlpha: 0, duration: 0.3 }, 7.4)
          .to(q("[data-drawer]"), { xPercent: 105, duration: 0.7, ease: "power3.in" }, 8.8)
          .to(q("[data-badge]"), { scale: 0, duration: 0.3 }, 9.3)
          .to(q("[data-ring]"), { x: 0, duration: 0.5 }, 9.3)
          .to(ph, { autoAlpha: (i: number) => (i === 0 ? 1 : 0), duration: 0.5 }, 9.3);
        step(run, caps, 0, 9.3);
        step(run, q("[data-addl]"), 0, 9.3);
        return tl.add(run, 1);
      }}
    >
      <div className="absolute inset-0 [perspective:1200px]">
        <div
          data-win
          className="absolute left-0 top-3 h-[410px] w-[540px] origin-[30%_50%] overflow-hidden rounded-[16px] bg-[#f6f3ee] text-[#16161a] shadow-[0_0_0_1px_rgba(255,255,255,.4),0_60px_110px_-30px_rgba(0,0,0,.95)]"
          style={{ transform: "rotateY(-9deg) rotateX(5deg)" }}
        >
          {/* barra del browser */}
          <div className="flex h-[30px] items-center gap-1.5 bg-[#e8e3dc] px-3">
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
            ))}
            <span className="mx-auto flex h-[18px] w-44 items-center justify-center rounded-full bg-white/80 font-mono text-[9.5px] text-[#6b6862]">halden.store</span>
          </div>
          {/* intestazione del negozio */}
          <div className="absolute inset-x-5 top-[30px] flex h-10 items-center justify-between text-[10.5px] text-[#5d5a55]">
            <span className="text-[13px] font-semibold tracking-[0.32em] text-[#16161a]">HALDEN</span>
            <span className="flex gap-5">
              <span className="text-[#16161a]">{t.webNav1}</span>
              <span>{t.webNav2}</span>
              <span>{t.webNav3}</span>
            </span>
            <span data-bag className="relative text-[#16161a]">
              <Bag />
              <span data-badge className="absolute -right-1.5 -top-1.5 flex h-[14px] w-[14px] scale-0 items-center justify-center rounded-full bg-[#16161a] text-[8.5px] font-semibold text-white">
                1
              </span>
            </span>
          </div>
          {/* prodotto */}
          <div className="absolute left-5 top-[80px] h-[240px] w-[240px] overflow-hidden rounded-[14px] bg-[#e9e4dc]">
            <span className="absolute inset-x-8 bottom-6 h-4 rounded-full bg-black/10 blur-md" />
            {PHONES.map((c, i) => (
              <span key={i} data-ph className="absolute inset-6" style={{ opacity: i ? 0 : 1 }}>
                <Phones c={c} />
              </span>
            ))}
            <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`h-1.5 rounded-full ${i ? "w-1.5 bg-black/15" : "w-4 bg-black/60"}`} />
              ))}
            </span>
            <span data-fly className="absolute left-[95px] top-[95px] h-[50px] w-[50px] rounded-full bg-white p-1.5 opacity-0 shadow-[0_10px_20px_-6px_rgba(0,0,0,.4)]">
              <Phones c={PHONES[2]} />
            </span>
          </div>
          {/* scheda prodotto */}
          <p className="absolute left-[280px] top-[84px] text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#1f7fb8]">{t.webNew}</p>
          <p className="absolute left-[280px] top-[100px] text-[24px] font-semibold leading-[28px] tracking-[-0.03em]">Halden One</p>
          <p className="absolute left-[280px] top-[132px] w-[240px] text-[11px] leading-[14px] text-[#6b6862]">{t.webSub}</p>
          <p className="absolute left-[280px] top-[154px] flex items-center gap-1.5 text-[10.5px] leading-[14px] text-[#6b6862]">
            <span className="tracking-[0.1em] text-[#16161a]">★★★★★</span>
            4,9 · {t.webReviews}
          </p>
          <p className="absolute left-[280px] top-[176px] text-[22px] font-medium leading-[26px] tracking-[-0.02em] tabular-nums">€ 249</p>
          <div className="absolute left-[280px] top-[212px] flex items-baseline gap-1 text-[10px] leading-[14px] text-[#6b6862]">
            {t.webColor} ·
            <Steps items={names.map((n) => <span key={n} className="text-[#16161a]">{n}</span>)} attr="data-cname" />
          </div>
          <div className="absolute left-[280px] top-[232px] flex gap-[10px]">
            {PHONES.map((c, i) => (
              <span key={i} data-sw className="h-6 w-6 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)]" style={{ background: c[0] }} />
            ))}
            <span data-ring className="absolute -left-[3px] -top-[3px] h-[30px] w-[30px] rounded-full ring-[1.5px] ring-[#16161a]" />
          </div>
          <div data-add className="absolute left-[280px] top-[272px] flex h-10 w-[240px] items-center justify-center rounded-full bg-[#16161a] text-[12px] font-medium text-white">
            <Steps items={[t.webAdd, <><Tick className="h-3 w-3" /> {t.webAdded}</>]} attr="data-addl" className="justify-center" />
          </div>
          <p className="absolute left-[280px] top-[320px] text-[10px] text-[#6b6862]">{t.webShip}</p>
          {/* consigliati, tagliati dal bordo */}
          <p className="absolute left-5 top-[340px] text-[12px] font-semibold tracking-[-0.01em]">{t.webMore}</p>
          {[t.webM1, t.webM2, t.webM3].map((m, i) => (
            <div key={m} className="absolute top-[360px] flex h-[80px] w-[160px] items-start justify-between rounded-[12px] bg-[#ece7df] p-2.5 text-[10px]" style={{ left: 20 + i * 170 }}>
              <span className="font-medium">{m}</span>
              <span className="h-9 w-9 rounded-full" style={{ background: PHONES[i][0], opacity: 0.85 }} />
            </div>
          ))}
          {/* carrello */}
          <div data-drawer className="absolute bottom-0 right-0 top-[30px] w-[220px] bg-white p-4 shadow-[-20px_0_40px_-20px_rgba(0,0,0,.35)]" style={{ transform: "translateX(105%)" }}>
            <p data-in className="text-[13px] font-semibold">
              {t.webCart} · 1
            </p>
            <div data-in className="mt-4 flex items-center gap-3">
              <span className="h-14 w-14 shrink-0 rounded-[10px] bg-[#e9e4dc] p-1.5">
                <Phones c={PHONES[2]} />
              </span>
              <span className="text-[10.5px] leading-snug">
                <span className="block font-medium">Halden One</span>
                <span className="block text-[#6b6862]">{t.webC3}</span>
                <span className="tabular-nums block">€ 249</span>
              </span>
            </div>
            <div data-in className="mt-4 flex justify-between border-t border-black/10 pt-3 text-[11.5px] font-semibold">
              <span>{t.webTotal}</span>
              <span className="tabular-nums">€ 249</span>
            </div>
            <div data-in data-checkout className="mt-3 flex h-10 items-center justify-center rounded-full bg-[#16161a] text-[11.5px] font-medium text-white">
              {t.webCheckout}
            </div>
            <p data-in className="mt-2 text-center text-[9.5px] text-[#6b6862]">
              {t.webShip}
            </p>
          </div>
          <Cursor />
        </div>
      </div>
    </Canvas>
  );
}

/* ───────────── SEO: il pannello "Rendimento" di Google Search Console, una metrica alla volta ───────────── */

const GSC = [
  { c: "#4285f4", pts: [70, 66, 68, 60, 58, 54, 50, 46, 40, 34, 26, 16] },
  { c: "#5e35b1", pts: [62, 60, 56, 57, 50, 46, 44, 38, 36, 30, 24, 20] },
  { c: "#00897b", pts: [56, 58, 54, 52, 54, 50, 46, 48, 42, 40, 38, 34] },
  { c: "#e8710a", pts: [30, 34, 32, 38, 42, 44, 48, 52, 54, 58, 62, 64] },
];
function SeoV({ t, max }: { t: WidgetText; max?: number }) {
  const W = 536;
  const H = 74;
  const path = (p: number[]) => p.map((y, i) => `${i ? "L" : "M"}${((i / (p.length - 1)) * W).toFixed(1)} ${y}`).join(" ");
  const labels = [t.seoM1, t.seoM2, t.seoM3, t.seoM4];
  const values = [t.seoV1, t.seoV2, t.seoV3, t.seoV4];
  const hx = (9 / 11) * W;
  return (
    <Canvas
      w={560}
      h={196}
      max={max}
      build={(q) => {
        const tl = gsap.timeline().from(q("[data-panel]"), { y: 30, autoAlpha: 0, duration: 1, ease: "expo.out" });
        const tiles = q("[data-tile]");
        const n = q("[data-count]")[0];
        const run = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
        GSC.forEach((g, i) => {
          const at = 0.3 + i * 1.15;
          run
            .to(tiles[i], { backgroundColor: g.c, color: "#fff", boxShadow: `0 8px 18px -8px ${g.c}`, duration: 0.35, ease: "power2.out" }, at)
            .fromTo(tiles[i].querySelector("[data-box]"), { backgroundColor: "rgba(255,255,255,0)", color: "rgba(0,0,0,0)" }, { backgroundColor: "#fff", color: g.c, duration: 0.25 }, at)
            .fromTo(tiles[i].querySelector("[data-val]"), { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "expo.out" }, at + 0.1)
            .fromTo(q("[data-gl]")[i], { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, at);
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
        return tl.add(run, 0.6);
      }}
    >
      <div data-panel className="absolute inset-0 overflow-hidden rounded-[16px] bg-white text-[#202124] shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)]">
        <div className="absolute inset-x-3 top-2.5 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-2 font-medium">
            <Brand icon={si.siGooglesearchconsole} className="h-3.5 w-3.5 text-[#4285f4]" />
            {t.seoTitle}
          </span>
          <span className="text-[#5f6368]">{t.seoRange}</span>
        </div>
        <div className="absolute left-3 top-[32px] flex gap-1.5">
          {GSC.map((g, i) => (
            <div key={g.c} data-tile className="relative h-[66px] w-[128.5px] rounded-[8px] px-2.5 pt-2 text-[#5f6368] shadow-[inset_0_0_0_1px_#dadce0]" style={{ backgroundColor: "#fff" }}>
              <span className="flex items-center gap-1.5 text-[10.5px] leading-tight">
                <span data-box className="flex h-3 w-3 shrink-0 items-center justify-center rounded-[2px] shadow-[inset_0_0_0_1.5px_currentColor]" style={{ color: "rgba(0,0,0,0)" }}>
                  <Tick className="h-2.5 w-2.5" w={3.4} />
                </span>
                {labels[i]}
              </span>
              <span data-val className="tabular-nums mt-1.5 block text-[22px] font-normal leading-none tracking-[-0.02em] opacity-0">
                {i ? values[i] : <span data-count>{values[0]}</span>}
              </span>
            </div>
          ))}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute left-3 top-[110px] overflow-visible" style={{ width: W, height: H }}>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1="0" x2={W} y1={4 + i * 22} y2={4 + i * 22} stroke="#e8eaed" />
          ))}
          {GSC.map((g) => (
            <path key={g.c} data-gl d={path(g.pts)} fill="none" stroke={g.c} strokeWidth="2.2" strokeLinejoin="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
          ))}
          <g data-hover opacity="0">
            <line x1={hx} x2={hx} y1="0" y2={H} stroke="#9aa0a6" strokeDasharray="2 3" />
            {GSC.map((g) => (
              <circle key={g.c} data-hdot cx={hx} cy={g.pts[9]} r="3.6" fill="#fff" stroke={g.c} strokeWidth="2" />
            ))}
          </g>
        </svg>
        <div data-tip className="absolute top-[104px] rounded-[6px] bg-[#3c4043] px-2.5 py-1.5 text-[10px] leading-[1.45] text-white opacity-0 shadow-lg" style={{ left: 12 + hx - 150 }}>
          <span className="block font-medium">{t.seoTipD}</span>
          {GSC.map((g, i) => (
            <span key={g.c} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: g.c }} />
              {t[`seoT${i + 1}`]}
            </span>
          ))}
        </div>
      </div>
    </Canvas>
  );
}

/* ───────────── GEO: Claude, riconoscibile, risponde e cita il sito come fonte ───────────── */

const CLAUDE = "#D97757";
const SERIF = { fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', serif" };
function GeoV({ t, max }: { t: WidgetText; max?: number }) {
  const words = t.geoA.split(" ");
  return (
    <Canvas
      w={560}
      h={196}
      max={max}
      build={(q) => {
        const tl = gsap.timeline().from(q("[data-panel]"), { y: 30, autoAlpha: 0, duration: 1, ease: "expo.out" });
        const run = gsap.timeline({ repeat: -1, repeatDelay: 2 });
        run
          .fromTo(q("[data-q]"), { x: 20, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, ease: "expo.out" }, 0)
          .fromTo(q("[data-star]"), { rotate: -180, scale: 0 }, { rotate: 0, scale: 1, duration: 0.8, ease: "back.out(2)" }, 0.5)
          .to(q("[data-star]"), { rotate: 360, duration: 2.6, ease: "none" }, 1.3)
          .fromTo(q("[data-w]"), { autoAlpha: 0, y: 4, filter: "blur(4px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.25, stagger: 0.045 }, 0.9)
          .fromTo(q("[data-src]"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9, ease: "elastic.out(1, 0.55)" })
          .to(q("[data-src]"), { boxShadow: `0 0 0 1px ${CLAUDE}, 0 0 24px -4px ${CLAUDE}`, duration: 0.6, yoyo: true, repeat: 3 })
          .to(q("[data-q], [data-w], [data-src]"), { autoAlpha: 0, duration: 0.4 }, "+=1.4");
        return tl.add(run, 0.6);
      }}
    >
      <div data-panel className="absolute inset-0 overflow-hidden rounded-[18px] bg-[#262624] shadow-[0_0_0_1px_rgba(255,255,255,.08),0_40px_80px_-30px_rgba(0,0,0,.95)]">
        <p data-q className="absolute right-4 top-3.5 max-w-[340px] rounded-[14px] bg-[#141413] px-3.5 py-2 text-[12.5px] text-[#f5f4ef] opacity-0">
          {t.geoQ}
        </p>
        <div className="absolute left-4 right-6 top-[60px] flex gap-3">
          <span data-star className="mt-1 h-[18px] w-[18px] shrink-0" style={{ color: CLAUDE }}>
            <Brand icon={si.siClaude} className="h-[18px] w-[18px]" />
          </span>
          <p className="text-[14.5px] leading-[1.5] text-[#f5f4ef]" style={SERIF}>
            {words.map((w, i) => (
              <span key={i} data-w className="inline-block opacity-0">
                {w}&nbsp;
              </span>
            ))}
            <span data-src className="ml-0.5 inline-flex h-5 items-center rounded-[6px] bg-[#3a3937] px-1.5 align-middle font-sans text-[10.5px] text-[#c2c0b6] opacity-0">
              {t.url}
            </span>
          </p>
        </div>
        <div className="absolute inset-x-3 bottom-3 flex h-10 items-center gap-2.5 rounded-[14px] bg-[#30302e] px-4 text-[11.5px] text-[#9a988f] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
          <span className="text-[15px] leading-none">+</span>
          <span className="flex-1">{t.geoReply}</span>
          <span className="text-[#c2c0b6]">Sonnet 5.5</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-[7px] text-[12px] text-white" style={{ background: "#c6613f" }}>
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
  const xs = [80, 213, 347, 480];
  const paths = xs.map((x) => `M280 42 C280 64 ${x} 50 ${x} 72`);
  return (
    <Canvas
      w={560}
      h={192}
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
          run.to(q("[data-core]"), { scale: 1.06, duration: 0.15, yoyo: true, repeat: 1 }, at);
          travel(run, g, at + 0.05, 0.7);
          run.to(q("[data-svcb]")[i], { ["--drop-tint" as string]: FLASH, color: "#fff", scale: 1.1, duration: 0.2, yoyo: true, repeat: 1, repeatDelay: 0.5 }, at + 0.7);
          step(run, caps, i, at + 0.7);
        });
        return tl.add(run, 1.2);
      }}
    >
      <Links paths={paths} w={560} h={192} />
      <Bead data-core tint={DARK} className="absolute left-[280px] top-1.5 -ml-[70px] flex h-9 w-[140px] items-center justify-center whitespace-nowrap text-[12px] font-medium text-white backdrop-blur-md">
        {t.apiCore}
      </Bead>
      {LINKED.map((ic, i) => (
        <span key={ic.slug} data-svc className="absolute top-[72px] -ml-12 flex w-24 flex-col items-center gap-1.5" style={{ left: xs[i] }}>
          <Bead data-svcb tint={DARK} radius={14} className="flex h-11 w-11 items-center justify-center text-white/75 backdrop-blur-md">
            <Brand icon={ic} className="h-[18px] w-[18px]" />
          </Bead>
          <span className="text-[11px] text-white [text-shadow:0_1px_6px_rgba(0,0,0,.7)]">{names[i]}</span>
        </span>
      ))}
      <Bead data-log tint={DARK} className="absolute bottom-0 left-[280px] -ml-[130px] flex h-9 w-[260px] items-center justify-center px-3.5 text-[11px] text-white backdrop-blur-md">
        <Steps items={[t.apiL1, t.apiL2, t.apiL3, t.apiL4].map((l) => <><Tick className="h-3 w-3 text-[#fde68a]" /> {l}</>)} className="justify-center" />
      </Bead>
    </Canvas>
  );
}

/* ───────────── Design: un editor come Figma. Selezioni un elemento, cambi colore, angoli e carattere ───────────── */

const FIG = "#0d99ff";
const FILLS = [SKY, "#16324f", "#111214", "#f5efe6"];
/** Il cursore di chi lavora nel file, con il nome accanto come negli editor condivisi. */
const NamedCursor = ({ name, color, attr = "data-cur" }: { name: string; color: string; attr?: string }) => (
  <span {...{ [attr]: "" }} className="absolute left-0 top-0 z-20 flex items-start opacity-0">
    <svg viewBox="0 0 16 16" className="h-4 w-4 drop-shadow-[0_2px_4px_rgba(0,0,0,.5)]" aria-hidden>
      <path d="M2 1l11 6-5 1.5L6 14z" fill={color} stroke="#fff" strokeWidth="1" />
    </svg>
    <span className="ml-0.5 mt-3 whitespace-nowrap rounded-[5px] px-1.5 py-0.5 text-[9.5px] font-semibold text-white" style={{ background: color }}>
      {name}
    </span>
  </span>
);
function DesignV({ t, max }: { t: WidgetText; max?: number }) {
  const BTN = { x: 228, y: 112, w: 120, h: 36 };
  const TTL = { x: 228, y: 46, w: 196, h: 28 };
  const box = (r: typeof BTN) => ({ x: r.x - 3, y: r.y - 3, width: r.w + 6, height: r.h + 6 });
  return (
    <Canvas
      w={560}
      h={180}
      max={max}
      build={(q) => {
        const cur = q("[data-cur]")[0];
        const sel = q("[data-sel]")[0];
        const rad = q("[data-rad]")[0];
        const btn = q("[data-btn]")[0];
        const o = { r: 8 };
        const tl = gsap
          .timeline()
          .from(q("[data-insp]"), { x: -20, autoAlpha: 0, duration: 0.9, ease: "expo.out" })
          .from(q("[data-mock]"), { y: 24, autoAlpha: 0, duration: 0.9, ease: "expo.out" }, 0.1);
        const run = gsap.timeline({ repeat: -1, repeatDelay: 0.4, defaults: { ease: "power3.inOut" } });
        const click = (at: number, el?: Element) => {
          run.to(cur, { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1, transformOrigin: "0 0" }, at);
          if (el) run.to(el, { scale: 0.92, duration: 0.1, yoyo: true, repeat: 1 }, at);
        };
        run
          .set(sel, { ...box(BTN), autoAlpha: 0 })
          .fromTo(cur, { x: 560, y: 190, autoAlpha: 0 }, { x: 300, y: 128, autoAlpha: 1, duration: 0.9 }, 0.2);
        // 1. seleziono il tasto
        click(1.15);
        run.fromTo(sel, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, 1.2);
        step(run, q("[data-layer]"), 0, 1.2);
        // 2. cambio colore
        run.to(cur, { x: 52, y: 72, duration: 0.8 }, 1.6);
        click(2.45, q("[data-fill]")[1]);
        run
          .to(btn, { backgroundColor: FILLS[1], color: "#fff", duration: 0.4, ease: "power2.out" }, 2.5)
          .to(q("[data-fring]"), { x: 28, duration: 0.4, ease: "back.out(2)" }, 2.5)
          // 3. trascino gli angoli
          .to(cur, { x: 21, y: 116, duration: 0.6 }, 2.9)
          .to([cur, q("[data-knob]")[0]], { x: "+=70", duration: 0.9, ease: "power2.inOut" }, 3.6)
          .fromTo(o, { r: 8 }, { r: 18, duration: 0.9, ease: "power2.inOut", onUpdate: () => { rad.textContent = String(Math.round(o.r)); (btn as HTMLElement).style.borderRadius = `${o.r}px`; } }, 3.6)
          // 4. seleziono il titolo e cambio carattere
          .to(cur, { x: 330, y: 62, duration: 0.8 }, 4.7);
        click(5.55);
        run.to(sel, { ...box(TTL), duration: 0.45, ease: "expo.out" }, 5.6);
        step(run, q("[data-layer]"), 1, 5.6);
        run.to(cur, { x: 120, y: 160, duration: 0.8 }, 6);
        click(6.85, q("[data-font]")[1]);
        run.to(q("[data-fpill]"), { x: 66, width: 82, duration: 0.4, ease: "back.out(1.6)" }, 6.9);
        step(run, q("[data-ttl]"), 1, 6.9);
        // si ricomincia
        run
          .to(cur, { x: 560, y: 190, autoAlpha: 0, duration: 0.8 }, 8.6)
          .to(sel, { autoAlpha: 0, duration: 0.3 }, 8.6)
          .to(btn, { backgroundColor: FILLS[0], color: "#16161a", borderRadius: 8, duration: 0.5 }, 8.8)
          .to(q("[data-fring]"), { x: 0, duration: 0.4 }, 8.8)
          .to(q("[data-knob]"), { x: 0, duration: 0.5 }, 8.8)
          .to(q("[data-fpill]"), { x: 0, width: 56, duration: 0.4 }, 8.8)
          .call(() => void (rad.textContent = "8"), [], 8.8);
        step(run, q("[data-ttl]"), 0, 8.8);
        step(run, q("[data-layer]"), 0, 8.8);
        return tl.add(run, 0.9);
      }}
    >
      {/* pannello delle proprietà */}
      <Bead data-insp tint={DARK} radius={16} className="absolute left-0 top-0 block h-[180px] w-[176px] text-white backdrop-blur-md">
        <span className="absolute left-3.5 top-3.5 flex items-center gap-2 text-[11.5px] font-semibold">
          <span className="h-2.5 w-2.5 rounded-[3px] border-[1.5px]" style={{ borderColor: FIG }} />
          <Steps items={[t.dLayer1, t.dLayer2]} attr="data-layer" />
        </span>
        <span className="absolute left-3.5 top-[42px] text-[9.5px] text-white/55">{t.dFill}</span>
        <span className="absolute left-3.5 top-[60px] flex gap-2">
          {FILLS.map((f) => (
            <span key={f} data-fill className="h-5 w-5 rounded-[6px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.2)]" style={{ background: f }} />
          ))}
          <span data-fring className="absolute -left-[3px] -top-[3px] h-[26px] w-[26px] rounded-[8px]" style={{ boxShadow: `0 0 0 1.5px ${FIG}` }} />
        </span>
        <span className="absolute left-3.5 top-[92px] text-[9.5px] text-white/55">{t.dRadius}</span>
        <span className="absolute left-3.5 top-[114px] h-1 w-[110px] rounded-full bg-white/15">
          <span data-knob className="absolute -top-[5px] left-0 h-3.5 w-3.5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.5)]" />
        </span>
        <span data-rad className="absolute left-[136px] top-[107px] text-[11px] tabular-nums text-white/85">
          8
        </span>
        <span className="absolute left-3.5 top-[132px] text-[9.5px] text-white/55">{t.dText}</span>
        <span className="absolute left-3.5 top-[148px] flex text-[10.5px]">
          <span data-fpill className="absolute left-0 top-0 h-[22px] w-[56px] rounded-full bg-white/15" />
          <span data-font className="relative flex h-[22px] w-[60px] items-center justify-center">
            Geist
          </span>
          <span data-font className="t-serif relative ml-1.5 flex h-[22px] w-[82px] items-center justify-center text-[12.5px]">
            Instrument
          </span>
        </span>
      </Bead>
      {/* la tela con la schermata in lavorazione */}
      <div data-mock className="absolute left-[210px] top-3 h-[156px] w-[330px] rounded-[16px] bg-[#f6f3ee] shadow-[0_30px_60px_-24px_rgba(0,0,0,.9)]" />
      <p className="absolute left-[228px] top-[30px] text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[#8a857d]">{t.dKick}</p>
      <div className="absolute left-[228px] top-[46px] h-[28px] w-[196px] text-[22px] leading-[28px] tracking-[-0.03em] text-[#16161a]">
        <Steps items={[<span key="a" className="font-semibold">{t.dTitle}</span>, <span key="b" className="t-serif text-[25px]">{t.dTitle}</span>]} attr="data-ttl" />
      </div>
      <p className="absolute left-[228px] top-[80px] text-[11px] text-[#6b6862]">{t.dSub}</p>
      <span data-btn className="absolute flex items-center justify-center text-[12px] font-semibold text-[#16161a]" style={{ left: BTN.x, top: BTN.y, width: BTN.w, height: BTN.h, borderRadius: 8, background: FILLS[0] }}>
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

/* ───────────── AI: un agente (Claude) che lavora da solo: legge la posta, apre il gestionale, compila, risponde ───────────── */

const Spinner = () => (
  <svg data-spin viewBox="0 0 16 16" className="absolute inset-0 h-3.5 w-3.5" aria-hidden>
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
  const FX = [12, 160];
  const FY = [66, 112];
  return (
    <Canvas
      w={560}
      h={180}
      max={max}
      build={(q) => {
        const cur = q("[data-agent]")[0];
        const rows = q("[data-tool]");
        const vals = q("[data-val]");
        const reply = q("[data-reply]")[0];
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
            .to(q("[data-tabpill]"), { x: i ? 64 : 0, width: i ? 84 : 58, duration: 0.4, ease: "back.out(1.6)" }, at)
            .to(q("[data-tab]"), { color: (j: number) => (j === i ? "#fff" : "rgba(255,255,255,.5)"), duration: 0.3 }, at);

        const tl = gsap
          .timeline()
          .from(q("[data-chat]"), { x: -20, autoAlpha: 0, duration: 0.9, ease: "expo.out" })
          .from(q("[data-win]"), { x: 20, autoAlpha: 0, duration: 0.9, ease: "expo.out" }, 0.1);
        const run = gsap.timeline({ repeat: -1, repeatDelay: 0.3 });
        // riparte da capo
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
          .fromTo(cur, { x: 330, y: 200, autoAlpha: 0 }, { x: 150, y: 86, autoAlpha: 1, duration: 0.8, ease: "power3.out", immediateRender: false }, 0.6);
        // 1. legge l'email
        tool(0, 0.6, 2);
        run.to(q("[data-mark]"), { scaleX: 1, duration: 0.45, stagger: 0.45, ease: "power2.inOut" }, 1.1);
        go(250, 86, 1.1, 0.8);
        // 2. apre il gestionale
        tool(1, 2.1, 2.9);
        go(118, 15, 2.1);
        press(2.75, q("[data-tab]")[1]);
        view(1, 2.8);
        // 3. compila e salva
        tool(2, 3, 5.6);
        fields.forEach(([, v], i) => {
          const at = 3.05 + i * 0.5;
          go(FX[i % 2] + 70, FY[Math.floor(i / 2)] + 11, at, 0.35);
          type(vals[i], v, at + 0.3, 0.2 + v.length * 0.02);
        });
        go(268, 158, 5.05, 0.4);
        press(5.45, q("[data-save]")[0]);
        run.fromTo(q("[data-toast]"), { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: "expo.out", immediateRender: false }, 5.5);
        // 4. risponde al cliente
        tool(3, 5.8, 8.4);
        go(42, 15, 5.8);
        press(6.3, q("[data-tab]")[0]);
        view(0, 6.35);
        run.to(q("[data-replybox]"), { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" }, 6.5);
        go(150, 124, 6.5, 0.4);
        type(reply, t.aiReply, 6.8, 1.2);
        go(265, 151, 7.9, 0.4);
        press(8.3, q("[data-sendb]")[0]);
        step(run, q("[data-send]"), 1, 8.3);
        run.to(cur, { x: 330, y: 200, autoAlpha: 0, duration: 0.7, ease: "power3.in" }, 9.4).to([...q("[data-user]"), ...rows], { autoAlpha: 0, duration: 0.4 }, 10);
        return tl.add(run, 0.8);
      }}
    >
      {/* la chat con l'agente */}
      <div data-chat className="absolute left-0 top-0 h-[180px] w-[232px] overflow-hidden rounded-[16px] bg-[#262624] p-3 shadow-[0_0_0_1px_rgba(255,255,255,.08),0_30px_60px_-24px_rgba(0,0,0,.9)]">
        <p data-user className="ml-auto w-fit max-w-[190px] rounded-[12px] bg-[#141413] px-2.5 py-1.5 text-[10.5px] leading-snug text-[#f5f4ef] opacity-0">
          {t.aiUser}
        </p>
        <div className="mt-2.5 flex gap-2">
          <span data-star className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: CLAUDE }}>
            <Brand icon={si.siClaude} className="h-3.5 w-3.5" />
          </span>
          <div className="flex-1 space-y-1">
            {tools.map((x) => (
              <div key={x} data-tool className="flex h-[18px] items-center gap-2 text-[10.5px] text-[#c2c0b6] opacity-0">
                <span className="relative h-3.5 w-3.5 shrink-0">
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
        <div className="absolute inset-x-2.5 bottom-2.5 flex h-6 items-center gap-2 rounded-[9px] bg-[#30302e] px-2.5 text-[9.5px] text-[#9a988f]">
          <span className="flex-1">{t.geoReply}</span>
          <span className="flex h-4 w-4 items-center justify-center rounded-[5px] text-[9px] text-white" style={{ background: "#c6613f" }}>
            ↑
          </span>
        </div>
      </div>
      {/* lo schermo su cui lavora */}
      <div data-win className="absolute left-[246px] top-0 h-[180px] w-[314px] overflow-hidden rounded-[14px] bg-[#16171a] text-white shadow-[0_0_0_1px_rgba(255,255,255,.1),0_30px_60px_-24px_rgba(0,0,0,.9)]">
        <div className="relative flex h-[30px] items-center gap-1.5 border-b border-white/[0.07] px-3 text-[10.5px]">
          <span data-tabpill className="absolute left-3 top-[5px] h-5 w-[58px] rounded-full bg-white/10" />
          <span data-tab className="relative flex h-5 w-[58px] items-center justify-center">
            {t.aiTab1}
          </span>
          <span data-tab className="relative flex h-5 w-[84px] items-center justify-center text-white/50">
            {t.aiTab2}
          </span>
        </div>
        {/* posta */}
        <div data-view className="absolute inset-x-0 bottom-0 top-[30px]">
          <p className="absolute left-3 right-3 top-[10px] flex justify-between text-[10.5px]">
            <span className="font-semibold">{t.aiFrom}</span>
            <span className="text-white/45">09:41</span>
          </p>
          <p className="absolute left-3 top-[26px] text-[11px] font-medium text-white/90">{t.aiSubj}</p>
          <p className="absolute left-3 right-3 top-[44px] text-[10.5px] leading-[1.5] text-white/70">
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
          <div data-replybox className="absolute left-3 right-3 top-[74px] h-[66px] rounded-[10px] bg-white/[0.06] p-2.5 opacity-0">
            <p data-reply className="text-[10.5px] leading-[1.45] text-white/90" />
            <span data-sendb className="absolute bottom-2 right-2 flex h-[22px] w-[60px] items-center justify-center rounded-full bg-white text-[10px] font-semibold text-[#16161a]">
              <Steps items={[t.aiSendBtn, t.aiSentBtn]} attr="data-send" className="justify-center" />
            </span>
          </div>
        </div>
        {/* gestionale */}
        <div data-view className="absolute inset-x-0 bottom-0 top-[30px] opacity-0">
          <p className="absolute left-3 top-[8px] text-[11.5px] font-semibold">{t.aiNew}</p>
          {fields.map(([l], i) => (
            <div key={l} className="absolute w-[142px]" style={{ left: FX[i % 2], top: FY[Math.floor(i / 2)] - 30 - 12 }}>
              <p className="text-[9px] text-white/50">{l}</p>
              <p data-val className="mt-1 flex h-[22px] items-center rounded-[6px] bg-white/[0.07] px-2 text-[10.5px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]" />
            </div>
          ))}
          <p data-toast className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] text-[#86efac] opacity-0">
            <Tick className="h-3 w-3" />
            {t.aiSaved}
          </p>
          <span data-save className="absolute bottom-[8px] right-3 flex h-6 w-16 items-center justify-center rounded-full text-[10.5px] font-semibold text-[#16161a]" style={{ background: CLAUDE }}>
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

/* ───────────── Gestione: il sito resta acceso mentre succedono le cose, una alla volta ───────────── */

function OpsV({ t, max }: { t: WidgetText; max?: number }) {
  const C = "#34d399";
  const events = [
    { time: "09:12", title: t.opsE1t, sub: t.opsE1s, kind: "bar" },
    { time: "03:00", title: t.opsE2t, sub: t.opsE2s, kind: "ring" },
    { time: "14:47", title: t.opsE3t, sub: t.opsE3s, kind: "block" },
    { time: "", title: t.opsE4t, sub: t.opsE4s, kind: "up" },
  ];
  return (
    <Canvas
      w={560}
      h={180}
      max={max}
      build={(q) => {
        const vis = q("[data-vis]")[0];
        const o = { v: 34 };
        const tl = gsap
          .timeline()
          .from(q("[data-site]"), { y: 20, autoAlpha: 0, duration: 1, ease: "expo.out" })
          .to(q("[data-ping]"), { scale: 3, autoAlpha: 0, duration: 1.6, repeat: -1, ease: "power1.out" }, 0.4)
          .to(o, { v: 41, duration: 1.4, repeat: -1, yoyo: true, ease: "steps(7)", onUpdate: () => void (vis.textContent = String(Math.round(o.v))) }, 0.5);
        const ev = q("[data-ev]");
        const run = gsap.timeline({ repeat: -1 });
        ev.forEach((e, i) => {
          const at = i * 2.8;
          run
            .fromTo(e, { y: 26, autoAlpha: 0, filter: "blur(6px)" }, { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }, at)
            .to(e, { y: -26, autoAlpha: 0, filter: "blur(6px)", duration: 0.45, ease: "power2.in" }, at + 2.35);
        });
        run
          .fromTo(q("[data-prog]"), { scaleX: 0 }, { scaleX: 1, transformOrigin: "0 50%", duration: 1.4, ease: "power2.inOut" }, 0.4)
          .fromTo(q("[data-sbar]"), { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, transformOrigin: "0 50%", duration: 1.4, ease: "power2.inOut" }, 0.4)
          .to(q("[data-sbar]"), { autoAlpha: 0, duration: 0.3 }, 1.9)
          .fromTo(q("[data-ring]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" }, 3.2)
          .fromTo(q("[data-ev]")[2], { boxShadow: "0 0 0 0 rgba(248,113,113,0)" }, { boxShadow: "0 0 0 1.5px rgba(248,113,113,.9), 0 0 30px -6px rgba(248,113,113,.8)", duration: 0.25, yoyo: true, repeat: 3 }, 6)
          .fromTo(q("[data-shield]"), { scale: 0 }, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.5)" }, 6.2)
          .fromTo(q("[data-ub]"), { scaleY: 0 }, { scaleY: 1, transformOrigin: "50% 100%", duration: 0.6, stagger: 0.015, ease: "back.out(2)" }, 8.6);
        return tl.add(run, 0.8);
      }}
    >
      {/* il sito, sempre acceso */}
      <Bead data-site tint={DARK} radius={16} className="absolute left-0 top-0 block h-[180px] w-[250px] overflow-hidden backdrop-blur-md">
        <span data-sbar className="absolute inset-x-0 top-0 h-[2px] opacity-0" style={{ background: C, transform: "scaleX(0)" }} />
        <span className="absolute inset-x-3 top-3 flex items-center justify-between">
          <span className="font-mono text-[10px] text-white/70">{t.url}</span>
          <span className="flex items-center gap-1.5 text-[10px] text-white">
            <span className="relative flex h-2 w-2">
              <span data-ping className="absolute inset-0 rounded-full" style={{ background: C }} />
              <span className="relative h-2 w-2 rounded-full" style={{ background: C }} />
            </span>
            {t.opsLive}
          </span>
        </span>
        <span className="absolute inset-x-3 top-[34px] h-[58px] overflow-hidden rounded-[10px]" style={{ background: "linear-gradient(135deg,#1d2b28,#0f1716)" }}>
          <span className="absolute -right-4 -top-6 h-20 w-20 rounded-full opacity-70 blur-xl" style={{ background: C }} />
          <span className="absolute left-3 top-3 h-2 w-24 rounded-full bg-white/85" />
          <span className="absolute left-3 top-7 h-2 w-16 rounded-full bg-white/50" />
          <span className="absolute bottom-3 left-3 h-4 w-14 rounded-full bg-white" />
        </span>
        <span className="absolute inset-x-3 top-[102px] flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-7 flex-1 rounded-[6px] bg-white/[0.07]" />
          ))}
        </span>
        <span className="absolute bottom-3 left-3 flex items-baseline gap-1.5 text-white">
          <span data-vis className="tabular-nums text-[22px] font-medium leading-none tracking-[-0.03em]">
            34
          </span>
          <span className="text-[10.5px] text-white/65">{t.opsVisitors}</span>
        </span>
      </Bead>
      {/* quello che succede, un evento alla volta */}
      <div className="absolute left-[270px] top-[24px] h-[132px] w-[290px]">
        {events.map((e) => (
          <Bead key={e.title} data-ev tint={DARK} radius={16} className="absolute inset-0 block p-4 text-white opacity-0 backdrop-blur-md">
            <span className="font-mono text-[10px] text-white/60">{e.time || "24/7"}</span>
            <span className="mt-1 block text-[15px] font-medium tracking-[-0.02em]">{e.title}</span>
            <span className="mt-0.5 block text-[11.5px] text-white/70">{e.sub}</span>
            <span className="absolute inset-x-4 bottom-4 block h-[18px]">
              {e.kind === "bar" && (
                <span className="absolute inset-x-0 top-[7px] h-1 overflow-hidden rounded-full bg-white/15">
                  <span data-prog className="block h-full rounded-full" style={{ background: C, transform: "scaleX(0)" }} />
                </span>
              )}
              {e.kind === "ring" && (
                <svg viewBox="0 0 20 20" className="h-[18px] w-[18px] -rotate-90">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="2.6" />
                  <circle data-ring cx="10" cy="10" r="8" fill="none" stroke={C} strokeWidth="2.6" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
                </svg>
              )}
              {e.kind === "block" && (
                <span data-shield className="inline-flex h-[18px] items-center rounded-full bg-[rgba(248,113,113,.18)] px-2 text-[10px] font-medium text-[#fecaca]" style={{ transform: "scale(0)" }}>
                  {t.opsBlocked}
                </span>
              )}
              {e.kind === "up" && (
                <span className="flex h-full items-end gap-[3px]">
                  {Array.from({ length: 40 }).map((_, j) => (
                    <span key={j} data-ub className="h-full flex-1 rounded-full" style={{ background: C, opacity: j === 27 ? 0.35 : 0.9 }} />
                  ))}
                </span>
              )}
            </span>
          </Bead>
        ))}
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
          .to(q("[data-dot]"), { backgroundColor: WARN, boxShadow: `0 0 12px ${WARN}`, duration: 0.4 }, 3.6);
        step(run, caps, 1, 3.6);
        run
          .fromTo(q("[data-notif]"), { y: -24, scale: 0.9, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: "elastic.out(1, 0.6)" }, 4.2)
          // qualcuno la chiude: torna giù
          .to(q("[data-notif]"), { y: -16, autoAlpha: 0, duration: 0.4 }, 7.2)
          .to(o, { v: 4, duration: 2.6, ease: "power2.out", onUpdate: show }, 7.2)
          .to(q("[data-tempw]"), { color: "#fff", duration: 0.8 }, 8);
        step(run, caps, 2, 7.2);
        run.to(q("[data-dot]"), { backgroundColor: "#5ec4ff", boxShadow: "0 0 12px #5ec4ff", duration: 0.5 }, 9.4);
        step(run, caps, 0, 10);
        return tl.add(run.to({}, { duration: 1.4 }), 0.6);
      }}
    >
      <Bead data-panel tint={DARK} radius={18} className="absolute left-0 top-0 block h-[180px] w-[252px] p-4 text-white backdrop-blur-md">
        <span className="flex items-center gap-2 text-[11.5px] text-white/75">
          <span data-dot className="h-2 w-2 rounded-full" style={{ background: "#5ec4ff", boxShadow: "0 0 12px #5ec4ff" }} />
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
