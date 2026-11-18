"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ArrowDown, Bell, Check, Pause, Play, RotateCcw, Volume2, VolumeX, FileText, Globe, Inbox, KeyRound, LifeBuoy, Lock, LockOpen, Menu, PencilLine, Search, ShieldCheck, UserRound } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { prefersReducedMotion } from "@/lib/env";
import { onIntroLift } from "@/lib/intro";
import { play as sfx, soundOn, onSound, setSound } from "@/lib/sound";
import { Bead } from "@/components/glass/Bead";
import { getCinema, type Cinema } from "@/content/cinema";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const ACC = "#8fd8ff";

const DISP = { fontFamily: "var(--font-anton), Impact, sans-serif", textTransform: "uppercase" as const };
const cin = (n: string) => `/visual/cinema/${n}.webp`;

/** Scrive un testo lettera per lettera, con il suono dei tasti. */
const typeTo = (tl: gsap.core.Timeline, el: Element, text: string, at: number, dur: number) => {
  const o = { n: 0 };
  tl.to(o, { n: text.length, duration: dur, ease: "none", onUpdate: () => void (el.textContent = text.slice(0, Math.round(o.n))) }, at);
  for (let t = 0; t < dur; t += 0.085) tl.call(() => sfx("key", 0.9 + Math.random() * 0.3), undefined, at + t);
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
      <img data-simg src={cin("lavoro")} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 50%" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,12,16,.62) 0%, rgba(8,12,16,.12) 28%, rgba(8,12,16,.3) 48%, rgba(8,12,16,.9) 100%)" }} />
      <Bead as="div" tint="rgba(10,14,18,.62)" radius={999} className="absolute inset-x-[3cqw] top-[3cqw] flex h-[clamp(40px,8cqw,64px)] items-center justify-between pl-[clamp(14px,3cqw,26px)] pr-[clamp(6px,1.4cqw,12px)]">
        <span className="flex items-center gap-2 text-[clamp(14px,2.4cqw,20px)] font-semibold tracking-[-0.01em]">
          <span className="h-[7px] w-[7px] rounded-full" style={{ background: ACC }} />
          Marchio
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
    <div data-wire className="@container absolute inset-0 overflow-hidden bg-[var(--bg-sunken)]">
      <div className="absolute inset-[3cqw] rounded-[2.4cqw] border border-dashed border-[color:color-mix(in_srgb,var(--accent)_45%,transparent)]" />
      <div className="absolute inset-x-[3cqw] top-[3cqw] h-[clamp(40px,8cqw,64px)] rounded-full cine-blk" />
      <div className="absolute left-[4cqw] top-[clamp(64px,15cqw,120px)] h-[clamp(64px,13cqw,120px)] w-[clamp(64px,13cqw,120px)] rounded-full cine-blk max-[440px]:hidden" style={{ left: "auto", right: "4cqw" }} />
      <div className="absolute bottom-[clamp(54px,10cqw,96px)] left-[4cqw] h-[11.5cqw] w-[58cqw] rounded-[1cqw] cine-blk" style={{ minHeight: 34 }} />
      <div className="absolute bottom-[calc(clamp(54px,10cqw,96px)+12cqw)] left-[4cqw] h-[11.5cqw] w-[44cqw] rounded-[1cqw] cine-blk" style={{ minHeight: 34 }} />
      <div className="absolute bottom-[3cqw] left-[4cqw] h-[clamp(28px,5cqw,40px)] w-[22cqw] rounded-full cine-blk" />
      <div className="absolute bottom-[3cqw] left-[calc(4cqw+24cqw)] h-[clamp(28px,5cqw,40px)] w-[20cqw] rounded-full cine-blk" />
    </div>
  );
}


/* ───────────── Il video: una timeline sola, regolata da noi, con i suoni. Domanda → visual → risposta, una scena dopo l'altra. ───────────── */

type Q = (s: string) => HTMLElement[];
type Def = { id: string; q: string; a?: string; v: number; node: React.ReactNode; build: (tl: gsap.core.Timeline, $: Q, t: number) => void };

const QH = 1.25; // quanto resta la domanda
const AH = 1.5; // quanto resta la risposta
const BIG = "text-center font-medium leading-[1.06] tracking-[-0.05em] cine-fg";

function scenes(c: Cinema): Def[] {
  const find: Def = {
    id: "cerca",
    q: c.find.q,
    a: c.find.a,
    v: 3.7,
    node: (
      <div className="absolute inset-0 flex items-center justify-center px-5">
        <div className="relative h-[min(62svh,520px)] w-full max-w-[700px]">
          <Bead as="div" data-search radius={999} className="cine-fg absolute inset-x-0 top-[6%] flex h-[clamp(56px,9svh,76px)] items-center gap-4 px-7 text-[clamp(18px,2.4vw,26px)]">
            <Search size={22} strokeWidth={1.8} className="cine-fg2 shrink-0" />
            <span data-typed />
            <span className="h-[1.1em] w-[2px] animate-pulse bg-[var(--label-primary)]" />
          </Bead>
          <Bead as="div" data-res1 radius={34} className="cine-fg absolute inset-x-0 top-[34%] block px-8 py-7">
            <span className="block text-[clamp(20px,2.6vw,30px)] font-medium tracking-[-0.02em]">La tua attività</span>
            <span className="cine-fg2 mt-1 block text-[clamp(14px,1.6vw,18px)]">latuaattivita.it</span>
          </Bead>
          <div data-load className="cine-fg absolute inset-0 flex flex-col items-center justify-center gap-6">
            <span className="relative block h-[clamp(120px,22svh,190px)] w-[clamp(120px,22svh,190px)]">
              <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
                <circle cx="20" cy="20" r="17" fill="none" stroke="var(--hair-strong)" strokeWidth="1.6" />
                <circle data-ring cx="20" cy="20" r="17" fill="none" stroke="#f5c46b" strokeWidth="1.6" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
              </svg>
              <span data-count className="absolute inset-0 flex items-center justify-center font-mono text-[clamp(26px,4.4svh,40px)] tabular-nums">
                0,0 s
              </span>
            </span>
            <span className="cine-fg2 text-[clamp(16px,1.9vw,22px)]">{c.find.loading}</span>
          </div>
          <div data-res2 className="cine-fg absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="text-[clamp(68px,13svh,150px)] font-medium leading-none tracking-[-0.05em]" style={{ color: "var(--accent)" }}>
              0,8 s
            </span>
            <span className="cine-fg2 text-[clamp(18px,2.2vw,26px)]">latuaattivita.it</span>
          </div>
        </div>
      </div>
    ),
    build: (tl, $, t) => {
      const [search, typed, res1, load, ring, count, res2] = ["[data-search]", "[data-typed]", "[data-res1]", "[data-load]", "[data-ring]", "[data-count]", "[data-res2]"].map((x) => $(x)[0]);
      tl.fromTo(search, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" }, t);
      typeTo(tl, typed, c.find.typed, t + 0.35, 0.8);
      tl.fromTo(res1, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" }, t + 1.2)
        .call(() => sfx("press"), undefined, t + 1.5)
        .to([search, res1], { autoAlpha: 0, y: -20, duration: 0.3, ease: "power2.in" }, t + 1.65)
        .fromTo(load, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power2.out" }, t + 1.8)
        .fromTo(ring, { strokeDashoffset: 100 }, { strokeDashoffset: 80, duration: 1.0, ease: "power1.out" }, t + 1.9);
      num(tl, count, 0, 8.4, t + 1.9, 1.0, (n) => n.toFixed(1).replace(".", ",") + " s");
      for (let k = 0; k < 4; k++) tl.call(() => sfx("tick", 0.8 + k * 0.05), undefined, t + 1.95 + k * 0.25);
      tl.to(load, { autoAlpha: 0, scale: 1.04, duration: 0.25, ease: "power2.in" }, t + 3.0)
        .fromTo(res2, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "expo.out" }, t + 3.15)
        .call(() => sfx("success", 1.1), undefined, t + 3.2);
    },
  };

  const listen: Def = {
    id: "ascolto",
    q: c.listen.q,
    a: c.listen.a,
    v: 3.4,
    node: (
      <div className="absolute inset-0 flex items-center justify-center px-5">
        <div className="relative overflow-hidden rounded-[clamp(22px,3.4vw,40px)] bg-[#0d1115] shadow-[0_40px_120px_-40px_rgba(0,0,0,.55)]" style={{ width: "min(900px,92vw)", height: "min(58svh,560px)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-photo src={cin("ascolto")} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,10,.25),rgba(5,7,10,.78))]" />
          <div className="absolute inset-x-0 bottom-0 flex h-[52%] items-center justify-center px-6">
            {c.listen.asks.map((x) => (
              <p key={x} data-ask className="absolute max-w-[18ch] text-center text-[clamp(28px,4.6vw,64px)] font-medium leading-[1.08] tracking-[-0.045em] text-white">
                {x}
              </p>
            ))}
          </div>
        </div>
      </div>
    ),
    build: (tl, $, t) => {
      tl.fromTo($("[data-photo]"), { scale: 1.22 }, { scale: 1.02, duration: 3.6, ease: "none" }, t);
      $("[data-ask]").forEach((el, i) => {
        const at = t + i * 1.1;
        tl.fromTo(el, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "expo.out" }, at).call(() => sfx("tick", 1 + i * 0.12), undefined, at);
        if (i < 2) tl.to(el, { autoAlpha: 0, y: -36, duration: 0.3, ease: "power2.in" }, at + 0.8);
      });
    },
  };

  const draw: Def = {
    id: "disegno",
    q: c.draw.q,
    a: c.draw.a,
    v: 3.3,
    node: (
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div data-frame className="relative overflow-hidden rounded-[clamp(18px,3vw,36px)] bg-[#0d1115] shadow-[0_40px_120px_-40px_rgba(0,0,0,.55)]" style={{ width: "min(1100px,92vw)", height: "min(64svh,640px)" }}>
          <MiniSite c={c} />
          <Wire />
          <span data-scan className="pointer-events-none absolute inset-x-0 z-10 block h-[2px] bg-[#8fd8ff] opacity-0 shadow-[0_0_24px_4px_rgba(143,216,255,.55)]" />
        </div>
      </div>
    ),
    build: (tl, $, t) => {
      tl.fromTo($("[data-frame]"), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, t)
        .fromTo($("[data-wire] > div"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, stagger: 0.09 }, t + 0.15)
        .call(() => sfx("open", 0.9), undefined, t + 1.05)
        .fromTo($("[data-wire]"), { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.6, ease: "power2.inOut" }, t + 1.1)
        .fromTo($("[data-scan]"), { top: "0%", autoAlpha: 1 }, { top: "100%", duration: 1.6, ease: "power2.inOut" }, t + 1.1)
        .to($("[data-scan]"), { autoAlpha: 0, duration: 0.2 }, t + 2.7)
        .fromTo($("[data-simg]"), { scale: 1.2 }, { scale: 1, duration: 2, ease: "power2.out" }, t + 1.1)
        .call(() => sfx("success", 1), undefined, t + 2.7);
    },
  };

  const screens: Def = {
    id: "schermi",
    q: c.screens.q,
    a: c.screens.a,
    v: 3.2,
    node: (
      <div data-fr className="absolute left-1/2 top-1/2 overflow-hidden bg-[#0d1115] shadow-[0_40px_120px_-40px_rgba(0,0,0,.55)] ring-1 ring-[color:var(--hair-strong)]" style={{ width: 1100, height: 640 }}>
        <MiniSite c={c} />
      </div>
    ),
    build: (tl, $, t) => {
      const fr = $("[data-fr]")[0];
      const wide = () => (innerWidth > 760 ? 1100 : 760);
      const mid = () => (innerWidth > 760 ? 640 : 520);
      const phone = () => 340;
      const fit = (w: () => number) => () => Math.min(1, (innerWidth * 0.92) / w(), (innerHeight * 0.66) / 640);
      tl.set(fr, { width: wide, scale: fit(wide), borderRadius: 28, xPercent: -50, yPercent: -50 }, t - 0.5)
        .fromTo(fr, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, t)
        .call(() => sfx("toggle", 0.9), undefined, t + 1.0)
        .to(fr, { width: mid, scale: fit(mid), borderRadius: 38, duration: 0.8, ease: "power2.inOut" }, t + 1.0)
        .call(() => sfx("toggle", 1.15), undefined, t + 2.0)
        .to(fr, { width: phone, scale: fit(phone), borderRadius: 52, duration: 0.8, ease: "power2.inOut" }, t + 2.0);
    },
  };

  const online: Def = {
    id: "online",
    q: c.online.q,
    a: c.online.a,
    v: 3.7,
    node: (
      <>
        <div data-open className="absolute inset-0 opacity-0">
          <MiniSite c={c} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <Bead as="div" data-bar2 radius={999} className="cine-fg relative z-10 flex h-[clamp(60px,9svh,84px)] w-[min(720px,90vw)] items-center gap-4 overflow-hidden px-7 text-[clamp(18px,2.4vw,28px)]">
            <span className="relative block h-6 w-6 shrink-0">
              <Lock data-lock1 size={22} strokeWidth={1.8} className="cine-fg2 absolute inset-0" />
              <ShieldCheck data-lock2 size={24} strokeWidth={1.8} className="absolute inset-0 text-[#1fa35b] opacity-0" />
            </span>
            <span data-url className="tracking-[-0.01em]" />
            <span data-live className="ml-auto flex items-center gap-2 text-[0.72em] opacity-0">
              <span className="h-2 w-2 rounded-full bg-[#30d158] shadow-[0_0_0_4px_rgba(48,209,88,.25)]" />
              {c.online.live}
            </span>
            <span data-load2 className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-[var(--accent)]" style={{ transform: "scaleX(0)" }} />
          </Bead>
        </div>
      </>
    ),
    build: (tl, $, t) => {
      const bar = $("[data-bar2]")[0];
      tl.fromTo(bar, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" }, t);
      typeTo(tl, $("[data-url]")[0], "latuaattivita.it", t + 0.4, 0.9);
      tl.fromTo($("[data-load2]"), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power1.inOut" }, t + 1.4)
        .to($("[data-lock1]"), { autoAlpha: 0, duration: 0.1 }, t + 2.2)
        .fromTo($("[data-lock2]"), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, t + 2.2)
        .call(() => sfx("success", 1.05), undefined, t + 2.2)
        .fromTo($("[data-live]"), { autoAlpha: 0, x: 10 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: "expo.out" }, t + 2.3)
        .call(() => sfx("open", 1), undefined, t + 2.35)
        .fromTo($("[data-open]"), { autoAlpha: 0, scale: 1.14 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "power3.out" }, t + 2.35)
        .to(bar, { y: () => -(innerHeight / 2 - 76), duration: 0.8, ease: "power3.inOut" }, t + 2.7);
    },
  };

  const clients: Def = {
    id: "clienti",
    q: c.clients.q,
    a: c.clients.a,
    v: 3.3,
    node: (
      <div className="absolute inset-0 flex items-center justify-center px-5">
        <div className="relative h-[min(50svh,420px)] w-full max-w-[560px]">
          {c.clients.items.map(([x, y]) => (
            <Bead as="div" key={y} data-n radius={34} className="cine-fg absolute inset-x-0 top-[18%] flex items-center gap-5 px-6 py-5">
              <span className="flex h-[clamp(46px,6vw,62px)] w-[clamp(46px,6vw,62px)] shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--bg-canvas)]">
                <Bell size={24} strokeWidth={1.8} />
              </span>
              <span className="block leading-tight">
                <span className="block text-[clamp(18px,2.2vw,26px)] font-semibold tracking-[-0.015em]">{x}</span>
                <span className="cine-fg2 mt-1 block text-[clamp(15px,1.8vw,21px)]">{y}</span>
              </span>
            </Bead>
          ))}
        </div>
      </div>
    ),
    build: (tl, $, t) => {
      const n = $("[data-n]");
      n.forEach((el, i) => {
        const at = t + 0.1 + i * 0.9;
        tl.fromTo(el, { autoAlpha: 0, y: -150, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out" }, at).call(() => sfx("notify", 1 + i * 0.08), undefined, at);
        for (let j = 0; j < i; j++) tl.to(n[j], { y: "+=104", scale: "-=0.03", opacity: "-=0.16", duration: 0.5, ease: "expo.out" }, at);
      });
    },
  };

  const edit: Def = {
    id: "modifiche",
    q: c.edit.q,
    a: c.edit.a,
    v: 3.5,
    node: (
      <div className="absolute inset-0 flex items-center justify-center px-5">
        <Bead as="div" data-card radius={40} className="cine-fg relative block w-[min(640px,90vw)] px-[clamp(24px,4vw,48px)] py-[clamp(28px,5vw,56px)]">
          <span className="cine-fg2 flex items-center gap-2 text-[clamp(13px,1.5vw,17px)] uppercase tracking-[0.16em]">
            <PencilLine size={16} strokeWidth={1.8} />
            {c.edit.label}
          </span>
          <span className="relative mt-5 block">
            <span data-focus className="absolute -inset-x-4 -inset-y-2 rounded-2xl border-2 border-[var(--accent)]" />
            <span data-sel className="absolute -inset-x-3 -inset-y-1 origin-left rounded-xl bg-[color:color-mix(in_srgb,var(--accent)_30%,transparent)]" />
            <span data-line className="relative block min-h-[1.2em] text-[clamp(30px,5vw,60px)] font-medium leading-[1.15] tracking-[-0.04em]">
              {c.edit.from}
            </span>
          </span>
          <span data-saved className="mt-8 flex w-fit items-center gap-2 rounded-full bg-[var(--label-primary)] px-5 py-2 text-[clamp(14px,1.7vw,19px)] font-semibold text-[var(--bg-canvas)] opacity-0">
            <Check size={18} strokeWidth={2.4} />
            {c.edit.saved}
          </span>
        </Bead>
      </div>
    ),
    build: (tl, $, t) => {
      const line = $("[data-line]")[0];
      tl.fromTo($("[data-card]"), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "expo.out" }, t)
        .fromTo($("[data-focus]"), { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "expo.out" }, t + 0.6)
        .call(() => sfx("click"), undefined, t + 0.65)
        .fromTo($("[data-sel]"), { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.inOut" }, t + 1.0)
        .set(line, { textContent: "" }, t + 1.5)
        .set($("[data-sel]"), { autoAlpha: 0 }, t + 1.5);
      typeTo(tl, line, c.edit.to, t + 1.6, 0.8);
      tl.to($("[data-focus]"), { autoAlpha: 0, duration: 0.25 }, t + 2.5)
        .fromTo($("[data-saved]"), { autoAlpha: 0, scale: 0.8, y: 10 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(2)" }, t + 2.6)
        .call(() => sfx("success", 1.1), undefined, t + 2.6);
    },
  };

  const reel = (id: string, q: string, items: [string, string][], icons: typeof ICONS_GETS): Def => {
    const per = 0.9;
    return {
      id,
      q,
      v: items.length * per + 0.1,
      node: (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          {items.map(([x, y], i) => {
            const Icon = icons[i];
            return (
              <div key={x} data-it className="cine-fg absolute flex max-w-[1100px] flex-col items-center text-center">
                <Bead as="div" data-ico radius={999} className="flex h-[clamp(72px,11svh,104px)] w-[clamp(72px,11svh,104px)] items-center justify-center" style={{ color: "var(--accent)" }}>
                  <Icon size={36} strokeWidth={1.5} />
                </Bead>
                <p className="mt-7 text-[clamp(44px,9vw,150px)] font-medium leading-[1] tracking-[-0.055em]">{x}</p>
                <p className="cine-fg2 mt-6 max-w-[24ch] text-[clamp(19px,2.4vw,34px)] leading-[1.3] tracking-[-0.02em]">{y}</p>
              </div>
            );
          })}
        </div>
      ),
      build: (tl, $, t) => {
        $("[data-it]").forEach((el, i) => {
          const at = t + i * per;
          tl.fromTo(el, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "expo.out" }, at)
            .fromTo($("[data-ico]")[i], { scale: 0.5, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.5, ease: "back.out(1.8)" }, at)
            .call(() => sfx("tick", 1 + i * 0.07), undefined, at);
          if (i < items.length - 1) tl.to(el, { autoAlpha: 0, y: -60, duration: 0.3, ease: "power2.in" }, at + per - 0.3);
        });
      },
    };
  };

  return [find, listen, draw, screens, online, clients, edit, reel("ricevi", c.gets.q, c.gets.items, ICONS_GETS), reel("garanzie", c.promise.q, c.promise.items, ICONS_PROMISE)];
}

const ICONS_GETS = [Globe, KeyRound, ShieldCheck, PencilLine, Inbox, LifeBuoy];
const ICONS_PROMISE = [FileText, UserRound, KeyRound, LockOpen];

export function WebCinema({ title }: { title: string }) {
  const locale = useLocale() as Locale;
  const c = getCinema(locale);
  const defs = scenes(c);
  const root = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const flags = useRef({ visible: false, paused: false, ended: false, started: false, lifted: false });
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [snd, setSnd] = useState(false);

  useEffect(() => {
    setSnd(soundOn());
    const off = onSound(setSnd);
    return () => void off();
  }, []);

  useGSAP(
    () => {
      const el = root.current!;
      const $ = gsap.utils.selector(el) as Q;
      const endCard = $("[data-end]")[0];
      if (prefersReducedMotion()) {
        gsap.set(endCard, { autoAlpha: 1 });
        return;
      }
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "none" },
        onUpdate: () => {
          if (bar.current) bar.current.style.transform = `scaleX(${tl.progress()})`;
        },
        onComplete: () => {
          flags.current.ended = true;
          setEnded(true);
          setPlaying(false);
        },
      });
      tlRef.current = tl;
      // apertura: titolo del servizio
      const oh = SplitText.create($("[data-oh]")[0], { type: "words", mask: "words" });
      let t = 0;
      tl.set($("[data-open]"), { autoAlpha: 1 }, 0)
        .call(() => sfx("whoosh", 0.9), undefined, 0.1)
        .from(oh.words, { yPercent: 115, duration: 0.9, stagger: 0.07, ease: "expo.out" }, 0.1)
        .to(oh.words, { yPercent: -115, duration: 0.4, stagger: 0.03, ease: "power2.in" }, 2.1)
        .set($("[data-open]"), { autoAlpha: 0 }, 2.7);
      t = 2.6;
      defs.forEach((d) => {
        const sc = $(`[data-scene="${d.id}"]`)[0];
        const sq = SplitText.create(sc.querySelector("[data-q]") as HTMLElement, { type: "words", mask: "words" });
        const $s = gsap.utils.selector(sc) as Q;
        const vis = sc.querySelector("[data-vis]") as HTMLElement;
        tl.set(sc, { autoAlpha: 1 }, t)
          .call(() => sfx("whoosh", 1.1), undefined, t)
          .fromTo($s("[data-q]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, t)
          .from(sq.words, { yPercent: 115, duration: 0.6, stagger: 0.06, ease: "expo.out" }, t + 0.02)
          .to(sq.words, { yPercent: -115, duration: 0.35, stagger: 0.03, ease: "power2.in" }, t + QH)
          .set($s("[data-q]"), { autoAlpha: 0 }, t + QH + 0.5);
        const vs = t + QH + 0.2;
        tl.fromTo(vis, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power2.out" }, vs);
        const v0 = vs + 0.3;
        d.build(tl, $s, v0);
        const ve = v0 + d.v;
        let e = ve + 0.35;
        if (d.a) {
          const sa = SplitText.create(sc.querySelector("[data-a]") as HTMLElement, { type: "words", mask: "words" });
          tl.to(vis, { autoAlpha: 0, scale: 1.03, duration: 0.4, ease: "power2.inOut" }, ve)
            .fromTo($s("[data-a]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, ve + 0.3)
            .call(() => sfx("tick", 1.25), undefined, ve + 0.32)
            .from(sa.words, { yPercent: 115, duration: 0.6, stagger: 0.06, ease: "expo.out" }, ve + 0.32)
            .to($s("[data-a]"), { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, ve + 0.32 + AH + 0.5);
          e = ve + 0.32 + AH + 0.8;
        } else {
          tl.to(vis, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, ve);
        }
        tl.set(sc, { autoAlpha: 0 }, e);
        t = e + 0.05;
      });
      // chiusura: il titolo e l'invito a scorrere restano
      const es = gsap.utils.selector(endCard) as Q;
      const eh = SplitText.create(es("[data-eh]")[0], { type: "words", mask: "words" });
      tl.set(endCard, { autoAlpha: 1 }, t)
        .call(() => sfx("success", 1), undefined, t + 0.1)
        .from(eh.words, { yPercent: 115, duration: 0.8, stagger: 0.07, ease: "expo.out" }, t + 0.05)
        .from(es("[data-more]"), { autoAlpha: 0, y: 14, duration: 0.7, ease: "power2.out" }, t + 0.9);
      tl.set({}, {}, t + 1.8);

      const go = () => {
        const f = flags.current;
        if (f.visible && f.lifted && !f.paused && !f.ended) {
          tl.play();
          setPlaying(true);
        } else {
          tl.pause();
          setPlaying(false);
        }
      };
      const io = new IntersectionObserver(([en]) => {
        flags.current.visible = en.isIntersecting;
        go();
      }, { threshold: 0.55 });
      io.observe(el);
      onIntroLift(() => {
        flags.current.lifted = true;
        go();
      });
      (el as unknown as { __go: () => void }).__go = go;
      return () => io.disconnect();
    },
    { scope: root, dependencies: [locale] },
  );

  const toggle = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (flags.current.ended) return;
    flags.current.paused = tl.isActive();
    (root.current as unknown as { __go: () => void }).__go();
  };
  const replay = () => {
    const tl = tlRef.current;
    if (!tl) return;
    flags.current = { ...flags.current, ended: false, paused: false };
    setEnded(false);
    tl.restart();
    setPlaying(true);
  };

  return (
    <section ref={root} className="cine-acr relative h-svh min-h-[560px] overflow-hidden" aria-label={title}>
      <div data-open className="absolute inset-0 flex items-center justify-center" style={{ visibility: "hidden", opacity: 0 }}>
        <h1 data-oh className={`max-w-[14ch] px-6 text-[clamp(44px,8.4vw,140px)] leading-[1.02] ${BIG}`}>
          {title}
        </h1>
      </div>
      {defs.map((d) => (
        <div key={d.id} data-scene={d.id} className="absolute inset-0" style={{ visibility: "hidden", opacity: 0 }}>
          <div data-vis className="absolute inset-x-0 top-0 bottom-0 max-md:bottom-[22svh]" style={{ visibility: "hidden", opacity: 0 }}>
            {d.node}
          </div>
          <p data-q className={`pointer-events-none absolute inset-x-0 top-1/2 mx-auto max-w-[17ch] -translate-y-1/2 px-6 text-[clamp(36px,6.6vw,112px)] ${BIG}`}>
            {d.q}
          </p>
          {d.a && (
            <p data-a className={`pointer-events-none absolute inset-x-0 top-1/2 mx-auto max-w-[20ch] -translate-y-1/2 px-6 text-[clamp(34px,5.8vw,98px)] ${BIG}`} style={{ visibility: "hidden", opacity: 0 }}>
              {d.a}
            </p>
          )}
        </div>
      ))}
      <div data-end className="absolute inset-0 flex flex-col items-center justify-center" style={{ visibility: "hidden", opacity: 0 }}>
        <p data-eh className={`max-w-[14ch] px-6 text-[clamp(44px,8.4vw,140px)] leading-[1.02] ${BIG}`}>
          {c.end.t}
        </p>
        <span data-more className="cine-fg2 absolute bottom-[clamp(150px,22svh,200px)] flex flex-col items-center gap-2 text-[13px] uppercase tracking-[0.18em] md:bottom-24">
          {c.end.more}
          <ArrowDown size={16} strokeWidth={1.8} className="animate-bounce" />
        </span>
      </div>
      {!prefersReducedMotion() && (
        <div className="absolute inset-x-0 bottom-[clamp(158px,24svh,210px)] z-10 flex justify-center px-5 md:bottom-7">
          <Bead as="div" radius={999} className="cine-fg relative flex h-12 items-center gap-1 overflow-hidden pl-2 pr-2">
            <button type="button" onClick={ended ? replay : toggle} aria-label={ended ? c.ctl.replay : playing ? c.ctl.pause : c.ctl.play} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--hover)]">
              {ended ? <RotateCcw size={18} strokeWidth={1.9} /> : playing ? <Pause size={18} strokeWidth={1.9} /> : <Play size={18} strokeWidth={1.9} />}
            </button>
            <span className="relative mx-1 block h-[3px] w-[clamp(96px,22vw,200px)] overflow-hidden rounded-full bg-[var(--hair-strong)]">
              <span ref={bar} className="absolute inset-0 origin-left bg-[var(--accent)]" style={{ transform: "scaleX(0)" }} />
            </span>
            <button type="button" onClick={() => setSound(!snd)} aria-label={snd ? c.ctl.on : c.ctl.off} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--hover)]">
              {snd ? <Volume2 size={18} strokeWidth={1.9} /> : <VolumeX size={18} strokeWidth={1.9} />}
            </button>
          </Bead>
        </div>
      )}
    </section>
  );
}
