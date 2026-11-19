"use client";

import { useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ArrowUpRight, KeyRound, LayoutTemplate, LockOpen, PhoneCall, Plus, RefreshCw, Rocket, ShieldCheck, Star, UserRound, Zap, FileText } from "lucide-react";
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

/** Anima un contatore dentro un elemento. */
const count = (tl: gsap.core.Timeline, el: HTMLElement | undefined, from: number, to: number, dur: number, at: number, fmt: (n: number) => string, ease = "none") => {
  const o = { n: from };
  tl.fromTo(o, { n: from }, { n: to, duration: dur, ease, onUpdate: () => void (el && (el.textContent = fmt(o.n))) }, at);
};

/** Un ciclo che parte quando il riquadro si vede e si ferma quando esce. `build` restituisce come riportare tutto all'inizio. */
function useLoop(ref: React.RefObject<HTMLElement | null>, build: (tl: gsap.core.Timeline, q: Q) => () => void, hold = 1.6) {
  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return;
      const q = gsap.utils.selector(ref.current) as Q;
      const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: hold });
      const reset = build(tl, q);
      tl.eventCallback("onRepeat", reset);
      reset();
      ScrollTrigger.create({ trigger: ref.current, start: "top 92%", end: "bottom 4%", onToggle: (s) => void (s.isActive ? tl.play() : tl.pause()) });
    },
    { scope: ref },
  );
}

const surface = "bg-[var(--bg-surface)] shadow-[inset_0_0_0_1px_var(--hair-strong),0_14px_32px_-18px_rgba(0,0,0,.28)]";
const dot = (c = "#2fb36a") => <span className="inline-block h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: c, boxShadow: `0 0 0 3px color-mix(in srgb, ${c} 25%, transparent)` }} />;

/* ───────────── Mock 1 · Velocità ───────────── */

function SpeedMock({ m, f }: { m: M; f: (n: number) => string }) {
  const ref = useRef<HTMLDivElement>(null);
  useLoop(ref, (tl, q) => {
    const [b1, b2] = [q("[data-b1]"), q("[data-b2]")];
    const [t1, t2, sc] = [q("[data-t1]")[0], q("[data-t2]")[0], q("[data-sc]")[0]];
    const ring = q("[data-ring]");
    tl.fromTo(b1, { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: "expo.out" }, 0.3);
    count(tl, t1, 0, 0.8, 0.55, 0.3, f, "expo.out");
    tl.fromTo(b2, { scaleX: 0 }, { scaleX: 1, duration: 4, ease: "power1.inOut" }, 0.3);
    count(tl, t2, 0, 6.4, 4, 0.3, f, "power1.inOut");
    tl.fromTo(ring, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: "expo.out" }, 0.45);
    count(tl, sc, 0, 100, 0.9, 0.45, (n) => String(Math.round(n)), "expo.out");
    tl.to({}, { duration: 0.6 });
    return () => {
      t1.textContent = f(0);
      t2.textContent = f(0);
      sc.textContent = "0";
    };
  });
  const row = (lbl: string, tk: string, bk: string, c: string, strong: boolean) => (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-[14px]">
        <span className={strong ? "font-medium text-ink" : "text-ink-3"}>{lbl}</span>
        <span {...{ [tk]: "" }} className={`font-mono tabular-nums ${strong ? "text-ink" : "text-ink-3"}`}>0,0 s</span>
      </div>
      <span className="block h-3 overflow-hidden rounded-full bg-[var(--hover)]">
        <span {...{ [bk]: "" }} className="block h-full origin-left rounded-full" style={{ background: c }} />
      </span>
    </div>
  );
  return (
    <div ref={ref} className="flex h-full items-center gap-6 sm:gap-10">
      <div className="grid min-w-0 flex-1 gap-5">
        <div className={`flex h-10 items-center gap-2.5 rounded-full px-4 text-[13.5px] text-ink-2 ${surface}`}>
          {dot()}
          <span className="truncate">{m.address}</span>
        </div>
        {row(m.yours, "data-t1", "data-b1", "linear-gradient(90deg,#5ec4ff,#2f6fe0)", true)}
        {row(m.slow, "data-t2", "data-b2", "color-mix(in srgb, var(--label-primary) 28%, transparent)", false)}
      </div>
      <div className="relative flex h-[116px] w-[116px] shrink-0 items-center justify-center sm:h-[136px] sm:w-[136px]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--hover)" strokeWidth="8" />
          <circle data-ring cx="50" cy="50" r="44" fill="none" stroke="url(#spd)" strokeWidth="8" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
          <defs>
            <linearGradient id="spd" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#5ec4ff" />
              <stop offset="1" stopColor="#2f6fe0" />
            </linearGradient>
          </defs>
        </svg>
        <span className="text-center leading-none">
          <span data-sc className="block text-[38px] font-medium tracking-[-0.04em] text-ink sm:text-[44px]">
            0
          </span>
          <span className="mt-1 block text-[12px] text-ink-3">{m.score}</span>
        </span>
      </div>
    </div>
  );
}

/* ───────────── Mock 2 · Ogni schermo ───────────── */

function Wire({ cols = 2, tall = false }: { cols?: number; tall?: boolean }) {
  return (
    <span className="flex h-full flex-col gap-1">
      <span className="flex h-2 items-center justify-between">
        <span className="h-1 w-4 rounded-full bg-[var(--hair-strong)]" />
        <span className="h-1 w-6 rounded-full bg-[var(--hair-strong)]" />
      </span>
      <span className={`block rounded-[6px] ${tall ? "flex-[1.2]" : "flex-1"}`} style={{ background: "linear-gradient(140deg,#8fd8ff,#2f6fe0)" }} />
      <span className={`grid gap-1 ${cols === 1 ? "grid-cols-1" : cols === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {Array.from({ length: cols === 1 ? 2 : cols }).map((_, i) => (
          <span key={i} className="h-3 rounded-[4px] bg-[var(--hover)]" />
        ))}
      </span>
    </span>
  );
}

function ScreensMock() {
  const ref = useRef<HTMLDivElement>(null);
  useLoop(ref, (tl, q) => {
    const fr = q("[data-fr]");
    tl.fromTo(fr, { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.14, ease: "expo.out" }, 0.1);
    fr.forEach((el, i) => {
      tl.to(el, { y: -10, duration: 0.35, ease: "power2.out", boxShadow: "inset 0 0 0 2px #5ec4ff, 0 20px 40px -18px rgba(47,111,224,.6)" }, 1.1 + i * 0.5).to(el, { y: 0, duration: 0.5, ease: "power2.inOut", boxShadow: "inset 0 0 0 1px var(--hair-strong), 0 14px 32px -18px rgba(0,0,0,.28)" }, 1.55 + i * 0.5);
    });
    tl.to(fr, { y: 30, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 3.4);
    return () => void gsap.set(fr, { autoAlpha: 0 });
  }, 0.3);
  const fr = `${surface} rounded-[16px] p-2`;
  return (
    <div ref={ref} className="flex h-full items-end justify-center gap-3 sm:gap-4">
      <div data-fr className={`${fr} h-[128px] w-[52%]`}>
        <Wire cols={3} />
      </div>
      <div data-fr className={`${fr} h-[158px] w-[26%]`}>
        <Wire cols={2} tall />
      </div>
      <div data-fr className={`${fr} h-[184px] w-[16%] min-w-[58px] rounded-[18px]`}>
        <Wire cols={1} tall />
      </div>
    </div>
  );
}

/* ───────────── Mock 3 · Lo modifichi tu ───────────── */

function EditMock({ m }: { m: M }) {
  const ref = useRef<HTMLDivElement>(null);
  useLoop(ref, (tl, q) => {
    const inp = q("[data-in]")[0];
    const pv = q("[data-pv]")[0];
    const btn = q("[data-btn]");
    const chip = q("[data-chip]");
    const card = q("[data-card]");
    const o = { n: 0 };
    tl.fromTo(o, { n: 0 }, { n: m.typed.length, duration: 1.5, ease: "none", onUpdate: () => void (inp.textContent = m.typed.slice(0, Math.round(o.n))) }, 0.4)
      .to(btn, { scale: 0.92, duration: 0.12 }, 2.1)
      .to(btn, { scale: 1, duration: 0.4, ease: "back.out(3)" }, 2.22)
      .call(() => void (pv.textContent = m.typed), undefined, 2.3)
      .fromTo(card, { boxShadow: "0 0 0 0 rgba(94,196,255,0)" }, { boxShadow: "0 0 0 6px rgba(94,196,255,.35)", duration: 0.3, yoyo: true, repeat: 1 }, 2.3)
      .fromTo(chip, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" }, 2.4)
      .to(chip, { autoAlpha: 0, duration: 0.3 }, 3.8);
    return () => {
      inp.textContent = "";
      pv.textContent = m.before;
      gsap.set(chip, { autoAlpha: 0 });
    };
  }, 0.3);
  return (
    <div ref={ref} className="flex h-full flex-col justify-between gap-4">
      <div data-card className={`rounded-[16px] p-4 ${surface}`}>
        <span className="mb-2 block h-1.5 w-10 rounded-full" style={{ background: "linear-gradient(90deg,#5ec4ff,#2f6fe0)" }} />
        <p className="text-[12px] text-ink-3">{m.field}</p>
        <p data-pv className="mt-0.5 min-h-[22px] text-[16px] font-medium text-ink">
          {m.before}
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <span className={`flex h-11 min-w-0 flex-1 items-center rounded-full px-4 text-[14px] text-ink ${surface}`}>
          <span data-in className="truncate" />
          <span className="ml-0.5 inline-block h-[17px] w-px animate-pulse bg-ink" />
        </span>
        <span data-btn className="flex h-11 items-center rounded-full px-5 text-[14px] font-medium text-white" style={{ background: "linear-gradient(150deg,#5ec4ff,#2f6fe0)" }}>
          {m.save}
        </span>
      </div>
      <span data-chip className="inline-flex items-center gap-2 self-start text-[13.5px] font-medium text-ink">
        {dot()}
        {m.saved}
      </span>
    </div>
  );
}

/* ───────────── Mock 4 · Richieste ───────────── */

function LeadsMock({ m }: { m: M }) {
  const ref = useRef<HTMLDivElement>(null);
  const rows: [string, string, string][] = [["GR", "Giulia R.", m.request], ["MB", "Marco B.", m.booking], ["ET", "Elena T.", m.message]];
  useLoop(ref, (tl, q) => {
    const it = q("[data-n]");
    const bd = q("[data-bd]")[0];
    it.forEach((el, i) => {
      tl.fromTo(el, { y: -2, autoAlpha: 0, scale: 0.94 }, { y: 34 + i * 58, autoAlpha: 1, scale: 1, duration: 0.7, ease: "expo.out" }, 0.3 + i * 0.7).call(() => void (bd.textContent = String(i + 1)), undefined, 0.35 + i * 0.7);
    });
    tl.to(it, { autoAlpha: 0, y: "+=14", duration: 0.4, stagger: 0.06, ease: "power2.in" }, 3.8);
    return () => {
      gsap.set(it, { autoAlpha: 0 });
      bd.textContent = "0";
    };
  }, 0.4);
  return (
    <div ref={ref} className="relative h-full">
      <span className="absolute right-0 top-0 z-10 inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[13px] font-medium text-white" style={{ background: "linear-gradient(150deg,#5ec4ff,#2f6fe0)" }}>
        <span data-bd>0</span>
      </span>
      {rows.map(([ini, name, what]) => (
        <div key={name} data-n className={`absolute inset-x-0 top-0 flex h-[54px] items-center gap-3 rounded-[16px] px-3 ${surface}`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-medium text-white" style={{ background: "linear-gradient(150deg,#8fd8ff,#2f6fe0)" }}>
            {ini}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[14px] font-medium text-ink">{name}</span>
            <span className="block truncate text-[12.5px] text-ink-3">{what}</span>
          </span>
          <span className="text-[12px] text-ink-3">{m.now}</span>
        </div>
      ))}
    </div>
  );
}

/* ───────────── Mock 5 · Ti trovano ───────────── */

function FoundMock({ m, f }: { m: M; f: (n: number) => string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rows = [m.other1, m.other2, m.you];
  useLoop(ref, (tl, q) => {
    const r = q("[data-r]");
    const slot = (i: number) => 50 + i * 60;
    const order = [1, 2, 0]; // posizione finale di ciascuna riga
    tl.fromTo(r, { autoAlpha: 0, y: (i: number) => slot(i) + 20 }, { autoAlpha: 1, y: (i: number) => slot(i), duration: 0.6, stagger: 0.1, ease: "expo.out" }, 0.2);
    tl.to(r, { y: (i: number) => slot(order[i]), duration: 0.9, ease: "expo.inOut" }, 1.6).to(r[2], { boxShadow: "inset 0 0 0 2px #5ec4ff, 0 14px 32px -14px rgba(47,111,224,.55)", duration: 0.4 }, 2.3);
    tl.to(r, { autoAlpha: 0, duration: 0.4 }, 4.2);
    return () => {
      gsap.set(r, { autoAlpha: 0, y: (i: number) => slot(i), boxShadow: "inset 0 0 0 1px var(--hair-strong), 0 14px 32px -18px rgba(0,0,0,.28)" });
    };
  }, 0.4);
  return (
    <div ref={ref} className="relative h-full">
      <div className={`absolute inset-x-0 top-0 flex h-10 items-center gap-2.5 rounded-full px-4 text-[13.5px] text-ink-2 ${surface}`}>
        <span className="h-3 w-3 rounded-full border-2 border-ink-3" />
        {m.query}
      </div>
      {rows.map((name, i) => (
        <div key={name} data-r className={`absolute inset-x-0 top-0 flex h-[52px] items-center gap-3 rounded-[16px] px-3 ${surface}`}>
          <span className="h-9 w-9 shrink-0 rounded-[11px]" style={{ background: i === 2 ? "linear-gradient(150deg,#8fd8ff,#2f6fe0)" : "var(--hover)" }} />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[14px] font-medium text-ink">{name}</span>
            <span className="flex items-center gap-1 truncate text-[12.5px] text-ink-3">
              <Star size={12} strokeWidth={0} fill="#f5b83d" />
              {f(i === 2 ? 4.9 : 4.2)} · {i === 2 ? 128 : 36} {m.reviews}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-2">
            {dot()}
            {m.open}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ───────────── Mock 6 · Sicuro ───────────── */

function SafeMock({ m }: { m: M }) {
  const ref = useRef<HTMLDivElement>(null);
  useLoop(ref, (tl, q) => {
    const rings = q("[data-ring2]");
    const chips = q("[data-ch]");
    tl.fromTo(rings, { scale: 0.6, autoAlpha: 0.7 }, { scale: 2.1, autoAlpha: 0, duration: 2.2, stagger: 0.7, ease: "power1.out", repeat: 1 }, 0);
    tl.fromTo(chips, { autoAlpha: 0, y: 14, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.25, ease: "expo.out" }, 0.3).to(chips, { autoAlpha: 0, duration: 0.4 }, 4.6);
    return () => void gsap.set(chips, { autoAlpha: 0 });
  }, 0.2);
  return (
    <div ref={ref} className="relative flex h-full items-center justify-center">
      {[0, 1, 2].map((i) => (
        <span key={i} data-ring2 className="absolute h-[92px] w-[92px] rounded-full" style={{ boxShadow: "inset 0 0 0 1.5px #5ec4ff" }} />
      ))}
      <Tile3D Icon={ShieldCheck} size={38} className="relative block h-[92px] w-[92px]" />
      <span data-ch className="absolute left-0 top-2 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium text-ink" style={{ background: "var(--bg-surface)", boxShadow: "inset 0 0 0 1px var(--hair-strong)" }}>
        {dot("#5ec4ff")}
        {m.https}
      </span>
      <span data-ch className="absolute bottom-3 left-[6%] inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium text-ink" style={{ background: "var(--bg-surface)", boxShadow: "inset 0 0 0 1px var(--hair-strong)" }}>
        {dot("#5ec4ff")}
        {m.backup}
      </span>
      <span data-ch className="absolute right-0 top-8 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium text-ink" style={{ background: "var(--bg-surface)", boxShadow: "inset 0 0 0 1px var(--hair-strong)" }}>
        {dot()}
        {m.online}
      </span>
    </div>
  );
}

/* ───────────── Mock 7 · Area clienti ───────────── */

function DashMock({ m }: { m: M }) {
  const ref = useRef<HTMLDivElement>(null);
  useLoop(ref, (tl, q) => {
    const bars = q("[data-bar]");
    const pg = q("[data-pg]");
    const hs = [0.4, 0.62, 0.5, 0.82, 0.7, 0.95, 0.78];
    tl.fromTo(bars, { scaleY: 0.05 }, { scaleY: (i: number) => hs[i], duration: 0.9, stagger: 0.07, ease: "expo.out" }, 0.2);
    tl.fromTo(pg, { scaleX: 0 }, { scaleX: (i: number) => [0.9, 0.6, 0.3][i], duration: 1.1, stagger: 0.15, ease: "expo.out" }, 0.5);
    tl.to(bars, { scaleY: (i: number) => [0.7, 0.45, 0.85, 0.55, 0.9, 0.6, 1][i], duration: 0.9, stagger: 0.05, ease: "power2.inOut" }, 2.2).to(bars, { scaleY: 0.05, duration: 0.4 }, 4.2);
    return () => void gsap.set([bars, pg], { scaleY: 0.05, scaleX: 0 });
  }, 0.3);
  return (
    <div ref={ref} className="grid h-full grid-cols-[1.1fr_1fr] gap-4 sm:gap-6">
      <div className={`flex flex-col justify-end rounded-[18px] p-4 ${surface}`}>
        <div className="flex h-[120px] items-end gap-1.5 sm:gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} data-bar className="block h-full flex-1 origin-bottom rounded-[6px]" style={{ background: i % 2 ? "linear-gradient(0deg,#2f6fe0,#5ec4ff)" : "linear-gradient(0deg,#5ec4ff,#8fd8ff)" }} />
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center gap-4">
        <p className="text-[13px] text-ink-3">{m.project}</p>
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="mb-1.5 flex justify-between text-[12.5px] text-ink-2">
              <span>{m.progress}</span>
              <span className="font-mono tabular-nums">{[90, 60, 30][i]}%</span>
            </div>
            <span className="block h-2 overflow-hidden rounded-full bg-[var(--hover)]">
              <span data-pg className="block h-full origin-left rounded-full" style={{ background: "linear-gradient(90deg,#5ec4ff,#2f6fe0)" }} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────── Sezioni ───────────── */

function Cell({ span, title, body, mock, h = "h-[230px]" }: { span: string; title: string; body: string; mock: ReactNode; h?: string }) {
  return (
    <Bead as="article" data-rv radius={36} className={`relative flex flex-col overflow-hidden p-5 sm:p-7 ${span}`}>
      <div className={`relative mb-6 ${h}`}>{mock}</div>
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
      ScrollTrigger.batch("[data-rv]", { start: "top 90%", once: true, onEnter: (els) => void gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "expo.out", overwrite: true }) });
      // le tessere 3D oscillano piano mentre si vedono
      gsap.utils.toArray<HTMLElement>("[data-tile]").forEach((t, i) => {
        const tw = gsap.fromTo(t, { rotationY: -22, rotationX: 8 }, { rotationY: 22, rotationX: -8, duration: 3.4 + (i % 3) * 0.5, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true });
        ScrollTrigger.create({ trigger: t, start: "top 100%", end: "bottom 0%", onToggle: (s) => void (s.isActive ? tw.play() : tw.pause()) });
      });
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
      <section id="include" className={`${container} scroll-mt-10 pt-28 sm:pt-44`}>
        <header className="mb-10 grid gap-5 sm:mb-14 lg:grid-cols-[1fr_auto] lg:items-end">
          <h2 data-rv className={h2}>
            <Script text={c.bento.title} />
          </h2>
          <p data-rv className="max-w-[40ch] text-[17px] leading-[1.55] text-ink-2">
            {c.bento.lead}
          </p>
        </header>
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-12">
          <Cell span="lg:col-span-7" title={c.bento.cells.speed[0]} body={c.bento.cells.speed[1]} mock={<SpeedMock m={m} f={fs} />} />
          <Cell span="lg:col-span-5" title={c.bento.cells.screens[0]} body={c.bento.cells.screens[1]} mock={<ScreensMock />} />
          <Cell span="lg:col-span-4" title={c.bento.cells.edit[0]} body={c.bento.cells.edit[1]} mock={<EditMock m={m} />} h="h-[212px]" />
          <Cell span="lg:col-span-4" title={c.bento.cells.leads[0]} body={c.bento.cells.leads[1]} mock={<LeadsMock m={m} />} h="h-[212px]" />
          <Cell span="lg:col-span-4" title={c.bento.cells.found[0]} body={c.bento.cells.found[1]} mock={<FoundMock m={m} f={fr} />} h="h-[212px]" />
          <Cell span="lg:col-span-5" title={c.bento.cells.safe[0]} body={c.bento.cells.safe[1]} mock={<SafeMock m={m} />} />
          <Cell span="lg:col-span-7" title={c.bento.cells.dash[0]} body={c.bento.cells.dash[1]} mock={<DashMock m={m} />} />
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
