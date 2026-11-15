"use client";

/*
 * Pagina prodotto GEO: essenziale, positiva e fattuale in stile Apple.
 * Ogni sezione racconta un solo concetto senza ripetizioni:
 * 1. Hero con la riga firma degli assistenti
 * 2. Scena interattiva allo scroll con una vera chat AI in produzione
 * 3. Bento "Cosa ricevi" con gradiente dei servizi e vetro liquido
 * 4. Domande essenziali e chiusura
 */

import { useEffect, useRef, useState, type RefObject } from "react";
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
  LockKeyIcon,
  MapsLocation01Icon,
  QuoteDownIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { Drop } from "@/components/glass/Drop";
import { Bead } from "@/components/glass/Bead";
import { ServiceBg } from "@/components/sections/ServiceBg";
import { prefersReducedMotion } from "@/lib/env";
import { onIntroLift } from "@/lib/intro";
import type { GeoCopy } from "@/content/geo";
import type { ServiceStory } from "@/content/stories";
import { Next, type ServiceDetailProps } from "../ServiceDetail";
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

function useFit(box: RefObject<HTMLDivElement | null>, inner: RefObject<HTMLDivElement | null>, max = 1.08) {
  useEffect(() => {
    const b = box.current;
    const el = inner.current;
    if (!b || !el) return;
    const fit = () => {
      const k = Math.min(max, b.clientWidth / el.offsetWidth, b.clientHeight / el.offsetHeight);
      el.style.transform = `translate(-50%, -50%) scale(${Math.max(0.5, k)})`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    ro.observe(el);
    return () => ro.disconnect();
  }, [box, inner, max]);
}

/* ───────────── 1. Apertura: essenziale, centrata, con la riga firma degli assistenti ───────────── */

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

/* ───────────── 2. Scena: interfaccia chat AI reale in produzione, guidata dallo scroll ───────────── */

const TAB = 46;

function Scene({ copy }: { copy: GeoCopy }) {
  const s = copy.scene;
  const root = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const win = useRef<HTMLDivElement>(null);
  useFit(box, win);
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const reduced = prefersReducedMotion();
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: reduced ? undefined : { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.7 } });
      const chars = q("[data-ch]");
      const aw = q("[data-aw]");
      // Passo 1 · domanda utente
      tl.fromTo(q("[data-ubub]"), { autoAlpha: 0, y: 20, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.25, ease: "power2.out" }, 0.02).fromTo(
        chars,
        { opacity: 0 },
        { opacity: 1, duration: 0.01, stagger: 0.58 / chars.length },
        0.18,
      );
      // Passo 2 · consultazione fonti e passaggio tra i 4 assistenti
      tl.fromTo(q("[data-seek]"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 1).fromTo(
        q("[data-src]"),
        { autoAlpha: 0, y: 12, scale: 0.92 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.22, stagger: 0.14, ease: "power2.out" },
        1.1,
      );
      [1, 2, 3, 0].forEach((p, j) => {
        const at = 1.1 + j * 0.18;
        tl.to(q("[data-thumb]"), { x: p * TAB, duration: 0.14, ease: "power2.inOut" }, at).to(q("[data-av]"), { opacity: (k: number) => (k === p ? 1 : 0), duration: 0.1 }, at);
      });
      tl.to(q("[data-src]:not([data-hl])"), { opacity: 0.4, duration: 0.15 }, 1.72).fromTo(q("[data-ring]"), { opacity: 0 }, { opacity: 1, duration: 0.15 }, 1.72);
      // Passo 3 · risposta generata con pillola fonti consultate e nota [1]
      tl.to(q("[data-seek]"), { autoAlpha: 0, y: -8, duration: 0.15 }, 2)
        .fromTo(q("[data-read]"), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.18 }, 2.02)
        .fromTo(aw, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.06, stagger: 0.58 / aw.length }, 2.1)
        .fromTo(q("[data-mark]"), { scaleX: 0 }, { scaleX: 1, duration: 0.2 }, 2.74)
        .fromTo(q("[data-ref]"), { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.2, ease: "power2.out" }, 2.84);
      // Passo 4 · scheda fonte diretta
      tl.fromTo(q("[data-cite]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" }, 3);
      tl.to({}, { duration: 0.5 }, 3.5);
      // didascalie sincronizzate a sinistra
      const caps = q("[data-cap]");
      const bars = q("[data-pbar]");
      caps.forEach((c, i) => {
        if (i) tl.fromTo(c, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power2.out" }, i);
        if (i < caps.length - 1) tl.to(c, { autoAlpha: 0, y: -24, duration: 0.18, ease: "power2.in" }, i + 0.8);
        tl.fromTo(bars[i], { scaleY: 0 }, { scaleY: 1, duration: 1 }, i);
      });
      if (reduced) {
        tl.progress(1);
        gsap.set(caps, { autoAlpha: 1, y: 0 });
      }
    },
    { scope: root },
  );
  const sources: { l: string; i: typeof Add01Icon; hl?: boolean }[] = [
    { l: s.sourceUrl, i: LockKeyIcon, hl: true },
    { l: copy.hero.and === "and" ? "Reviews" : "Recensioni", i: StarIcon },
    { l: copy.hero.and === "and" ? "Maps" : "Mappe", i: MapsLocation01Icon },
  ];
  return (
    <section id="come-funziona" ref={root} className="geo-scene relative mt-20 h-[420svh] px-3 sm:mt-32 sm:px-5">
      <div className="geo-stick sticky top-[calc(var(--bar-h)+12px)] h-[calc(100svh-var(--bar-h)-24px)] min-h-[560px]">
        <div className="theme-dark relative mx-auto h-full max-w-[1400px] overflow-hidden rounded-[32px] bg-[#05070a] sm:rounded-[44px]">
          <ServiceBg k={K} v={1} />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,6,10,.74),rgba(3,6,10,.38)_50%,rgba(3,6,10,.22))] lg:bg-[linear-gradient(90deg,rgba(3,6,10,.76),rgba(3,6,10,.34)_55%,rgba(3,6,10,.16))]" />
          <div className="relative grid h-full grid-rows-[auto_minmax(0,1fr)] gap-5 p-6 sm:p-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:grid-rows-1 lg:gap-12 lg:p-14">
            <div className="flex flex-col lg:justify-between">
              <div>
                <p className={kick}>{s.kicker}</p>
                <h2 className="mt-3 hidden max-w-[14ch] text-[clamp(30px,3.8vw,58px)] font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:block">{s.title}</h2>
              </div>
              <div className="mt-4 flex gap-5 sm:mt-8 lg:mt-0">
                <div aria-hidden className="flex flex-col gap-1.5 py-1">
                  {s.steps.map((st) => (
                    <span key={st.t} className="relative w-[3px] flex-1 overflow-hidden rounded-full bg-white/15">
                      <span data-pbar className="absolute inset-0 origin-top rounded-full bg-[var(--sky)]" />
                    </span>
                  ))}
                </div>
                <ol className="grid flex-1">
                  {s.steps.map((st, i) => (
                    <li key={st.t} data-cap className="geo-cap [grid-area:1/1]">
                      <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-white/55">
                        {pad(i + 1)} / {pad(s.steps.length)}
                      </p>
                      <p className="mt-2 text-[clamp(22px,2.4vw,36px)] font-semibold leading-[1.1] tracking-[-0.04em] text-white">{st.t}</p>
                      <p className="mt-2.5 max-w-[38ch] text-[14.5px] leading-[1.55] text-white/75 sm:mt-3 sm:text-[17px]">{st.b}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div ref={box} className="geo-fit relative min-h-0">
              <div ref={win} aria-hidden className="absolute left-1/2 top-1/2 w-[540px]" style={{ transform: "translate(-50%, -50%)" }}>
                <Bead tint="rgba(10,16,24,.56)" radius={30} className="liquid block overflow-hidden text-white">
                  {/* Barra superiore con selettore dei 4 assistenti */}
                  <span className="flex items-center justify-between border-b border-white/[.08] px-4 py-3">
                    <span className="flex w-[52px] gap-1.5">
                      {[0, 1, 2].map((d) => (
                        <span key={d} className="h-2.5 w-2.5 rounded-full bg-white/20" />
                      ))}
                    </span>
                    <Bead tint="rgba(255,255,255,.06)" className="relative flex p-1">
                      <Bead data-thumb tint="rgba(255,255,255,.2)" className="absolute left-1 top-1 h-9" style={{ width: TAB }} />
                      {ASSISTANTS.map((a, i) => (
                        <span key={a.n} className="relative flex h-9 items-center justify-center" style={{ width: TAB }}>
                          <AiTile i={i} size={24} radius={7} />
                        </span>
                      ))}
                    </Bead>
                    <span className="w-[52px]" />
                  </span>
                  {/* Conversazione */}
                  <span className="block p-6">
                    <span data-ubub className="ml-auto block w-fit max-w-[82%] rounded-[20px] rounded-br-[6px] bg-white/[.12] px-4 py-2.5 text-[15px] leading-[1.45]">
                      {s.ask.split("").map((c, i) => (
                        <span key={i} data-ch>
                          {c}
                        </span>
                      ))}
                    </span>
                    <span className="mt-6 grid grid-cols-[34px_minmax(0,1fr)] gap-3.5">
                      <span className="relative mt-0.5 h-[34px] w-[34px]">
                        {ASSISTANTS.map((a, i) => (
                          <span key={a.n} data-av className={`absolute inset-0 ${i ? "opacity-0" : ""}`}>
                            <AiTile i={i} size={34} radius={10} />
                          </span>
                        ))}
                      </span>
                      <span className="grid">
                        {/* Fase di ricerca delle fonti */}
                        <span data-seek className="block [grid-area:1/1]">
                          <span className="geo-shimmer text-[14.5px] font-medium">{s.searching}…</span>
                          <span className="mt-3 flex flex-wrap gap-2">
                            {sources.map((x) => (
                              <Bead key={x.l} data-src {...(x.hl ? { "data-hl": "" } : {})} tint="rgba(255,255,255,.08)" className="relative flex h-8 items-center gap-2 px-3 text-[12.5px] text-white/85">
                                <Ico i={x.i} s={12} />
                                {x.l}
                                {x.hl && <span data-ring className="pointer-events-none absolute inset-0 rounded-full opacity-0 shadow-[inset_0_0_0_1.5px_var(--sky),0_0_22px_rgba(94,196,255,.45)]" />}
                              </Bead>
                            ))}
                          </span>
                        </span>
                        {/* Risposta finale con indicatore fonti lette e nota [1] */}
                        <span className="block [grid-area:1/1]">
                          <span data-read className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/[.07] px-2.5 py-0.5 text-[11.5px] text-white/65 ring-1 ring-inset ring-white/10">
                            <Globe size={11} strokeWidth={1.8} />
                            {s.sourcesRead}
                          </span>
                          <span className="block text-[16px] leading-[1.6] text-white/92">
                            {words(s.answer[0], "data-aw")}
                            <span data-aw className="relative inline-block font-semibold text-white">
                              {s.answer[1]}
                              <span data-mark className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full bg-[var(--sky)]" style={{ transform: "scaleX(0)" }} />
                            </span>
                            {words(s.answer[2], "data-aw")}
                            <span
                              data-ref
                              className="ml-0.5 inline-flex h-[18px] min-w-[18px] -translate-y-0.5 items-center justify-center rounded-full bg-white/[.14] px-1.5 align-middle font-mono text-[10.5px] font-medium text-[var(--brand-sky)] ring-1 ring-inset ring-white/15"
                            >
                              1
                            </span>
                          </span>
                        </span>
                      </span>
                    </span>
                    {/* Scheda fonte in calce alla risposta, come nelle chat AI in produzione */}
                    <span data-cite className="ml-[48px] mt-4 block">
                      <span className="flex items-center gap-3.5 rounded-[18px] bg-white/[.07] p-3.5 ring-1 ring-inset ring-white/[.12]">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white/[.1] font-mono text-[12px] font-semibold text-[var(--brand-sky)] ring-1 ring-inset ring-white/10">
                          1
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 text-[11.5px] text-white/55">
                            <Globe size={11} strokeWidth={1.8} />
                            <span className="truncate">{s.sourceUrl}</span>
                          </span>
                          <span className="mt-0.5 block truncate text-[13.5px] font-medium leading-[1.3] text-white">{s.sourceTitle}</span>
                          <span className="mt-0.5 block truncate text-[12px] text-white/60">{s.sourceSub}</span>
                        </span>
                        <ArrowUpRight size={16} strokeWidth={1.8} className="shrink-0 text-white/50" />
                      </span>
                    </span>
                  </span>
                </Bead>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── 3. Cosa ricevi: bento approvato (1 card grande col gradiente + 4 card chiare) ───────────── */

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

/* ───────────── 5. Chiusura approvata ───────────── */

function Close({ copy, t }: Pick<GeoPageProps, "copy" | "t">) {
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
      <Close copy={copy} t={t} />
      <Next next={p.next} others={p.others} t={t} />
    </div>
  );
}
