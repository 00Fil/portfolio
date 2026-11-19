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

const surface = "bg-[var(--bg-surface)] shadow-[inset_0_0_0_1px_var(--hair-strong),0_14px_32px_-18px_rgba(0,0,0,.28)]";
const dot = (c = "#2fb36a") => <span className="inline-block h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: c, boxShadow: `0 0 0 3px color-mix(in srgb, ${c} 25%, transparent)` }} />;
const sky = "linear-gradient(150deg,#5ec4ff,#2f6fe0)";

/* Le immagini dentro le tessere sono ferme: l'unico gesto è un leggero sollevamento al passaggio del mouse (vedi Cell). */

/* ───────────── 1 · Velocità ───────────── */

function SpeedMock({ m, f }: { m: M; f: (n: number) => string }) {
  const row = (lbl: string, t: number, w: string, bg: string, strong: boolean) => (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-[14px]">
        <span className={strong ? "font-medium text-ink" : "text-ink-3"}>{lbl}</span>
        <span className={`font-mono tabular-nums ${strong ? "text-ink" : "text-ink-3"}`}>{f(t)}</span>
      </div>
      <span className="block h-3 overflow-hidden rounded-full bg-[var(--hover)]">
        <span className="block h-full rounded-full" style={{ width: w, background: bg }} />
      </span>
    </div>
  );
  return (
    <div className="flex h-full items-center gap-6 sm:gap-10">
      <div className="relative flex h-[124px] w-[124px] shrink-0 items-center justify-center sm:h-[148px] sm:w-[148px]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--hover)" strokeWidth="8" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#spd)" strokeWidth="8" strokeLinecap="round" />
          <defs>
            <linearGradient id="spd" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#5ec4ff" />
              <stop offset="1" stopColor="#2f6fe0" />
            </linearGradient>
          </defs>
        </svg>
        <span className="text-center leading-none">
          <span className="block text-[44px] font-medium tracking-[-0.04em] text-ink sm:text-[52px]">100</span>
          <span className="mt-1 block text-[12px] text-ink-3">{m.score}</span>
        </span>
      </div>
      <div className="grid min-w-0 flex-1 gap-5">
        {row(m.yours, 0.8, "13%", sky, true)}
        {row(m.slow, 6.4, "100%", "color-mix(in srgb, var(--label-primary) 26%, transparent)", false)}
      </div>
    </div>
  );
}

/* ───────────── 2 · Ogni schermo ───────────── */

function Wire({ cols = 2, tall = false }: { cols?: number; tall?: boolean }) {
  return (
    <span className="flex h-full flex-col gap-1.5">
      <span className="flex h-2 items-center justify-between">
        <span className="h-1 w-4 rounded-full bg-[var(--hair-strong)]" />
        <span className="h-1 w-6 rounded-full bg-[var(--hair-strong)]" />
      </span>
      <span className={`block rounded-[8px] ${tall ? "flex-[1.2]" : "flex-1"}`} style={{ background: "linear-gradient(140deg,#8fd8ff,#2f6fe0)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.55)" }} />
      <span className={`grid gap-1.5 ${cols === 1 ? "grid-cols-1" : cols === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {Array.from({ length: cols === 1 ? 2 : cols }).map((_, i) => (
          <span key={i} className="h-3 rounded-[5px] bg-[var(--hover)]" />
        ))}
      </span>
    </span>
  );
}

function ScreensMock() {
  const fr = `${surface} p-2.5`;
  return (
    <div className="flex h-full items-end justify-center gap-3 sm:gap-4">
      <div className={`${fr} h-[134px] w-[52%] rounded-[18px]`}>
        <Wire cols={3} />
      </div>
      <div className={`${fr} h-[168px] w-[26%] rounded-[18px]`}>
        <Wire cols={2} tall />
      </div>
      <div className={`${fr} h-[196px] w-[16%] min-w-[58px] rounded-[20px]`} style={{ boxShadow: "inset 0 0 0 2px #5ec4ff, 0 20px 40px -18px rgba(47,111,224,.55)" }}>
        <Wire cols={1} tall />
      </div>
    </div>
  );
}

/* ───────────── 3 · Lo modifichi tu ───────────── */

function EditMock({ m }: { m: M }) {
  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className={`rounded-[18px] p-4 ${surface}`} style={{ boxShadow: "inset 0 0 0 2px #5ec4ff, 0 16px 36px -18px rgba(47,111,224,.5)" }}>
        <span className="mb-2 block h-1.5 w-10 rounded-full" style={{ background: sky }} />
        <p className="text-[12px] text-ink-3">{m.field}</p>
        <p className="mt-0.5 text-[16px] font-medium text-ink">{m.typed}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <span className={`flex h-11 min-w-0 flex-1 items-center rounded-full px-4 text-[14px] text-ink ${surface}`}>
          <span className="truncate">{m.typed}</span>
        </span>
        <span className="flex h-11 items-center rounded-full px-5 text-[14px] font-medium text-white" style={{ background: sky }}>
          {m.save}
        </span>
      </div>
      <span className="inline-flex items-center gap-2 self-start text-[13.5px] font-medium text-ink">
        {dot()}
        {m.saved}
      </span>
    </div>
  );
}

/* ───────────── 4 · Richieste ───────────── */

function LeadsMock({ m }: { m: M }) {
  const rows: [string, string, string][] = [["GR", "Giulia R.", m.request], ["MB", "Marco B.", m.booking], ["ET", "Elena T.", m.message]];
  return (
    <div className="relative h-full">
      <span className="absolute right-0 top-0 z-10 inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[13px] font-medium text-white" style={{ background: sky }}>
        3
      </span>
      {rows.map(([ini, name, what], i) => (
        <div key={name} className={`absolute inset-x-0 flex h-[54px] items-center gap-3 rounded-[18px] px-3 ${surface}`} style={{ top: 34 + i * 58, left: i * 0, transform: `scale(${1 - (2 - i) * 0.025})` }}>
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

/* ───────────── 5 · Ti trovano ───────────── */

function FoundMock({ m, f }: { m: M; f: (n: number) => string }) {
  const rows = [m.you, m.other1, m.other2];
  return (
    <div className="relative h-full">
      <div className={`absolute inset-x-0 top-0 flex h-10 items-center gap-2.5 rounded-full px-4 text-[13.5px] text-ink-2 ${surface}`}>
        <span className="h-3 w-3 rounded-full border-2 border-ink-3" />
        {m.query}
      </div>
      {rows.map((name, i) => (
        <div
          key={name}
          className={`absolute inset-x-0 flex h-[52px] items-center gap-3 rounded-[18px] px-3 ${surface}`}
          style={{ top: 50 + i * 56, ...(i === 0 ? { boxShadow: "inset 0 0 0 2px #5ec4ff, 0 14px 32px -14px rgba(47,111,224,.5)" } : { opacity: 0.9 - i * 0.12 }) }}
        >
          <span className="h-9 w-9 shrink-0 rounded-[11px]" style={{ background: i === 0 ? "linear-gradient(150deg,#8fd8ff,#2f6fe0)" : "var(--hover)" }} />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[14px] font-medium text-ink">{name}</span>
            <span className="flex items-center gap-1 truncate text-[12.5px] text-ink-3">
              <Star size={12} strokeWidth={0} fill="#f5b83d" />
              {f(i === 0 ? 4.9 : 4.2)} · {i === 0 ? 128 : 36} {m.reviews}
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

/* ───────────── 6 · Sicuro ───────────── */

function SafeMock({ m }: { m: M }) {
  const chip = "absolute inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium text-ink";
  const st = { background: "var(--bg-surface)", boxShadow: "inset 0 0 0 1px var(--hair-strong), 0 12px 26px -14px rgba(0,0,0,.3)" };
  return (
    <div className="relative flex h-full items-center justify-center">
      {[150, 210].map((d) => (
        <span key={d} aria-hidden className="absolute rounded-full" style={{ width: d, height: d, boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, #5ec4ff 40%, transparent)" }} />
      ))}
      <Tile3D Icon={ShieldCheck} size={38} className="relative block h-[96px] w-[96px]" />
      <span className={`${chip} left-0 top-2`} style={st}>
        {dot("#5ec4ff")}
        {m.https}
      </span>
      <span className={`${chip} bottom-3 left-[6%]`} style={st}>
        {dot("#5ec4ff")}
        {m.backup}
      </span>
      <span className={`${chip} right-0 top-8`} style={st}>
        {dot()}
        {m.online}
      </span>
    </div>
  );
}

/* ───────────── 7 · Area clienti ───────────── */

function DashMock({ m }: { m: M }) {
  const hs = [0.4, 0.62, 0.5, 0.82, 0.7, 0.95, 0.78];
  return (
    <div className="grid h-full grid-cols-[1.1fr_1fr] gap-4 sm:gap-6">
      <div className={`flex flex-col justify-end rounded-[20px] p-4 ${surface}`}>
        <div className="flex h-[120px] items-end gap-1.5 sm:gap-2">
          {hs.map((h, i) => (
            <span key={i} className="block flex-1 rounded-[6px]" style={{ height: `${h * 100}%`, background: i % 2 ? "linear-gradient(0deg,#2f6fe0,#5ec4ff)" : "linear-gradient(0deg,#5ec4ff,#8fd8ff)" }} />
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center gap-4">
        <p className="text-[13px] text-ink-3">{m.project}</p>
        {[90, 60, 30].map((v) => (
          <div key={v}>
            <div className="mb-1.5 flex justify-between text-[12.5px] text-ink-2">
              <span>{m.progress}</span>
              <span className="font-mono tabular-nums">{v}%</span>
            </div>
            <span className="block h-2 overflow-hidden rounded-full bg-[var(--hover)]">
              <span className="block h-full rounded-full" style={{ width: `${v}%`, background: sky }} />
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
    <Bead as="article" data-rv radius={36} className={`group relative flex flex-col overflow-hidden p-5 sm:p-7 ${span}`}>
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(60%_70%_at_50%_30%,color-mix(in_srgb,#5ec4ff_20%,transparent),transparent)]" />
      <div className={`relative mb-6 transition-transform duration-[600ms] ease-[var(--ease-out)] group-hover:-translate-y-1.5 ${h}`}>{mock}</div>
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
