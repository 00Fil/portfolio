"use client";

import { useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ArrowUpRight, Bell, CalendarDays, Check, FileText, Globe, HardDrive, Inbox, KeyRound, LayoutDashboard, LayoutTemplate, Lock, LockOpen, MessageCircle, PhoneCall, Plus, RefreshCw, Rocket, Settings, ShoppingBag, Truck, UserRound, Users, Zap, type LucideIcon } from "lucide-react";
import { BRANDS, type BrandKey } from "@/lib/brands";
import { Link } from "@/i18n/navigation";
import { Bead } from "@/components/glass/Bead";
import { Drop } from "@/components/glass/Drop";
import { Tile3D } from "@/components/ui/Tile3D";
import { Script } from "@/components/ui/Script";
import { prefersReducedMotion } from "@/lib/env";
import type { ServiceStory } from "@/content/stories";
import type { WebCopy } from "@/content/webpage";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Q = (s: string) => HTMLElement[];
type Proof = { slug: string; name: string; headline: string; context: string; tags: string[]; icon: string };
type M = Record<string, string>;

const container = "mx-auto w-full max-w-[1280px] px-5 sm:px-8";
const h2 = "max-w-[20ch] text-[clamp(34px,4.6vw,68px)] font-medium leading-[1.04] tracking-[-0.045em] text-ink";

const surface = "bg-[var(--bg-surface)] shadow-[inset_0_0_0_1px_var(--hair-strong),0_14px_32px_-18px_rgba(0,0,0,.28)]";
const dot = (c = "#2fb36a") => <span className="inline-block h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: c, boxShadow: `0 0 0 3px color-mix(in srgb, ${c} 25%, transparent)` }} />;
const blue = "linear-gradient(180deg,#3b8cff,#1f6ae8)";
const tint = (c: string, p = 72) => `color-mix(in srgb, ${c} ${p}%, transparent)`;

/** Anima un contatore dentro un elemento. */
const count = (tl: gsap.core.Timeline, el: HTMLElement | undefined, from: number, to: number, dur: number, at: number, fmt: (n: number) => string, ease = "none") => {
  const o = { n: from };
  tl.fromTo(o, { n: from }, { n: to, duration: dur, ease, onUpdate: () => void (el && (el.textContent = fmt(o.n))) }, at);
};

/** Cancella e riscrive un testo, lettera per lettera. */
const retype = (tl: gsap.core.Timeline, el: HTMLElement, from: string, to: string, at: number, dEr: number, dTy: number) => {
  const o = { n: from.length };
  tl.fromTo(o, { n: from.length }, { n: 0, duration: dEr, ease: "none", onUpdate: () => void (el.textContent = from.slice(0, Math.round(o.n))) }, at).fromTo(o, { n: 0 }, { n: to.length, duration: dTy, ease: "none", onUpdate: () => void (el.textContent = to.slice(0, Math.round(o.n))) }, at + dEr);
};

/** Parte una sola volta quando il riquadro si vede; poi si ripete solo al passaggio del cursore sulla card. `build` restituisce come riportare tutto all'inizio. */
function useLoop(ref: React.RefObject<HTMLElement | null>, build: (tl: gsap.core.Timeline, q: Q) => () => void, _hold = 0) {
  useGSAP(
    () => {
      const el = ref.current;
      if (prefersReducedMotion() || !el) return;
      const q = gsap.utils.selector(el) as Q;
      const tl = gsap.timeline({ paused: true });
      const reset = build(tl, q);
      reset();
      let seen = false;
      ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => void ((seen = true), tl.play()) });
      const host = el.closest("article") ?? el;
      const again = () => {
        if (!seen || tl.progress() < 1) return;
        reset();
        tl.restart();
      };
      host.addEventListener("pointerenter", again);
      return () => host.removeEventListener("pointerenter", again);
    },
    { scope: ref },
  );
}

/** Marchio vettoriale (Simple Icons) nel suo colore, o nel colore del testo per i marchi neri. */
function Brand({ k, size = 28, className = "" }: { k: BrandKey; size?: number; className?: string }) {
  const b = BRANDS[k];
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={b.name} className={className} fill={b.hex || "currentColor"}>
      <path d={b.path} />
    </svg>
  );
}

/** Tessera di vetro liquido con un marchio dentro. */
function BrandTile({ k, size = 58, solid = false, ...rest }: { k: BrandKey; size?: number; solid?: boolean; [k: string]: unknown }) {
  return (
    <Bead radius={size * 0.32} tint={solid ? "var(--bg-surface)" : undefined} className="flex items-center justify-center text-ink" style={{ width: size, height: size }} {...rest}>
      <Brand k={k} size={size * 0.5} />
    </Bead>
  );
}

/** Icona di app in vetro colorato. */
function GlassIcon({ Icon, c, size = 36, ...rest }: { Icon: LucideIcon; c: string; size?: number; [k: string]: unknown }) {
  return (
    <Bead radius={size * 0.3} tint={tint(c, 78)} className="flex shrink-0 items-center justify-center text-white" style={{ width: size, height: size }} {...rest}>
      <Icon size={size * 0.5} strokeWidth={2.1} aria-hidden style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,.25))" }} />
    </Bead>
  );
}

/** I tre pallini di una finestra di macOS. */
const Traffic = () => (
  <span className="flex shrink-0 gap-[6px]">
    {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
      <span key={c} className="h-[10px] w-[10px] rounded-full" style={{ background: c, boxShadow: "inset 0 0 0 .5px rgba(0,0,0,.18)" }} />
    ))}
  </span>
);

/* ───────────── 1 · Velocità: una pellicola in 3D ───────────── */

function Frame({ stage, t }: { stage: number; t: string }) {
  return (
    <div data-fr className="flex shrink-0 flex-col items-center gap-2" style={{ transformStyle: "preserve-3d" }}>
      <span className="block h-[124px] w-[92px] rounded-[7px] bg-[var(--bg-surface)] p-1.5" style={{ boxShadow: "inset 0 0 0 1px var(--hair-strong)" }}>
        {stage >= 1 && (
          <span className="mb-1.5 flex h-2 items-center justify-between">
            <span className="h-1 w-5 rounded-full bg-[var(--hair-strong)]" />
            <span className="h-1 w-7 rounded-full bg-[var(--hair-strong)]" />
          </span>
        )}
        {stage >= 2 && <span className="block h-[46px] rounded-[5px]" style={{ background: "linear-gradient(140deg,#8fd8ff,#2f6fe0)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.55)" }} />}
        {stage >= 3 && (
          <span className="mt-1.5 grid gap-1">
            <span className="h-1.5 w-[80%] rounded-full bg-[var(--hair-strong)]" />
            <span className="h-1.5 w-[55%] rounded-full bg-[var(--hair-strong)]" />
          </span>
        )}
        {stage >= 4 && <span className="mt-2 block h-[14px] w-[46px] rounded-full" style={{ background: blue }} />}
      </span>
      <span data-ft className="font-mono text-[11px] tabular-nums text-white/70">
        {t}
      </span>
    </div>
  );
}

function SpeedMock({ m, f }: { m: M; f: (n: number) => string }) {
  const ref = useRef<HTMLDivElement>(null);
  const times = [0, 0.2, 0.4, 0.6, 0.8];
  useLoop(ref, (tl, q) => {
    const fr = q("[data-fr]");
    const ft = q("[data-ft]");
    const cnt = q("[data-cnt]")[0];
    const strip = q("[data-strip]")[0];
    gsap.set(strip, { rotationX: 14, rotationY: -26, rotationZ: 3, transformPerspective: 1100 });
    tl.fromTo(strip, { x: 70, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out" }, 0);
    tl.to(strip, { x: -46, duration: 5.2, ease: "none" }, 0.9);
    fr.forEach((el, i) => {
      const at = 0.9 + i * 0.8;
      tl.to(el, { z: 46, y: -8, opacity: 1, duration: 0.45, ease: "expo.out" }, at).to(el, { z: 0, y: 0, opacity: 0.55, duration: 0.7, ease: "power2.inOut" }, at + 0.7);
      tl.call(() => void (cnt.textContent = f(times[i])), undefined, at);
      tl.to(ft[i], { color: "#8fd8ff", duration: 0.3 }, at);
    });
    tl.fromTo(q("[data-ok]"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(3)" }, 0.9 + 4 * 0.8 + 0.2);
    return () => {
      gsap.set(fr, { opacity: 0.55, z: 0, y: 0 });
      gsap.set(ft, { color: "rgba(255,255,255,.7)" });
      gsap.set(q("[data-ok]"), { autoAlpha: 0 });
      cnt.textContent = f(0);
    };
  }, 1.2);
  return (
    <div ref={ref} className="flex h-full items-center gap-3 sm:gap-6">
      <span className="relative z-10 shrink-0 leading-none">
        <span data-cnt className="block bg-clip-text text-[clamp(44px,5.2vw,66px)] font-semibold tabular-nums tracking-[-0.05em] text-transparent" style={{ backgroundImage: blue }}>
          {f(0)}
        </span>
        <span className="mt-2 flex items-center gap-2 text-[13px] text-ink-2">
          <span data-ok className="inline-flex" style={{ opacity: 0 }}>
            {dot()}
          </span>
          {m.yours}
        </span>
      </span>
      <div className="relative h-full min-w-0 flex-1 overflow-hidden [perspective:1100px] [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_88%,transparent)]">
        <div className="absolute inset-y-0 left-0 flex items-center">
          <div data-strip className="relative origin-left scale-[.7] rounded-[12px] px-5 py-6 sm:scale-[.82] lg:scale-[.88]" style={{ transformStyle: "preserve-3d", background: "linear-gradient(180deg,#14171c,#0b0d11)", boxShadow: "0 30px 50px -24px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.1)" }}>
            {[0, 1].map((r) => (
              <span key={r} aria-hidden className={`absolute inset-x-3 h-[6px] ${r ? "bottom-2" : "top-2"}`} style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,.5) 0 7px, transparent 7px 15px)", borderRadius: 2 }} />
            ))}
            <div className="flex gap-4" style={{ transformStyle: "preserve-3d" }}>
              {times.map((t, i) => (
                <Frame key={t} stage={i} t={f(t)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── 2 · Ogni schermo: Mac, iPad, iPhone in proporzione ───────────── */

function Wire({ cols = 2, tall = false }: { cols?: number; tall?: boolean }) {
  return (
    <span data-wire className="flex h-full flex-col gap-1.5">
      <span className={`block rounded-[6px] ${tall ? "flex-[1.2]" : "flex-1"}`} style={{ background: "linear-gradient(140deg,#8fd8ff,#2f6fe0)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.55)" }} />
      <span className={`grid gap-1.5 ${cols === 1 ? "grid-cols-1" : cols === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {Array.from({ length: cols === 1 ? 2 : cols }).map((_, i) => (
          <span key={i} className="h-2 rounded-[3px] bg-[var(--hair-strong)]" />
        ))}
      </span>
    </span>
  );
}

function ScreensMock() {
  const ref = useRef<HTMLDivElement>(null);
  useLoop(ref, (tl, q) => {
    const dv = q("[data-dv]");
    const wr = q("[data-wire]");
    tl.fromTo(dv, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.16, ease: "expo.out" }, 0.1);
    tl.fromTo(wr, { scale: 0.92, autoAlpha: 0.3 }, { scale: 1, autoAlpha: 1, duration: 0.6, stagger: 0.12, ease: "power2.out" }, 0.5);
    dv.forEach((el, i) => tl.to(el, { y: -7, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 1 }, 1.6 + i * 0.35));
    tl.to(dv, { y: 24, autoAlpha: 0, duration: 0.5, stagger: 0.06, ease: "power2.in" }, 4.4);
    return () => void gsap.set(dv, { autoAlpha: 0 });
  }, 0.5);
  const gloss = <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: "linear-gradient(125deg,rgba(255,255,255,.22),transparent 38%)" }} />;
  const bezel = "relative bg-[#15171b] shadow-[0_22px_36px_-18px_rgba(0,0,0,.55),inset_0_0_0_1px_rgba(255,255,255,.16)]";
  return (
    <div ref={ref} className="h-full [container-type:inline-size]">
      <div className="flex h-full items-end justify-center">
        {/* Mac 16:10 con la base */}
        <div data-dv className="relative z-[1] flex shrink-0 flex-col items-center">
          <div className={`${bezel} aspect-[16/10] w-[56cqw] rounded-[1.6cqw] p-[0.9cqw]`}>
            <div className="h-full rounded-[0.9cqw] bg-[var(--bg-surface)] p-[1.4cqw]">
              <Wire cols={3} />
            </div>
            {gloss}
          </div>
          <span className="block h-[1.5cqw] w-[62cqw] rounded-b-[1.2cqw]" style={{ background: "linear-gradient(180deg,#c9ced6,#9aa0aa)", boxShadow: "0 8px 14px -8px rgba(0,0,0,.5)" }} />
        </div>
        {/* iPad 3:4 */}
        <div data-dv className={`${bezel} relative z-[2] -ml-[9cqw] mb-[1.5cqw] aspect-[3/4] w-[30cqw] shrink-0 rounded-[2.4cqw] p-[1cqw]`}>
          <div className="h-full rounded-[1.5cqw] bg-[var(--bg-surface)] p-[1.6cqw]">
            <Wire cols={2} tall />
          </div>
          {gloss}
        </div>
        {/* iPhone 9:19,5 */}
        <div data-dv className={`${bezel} relative z-[3] -ml-[6cqw] mb-[1.5cqw] aspect-[9/19.5] w-[19cqw] shrink-0 rounded-[3cqw] p-[0.9cqw]`}>
          <span aria-hidden className="absolute left-1/2 top-[1.5cqw] z-10 h-[1.2cqw] w-[5cqw] -translate-x-1/2 rounded-full bg-[#15171b]" />
          <div className="h-full rounded-[2.2cqw] bg-[var(--bg-surface)] px-[1.2cqw] pb-[1.2cqw] pt-[3.6cqw]">
            <Wire cols={1} tall />
          </div>
          {gloss}
        </div>
      </div>
    </div>
  );
}

/* ───────────── 3 · Lo modifichi tu: pannelli dei CMS ───────────── */

const CMS: { k: BrandKey; c: string }[] = [
  { k: "wordpress", c: "#2271b1" },
  { k: "woocommerce", c: "#7f54b3" },
  { k: "prestashop", c: "#df0067" },
  { k: "shopify", c: "#008060" },
];

function EditMock({ m }: { m: M }) {
  const ref = useRef<HTMLDivElement>(null);
  useLoop(ref, (tl, q) => {
    const chips = q("[data-cms]");
    const hl = q("[data-hl]");
    const acs = q("[data-ac]");
    const txt = q("[data-txt]")[0];
    const sel = q("[data-sel]")[0];
    const btn = q("[data-btn]")[0];
    const toast = q("[data-toast]")[0];
    const field = q("[data-field]")[0];
    CMS.forEach(({ c }, j) => {
      const b = j * 4.4;
      tl.to(chips, { opacity: 0.45, y: 0, duration: 0.3 }, b)
        .to(chips[j], { opacity: 1, y: -3, duration: 0.5, ease: "back.out(2.4)" }, b)
        .to(hl, { autoAlpha: 0, duration: 0.25 }, b)
        .to(hl[j], { autoAlpha: 1, duration: 0.35 }, b + 0.1)
        .to(acs, { backgroundColor: c, duration: 0.45 }, b)
        .call(() => void (txt.textContent = m.before), undefined, b + 0.05)
        .to(field, { boxShadow: `inset 0 0 0 1.5px ${c}, 0 0 0 4px ${tint(c, 28)}`, duration: 0.3 }, b + 0.4)
        .fromTo(sel, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.45, ease: "power3.inOut" }, b + 0.6)
        .to(sel, { autoAlpha: 0, duration: 0.15 }, b + 1.1);
      retype(tl, txt, m.before, m.typed, b + 1.1, 0.3, 1.1);
      tl.to(btn, { scale: 0.93, duration: 0.12 }, b + 2.75)
        .to(btn, { scale: 1, duration: 0.45, ease: "back.out(3)" }, b + 2.87)
        .to(field, { boxShadow: "inset 0 0 0 1px var(--hair-strong), 0 0 0 0 rgba(0,0,0,0)", duration: 0.3 }, b + 2.9)
        .fromTo(toast, { autoAlpha: 0, y: -10, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(2)" }, b + 3)
        .to(toast, { autoAlpha: 0, y: -6, duration: 0.3 }, b + 4.1);
    });
    return () => {
      txt.textContent = m.before;
      gsap.set(chips, { opacity: 0.45, y: 0 });
      gsap.set(chips[0], { opacity: 1, y: -3 });
      gsap.set(hl, { autoAlpha: 0 });
      gsap.set(hl[0], { autoAlpha: 1 });
      gsap.set(acs, { backgroundColor: CMS[0].c });
      gsap.set(sel, { autoAlpha: 0 });
      gsap.set(toast, { autoAlpha: 0 });
    };
  }, 0.4);
  return (
    <div ref={ref} className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-center gap-2.5">
        {CMS.map(({ k }) => (
          <BrandTile key={k} k={k} size={44} data-cms="" />
        ))}
      </div>
      <div className={`relative flex min-h-0 flex-1 overflow-hidden rounded-[14px] ${surface}`}>
        <span className="flex w-[44px] shrink-0 flex-col items-center gap-2.5 bg-[#1d2327] py-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`h-[5px] rounded-full ${i === 1 ? "w-5 bg-white/80" : "w-4 bg-white/30"}`} />
          ))}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <div data-ac className="relative flex h-8 shrink-0 items-center px-3 text-white" style={{ background: CMS[0].c }}>
            {CMS.map(({ k }, i) => (
              <span key={k} data-hl className="absolute left-3 flex items-center gap-2 text-[12px] font-medium" style={{ opacity: i ? 0 : 1 }}>
                <svg viewBox="0 0 24 24" width={15} height={15} fill="#fff">
                  <path d={BRANDS[k].path} />
                </svg>
                {BRANDS[k].name}
              </span>
            ))}
            <span ref={undefined} data-toast className="absolute right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-[3px] text-[11.5px] font-medium text-[#1d2327]" style={{ opacity: 0 }}>
              {dot()}
              {m.saved}
            </span>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-2 px-4">
            <p className="text-[12px] text-ink-3">{m.field}</p>
            <span data-field className="relative flex h-9 items-center overflow-hidden rounded-[7px] bg-[var(--bg-surface)] px-3 text-[14px] text-ink" style={{ boxShadow: "inset 0 0 0 1px var(--hair-strong)" }}>
              <span data-sel aria-hidden className="absolute inset-y-1 left-2 right-2 origin-left rounded-[4px]" style={{ background: "color-mix(in srgb,#3b8cff 30%, transparent)", opacity: 0 }} />
              <span data-txt className="relative truncate">
                {m.before}
              </span>
            </span>
            <span data-btn data-ac className="mt-1 inline-flex h-8 w-fit items-center rounded-[7px] px-4 text-[13px] font-medium text-white" style={{ background: CMS[0].c }}>
              {m.save}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── 4 · Richieste: il telefono riceve le notifiche ───────────── */

function LeadsMock({ m }: { m: M }) {
  const ref = useRef<HTMLDivElement>(null);
  const rows: [LucideIcon, string, string, string][] = [
    [Inbox, "#2f7bff", "Giulia R.", m.request],
    [CalendarDays, "#ff5a4a", "Marco B.", m.booking],
    [MessageCircle, "#2fc15a", "Elena T.", m.message],
  ];
  const H = 58;
  useLoop(ref, (tl, q) => {
    const it = q("[data-nt]");
    const ph = q("[data-phone]")[0];
    it.forEach((el, k) => {
      const at = 0.6 + k * 1.1;
      for (let j = 0; j < k; j++) tl.to(it[j], { y: (k - j) * H, duration: 0.6, ease: "expo.out" }, at);
      tl.fromTo(el, { y: -H, autoAlpha: 0, scale: 0.92 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.7, ease: "back.out(1.5)" }, at)
        .fromTo(ph, { x: 0 }, { x: 2.5, duration: 0.05, yoyo: true, repeat: 5, ease: "none" }, at)
        .to(ph, { x: 0, duration: 0.05 }, at + 0.35);
    });
    return () => void gsap.set(it, { autoAlpha: 0, y: -H });
  }, 0.5);
  return (
    <div ref={ref} className="relative h-full overflow-hidden">
      <div data-phone className="absolute left-1/2 top-1 aspect-[9/19.5] w-[min(236px,66%)] -translate-x-1/2 rounded-[36px] bg-[#101216] p-[6px]" style={{ boxShadow: "0 30px 50px -26px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.18)" }}>
        <div className="relative h-full overflow-hidden rounded-[30px]" style={{ background: "radial-gradient(120% 70% at 20% 0%,#8fd8ff,transparent 60%), linear-gradient(170deg,#3b8cff,#1b3f9c 70%,#0e1f4d)" }}>
          <span aria-hidden className="absolute left-1/2 top-2 z-10 h-[18px] w-[58px] -translate-x-1/2 rounded-full bg-[#101216]" />
          <div className="flex justify-center pt-8">
            <Bead radius={26} tint="rgba(255,255,255,.2)" className="px-5 py-1.5 text-[44px] font-extrabold leading-none tracking-[-0.03em] text-white">
              9:41
            </Bead>
          </div>
          <div className="absolute inset-x-2 top-[104px]">
            {rows.map(([Icon, c, name, what]) => (
              <Bead key={name} data-nt className="absolute inset-x-0 top-0 flex items-center gap-2.5 px-2.5 text-[#14171c]" radius={20} tint="#f3f5f9" style={{ height: H - 6, opacity: 0 }}>
                <GlassIcon Icon={Icon} c={c} size={32} />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-[12.5px] font-semibold">{name}</span>
                  <span className="block truncate text-[12px] text-[#5b6370]">{what}</span>
                </span>
                <span className="self-start pt-2.5 text-[10.5px] text-[#7a8190]">{m.now}</span>
              </Bead>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── 5 · Ti trovano: indicizzato ovunque ───────────── */

const ENGINES: { k: BrandKey; x: number; y: number }[] = [
  { k: "google", x: 12, y: 24 },
  { k: "gemini", x: 50, y: 12 },
  { k: "anthropic", x: 88, y: 24 },
  { k: "openai", x: 12, y: 78 },
  { k: "perplexity", x: 50, y: 90 },
  { k: "duckduckgo", x: 88, y: 78 },
];

function FoundMock({ m }: { m: M }) {
  const ref = useRef<HTMLDivElement>(null);
  useLoop(ref, (tl, q) => {
    const el = ref.current!;
    const tiles = q("[data-ei]");
    const ln = q("[data-ln]");
    const ck = q("[data-ck]");
    const hub = q("[data-hub]")[0];
    const rp = q("[data-rp]")[0];
    const W = () => el.clientWidth;
    const Hh = () => el.clientHeight;
    tl.fromTo(hub, { scale: 0.8, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "expo.out" }, 0);
    ENGINES.forEach(({ x, y }, i) => {
      tl.fromTo(tiles[i], { x: ((50 - x) * W()) / 100, y: ((50 - y) * Hh()) / 100, scale: 0.4, autoAlpha: 0 }, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 0.6, ease: "expo.out" }, 0.15 + i * 0.06);
    });
    tl.fromTo(ln, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power1.out" }, 0.45);
    tl.fromTo(rp, { scale: 0.4, autoAlpha: 0.55 }, { scale: 4, autoAlpha: 0, duration: 0.9, ease: "power2.out" }, 0.5);
    tl.fromTo(ck, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, stagger: 0.06, ease: "back.out(3)" }, 0.85);
    return () => void gsap.set([tiles, hub, ck, ln, rp], { autoAlpha: 0 });
  });
  return (
    <div ref={ref} className="relative h-full">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {ENGINES.map(({ k, x, y }) => (
          <line key={k} data-ln x1={50} y1={50} x2={x} y2={y} stroke="color-mix(in srgb,#5ec4ff 50%, transparent)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" style={{ opacity: 0 }} />
        ))}
      </svg>
      <span data-rp aria-hidden className="absolute left-1/2 top-1/2 h-[52px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ boxShadow: "inset 0 0 0 1.5px #5ec4ff", opacity: 0 }} />
      <Bead data-hub tint="color-mix(in srgb,#5ec4ff 36%, var(--bg-surface))" radius={24} className="absolute left-1/2 top-1/2 z-10 flex h-[52px] -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 whitespace-nowrap px-5 text-[15px] font-medium text-ink" style={{ opacity: 0 }}>
        <Globe size={17} strokeWidth={2} aria-hidden />
        {m.address}
      </Bead>
      {ENGINES.map(({ k, x, y }) => (
        <span key={k} className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
          <span data-ei className="relative block" style={{ opacity: 0 }}>
            <BrandTile k={k} size={60} solid />
            <span data-ck className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#2fb36a] text-white" style={{ boxShadow: "0 0 0 2px var(--bg-surface)", opacity: 0 }}>
              <Check size={11} strokeWidth={3.2} aria-hidden />
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}

/* ───────────── 6 · Sicuro: Cloudflare, SSL, copie ───────────── */

function SafeMock({ m }: { m: M }) {
  const ref = useRef<HTMLDivElement>(null);
  useLoop(ref, (tl, q) => {
    const nodes = q("[data-node]");
    const pk = q("[data-pk]")[0];
    const cf = q("[data-cf]")[0];
    const lk = q("[data-lk]")[0];
    tl.fromTo(nodes, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.07, ease: "expo.out" }, 0);
    tl.fromTo(pk, { left: "16%", autoAlpha: 0 }, { left: "50%", autoAlpha: 1, duration: 0.5, ease: "power2.in" }, 0.45)
      .fromTo(cf, { scale: 1 }, { scale: 1.07, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out" }, 0.95)
      .to(pk, { left: "84%", duration: 0.5, ease: "power2.out" }, 1.0)
      .to(pk, { autoAlpha: 0, duration: 0.12 }, 1.5)
      .fromTo(lk, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "back.out(3)" }, 1.45);
    return () => void gsap.set([pk, lk], { autoAlpha: 0 });
  });
  return (
    <div ref={ref} className="relative flex h-full items-center">
      <span aria-hidden className="absolute left-[16%] right-[16%] top-1/2 h-px -translate-y-[10px] bg-[repeating-linear-gradient(90deg,var(--hair-strong)_0_6px,transparent_6px_12px)]" />
      <div data-node className="absolute left-[16%] top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
        <Bead radius={20} tint="var(--bg-surface)" className="flex h-[56px] w-[56px] items-center justify-center text-ink">
          <Globe size={24} strokeWidth={1.8} aria-hidden />
        </Bead>
        <span className="text-[12px] text-ink-3">{m.visitor}</span>
      </div>
      <div data-node data-cf className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <BrandTile k="cloudflare" size={84} solid />
      </div>
      <div data-node className="absolute left-[84%] top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
        <span className="relative">
          <GlassIcon Icon={Lock} c="#2f7bff" size={56} />
          <span data-lk className="absolute -right-1 -top-1 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#2fb36a] text-white" style={{ boxShadow: "0 0 0 2px var(--bg-surface)", opacity: 0 }}>
            <Check size={12} strokeWidth={3.2} aria-hidden />
          </span>
        </span>
        <span className="text-[12px] text-ink-3">{m.address}</span>
      </div>
      <span data-pk className="absolute top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-[15px] rounded-full" style={{ background: "#2fb36a", boxShadow: "0 0 0 4px rgba(47,179,106,.25)", opacity: 0 }} />
    </div>
  );
}

/* ───────────── 7 · Area clienti: la dashboard di Mario Rossi ───────────── */

function DashMock({ m, locale }: { m: M; locale: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const days = m.days.split("");
  const bars = [0.42, 0.66, 0.5, 0.86, 0.72, 0.4, 0.58];
  const seg: [number, string][] = [[52, "#3b8cff"], [30, "#7ab8ff"], [18, "#bcd9ff"]];
  const feed: [LucideIcon, string, string, string][] = [
    [ShoppingBag, "#2f7bff", m.n1, m.n1s],
    [MessageCircle, "#2fc15a", m.n2, m.n2s],
    [Truck, "#ff9f0a", m.n3, m.n3s],
  ];
  const nf = (n: number) => Math.round(n).toLocaleString(locale === "en" ? "en-US" : "it-IT");
  const H = 54;
  useLoop(ref, (tl, q) => {
    const wl = q("[data-wl]");
    const nums = q("[data-num]");
    const to = [128, 24, 3482];
    const arcs = q("[data-arc]");
    const line = q("[data-line]")[0];
    const area = q("[data-area]")[0];
    const brs = q("[data-bar]");
    const nt = q("[data-nt]");
    const bd = q("[data-bd]")[0];
    tl.fromTo(wl, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.1, ease: "expo.out" }, 0);
    nums.forEach((el, i) => count(tl, el, 0, to[i], 1.3, 0.3 + i * 0.12, nf, "expo.out"));
    arcs.forEach((a, i) => tl.fromTo(a, { attr: { "stroke-dasharray": "0 100" } }, { attr: { "stroke-dasharray": `${seg[i][0] - 2} ${102 - seg[i][0]}` }, duration: 0.9, ease: "power2.out" }, 0.5 + i * 0.3));
    tl.fromTo(line, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" }, 0.6).fromTo(area, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 1.3);
    tl.fromTo(brs, { scaleY: 0.04 }, { scaleY: 1, duration: 0.8, stagger: 0.07, ease: "expo.out" }, 0.7);
    nt.forEach((el, k) => {
      const at = 1.4 + k * 1.2;
      for (let j = 0; j < k; j++) tl.to(nt[j], { y: (k - j) * H, duration: 0.6, ease: "expo.out" }, at);
      tl.fromTo(el, { y: -H, autoAlpha: 0, scale: 0.94 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.7, ease: "back.out(1.5)" }, at).call(() => void (bd.textContent = String(k + 1)), undefined, at + 0.1).fromTo(bd, { scale: 1.5 }, { scale: 1, duration: 0.4, ease: "back.out(3)" }, at + 0.1);
    });
    return () => {
      gsap.set([wl, nt], { autoAlpha: 0 });
      gsap.set(nt, { y: -H });
      gsap.set(arcs, { attr: { "stroke-dasharray": "0 100" } });
      gsap.set(brs, { scaleY: 0.04, autoAlpha: 1 });
      gsap.set(q("[data-fade]"), { autoAlpha: 1 });
      nums.forEach((n) => (n.textContent = "0"));
      bd.textContent = "0";
    };
  }, 0.5);
  const nav: LucideIcon[] = [LayoutDashboard, ShoppingBag, MessageCircle, Users, Settings];
  const kp: [string, string][] = [[m.kOrders, "+12%"], [m.kMessages, "+3"], [m.kVisits, "+8%"]];
  const title = "mb-3 text-[13px] font-semibold text-ink";
  let acc = 0;
  return (
    <div ref={ref} className="flex w-full overflow-hidden" style={{ boxShadow: "inset 0 -1px 0 var(--hair-strong)" }}>
      <aside className="hidden w-[60px] shrink-0 flex-col items-center gap-3 py-4 md:flex" style={{ boxShadow: "inset -1px 0 0 var(--hair-strong)" }}>
        <Traffic />
        <span className="mt-2 flex flex-col gap-2">
          {nav.map((Icon, i) => (
            <Bead key={i} radius={13} tint={i === 0 ? "sky" : "transparent"} className={`flex h-9 w-9 items-center justify-center ${i === 0 ? "text-ink" : "text-ink-3"}`}>
              <Icon size={17} strokeWidth={1.9} aria-hidden />
            </Bead>
          ))}
        </span>
      </aside>
      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p data-wl className="text-[clamp(19px,2vw,26px)] font-semibold leading-tight tracking-[-0.03em] text-ink">
              {m.welcome}
            </p>
            <p data-wl className="mt-0.5 text-[13.5px] text-ink-3">
              {m.welcomeSub}
            </p>
          </div>
          <div data-fade className="flex items-center gap-2.5">
            <span className="relative">
              <Bead radius={15} className="flex h-9 w-9 items-center justify-center text-ink">
                <Bell size={17} strokeWidth={1.9} aria-hidden />
              </Bead>
              <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#ff453a] px-1 text-[10.5px] font-semibold text-white" style={{ boxShadow: "0 0 0 2px var(--bg-surface)" }}>
                <span data-bd>0</span>
              </span>
            </span>
            <Bead radius={18} tint="sky" className="flex h-9 w-9 items-center justify-center text-[12.5px] font-semibold text-ink">
              MR
            </Bead>
          </div>
        </header>
        {/* griglia a quattro colonne: ogni riga ha la stessa altezza */}
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
          {kp.map(([l, d], i) => (
            <div key={l} data-fade className="min-h-[84px]">
              <p className="text-[12.5px] text-ink-3">{l}</p>
              <p data-num className="mt-1 text-[clamp(24px,2.6vw,32px)] font-semibold tabular-nums leading-none tracking-[-0.04em] text-ink">
                0
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-ink-2">
                {dot()}
                {d}
              </p>
            </div>
          ))}
          <div data-fade className="col-span-2 min-h-[84px] lg:col-span-1">
            <div className="flex h-[56px] items-end gap-1.5">
              {bars.map((h, i) => (
                <span key={i} data-bar className="block flex-1 origin-bottom rounded-[4px]" style={{ height: `${h * 100}%`, background: i === 3 ? blue : "color-mix(in srgb,#3b8cff 26%, transparent)" }} />
              ))}
            </div>
            <div className="mt-1 flex gap-1.5 text-[10.5px] text-ink-3">
              {days.map((d, i) => (
                <span key={i} className="flex-1 text-center">
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div data-fade className="col-span-2 lg:col-span-1">
            <p className={title}>{m.chDonut}</p>
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 100 100" className="h-[96px] w-[96px] shrink-0 -rotate-90" aria-hidden>
                <circle cx="50" cy="50" r="36" fill="none" stroke="var(--hover)" strokeWidth="14" />
                {seg.map(([v, c], i) => {
                  const start = acc;
                  acc += v;
                  return <circle key={i} data-arc cx="50" cy="50" r="36" fill="none" stroke={c} strokeWidth="14" pathLength={100} strokeDasharray="0 100" strokeDashoffset={-start - 1} />;
                })}
              </svg>
              <ul className="grid gap-1.5 text-[12.5px] text-ink-2">
                {[m.d1, m.d2, m.d3].map((l, i) => (
                  <li key={l} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: seg[i][1] }} />
                    {l}
                    <span className="ml-auto font-mono text-[11.5px] tabular-nums text-ink-3">{seg[i][0]}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div data-fade className="col-span-2">
            <p className={title}>{m.chLine}</p>
            <svg viewBox="0 0 200 84" className="h-[96px] w-full" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="dsh-a" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#3b8cff" stopOpacity=".35" />
                  <stop offset="1" stopColor="#3b8cff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path data-area d="M0 66 C20 58 30 40 50 44 S80 66 100 46 S140 14 160 28 S190 20 200 10 V84 H0 Z" fill="url(#dsh-a)" />
              <path data-line d="M0 66 C20 58 30 40 50 44 S80 66 100 46 S140 14 160 28 S190 20 200 10" fill="none" stroke="#2f6fe0" strokeWidth="2.5" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <p data-fade className={title}>
              {m.activity}
            </p>
            <div className="relative h-[162px]">
              {feed.map(([Icon, c, t, s]) => (
                <Bead key={t} data-nt radius={16} className="absolute inset-x-0 top-0 flex items-center gap-2.5 px-2.5 text-ink" style={{ height: H - 6, opacity: 0 }}>
                  <GlassIcon Icon={Icon} c={c} size={30} />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-[12.5px] font-semibold">{t}</span>
                    <span className="block truncate text-[11.5px] text-ink-2">{s}</span>
                  </span>
                </Bead>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Sezioni ───────────── */

function Cell({ span, title, body, mock, h = "h-[230px]", bleed = false }: { span: string; title: string; body: string; mock: ReactNode; h?: string; bleed?: boolean }) {
  return (
    <Bead as="article" data-rv radius={36} className={`group relative flex flex-col overflow-hidden p-5 sm:p-7 ${span}`}>
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(60%_70%_at_50%_30%,color-mix(in_srgb,#5ec4ff_20%,transparent),transparent)]" />
      <div className={bleed ? "relative -mx-5 -mt-5 mb-6 sm:-mx-7 sm:-mt-7" : `relative mb-6 transition-transform duration-[600ms] ease-[var(--ease-out)] group-hover:-translate-y-1.5 ${h}`}>{mock}</div>
      <h3 className="text-[clamp(21px,2vw,28px)] font-medium leading-[1.1] tracking-[-0.035em] text-ink">{title}</h3>
      <p className="mt-2.5 max-w-[46ch] text-[15.5px] leading-[1.55] text-ink-2">{body}</p>
    </Bead>
  );
}

/** Mette in evidenza le ultime due parole di un titolo. */
const emph = (t: string) => {
  const w = t.replace(/[.!?]+$/, "").split(" ");
  const tail = t.match(/[.!?]+$/)?.[0] ?? "";
  return w.length > 2 ? `${w.slice(0, -2).join(" ")} *${w.slice(-2).join(" ")}*${tail}` : `*${t}*`;
};

const FACT_ICONS = [Zap, UserRound, KeyRound];
const STEP_ICONS = [PhoneCall, LayoutTemplate, RefreshCw, Rocket];
const PROMISE_ICONS = [FileText, UserRound, KeyRound, LockOpen];

export function WebPage({ locale, copy, tale, proof, github, ctaLabel, ctaLead }: { locale: string; copy: WebCopy; tale: ServiceStory; proof: Proof[]; github?: string; ctaLabel: string; ctaLead: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(0);
  const fs = (n: number) => n.toFixed(1).replace(".", locale === "en" ? "." : ",") + " s";
  const fr = (n: number) => n.toFixed(1).replace(".", locale === "en" ? "." : ",");
  const c = copy;
  const m = c.bento.mock;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.set("[data-rv]", { autoAlpha: 0, y: 36 });
      ScrollTrigger.batch("[data-rv]", { start: "top 102%", once: true, onEnter: (els) => void gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "expo.out", overwrite: true }) });
      // le tessere 3D stanno ferme, leggermente ruotate
      gsap.set("[data-tile]", { rotationY: -16, rotationX: 7 });
      // la linea dei passi si riempie
      gsap.fromTo("[data-sfill]", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: "[data-steps]", start: "top 75%", end: "bottom 60%", scrub: 0.6 } });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="pb-8">
      {/* offerta */}
      <section className={`${container} pt-24 sm:pt-36`}>
        <div className="grid items-center gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div>
            <h2 data-rv className="max-w-[16ch] text-[clamp(40px,6vw,92px)] font-medium leading-[1.02] tracking-[-0.05em] text-ink">
              <Script text={c.offer.title} />
            </h2>
            <p data-rv className="mt-7 max-w-[52ch] text-[clamp(17px,1.5vw,20px)] leading-[1.6] text-ink-2">
              {c.offer.lead}
            </p>
            <div data-rv className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Drop href="#brief-web" accent className="h-[54px] px-7 text-[16px] font-medium text-ink">
                {c.offer.cta}
                <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
              </Drop>
              <a href="#proof" className="group inline-flex h-[54px] items-center gap-2 text-[16px] font-medium text-ink-2 transition-colors hover:text-ink">
                {c.offer.more}
                <ArrowRight size={17} strokeWidth={1.8} className="rotate-90 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden />
              </a>
            </div>
          </div>
          <ul className="grid gap-4">
            {c.offer.facts.map(([v, l], i) => (
              <Bead as="li" key={v} data-rv radius={32} className="flex items-center gap-5 p-4 pr-6 sm:p-5 sm:pr-8">
                <Tile3D Icon={FACT_ICONS[i]} size={28} className="block h-[64px] w-[64px] shrink-0" />
                <span className="leading-tight">
                  <span className="block text-[clamp(24px,2.4vw,32px)] font-medium tracking-[-0.04em] text-ink">{v}</span>
                  <span className="mt-1 block text-[14.5px] leading-[1.45] text-ink-2">{l}</span>
                </span>
              </Bead>
            ))}
          </ul>
        </div>
      </section>

      {/* bento */}
      <section id="include" className={`${container} scroll-mt-10 pt-8 sm:pt-6`}>
        <header className="mb-6 sm:mb-7">
          <h2 data-rv className={h2}>
            <Script text={c.bento.title} />
          </h2>
        </header>
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-12">
          <Cell span="lg:col-span-7" title={c.bento.cells.speed[0]} body={c.bento.cells.speed[1]} mock={<SpeedMock m={m} f={fs} />} h="h-[300px]" />
          <Cell span="lg:col-span-5" title={c.bento.cells.screens[0]} body={c.bento.cells.screens[1]} mock={<ScreensMock />} h="h-[300px]" />
          <Cell span="lg:col-span-7" title={c.bento.cells.edit[0]} body={c.bento.cells.edit[1]} mock={<EditMock m={m} />} h="h-[290px]" />
          <Cell span="lg:col-span-5" title={c.bento.cells.leads[0]} body={c.bento.cells.leads[1]} mock={<LeadsMock m={m} />} h="h-[290px]" />
          <Cell span="lg:col-span-7" title={c.bento.cells.found[0]} body={c.bento.cells.found[1]} mock={<FoundMock m={m} />} h="h-[270px]" />
          <Cell span="lg:col-span-5" title={c.bento.cells.safe[0]} body={c.bento.cells.safe[1]} mock={<SafeMock m={m} />} h="h-[270px]" />
          <Cell span="lg:col-span-12" title={c.bento.cells.dash[0]} body={c.bento.cells.dash[1]} mock={<DashMock m={m} locale={locale} />} h="h-auto" bleed />
        </div>
      </section>

      {/* passi */}
      <section className={`${container} pt-28 sm:pt-44`}>
        <header className="mb-12 grid gap-5 sm:mb-16 lg:grid-cols-[1fr_auto] lg:items-end">
          <h2 data-rv className={h2}>
            <Script text={c.steps.title} />
          </h2>
          <p data-rv className="max-w-[40ch] text-[17px] leading-[1.55] text-ink-2">
            {c.steps.lead}
          </p>
        </header>
        <div data-steps className="relative">
          <span aria-hidden className="absolute left-[8%] right-[8%] top-[34px] hidden h-[3px] rounded-full bg-[var(--hover)] lg:block">
            <span data-sfill className="absolute inset-0 origin-left rounded-full" style={{ background: "linear-gradient(90deg,#5ec4ff,#2f6fe0)" }} />
          </span>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {c.steps.items.map(([t, b], i) => (
              <li key={t} data-rv className="relative flex flex-col items-start gap-5 lg:items-center lg:text-center">
                <Tile3D Icon={STEP_ICONS[i]} size={30} className="relative block h-[68px] w-[68px]" />
                <Bead as="div" radius={30} className="w-full p-5">
                  <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-2 text-[20px] font-medium leading-[1.2] tracking-[-0.03em] text-ink">{t}</h3>
                  <p className="mt-2.5 text-[15px] leading-[1.55] text-ink-2">{b}</p>
                </Bead>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* prove */}
      {proof.length > 0 && (
        <section id="proof" className={`${container} scroll-mt-10 pt-28 sm:pt-44`}>
          <h2 data-rv className={`${h2} mb-10 sm:mb-14`}>
            <Script text={c.proof.title} />
          </h2>
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            {proof.map((p) => (
              <Link key={p.slug} href={`/lavori/${p.slug}`} data-rv className="group block">
                <Bead as="div" radius={36} className="overflow-hidden">
                  <span className="relative block aspect-[16/10] overflow-hidden bg-[#05070a]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/work/${p.slug}/fibers.webp`} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.04]" />
                    <span aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(3,6,10,.72),transparent_60%)]" />
                    <span className="absolute inset-x-5 bottom-5 flex items-center gap-4">
                      <span className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[20px] bg-white/15 backdrop-blur-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.icon} alt="" className="h-10 w-10 object-contain" />
                      </span>
                      <span className="text-[clamp(30px,3.4vw,46px)] font-medium leading-none tracking-[-0.05em] text-white">{p.name}</span>
                    </span>
                  </span>
                  <span className="flex items-start justify-between gap-4 p-5 sm:p-7">
                    <span>
                      <span className="block font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">{p.context}</span>
                      <span className="mt-3 block max-w-[24ch] text-[clamp(21px,2vw,28px)] font-medium leading-[1.12] tracking-[-0.035em] text-ink">{p.headline}</span>
                    </span>
                    <ArrowUpRight size={22} strokeWidth={1.6} className="mt-1 shrink-0 text-[var(--sky)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden />
                  </span>
                </Bead>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* garanzie */}
      <section className={`${container} pt-28 sm:pt-44`}>
        <h2 data-rv className={`${h2} mb-10 sm:mb-14`}>
          <Script text={c.promise.title} />
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {tale.promise.yes.map((y, i) => (
            <Bead as="li" key={y} data-rv radius={32} className="flex items-center gap-5 p-4 pr-6 sm:p-5 sm:pr-8">
              <Tile3D Icon={PROMISE_ICONS[i % PROMISE_ICONS.length]} size={26} className="block h-[58px] w-[58px] shrink-0" />
              <span className="text-[clamp(16px,1.35vw,19px)] leading-[1.4] tracking-[-0.015em] text-ink">{y}</span>
            </Bead>
          ))}
        </ul>
        <div data-rv className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <Bead tint="dark" radius={36} className="flex h-[72px] w-[72px] shrink-0 items-center justify-center text-[22px] font-medium tracking-[-0.02em] text-white">
            FC
          </Bead>
          <div className="flex-1">
            <p className="text-[22px] font-medium tracking-[-0.03em] text-ink">{tale.promise.me}</p>
            <p className="mt-2 max-w-[62ch] text-[16.5px] leading-[1.6] text-ink-2">{tale.promise.meLead}</p>
          </div>
          {github && (
            <a href={github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[15px] font-medium text-ink-2 transition-colors hover:text-ink">
              GitHub
              <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden />
            </a>
          )}
        </div>
      </section>

      {/* domande */}
      <section className={`${container} pt-28 sm:pt-44`}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <h2 data-rv className={h2}>
            <Script text={c.faq.title} />
          </h2>
          <ul className="grid gap-3">
            {tale.faq.items.map((it, i) => {
              const on = open === i;
              return (
                <Bead as="li" key={it.q} data-rv radius={28} className="overflow-hidden">
                  <button type="button" aria-expanded={on} onClick={() => setOpen(on ? -1 : i)} className="flex w-full items-center justify-between gap-5 px-5 py-4 text-left sm:px-6 sm:py-5">
                    <span className="text-[clamp(16px,1.4vw,19px)] font-medium leading-[1.3] tracking-[-0.02em] text-ink">{it.q}</span>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--hover)] text-ink transition-transform duration-500 ease-[var(--ease-out)] ${on ? "rotate-45" : ""}`}>
                      <Plus size={17} strokeWidth={1.8} aria-hidden />
                    </span>
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out)] ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <p className="max-w-[58ch] px-5 pb-6 text-[16px] leading-[1.65] text-ink-2 sm:px-6">{it.a}</p>
                    </div>
                  </div>
                </Bead>
              );
            })}
          </ul>
        </div>
      </section>

      {/* invito */}
      <section className={`${container} pt-28 text-center sm:pt-44`}>
        <h2 data-rv className="mx-auto max-w-[16ch] text-[clamp(40px,6vw,96px)] font-medium leading-[1.02] tracking-[-0.055em] text-ink">
          <Script text={emph(tale.close.title)} />
        </h2>
        <p data-rv className="mx-auto mt-6 max-w-[42ch] text-[18px] leading-[1.55] text-ink-2">
          {tale.close.lead || ctaLead}
        </p>
        <div data-rv className="mt-9">
          <Drop href="#brief-web" accent className="h-[56px] px-7 text-[17px] font-medium text-ink">
            {ctaLabel}
            <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
          </Drop>
        </div>
      </section>
    </div>
  );
}
