"use client";

/*
 * Pagina prodotto GEO: architettura coerente su griglia 1280px, in stile Apple.
 * 1. Hero: promessa e riga firma animata con i 4 assistenti
 * 2. Dalla domanda al tuo sito: palco interattivo con chat AI + 3 card dei passaggi sincronizzate
 * 3. Cosa ricevi: bento 2+1 / 1+1+1 con gradiente dei servizi e vetro liquido
 * 4. Domande frequenti
 * 5. Chiusura + navigazione agli altri servizi
 */

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ArrowUpRight, Globe } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Analytics01Icon,
  DatabaseIcon,
  FileScriptIcon,
  QuoteDownIcon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/i18n/navigation";
import { Drop } from "@/components/glass/Drop";
import { Bead } from "@/components/glass/Bead";
import { ServiceBg } from "@/components/sections/ServiceBg";
import { ServiceIcon } from "../ServiceIcon";
import type { ServiceDetailProps } from "../ServiceDetail";
import { prefersReducedMotion } from "@/lib/env";
import { onIntroLift } from "@/lib/intro";
import type { GeoCopy } from "@/content/geo";
import type { ServiceStory } from "@/content/stories";
import { AiTile, AssistantLine, ASSISTANTS, playLine } from "./Assistants";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export type GeoPageProps = { copy: GeoCopy; tale: ServiceStory } & Pick<ServiceDetailProps, "next" | "others" | "t">;

const K = "geo" as const;
const pad = (n: number) => String(n).padStart(2, "0");
const Ico = ({ i, s = 18, c = "" }: { i: typeof Add01Icon; s?: number; c?: string }) => <HugeiconsIcon icon={i} size={s} strokeWidth={1.7} className={c} />;

const kick = "geo-grad inline-block text-[15px] font-semibold tracking-[-0.01em] sm:text-[18px]";
const h2 = "text-[clamp(36px,5.2vw,76px)] font-semibold leading-[1.02] tracking-[-0.05em] text-ink";
const tile = "rounded-[32px] bg-[var(--chip)] ring-1 ring-inset ring-[var(--hair)] sm:rounded-[40px]";

const words = (s: string, attr: string, cls = "") =>
  s
    .trim()
    .split(" ")
    .map((w, i) => (
      <span key={i} {...{ [attr]: "" }} className={`inline-block ${cls}`}>
        {w}&nbsp;
      </span>
    ));

/* ───────────── 1. Apertura ───────────── */

function Hero({ copy, t }: Pick<GeoPageProps, "copy" | "t">) {
  const h = copy.hero;
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = root.current!;
      if (prefersReducedMotion()) return;
      const split = SplitText.create("[data-h1a]", { type: "words", mask: "words" });
      const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      onIntroLift(() => intro.play());
      intro
        .from("[data-island]", { clipPath: "inset(6% 4% 6% 4% round 60px)", duration: 1.4, ease: "expo.inOut" })
        .from("[data-eyebrow]", { y: 14, autoAlpha: 0, duration: 1 }, 0.45)
        .from(split.words, { yPercent: 110, duration: 1.2, stagger: 0.06 }, 0.5)
        .from("[data-h1b]", { yPercent: 110, duration: 1.3 }, 0.72);
      playLine(intro, el.querySelector("[data-aline]")!, 1.1);
      intro.from("[data-hrest]", { y: 18, autoAlpha: 0, duration: 1, stagger: 0.08 }, 1.55);
      gsap.to("[data-island]", { scale: 0.96, borderRadius: 56, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
    },
    { scope: root },
  );
  return (
    <section ref={root} className="px-3 pt-[calc(var(--bar-h)+20px)] sm:px-5">
      <div
        data-island
        className="theme-dark relative mx-auto flex max-w-[1400px] flex-col justify-center overflow-hidden rounded-[32px] bg-[#05070a] [clip-path:inset(0_0_0_0_round_0)] sm:rounded-[44px] lg:min-h-[min(820px,calc(100svh-var(--bar-h)-40px))]"
      >
        <ServiceBg k={K} live />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_75%_at_50%_45%,rgba(3,6,10,.76),rgba(3,6,10,.5)_65%,rgba(3,6,10,.32))]" />
        <div className="relative flex flex-col items-center px-5 py-16 text-center sm:px-10 sm:py-24 lg:py-28">
          <Bead data-eyebrow tint="rgba(6,14,24,.56)" className="liquid inline-flex h-9 items-center gap-2.5 px-4 text-[13px] font-medium text-white/95">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--sky)] shadow-[0_0_10px_var(--sky)]" />
            {h.eyebrow}
          </Bead>
          <h1 className="mt-7 text-[clamp(40px,7vw,110px)] font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:mt-9">
            <span data-h1a className="block">
              {h.l1}
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <span data-h1b className="geo-grad block">
                {h.l2}
              </span>
            </span>
          </h1>
          <AssistantLine start="manual" prefix={h.on} and={h.and} className="mt-6 text-[clamp(21px,2.7vw,40px)] text-white sm:mt-8" />
          <p data-hrest className="mt-6 max-w-[52ch] text-[16px] leading-[1.55] text-white/75 sm:mt-8 sm:text-[19px]">
            {h.sub}
          </p>
          <div data-hrest className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            <Drop href={`#brief-${K}`} accent className="h-[52px] px-6 text-[16px] font-medium text-ink">
              {t.cta}
              <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
            </Drop>
            <a href="#come-funziona" className="group inline-flex h-[52px] items-center gap-2 text-[16px] font-medium text-white/85 transition-colors hover:text-white">
              {h.how}
              <ArrowRight size={17} strokeWidth={1.8} className="rotate-90 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── 2. Dalla domanda al tuo sito: palco chat AI + 3 card sincronizzate ───────────── */

function Scene({ copy }: { copy: GeoCopy }) {
  const s = copy.scene;
  const root = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [ai, setAi] = useState(0);
  const [step, setStep] = useState(0);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const reduced = prefersReducedMotion();
      const chars = q("[data-ch]");
      const aw = q("[data-aw]");
      const bars = q("[data-sbar]");

      const tl = gsap.timeline({
        paused: true,
        repeat: -1,
        onRepeat: () => {
          setAi((prev) => (prev + 1) % ASSISTANTS.length);
        },
      });
      tlRef.current = tl;

      // Reset iniziale
      tl.set(bars, { scaleX: 0 }, 0)
        .set(q("[data-ubub]"), { autoAlpha: 0, y: 14, scale: 0.97 }, 0)
        .set(chars, { opacity: 0 }, 0)
        .set(q("[data-read]"), { autoAlpha: 0, y: 6 }, 0)
        .set(aw, { opacity: 0, y: 4 }, 0)
        .set(q("[data-mark]"), { scaleX: 0 }, 0)
        .set(q("[data-cite]"), { autoAlpha: 0, y: 12 }, 0);

      // Passo 1 (0s -> 2.0s): La domanda del cliente
      tl.call(() => setStep(0), undefined, 0)
        .to(bars[0], { scaleX: 1, duration: 2.0, ease: "none" }, 0)
        .to(q("[data-ubub]"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: "expo.out" }, 0.1)
        .to(chars, { opacity: 1, duration: 0.01, stagger: 1.1 / chars.length, ease: "none" }, 0.3);

      // Passo 2 (2.0s -> 4.4s): La risposta con i tuoi dati
      tl.call(() => setStep(1), undefined, 2.0)
        .to(bars[1], { scaleX: 1, duration: 2.4, ease: "none" }, 2.0)
        .to(q("[data-read]"), { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 2.05)
        .to(aw, { opacity: 1, y: 0, duration: 0.18, stagger: 1.25 / aw.length, ease: "power2.out" }, 2.25)
        .to(q("[data-mark]"), { scaleX: 1, duration: 0.45, ease: "expo.out" }, 3.55);

      // Passo 3 (4.4s -> 7.2s): Il collegamento diretto
      tl.call(() => setStep(2), undefined, 4.4)
        .to(bars[2], { scaleX: 1, duration: 2.8, ease: "none" }, 4.4)
        .to(q("[data-cite]"), { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, 4.45);

      if (reduced) {
        tl.progress(1).pause();
        return;
      }

      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        end: "bottom 20%",
        onToggle: (self) => void (self.isActive ? tl.play() : tl.pause()),
      });
    },
    { scope: root },
  );

  const jumpStep = (idx: number) => {
    const tl = tlRef.current;
    if (!tl) return;
    const times = [0.05, 2.05, 4.45];
    setStep(idx);
    tl.play(times[idx]);
  };

  return (
    <section id="come-funziona" ref={root} className="mx-auto w-full max-w-[1400px] scroll-mt-10 px-3 pt-28 sm:px-5 sm:pt-44">
      <header className="mx-auto max-w-[920px] px-2 text-center">
        <p data-rise className={kick}>
          {s.kicker}
        </p>
        <h2 data-rise className={`${h2} mt-4`}>
          {s.title}
        </h2>
      </header>

      <div className="mx-auto mt-14 max-w-[1280px] sm:mt-20">
        {/* Palco principale col gradiente dei servizi e la finestra della chat AI */}
        <div data-rise className="theme-dark relative overflow-hidden rounded-[32px] bg-[#05070a] p-5 sm:rounded-[40px] sm:p-10 lg:p-12">
          <ServiceBg k={K} v={1} still />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_80%_at_50%_50%,rgba(3,6,10,.38),rgba(3,6,10,.68))]" />

          {/* Barra di selezione dei 4 assistenti */}
          <div className="relative flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {ASSISTANTS.map((a, i) => {
              const active = ai === i;
              return (
                <button
                  key={a.n}
                  type="button"
                  onClick={() => setAi(i)}
                  className={`inline-flex items-center gap-2.5 rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-all duration-300 ${
                    active
                      ? "bg-white/[.18] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.28),0_8px_24px_-8px_rgba(0,0,0,.5)]"
                      : "bg-white/[.06] text-white/65 hover:bg-white/[.11] hover:text-white"
                  }`}
                >
                  <AiTile i={i} size={22} radius={6} />
                  <span>{a.n}</span>
                </button>
              );
            })}
          </div>

          {/* Finestra della conversazione AI in vetro scuro ad alto contrasto */}
          <div className="relative mx-auto mt-6 max-w-[720px] overflow-hidden rounded-[26px] bg-[#080d14]/88 p-5 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.14),0_28px_70px_-24px_rgba(0,0,0,.75)] backdrop-blur-2xl sm:mt-8 sm:rounded-[30px] sm:p-8">
            {/* Domanda del cliente */}
            <div className="flex justify-end">
              <div data-ubub className="max-w-[85%] rounded-[20px] rounded-br-[6px] bg-white/[.11] px-4 py-2.5 text-[15px] leading-[1.45] text-white ring-1 ring-inset ring-white/10 sm:text-[16px]">
                {s.ask.split("").map((c, i) => (
                  <span key={i} data-ch>
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Risposta dell'assistente selezionato */}
            <div className="mt-6 grid grid-cols-[36px_minmax(0,1fr)] items-start gap-3.5 sm:gap-4">
              <div className="mt-0.5">
                <AiTile i={ai} size={36} radius={10} />
              </div>
              <div className="min-w-0">
                <div data-read className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/[.07] px-3 py-1 text-[12px] text-white/70 ring-1 ring-inset ring-white/10">
                  <Globe size={12} strokeWidth={1.8} className="text-[var(--sky)]" />
                  <span>{s.sourcesRead}</span>
                </div>

                <p className="text-[16px] leading-[1.62] text-white/92 sm:text-[17.5px]">
                  {words(s.answer[0], "data-aw")}
                  <span data-aw className="relative inline-block font-semibold text-white">
                    {s.answer[1]}
                    <span data-mark className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full bg-[var(--sky)]" style={{ transform: "scaleX(0)" }} />
                  </span>
                  {words(s.answer[2], "data-aw")}
                </p>

                {/* Scheda della fonte linkata */}
                <div data-cite className="mt-5 flex items-center gap-3.5 rounded-[18px] bg-white/[.06] p-3.5 ring-1 ring-inset ring-white/[.12] sm:p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[var(--sky)]/15 text-[var(--sky)] ring-1 ring-inset ring-[var(--sky)]/30">
                    <Globe size={18} strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-medium text-[var(--brand-sky)]">{s.sourceUrl}</span>
                    <span className="mt-0.5 block truncate text-[14px] font-semibold leading-[1.3] text-white sm:text-[15px]">{s.sourceTitle}</span>
                    <span className="mt-0.5 hidden truncate text-[12.5px] text-white/60 sm:block">{s.sourceSub}</span>
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[.08] text-white/75">
                    <ArrowUpRight size={15} strokeWidth={1.8} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* I 3 passaggi: griglia a 3 colonne allineata al Bento sottostante */}
        <ol className="mt-4 grid gap-4 lg:grid-cols-3">
          {s.steps.map((st, i) => {
            const active = step === i;
            return (
              <li key={st.t} data-rise>
                <button
                  type="button"
                  onClick={() => jumpStep(i)}
                  className={`flex h-full w-full flex-col justify-between p-7 text-left transition-colors duration-300 sm:p-8 ${tile}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <span className={`font-mono text-[12px] uppercase tracking-[0.14em] transition-colors duration-300 ${active ? "text-[var(--accent)]" : "text-ink-3"}`}>
                        {pad(i + 1)}
                      </span>
                      <span className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-[var(--hair-strong)]">
                        <span data-sbar className="absolute inset-0 origin-left rounded-full bg-[var(--sky)]" style={{ transform: "scaleX(0)" }} />
                      </span>
                    </div>
                    <h3 className="mt-6 text-[clamp(21px,1.8vw,26px)] font-semibold leading-[1.14] tracking-[-0.03em] text-ink">{st.t}</h3>
                  </div>
                  <p className="mt-3 text-[15.5px] leading-[1.55] text-ink-2">{st.b}</p>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ───────────── 3. Cosa ricevi: bento approvato ───────────── */

const GET_ICONS = [QuoteDownIcon, DatabaseIcon, FileScriptIcon, Analytics01Icon];

function Gets({ copy, gets }: { copy: GeoCopy; gets: ServiceStory["gets"] }) {
  const [hover, setHover] = useState(false);
  return (
    <section className="mx-auto w-full max-w-[1400px] px-3 pt-28 sm:px-5 sm:pt-44">
      <header className="mx-auto max-w-[920px] px-2 text-center">
        <p data-rise className={kick}>
          {copy.gets.kicker}
        </p>
        <h2 data-rise className={`${h2} mt-4`}>
          {copy.gets.title}
        </h2>
      </header>
      <div className="mx-auto mt-14 grid max-w-[1280px] gap-4 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3">
        <article
          data-rise
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          className="theme-dark relative flex min-h-[440px] flex-col justify-between overflow-hidden rounded-[32px] bg-[#05070a] p-8 sm:col-span-2 sm:rounded-[40px] sm:p-11"
        >
          <ServiceBg k={K} v={2} live paused={!hover} />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(3,6,10,.62),rgba(3,6,10,.15)_60%)]" />
          <div className="relative">
            <h3 className="max-w-[16ch] text-[clamp(30px,3.3vw,50px)] font-semibold leading-[1.02] tracking-[-0.05em] text-white">{copy.gets.assistants}</h3>
            <p className="mt-4 max-w-[44ch] text-[16px] leading-[1.55] text-white/75 sm:text-[17px]">{copy.gets.assistantsLead}</p>
          </div>
          <div className="relative mt-10 flex flex-wrap gap-3">
            {ASSISTANTS.map((a, i) => (
              <Bead key={a.n} tint="rgba(255,255,255,.1)" radius={26} className="liquid flex items-center gap-3 p-2.5 pr-5 text-[16px] font-semibold tracking-[-0.02em] text-white">
                <AiTile i={i} size={44} radius={13} />
                {a.n}
              </Bead>
            ))}
          </div>
        </article>
        {gets.items.map((it, i) => (
          <article key={it.t} data-rise className={`flex min-h-[300px] flex-col p-8 sm:p-9 ${tile}`}>
            <Bead tint="var(--accent-subtle)" radius={16} className="flex h-12 w-12 items-center justify-center text-[var(--accent-on-subtle)]">
              <Ico i={GET_ICONS[i % GET_ICONS.length]} s={22} />
            </Bead>
            <h3 className="mt-auto pt-10 text-[clamp(22px,1.9vw,28px)] font-semibold leading-[1.12] tracking-[-0.035em] text-ink">{it.t}</h3>
            <p className="mt-3 text-[15.5px] leading-[1.55] text-ink-2">{it.b}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────────── 4. Domande essenziali ───────────── */

function Faq({ copy }: { copy: GeoCopy }) {
  const f = copy.faq;
  const [open, setOpen] = useState(0);
  return (
    <section className="mx-auto w-full max-w-[920px] px-5 pt-28 sm:px-8 sm:pt-44">
      <header className="text-center">
        <p data-rise className={kick}>
          {f.kicker}
        </p>
        <h2 data-rise className={`${h2} mt-4`}>
          {f.title}
        </h2>
      </header>
      <ul className="mt-12 grid gap-3 sm:mt-16">
        {f.items.map((it, i) => {
          const on = open === i;
          return (
            <li key={it.q} data-rise className={`overflow-hidden !rounded-[28px] transition-shadow duration-500 ${tile} ${on ? "shadow-[0_24px_60px_-34px_var(--shadow-strong)]" : ""}`}>
              <button
                type="button"
                id={`geo-q-${i}`}
                aria-expanded={on}
                aria-controls={`geo-a-${i}`}
                onClick={() => setOpen(on ? -1 : i)}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left sm:px-8 sm:py-6"
              >
                <span className="text-[18px] font-semibold leading-[1.3] tracking-[-0.02em] text-ink sm:text-[20px]">{it.q}</span>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color] duration-500 ease-[var(--ease-out)] ${on ? "rotate-45 bg-[var(--accent-subtle)] text-[var(--accent-on-subtle)]" : "bg-[var(--hover)] text-ink"}`}>
                  <Ico i={Add01Icon} s={16} />
                </span>
              </button>
              <div id={`geo-a-${i}`} role="region" aria-labelledby={`geo-q-${i}`} className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out)] ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <p className="max-w-[62ch] px-6 pb-6 text-[16.5px] leading-[1.65] text-ink-2 sm:px-8 sm:pb-7">{it.a}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ───────────── 5. Chiusura approvata + navigazione agli altri servizi ───────────── */

function Close({ copy, others, t }: Pick<GeoPageProps, "copy" | "others" | "t">) {
  return (
    <section className="mx-auto mt-28 w-full max-w-[1400px] px-3 sm:mt-44 sm:px-5">
      <div className="theme-dark relative overflow-hidden rounded-[32px] bg-[#05070a] px-6 py-20 text-center sm:rounded-[44px] sm:px-12 sm:py-32">
        <ServiceBg k={K} v={2} live />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_50%,rgba(3,6,10,.6),rgba(3,6,10,.18))]" />
        <div className="relative mx-auto max-w-[1000px]">
          <AssistantLine and={copy.hero.and} className="text-[clamp(18px,2.1vw,30px)] text-white/90" radius={10} />
          <h2 data-rise className="mx-auto mt-8 max-w-[18ch] text-[clamp(40px,6vw,96px)] font-semibold leading-[0.98] tracking-[-0.055em] text-white">
            {copy.close.title}
          </h2>
          <p data-rise className="mx-auto mt-6 max-w-[46ch] text-[17px] leading-[1.55] text-white/75 sm:text-[19px]">
            {copy.close.lead}
          </p>
          <div data-rise className="mt-10">
            <Drop href={`#brief-${K}`} accent className="h-[56px] px-7 text-[17px] font-medium text-ink">
              {t.cta}
              <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
            </Drop>
          </div>
        </div>
      </div>

      <nav aria-label={t.all} className="mx-auto mt-16 max-w-[1280px] px-2 sm:mt-24 sm:px-3">
        <p className="mb-6 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">{t.all}</p>
        <ul className="grid border-t border-[var(--hair)] sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3">
          {others.map((o) => (
            <li key={o.slug} className="border-b border-[var(--hair)]">
              <Link href={`/servizi/${o.slug}`} className="group flex items-center gap-4 py-4 text-[17px] text-ink-2 transition-colors hover:text-ink">
                <ServiceIcon k={o.k} size={36} className="transition-transform duration-500 ease-[var(--ease-out)] group-hover:-rotate-6" />
                <span className="flex-1">{o.title}</span>
                <ArrowUpRight size={16} strokeWidth={1.8} className="shrink-0 text-ink-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}

export function GeoPage(p: GeoPageProps) {
  const { copy, tale, t } = p;
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const els = gsap.utils.toArray<HTMLElement>("[data-rise]");
      gsap.set(els, { autoAlpha: 0, y: 36 });
      ScrollTrigger.batch(els, {
        start: "top 90%",
        once: true,
        onEnter: (b) => void gsap.to(b, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08, ease: "expo.out", overwrite: true }),
      });
    },
    { scope: root },
  );
  return (
    <div ref={root}>
      <Hero copy={copy} t={t} />
      <Scene copy={copy} />
      <Gets copy={copy} gets={tale.gets} />
      <Faq copy={copy} />
      <Close copy={copy} others={p.others} t={t} />
    </div>
  );
}
