"use client";

import { useRef, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ArrowDown, Bell, Check, FileText, Globe, Inbox, KeyRound, LifeBuoy, Lock, LockOpen, Menu, PencilLine, Search, ShieldCheck, UserRound } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { prefersReducedMotion } from "@/lib/env";
import { onIntroLift } from "@/lib/intro";
import { Bead } from "@/components/glass/Bead";
import { getCinema, type Cinema } from "@/content/cinema";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const ACC = "#8fd8ff";
const INK = "#05070a";
const DISP = { fontFamily: "var(--font-anton), Impact, sans-serif", textTransform: "uppercase" as const };
const studio = (n: string) => `/visual/studio/${n}.webp`;
const cin = (n: string) => `/visual/cinema/${n}.webp`;
type Q = (s: string) => HTMLElement[];

/** Scrive un testo lettera per lettera: segue lo scorrimento, avanti e indietro. */
const typeTo = (tl: gsap.core.Timeline, el: Element, text: string, at: number, dur: number) => {
  const o = { n: 0 };
  tl.to(o, { n: text.length, duration: dur, ease: "none", onUpdate: () => void (el.textContent = text.slice(0, Math.round(o.n))) }, at);
};
const num = (tl: gsap.core.Timeline, el: Element, from: number, to: number, at: number, dur: number, fmt: (n: number) => string) => {
  const o = { n: from };
  tl.to(o, { n: to, duration: dur, ease: "none", onUpdate: () => void (el.textContent = fmt(o.n)) }, at);
};

/* ───────────── Il sito che consegniamo, vero e adattabile: lo stesso disegno a ogni larghezza ───────────── */

function MiniSite({ c }: { c: Cinema }) {
  return (
    <div data-site className="@container relative h-full w-full overflow-hidden bg-[#0d1115] text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-simg src={studio("hero")} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 60%" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,12,16,.62) 0%, rgba(8,12,16,.12) 28%, rgba(8,12,16,.3) 48%, rgba(8,12,16,.9) 100%)" }} />
      <Bead as="div" tint="rgba(10,14,18,.62)" radius={999} className="absolute inset-x-[3cqw] top-[3cqw] flex h-[clamp(40px,8cqw,64px)] items-center justify-between pl-[clamp(14px,3cqw,26px)] pr-[clamp(6px,1.4cqw,12px)]">
        <span className="flex items-center gap-2 text-[clamp(14px,2.4cqw,20px)] font-semibold tracking-[-0.01em]">
          <span className="h-[7px] w-[7px] rounded-full" style={{ background: ACC }} />
          Bianchi
        </span>
        <span className="flex items-center gap-[clamp(14px,3cqw,28px)] text-[clamp(12px,1.8cqw,16px)] text-white">
          <span className="hidden @min-[560px]:flex gap-[clamp(14px,3cqw,28px)]">
            {c.site.nav.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
          <span className="hidden @min-[560px]:flex h-[clamp(28px,5cqw,40px)] items-center rounded-full bg-white px-[clamp(14px,2.6cqw,22px)] font-semibold text-black">{c.site.book}</span>
          <span className="flex @min-[560px]:hidden h-8 w-8 items-center justify-center rounded-full bg-white text-black">
            <Menu size={16} strokeWidth={2} />
          </span>
        </span>
      </Bead>
      <div className="absolute bottom-[clamp(54px,10cqw,96px)] left-[4cqw] text-white" style={{ ...DISP, fontSize: "clamp(34px,11.5cqw,128px)", lineHeight: 0.98 }}>
        {c.site.title[0]}
        <br />
        {c.site.title[1].replace(".", "")}
        <span style={{ color: ACC }}>.</span>
      </div>
      <Bead as="div" tint="rgba(10,14,18,.6)" radius={999} className="absolute right-[4cqw] top-[clamp(64px,15cqw,120px)] hidden h-[clamp(64px,13cqw,120px)] w-[clamp(64px,13cqw,120px)] items-center justify-center @min-[440px]:flex">
        <svg viewBox="0 0 100 100" className="absolute inset-0" aria-hidden>
          <defs>
            <path id="wcc" d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0" />
          </defs>
          <text fontSize="9.4" fontWeight="600" letterSpacing="1.8" fill="#fff">
            <textPath href="#wcc">{c.site.badge}</textPath>
          </text>
        </svg>
        <span className="flex h-[38%] w-[38%] items-center justify-center rounded-full bg-white text-black">
          <ArrowDown size={16} strokeWidth={2} className="-rotate-[135deg]" />
        </span>
      </Bead>
      <div className="absolute bottom-[3cqw] left-[4cqw] hidden gap-2 text-[clamp(11px,1.7cqw,15px)] @min-[480px]:flex">
        {[c.site.stars, c.site.since].map((s) => (
          <Bead key={s} as="div" tint="rgba(10,14,18,.62)" radius={999} className="flex h-[clamp(28px,5cqw,40px)] items-center px-[clamp(12px,2.4cqw,20px)]">
            {s}
          </Bead>
        ))}
      </div>
    </div>
  );
}

/** Lo stesso disegno, prima di essere finito: solo le forme, nelle stesse posizioni. */
function Wire() {
  return (
    <div data-wire className="@container absolute inset-0 overflow-hidden bg-[#08111a]">
      <div className="absolute inset-[3cqw] rounded-[2.4cqw] border border-dashed border-[#8fd8ff]/35" />
      <div className="absolute inset-x-[3cqw] top-[3cqw] h-[clamp(40px,8cqw,64px)] rounded-full bg-white/[.12]" />
      <div className="absolute left-[4cqw] top-[clamp(64px,15cqw,120px)] h-[clamp(64px,13cqw,120px)] w-[clamp(64px,13cqw,120px)] rounded-full bg-white/[.08] max-[440px]:hidden" style={{ left: "auto", right: "4cqw" }} />
      <div className="absolute bottom-[clamp(54px,10cqw,96px)] left-[4cqw] h-[11.5cqw] w-[58cqw] rounded-[1cqw] bg-white/[.14]" style={{ minHeight: 34 }} />
      <div className="absolute bottom-[calc(clamp(54px,10cqw,96px)+12cqw)] left-[4cqw] h-[11.5cqw] w-[44cqw] rounded-[1cqw] bg-white/[.14]" style={{ minHeight: 34 }} />
      <div className="absolute bottom-[3cqw] left-[4cqw] h-[clamp(28px,5cqw,40px)] w-[22cqw] rounded-full bg-white/[.1]" />
      <div className="absolute bottom-[3cqw] left-[calc(4cqw+24cqw)] h-[clamp(28px,5cqw,40px)] w-[20cqw] rounded-full bg-white/[.1]" />
    </div>
  );
}

/* ───────────── Un capitolo: la domanda, la risposta mostrata a tutto schermo, la frase che la riassume ───────────── */

const VIS_AT = 2.0;

function Chapter({
  id,
  q,
  a,
  vh = 300,
  span = 5,
  bg,
  children,
  build,
}: {
  id: string;
  q: string;
  a?: string;
  vh?: number;
  span?: number;
  bg?: ReactNode;
  children: ReactNode;
  build: (tl: gsap.core.Timeline, $: Q, root: HTMLElement) => void;
}) {
  const root = useRef<HTMLElement>(null);
  const end = VIS_AT + span;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current!;
      const $ = gsap.utils.selector(el) as Q;
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.8, invalidateOnRefresh: true } });
      const sq = SplitText.create($("[data-q]")[0], { type: "words", mask: "words" });
      tl.fromTo($("[data-q]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0)
        .from(sq.words, { yPercent: 115, duration: 0.9, stagger: 0.07, ease: "expo.out" }, 0.05)
        .to(sq.words, { yPercent: -115, duration: 0.5, stagger: 0.04, ease: "power2.in" }, 1.6)
        .set($("[data-q]"), { autoAlpha: 0 }, 2.2);
      tl.fromTo($("[data-vis]"), { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power2.out" }, VIS_AT - 0.1);
      build(tl, $, el);
      if (a) {
        const sa = SplitText.create($("[data-a]")[0], { type: "words", mask: "words" });
        tl.to($("[data-vis]"), { opacity: 0.14, scale: 1.03, duration: 0.7, ease: "power2.inOut" }, end + 0.1)
          .fromTo($("[data-a]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, end + 0.3)
          .from(sa.words, { yPercent: 115, duration: 0.9, stagger: 0.07, ease: "expo.out" }, end + 0.35);
        tl.set({}, {}, end + 2.8);
      } else {
        tl.to($("[data-vis]"), { autoAlpha: 0, duration: 0.5, ease: "power2.in" }, end + 0.2);
        tl.set({}, {}, end + 0.9);
      }
    },
    { scope: root },
  );
  return (
    <section ref={root} id={id} className="cine-sec relative" style={{ height: `${vh}svh` }}>
      <div className="cine-stage sticky top-0 h-svh overflow-hidden">
        {bg}
        <div data-vis className="cine-vis absolute inset-0">
          {children}
        </div>
        <p data-q className="cine-q pointer-events-none absolute inset-x-0 top-1/2 mx-auto max-w-[17ch] -translate-y-1/2 px-6 text-center text-[clamp(36px,6.6vw,112px)] font-medium leading-[1.06] tracking-[-0.05em] text-white">
          {q}
        </p>
        {a && (
          <p data-a className="cine-a pointer-events-none absolute inset-x-0 top-1/2 mx-auto max-w-[20ch] -translate-y-1/2 px-6 text-center text-[clamp(34px,5.8vw,98px)] font-medium leading-[1.06] tracking-[-0.05em] text-white">
            {a}
          </p>
        )}
      </div>
    </section>
  );
}

/* ───────────── 1 · Cosa trova chi ti cerca ───────────── */

function Find({ c }: { c: Cinema }) {
  return (
    <Chapter
      id="cerca"
      q={c.find.q}
      a={c.find.a}
      span={5.2}
      build={(tl, $) => {
        const [search, typed, res1, load, ring, count, res2] = ["[data-search]", "[data-typed]", "[data-res1]", "[data-load]", "[data-ring]", "[data-count]", "[data-res2]"].map((s) => $(s)[0]);
        tl.fromTo(search, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, 2.1);
        typeTo(tl, typed, c.find.typed, 2.6, 0.95);
        tl.fromTo(res1, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, 3.7)
          .to(res1, { scale: 0.97, duration: 0.15 }, 4.2)
          .to(res1, { scale: 1, duration: 0.15 }, 4.35)
          .to([search, res1], { autoAlpha: 0, y: -20, duration: 0.35, ease: "power2.in" }, 4.55)
          .fromTo(load, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power2.out" }, 4.8)
          .fromTo(ring, { strokeDashoffset: 100 }, { strokeDashoffset: 80, duration: 0.7, ease: "power1.out" }, 4.9);
        num(tl, count, 0, 8.4, 4.9, 1.3, (n) => n.toFixed(1).replace(".", ",") + " s");
        tl.to(load, { autoAlpha: 0, scale: 1.04, duration: 0.3, ease: "power2.in" }, 6.4).fromTo(res2, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "expo.out" }, 6.6);
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center px-5">
        <div className="relative h-[min(62svh,520px)] w-full max-w-[700px]">
          <Bead as="div" data-search tint="rgba(255,255,255,.12)" radius={999} className="absolute inset-x-0 top-[6%] flex h-[clamp(56px,9svh,76px)] items-center gap-4 px-7 text-[clamp(18px,2.4vw,26px)] text-white">
            <Search size={22} strokeWidth={1.8} className="shrink-0 text-white/70" />
            <span data-typed />
            <span className="h-[1.1em] w-[2px] animate-pulse bg-white/80" />
          </Bead>
          <Bead as="div" data-res1 tint="rgba(255,255,255,.1)" radius={34} className="absolute inset-x-0 top-[34%] block px-8 py-7 text-white">
            <span className="block text-[clamp(20px,2.6vw,30px)] font-medium tracking-[-0.02em]">Studio Rossi</span>
            <span className="mt-1 block text-[clamp(14px,1.6vw,18px)] text-white/60">studiorossi.it</span>
          </Bead>
          <div data-load className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-white">
            <span className="relative block h-[clamp(120px,22svh,190px)] w-[clamp(120px,22svh,190px)]">
              <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
                <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1.6" />
                <circle data-ring cx="20" cy="20" r="17" fill="none" stroke="#f5c46b" strokeWidth="1.6" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
              </svg>
              <span data-count className="absolute inset-0 flex items-center justify-center font-mono text-[clamp(26px,4.4svh,40px)] tabular-nums">
                0,0 s
              </span>
            </span>
            <span className="text-[clamp(16px,1.9vw,22px)] text-white/70">{c.find.loading}</span>
          </div>
          <div data-res2 className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
            <span className="text-[clamp(68px,13svh,150px)] font-medium leading-none tracking-[-0.05em]" style={{ color: ACC }}>
              0,8 s
            </span>
            <span className="text-[clamp(18px,2.2vw,26px)] text-white/80">Studio Verdi</span>
          </div>
        </div>
      </div>
    </Chapter>
  );
}

/* ───────────── 2 · Si parte da te: tre domande, su una persona che ti ascolta ───────────── */

function Listen({ c }: { c: Cinema }) {
  return (
    <Chapter
      id="ascolto"
      q={c.listen.q}
      a={c.listen.a}
      span={5.2}
      bg={
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-photo src={cin("ascolto")} alt="" className="h-full w-full object-cover" style={{ filter: "brightness(.5)" }} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,10,.55),rgba(5,7,10,.7))]" />
        </div>
      }
      build={(tl, $) => {
        tl.fromTo($("[data-photo]"), { scale: 1.2 }, { scale: 1.03, duration: 7, ease: "none" }, 1.2);
        $("[data-ask]").forEach((el, i) => {
          const at = 2.2 + i * 1.7;
          tl.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, at);
          tl.to(el, { autoAlpha: 0, y: -40, duration: 0.4, ease: "power2.in" }, i < 2 ? at + 1.3 : 7.0);
        });
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center px-6">
        {c.listen.asks.map((t) => (
          <p key={t} data-ask className="absolute max-w-[16ch] text-center text-[clamp(36px,6.2vw,104px)] font-medium leading-[1.06] tracking-[-0.05em] text-white">
            {t}
          </p>
        ))}
      </div>
    </Chapter>
  );
}

/* ───────────── 3 · Le pagine vere, prima che esistano ───────────── */

function Draw({ c }: { c: Cinema }) {
  return (
    <Chapter
      id="disegno"
      q={c.draw.q}
      a={c.draw.a}
      build={(tl, $) => {
        const wire = $("[data-wire]")[0];
        tl.fromTo($("[data-frame]"), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" }, 2.1)
          .fromTo($("[data-wire] > div"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.13 }, 2.3)
          .fromTo(wire, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(100% 0% 0% 0%)", duration: 2.1, ease: "power2.inOut" }, 3.6)
          .fromTo($("[data-scan]"), { yPercent: -100, autoAlpha: 1 }, { yPercent: 0, duration: 2.1, ease: "power2.inOut" }, 3.6)
          .to($("[data-scan]"), { autoAlpha: 0, duration: 0.2 }, 5.7)
          .fromTo($("[data-simg]"), { scale: 1.22 }, { scale: 1, duration: 2.6, ease: "power2.out" }, 3.6);
        // la linea che disegna scende insieme alla maschera: mostra dove il progetto diventa pagina
        tl.set($("[data-scan]"), { top: 0 }, 0);
        tl.fromTo($("[data-scan]"), { top: "0%" }, { top: "100%", duration: 2.1, ease: "power2.inOut" }, 3.6);
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div data-frame className="relative overflow-hidden rounded-[clamp(18px,3vw,36px)] bg-[#0d1115] shadow-[0_40px_120px_-30px_rgba(0,0,0,.8)]" style={{ width: "min(1100px,92vw)", height: "min(64svh,640px)" }}>
          <MiniSite c={c} />
          <Wire />
          <span data-scan className="pointer-events-none absolute inset-x-0 z-10 block h-[2px] bg-[#8fd8ff] opacity-0 shadow-[0_0_24px_4px_rgba(143,216,255,.55)]" />
        </div>
      </div>
    </Chapter>
  );
}

/* ───────────── 4 · Si adatta a ogni schermo: la stessa pagina, che si riordina davvero ───────────── */

function Screens({ c }: { c: Cinema }) {
  return (
    <Chapter
      id="schermi"
      q={c.screens.q}
      a={c.screens.a}
      build={(tl, $) => {
        const fr = $("[data-fr]")[0];
        const fit = (w: number) => () => Math.min(1, (innerWidth * 0.92) / w, (innerHeight * 0.66) / 640);
        tl.set(fr, { width: 1100, scale: fit(1100), borderRadius: 28, xPercent: -50, yPercent: -50 }, 0)
          .fromTo(fr, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" }, 2.1)
          .to(fr, { width: 640, scale: fit(640), borderRadius: 38, duration: 1.4, ease: "power2.inOut" }, 3.2)
          .to(fr, { width: 340, scale: fit(340), borderRadius: 52, duration: 1.4, ease: "power2.inOut" }, 5.0);
      }}
    >
      <div data-fr className="absolute left-1/2 top-1/2 overflow-hidden bg-[#0d1115] shadow-[0_40px_120px_-30px_rgba(0,0,0,.8)] ring-1 ring-white/15" style={{ width: 1100, height: 640 }}>
        <MiniSite c={c} />
      </div>
    </Chapter>
  );
}

/* ───────────── 5 · Online, sul tuo indirizzo ───────────── */

function Online({ c }: { c: Cinema }) {
  return (
    <Chapter
      id="online"
      q={c.online.q}
      a={c.online.a}
      span={5.4}
      build={(tl, $) => {
        const bar = $("[data-bar2]")[0];
        tl.fromTo(bar, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, 2.1);
        typeTo(tl, $("[data-url]")[0], "studiobianchi.it", 2.6, 1.1);
        tl.fromTo($("[data-load2]"), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power1.inOut" }, 3.9)
          .to($("[data-lock1]"), { autoAlpha: 0, duration: 0.1 }, 4.8)
          .fromTo($("[data-lock2]"), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, 4.8)
          .fromTo($("[data-live]"), { autoAlpha: 0, x: 10 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: "expo.out" }, 4.9)
          .fromTo($("[data-open]"), { autoAlpha: 0, scale: 1.14 }, { autoAlpha: 1, scale: 1, duration: 1.0, ease: "power3.out" }, 5.0)
          .to(bar, { y: () => -(innerHeight / 2 - 76), duration: 0.9, ease: "power3.inOut" }, 5.4);
      }}
    >
      <div data-open className="absolute inset-0 opacity-0">
        <MiniSite c={c} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-5">
        <Bead as="div" data-bar2 tint="rgba(10,14,18,.7)" radius={999} className="relative z-10 flex h-[clamp(60px,9svh,84px)] w-[min(720px,90vw)] items-center gap-4 overflow-hidden px-7 text-[clamp(18px,2.4vw,28px)] text-white">
          <span className="relative block h-6 w-6 shrink-0">
            <Lock data-lock1 size={22} strokeWidth={1.8} className="absolute inset-0 text-white/70" />
            <ShieldCheck data-lock2 size={24} strokeWidth={1.8} className="absolute inset-0 text-[#6ee7a8] opacity-0" />
          </span>
          <span data-url className="tracking-[-0.01em]" />
          <span data-live className="ml-auto flex items-center gap-2 text-[0.72em] text-white opacity-0">
            <span className="h-2 w-2 rounded-full bg-[#30d158] shadow-[0_0_0_4px_rgba(48,209,88,.25)]" />
            {c.online.live}
          </span>
          <span data-load2 className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-[#8fd8ff]" style={{ transform: "scaleX(0)" }} />
        </Bead>
      </div>
    </Chapter>
  );
}

/* ───────────── 6 · Arrivano i clienti ───────────── */

function Clients({ c }: { c: Cinema }) {
  return (
    <Chapter
      id="clienti"
      q={c.clients.q}
      a={c.clients.a}
      span={5.2}
      bg={<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(94,196,255,.16),transparent_62%)]" />}
      build={(tl, $) => {
        const n = $("[data-n]");
        n.forEach((el, i) => {
          const at = 2.3 + i * 1.5;
          tl.fromTo(el, { autoAlpha: 0, y: -150, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "expo.out" }, at);
          for (let j = 0; j < i; j++) tl.to(n[j], { y: "+=104", scale: "-=0.03", opacity: "-=0.16", duration: 0.6, ease: "expo.out" }, at);
        });
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center px-5">
        <div className="relative h-[min(50svh,420px)] w-full max-w-[560px]">
          {c.clients.items.map(([t, b]) => (
            <Bead as="div" key={b} data-n tint="rgba(255,255,255,.14)" radius={34} className="absolute inset-x-0 top-[18%] flex items-center gap-5 px-6 py-5 text-white">
              <span className="flex h-[clamp(46px,6vw,62px)] w-[clamp(46px,6vw,62px)] shrink-0 items-center justify-center rounded-full" style={{ background: ACC, color: "#04121c" }}>
                <Bell size={24} strokeWidth={1.8} />
              </span>
              <span className="block leading-tight">
                <span className="block text-[clamp(18px,2.2vw,26px)] font-semibold tracking-[-0.015em]">{t}</span>
                <span className="mt-1 block text-[clamp(15px,1.8vw,21px)] text-white/75">{b}</span>
              </span>
            </Bead>
          ))}
        </div>
      </div>
    </Chapter>
  );
}

/* ───────────── 7 · I testi li cambi tu ───────────── */

function Edit({ c }: { c: Cinema }) {
  return (
    <Chapter
      id="modifiche"
      q={c.edit.q}
      a={c.edit.a}
      span={5}
      bg={<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(94,196,255,.12),transparent_60%)]" />}
      build={(tl, $) => {
        const line = $("[data-line]")[0];
        tl.fromTo($("[data-card]"), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" }, 2.1)
          .fromTo($("[data-focus]"), { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "expo.out" }, 2.9)
          .fromTo($("[data-sel]"), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 3.5);
        tl.set(line, { textContent: c.edit.from }, 0);
        // si cancella e si riscrive: dal vecchio orario al nuovo
        const o = { n: 0 };
        tl.to(o, { n: 1, duration: 0.01, onUpdate: () => void 0 }, 4.1)
          .set(line, { textContent: "" }, 4.1)
          .set($("[data-sel]"), { autoAlpha: 0 }, 4.1);
        typeTo(tl, line, c.edit.to, 4.2, 1.1);
        tl.to($("[data-focus]"), { autoAlpha: 0, duration: 0.3 }, 5.5)
          .fromTo($("[data-saved]"), { autoAlpha: 0, scale: 0.8, y: 10 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(2)" }, 5.6);
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center px-5">
        <Bead as="div" data-card tint="rgba(255,255,255,.1)" radius={40} className="relative block w-[min(640px,90vw)] px-[clamp(24px,4vw,48px)] py-[clamp(28px,5vw,56px)] text-white">
          <span className="flex items-center gap-2 text-[clamp(13px,1.5vw,17px)] uppercase tracking-[0.16em] text-white/65">
            <PencilLine size={16} strokeWidth={1.8} />
            {c.edit.label}
          </span>
          <span className="relative mt-5 block">
            <span data-focus className="absolute -inset-x-4 -inset-y-2 rounded-2xl border-2 border-[#8fd8ff]" />
            <span data-sel className="absolute -inset-x-3 -inset-y-1 origin-left rounded-xl bg-[#8fd8ff]/30" />
            <span data-line className="relative block min-h-[1.2em] text-[clamp(30px,5vw,60px)] font-medium leading-[1.15] tracking-[-0.04em]">
              {c.edit.from}
            </span>
          </span>
          <span data-saved className="mt-8 flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2 text-[clamp(14px,1.7vw,19px)] font-semibold text-black opacity-0">
            <Check size={18} strokeWidth={2.4} />
            {c.edit.saved}
          </span>
        </Bead>
      </div>
    </Chapter>
  );
}

/* ───────────── 8 e 9 · Un elenco che si legge una voce alla volta ───────────── */

const ICONS_GETS = [Globe, KeyRound, ShieldCheck, PencilLine, Inbox, LifeBuoy];
const ICONS_PROMISE = [FileText, UserRound, KeyRound, LockOpen];

function Reel({ id, q, items, icons }: { id: string; q: string; items: [string, string][]; icons: typeof ICONS_GETS }) {
  const per = 1.55;
  const span = items.length * per + 0.4;
  return (
    <Chapter
      id={id}
      q={q}
      vh={Math.round(130 + items.length * 62)}
      span={span}
      build={(tl, $) => {
        $("[data-it]").forEach((el, i) => {
          const at = VIS_AT + 0.1 + i * per;
          tl.fromTo(el, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "expo.out" }, at);
          tl.fromTo($("[data-ico]")[i], { scale: 0.5, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.6, ease: "back.out(1.8)" }, at);
          if (i < items.length - 1) tl.to(el, { autoAlpha: 0, y: -70, duration: 0.4, ease: "power2.in" }, at + per - 0.45);
        });
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center px-6">
        {items.map(([t, b], i) => {
          const Icon = icons[i];
          return (
            <div key={t} data-it className="absolute flex max-w-[1100px] flex-col items-center text-center text-white">
              <Bead as="div" data-ico tint="rgba(255,255,255,.14)" radius={999} className="flex h-[clamp(72px,11svh,104px)] w-[clamp(72px,11svh,104px)] items-center justify-center" style={{ color: ACC }}>
                <Icon size={36} strokeWidth={1.5} />
              </Bead>
              <p className="mt-7 text-[clamp(44px,9vw,150px)] font-medium leading-[1] tracking-[-0.055em]">{t}</p>
              <p className="mt-6 max-w-[24ch] text-[clamp(19px,2.4vw,34px)] leading-[1.3] tracking-[-0.02em] text-white/80">{b}</p>
            </div>
          );
        })}
      </div>
    </Chapter>
  );
}

/* ───────────── Apertura ───────────── */

function Open({ title, c }: { title: string; c: Cinema }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const split = SplitText.create("[data-oh]", { type: "words", mask: "words" });
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      onIntroLift(() => tl.play());
      tl.from(split.words, { yPercent: 115, duration: 1.3, stagger: 0.07 }, 0.2).from("[data-ocue]", { autoAlpha: 0, y: 14, duration: 1 }, 1.2).from("[data-oimg]", { scale: 1.2, duration: 2.6 }, 0);
      gsap.to("[data-oimg]", { yPercent: 12, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
    },
    { scope: root },
  );
  return (
    <section ref={root} className="relative flex h-svh min-h-[560px] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-oimg src={cin("lavoro")} alt="" className="h-full w-full object-cover" style={{ filter: "brightness(.42)" }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,10,.4),rgba(5,7,10,.2)_40%,rgba(5,7,10,.9))]" />
      </div>
      <h1 data-oh className="relative max-w-[14ch] px-6 text-center text-[clamp(44px,8.4vw,140px)] font-medium leading-[1.02] tracking-[-0.055em] text-white">
        {title}
      </h1>
      <span data-ocue className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[13px] uppercase tracking-[0.18em] text-white/70">
        {c.cue}
        <ArrowDown size={16} strokeWidth={1.8} className="animate-bounce" />
      </span>
    </section>
  );
}

export function WebCinema({ title }: { title: string }) {
  const locale = useLocale() as Locale;
  const c = getCinema(locale);
  return (
    <div className="theme-dark relative bg-[#05070a] text-white" style={{ background: INK }}>
      <Open title={title} c={c} />
      <Find c={c} />
      <Listen c={c} />
      <Draw c={c} />
      <Screens c={c} />
      <Online c={c} />
      <Clients c={c} />
      <Edit c={c} />
      <Reel id="ricevi" q={c.gets.q} items={c.gets.items} icons={ICONS_GETS} />
      <Reel id="garanzie" q={c.promise.q} items={c.promise.items} icons={ICONS_PROMISE} />
    </div>
  );
}
