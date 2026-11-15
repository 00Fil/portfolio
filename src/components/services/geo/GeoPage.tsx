"use client";

/*
 * La pagina del servizio GEO, costruita come una pagina prodotto Apple: una frase forte per schermata,
 * una scena che si svolge scorrendo, tessere di vetro liquido sopra i gradienti delle schede dei servizi.
 * Il filo conduttore è la riga con i nomi degli assistenti e i loro marchi, con lo stesso movimento dello spot.
 */

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Analytics01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  DatabaseIcon,
  FileScriptIcon,
  LockKeyIcon,
  MapsLocation01Icon,
  QuoteDownIcon,
  StarIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Drop } from "@/components/glass/Drop";
import { Bead } from "@/components/glass/Bead";
import { ServiceBg } from "@/components/sections/ServiceBg";
import { prefersReducedMotion } from "@/lib/env";
import { onIntroLift } from "@/lib/intro";
import { play as sfx } from "@/lib/sound";
import type { GeoCopy } from "@/content/geo";
import type { ServiceStory } from "@/content/stories";
import { Next, type ServiceDetailProps } from "../ServiceDetail";
import { AiTile, AssistantLine, ASSISTANTS, playLine } from "./Assistants";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export type GeoPageProps = { copy: GeoCopy; tale: ServiceStory } & Pick<ServiceDetailProps, "next" | "others" | "t">;

const K = "geo" as const;
const pad = (n: number) => String(n).padStart(2, "0");
const Ico = ({ i, s = 18, c = "" }: { i: typeof Add01Icon; s?: number; c?: string }) => <HugeiconsIcon icon={i} size={s} strokeWidth={1.7} className={c} />;

/* titoli e occhielli, come nelle pagine prodotto: occhiello in gradiente, titolo grande e stretto */
const kick = "geo-grad inline-block text-[15px] font-semibold tracking-[-0.01em] sm:text-[19px]";
const h2 = "text-[clamp(38px,5.4vw,80px)] font-semibold leading-[1.02] tracking-[-0.05em] text-ink";
/* una tessera sul fondo della pagina: chiara nel tema chiaro, quasi nera nello scuro */
const tile = "rounded-[32px] bg-[var(--chip)] ring-1 ring-inset ring-[var(--hair)] sm:rounded-[40px]";

/** Parole separate, per farle entrare una alla volta. */
const words = (s: string, attr: string, cls = "") =>
  s
    .trim()
    .split(" ")
    .map((w, i) => (
      <span key={i} {...{ [attr]: "" }} className={`inline-block ${cls}`}>
        {w}&nbsp;
      </span>
    ));

/** Adatta un oggetto disegnato a misura fissa allo spazio che ha: si rimpicciolisce sui telefoni, cresce appena sui grandi schermi. */
function useFit(box: RefObject<HTMLDivElement | null>, inner: RefObject<HTMLDivElement | null>, max = 1.12) {
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

/* ───────────── Apertura: la domanda di tutti, la risposta con il tuo nome ───────────── */

function Hero({ copy, t }: Pick<GeoPageProps, "copy" | "t">) {
  const h = copy.hero;
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = root.current!;
      const ask = el.querySelector<HTMLElement>("[data-ask]")!;
      if (prefersReducedMotion()) {
        ask.textContent = h.ask;
        return;
      }
      // la barra della domanda: scrive, invia, ricomincia con l'assistente successivo
      const tiles = gsap.utils.toArray<HTMLElement>("[data-ptile]", el);
      const send = el.querySelector("[data-send]")!;
      const loop = gsap.timeline({ paused: true, repeat: -1 });
      let at = 0;
      ASSISTANTS.forEach((_, i) => {
        const o = { n: 0 };
        loop
          .call(() => void (ask.textContent = ""), undefined, at)
          .set(ask, { autoAlpha: 1, y: 0 }, at)
          .set(tiles, { autoAlpha: (k: number) => (k === i ? 1 : 0) }, at)
          .fromTo(tiles[i], { scale: 0.6 }, { scale: 1, duration: 0.6, ease: "expo.out" }, at)
          .fromTo(o, { n: 0 }, { n: h.ask.length, duration: h.ask.length * 0.042, ease: "none", onUpdate: () => void (ask.textContent = h.ask.slice(0, Math.round(o.n))) }, at + 0.35);
        at += 0.35 + h.ask.length * 0.042 + 0.7;
        loop
          .call(() => sfx("send"), undefined, at)
          .to(send, { scale: 0.86, duration: 0.09, ease: "power2.out" }, at)
          .to(send, { scale: 1, duration: 0.55, ease: "elastic.out(1,0.45)" }, at + 0.09)
          .to(ask, { autoAlpha: 0, y: -10, duration: 0.35, ease: "power2.in" }, at + 0.25);
        at += 1.1;
      });
      let ready = false;
      let seen = true;
      const split = SplitText.create("[data-h1a]", { type: "words", mask: "words" });
      const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      onIntroLift(() => intro.play());
      intro
        .from("[data-island]", { clipPath: "inset(6% 4% 6% 4% round 60px)", duration: 1.4, ease: "expo.inOut" })
        .from("[data-eyebrow]", { y: 14, autoAlpha: 0, duration: 1 }, 0.45)
        .from(split.words, { yPercent: 110, duration: 1.2, stagger: 0.06 }, 0.5)
        .from("[data-h1b]", { yPercent: 110, duration: 1.3 }, 0.72);
      playLine(intro, el.querySelector("[data-aline]")!, 1.1);
      intro
        .from("[data-hrest]", { y: 18, autoAlpha: 0, duration: 1, stagger: 0.08 }, 1.55)
        .from("[data-prompt]", { y: 46, autoAlpha: 0, scale: 0.94, filter: "blur(14px)", duration: 1.4, clearProps: "filter" }, 1.6)
        .call(
          () => {
            ready = true;
            if (seen) loop.play();
          },
          undefined,
          2.5,
        );
      // la barra lavora solo mentre l'apertura è sullo schermo
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          seen = self.isActive;
          if (ready) void (seen ? loop.play() : loop.pause());
        },
      });
      // uscendo, la tela si stringe appena
      gsap.to("[data-island]", { scale: 0.96, borderRadius: 56, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
    },
    { scope: root },
  );
  return (
    <section ref={root} className="px-3 pt-[calc(var(--bar-h)+20px)] sm:px-5">
      <div
        data-island
        className="theme-dark relative mx-auto flex max-w-[1400px] flex-col overflow-hidden rounded-[32px] bg-[#05070a] [clip-path:inset(0_0_0_0_round_0)] sm:rounded-[44px] lg:min-h-[min(960px,calc(100svh-var(--bar-h)-40px))]"
      >
        <ServiceBg k={K} live />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_70%_at_50%_40%,rgba(3,6,10,.66),rgba(3,6,10,.3)_62%,rgba(3,6,10,.12))]" />
        <div className="relative flex flex-1 flex-col items-center px-5 pb-6 pt-12 text-center sm:px-10 sm:pb-10 sm:pt-20 lg:pt-24">
          <Bead data-eyebrow tint="rgba(255,255,255,.1)" className="liquid inline-flex h-9 items-center gap-2.5 px-4 text-[13px] font-medium text-white/85">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--sky)] shadow-[0_0_10px_var(--sky)]" />
            {h.eyebrow}
          </Bead>
          <h1 className="mt-7 text-[clamp(40px,7vw,112px)] font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:mt-9">
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
          <p data-hrest className="mt-6 max-w-[54ch] text-[16px] leading-[1.55] text-white/75 sm:mt-8 sm:text-[19px]">
            {h.sub}
          </p>
          <div data-hrest className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            <Drop href={`#brief-${K}`} accent className="h-[52px] px-6 text-[16px] font-medium text-ink">
              {t.cta}
              <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
            </Drop>
            <a href="#come-funziona" className="group inline-flex h-[52px] items-center gap-2 text-[16px] font-medium text-white/85 transition-colors hover:text-white">
              {h.how}
              <ArrowRight size={17} strokeWidth={1.8} className="rotate-90 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden />
            </a>
          </div>
          {/* la domanda che un cliente fa, a ogni assistente: vetro liquido sopra il gradiente */}
          <div aria-hidden className="mt-auto w-full pt-12 sm:pt-16">
            <Bead
              data-prompt
              tint="rgba(14,22,32,.38)"
              radius={32}
              className="liquid mx-auto flex h-[64px] w-full max-w-[640px] items-center gap-3 pl-3 pr-3 text-left sm:h-[72px] sm:pl-3.5"
            >
              <span className="relative h-10 w-10 shrink-0 sm:h-11 sm:w-11">
                {ASSISTANTS.map((a, i) => (
                  <span key={a.n} data-ptile className={`absolute inset-0 ${i ? "opacity-0" : ""}`}>
                    <AiTile i={i} size="100%" radius={12} />
                  </span>
                ))}
              </span>
              <span className="flex min-w-0 flex-1 items-center text-[15px] text-white sm:text-[17px]">
                <span data-ask className="truncate" />
                <span className="ml-0.5 h-5 w-[1.5px] shrink-0 animate-[geoBlink_1.05s_steps(1)_infinite] bg-[var(--sky)]" />
              </span>
              <Bead data-send tint="sky" className="flex h-11 w-11 shrink-0 items-center justify-center text-white sm:h-12 sm:w-12">
                <Ico i={ArrowUp01Icon} s={20} />
              </Bead>
            </Bead>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Cosa è cambiato: la frase si accende scorrendo, poi tre numeri ───────────── */

function Shift({ copy, facts }: { copy: GeoCopy; facts: ServiceStory["facts"] }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-sw]", { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: "[data-shift]", start: "top 80%", end: "bottom 50%", scrub: true } });
    },
    { scope: root },
  );
  return (
    <section ref={root} className="mx-auto w-full max-w-[1180px] px-5 pt-28 sm:px-8 sm:pt-48">
      <p data-rise className={kick}>
        {copy.shift.kicker}
      </p>
      <p data-shift className="mt-6 text-[clamp(30px,4.6vw,68px)] font-semibold leading-[1.08] tracking-[-0.045em] text-ink">
        {words(copy.shift.text, "data-sw")}
        {words(copy.shift.accent, "data-sw", "text-[var(--sky)]")}
      </p>
      <dl className="mt-20 grid gap-10 border-t border-[var(--hair-strong)] pt-10 sm:mt-28 sm:grid-cols-3 sm:gap-8">
        {facts.map((f) => (
          <div key={f.v} data-rise>
            <dt className="geo-grad text-[clamp(38px,4.2vw,60px)] font-semibold leading-[1.05] tracking-[-0.05em]">{f.v}</dt>
            <dd className="mt-4 max-w-[30ch] text-[16px] leading-[1.55] text-ink-2">{f.l}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ───────────── La scena: scorrendo, una domanda diventa una risposta che ti nomina e ti cita ───────────── */

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
      // 0 → 1 · la domanda arriva e si scrive
      tl.fromTo(q("[data-ubub]"), { autoAlpha: 0, y: 24, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.25, ease: "power2.out" }, 0.02).fromTo(
        chars,
        { opacity: 0 },
        { opacity: 1, duration: 0.01, stagger: 0.6 / chars.length },
        0.2,
      );
      // 1 → 2 · l'assistente legge le fonti; la scelta passa da un assistente all'altro, la fonte giusta si accende
      tl.fromTo(q("[data-seek]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 1).fromTo(
        q("[data-src]"),
        { autoAlpha: 0, y: 14, scale: 0.9 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.22, stagger: 0.14, ease: "power2.out" },
        1.1,
      );
      [1, 2, 3, 0].forEach((p, j) => {
        const at = 1.1 + j * 0.18;
        tl.to(q("[data-thumb]"), { x: p * TAB, duration: 0.14, ease: "power2.inOut" }, at).to(q("[data-av]"), { opacity: (k: number) => (k === p ? 1 : 0), duration: 0.1 }, at);
      });
      tl.to(q("[data-src]:not([data-hl])"), { opacity: 0.35, duration: 0.15 }, 1.72).fromTo(q("[data-ring]"), { opacity: 0 }, { opacity: 1, duration: 0.15 }, 1.72);
      // 2 → 3 · risponde, parola per parola, e il tuo nome si sottolinea
      tl.to(q("[data-seek]"), { autoAlpha: 0, y: -10, duration: 0.15 }, 2)
        .fromTo(aw, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.06, stagger: 0.6 / aw.length }, 2.08)
        .fromTo(q("[data-mark]"), { scaleX: 0 }, { scaleX: 1, duration: 0.2 }, 2.75);
      // 3 → 4 · ti cita come fonte
      tl.fromTo(q("[data-cite]"), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" }, 3).fromTo(
        q("[data-badge]"),
        { scale: 0.4, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.25, ease: "back.out(2.2)" },
        3.22,
      );
      tl.to({}, { duration: 0.5 }, 3.5);
      // le didascalie a sinistra: una per passo, con la barra che si riempie
      const caps = q("[data-cap]");
      const bars = q("[data-pbar]");
      caps.forEach((c, i) => {
        if (i) tl.fromTo(c, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power2.out" }, i);
        if (i < caps.length - 1) tl.to(c, { autoAlpha: 0, y: -26, duration: 0.18, ease: "power2.in" }, i + 0.8);
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
    { l: "studiobianchi.it", i: LockKeyIcon, hl: true },
    { l: copy.hero.and === "and" ? "Reviews" : "Recensioni", i: StarIcon },
    { l: copy.hero.and === "and" ? "Maps" : "Mappe", i: MapsLocation01Icon },
  ];
  return (
    <section id="come-funziona" ref={root} className="geo-scene relative mt-24 h-[440svh] px-3 sm:mt-40 sm:px-5">
      <div className="geo-stick sticky top-[calc(var(--bar-h)+12px)] h-[calc(100svh-var(--bar-h)-24px)] min-h-[560px]">
        <div className="theme-dark relative mx-auto h-full max-w-[1400px] overflow-hidden rounded-[32px] bg-[#05070a] sm:rounded-[44px]">
          <ServiceBg k={K} v={1} />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,6,10,.72),rgba(3,6,10,.35)_50%,rgba(3,6,10,.2))] lg:bg-[linear-gradient(90deg,rgba(3,6,10,.74),rgba(3,6,10,.32)_55%,rgba(3,6,10,.14))]" />
          <div className="relative grid h-full grid-rows-[auto_minmax(0,1fr)] gap-5 p-6 sm:p-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:grid-rows-1 lg:gap-12 lg:p-14">
            <div className="flex flex-col lg:justify-between">
              <div>
                <p className={kick}>{s.kicker}</p>
                <h2 className="mt-3 hidden max-w-[13ch] text-[clamp(30px,3.9vw,62px)] font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:block">{s.title}</h2>
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
                      <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-white/50">
                        {pad(i + 1)} / {pad(s.steps.length)}
                      </p>
                      <p className="mt-2 text-[clamp(22px,2.4vw,36px)] font-semibold leading-[1.1] tracking-[-0.04em] text-white">{st.t}</p>
                      <p className="mt-2.5 max-w-[38ch] text-[14.5px] leading-[1.55] text-white/70 sm:mt-3 sm:text-[17px]">{st.b}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div ref={box} className="geo-fit relative min-h-0">
              <div ref={win} aria-hidden className="absolute left-1/2 top-1/2 w-[520px]" style={{ transform: "translate(-50%, -50%)" }}>
                <Bead tint="rgba(12,18,26,.46)" radius={30} className="liquid block overflow-hidden text-white">
                  <span className="flex items-center justify-between border-b border-white/[.08] px-4 py-3">
                    <span className="flex w-[52px] gap-1.5">
                      {[0, 1, 2].map((d) => (
                        <span key={d} className="h-2.5 w-2.5 rounded-full bg-white/20" />
                      ))}
                    </span>
                    {/* un solo comando a capsula, il cursore di vetro scivola sull'assistente scelto */}
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
                  <span className="block p-6">
                    <span data-ubub className="ml-auto block w-fit max-w-[82%] rounded-[20px] rounded-br-[6px] bg-white/[.12] px-4 py-2.5 text-[15.5px] leading-[1.45]">
                      {s.ask.split("").map((c, i) => (
                        <span key={i} data-ch>
                          {c}
                        </span>
                      ))}
                    </span>
                    <span className="mt-6 grid grid-cols-[34px_minmax(0,1fr)] gap-3.5">
                      <span className="relative h-[34px] w-[34px]">
                        {ASSISTANTS.map((a, i) => (
                          <span key={a.n} data-av className={`absolute inset-0 ${i ? "opacity-0" : ""}`}>
                            <AiTile i={i} size={34} radius={10} />
                          </span>
                        ))}
                      </span>
                      <span className="grid">
                        <span data-seek className="block [grid-area:1/1]">
                          <span className="geo-shimmer text-[15px] font-medium">{s.searching}…</span>
                          <span className="mt-3.5 flex flex-wrap gap-2">
                            {sources.map((x) => (
                              <Bead key={x.l} data-src {...(x.hl ? { "data-hl": "" } : {})} tint="rgba(255,255,255,.08)" className="relative flex h-9 items-center gap-2 px-3.5 text-[13px] text-white/85">
                                <Ico i={x.i} s={13} />
                                {x.l}
                                {x.hl && <span data-ring className="pointer-events-none absolute inset-0 rounded-full opacity-0 shadow-[inset_0_0_0_1.5px_var(--sky),0_0_26px_rgba(94,196,255,.5)]" />}
                              </Bead>
                            ))}
                          </span>
                        </span>
                        <span className="block text-[17px] leading-[1.6] text-white/90 [grid-area:1/1]">
                          {words(s.answer[0], "data-aw")}
                          <span data-aw className="relative inline-block font-semibold text-white">
                            {s.answer[1]}
                            <span data-mark className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full bg-[var(--sky)]" style={{ transform: "scaleX(0)" }} />
                          </span>
                          {words(s.answer[2], "data-aw")}
                        </span>
                      </span>
                    </span>
                    <span data-cite className="ml-[48px] mt-5 block border-t border-white/[.08] pt-4">
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">{s.sources}</span>
                      <span className="mt-2.5 flex items-center gap-3">
                        <Bead tint="rgba(94,196,255,.18)" className="flex h-10 items-center gap-2 px-4 text-[14px] text-white">
                          <Ico i={LockKeyIcon} s={13} />
                          studiobianchi.it
                        </Bead>
                        <span data-badge className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sky)] px-3 py-1.5 text-[12.5px] font-semibold text-[#03121c] shadow-[0_0_24px_rgba(94,196,255,.45)]">
                          <Ico i={Tick02Icon} s={14} />
                          {s.cites}
                        </span>
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

/* ───────────── Ti riconosci? La frase di oggi si cancella, al suo posto quello che cambia ───────────── */

function Changes({ changes, labels }: { changes: ServiceStory["changes"]; labels: { before: string; after: string } }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-row]").forEach((row) => {
        const q = gsap.utils.selector(row);
        gsap
          .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: row, start: "top 88%", end: "top 50%", scrub: 0.6 } })
          .fromTo(row, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, 0)
          .fromTo(q("[data-strike]"), { "--s": 0 }, { "--s": 1, duration: 0.4 }, 0.35)
          .fromTo(q("[data-from]"), { opacity: 1 }, { opacity: 0.5, duration: 0.3 }, 0.45)
          .fromTo(q("[data-arrow]"), { scale: 0.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.25, ease: "back.out(2)" }, 0.55)
          .fromTo(q("[data-to]"), { x: 30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.35, ease: "power2.out" }, 0.65);
      });
    },
    { scope: root },
  );
  return (
    <section ref={root} className="mx-auto w-full max-w-[1180px] px-5 pt-28 sm:px-8 sm:pt-48">
      <header className="mx-auto max-w-[800px] text-center">
        <h2 data-rise className={h2}>
          {changes.title}
        </h2>
        <p data-rise className="mt-6 text-[18px] leading-[1.5] text-ink-2 sm:text-[21px]">
          {changes.lead}
        </p>
      </header>
      <div aria-hidden className="mt-14 hidden grid-cols-[1fr_44px_1fr] gap-8 px-8 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3 sm:mt-20 sm:grid">
        <span>{labels.before}</span>
        <span />
        <span>{labels.after}</span>
      </div>
      <ul className="mt-6 grid gap-3 sm:mt-4">
        {changes.rows.map((r) => (
          <li key={r.from} data-row className={`grid items-center gap-4 p-6 sm:grid-cols-[1fr_44px_1fr] sm:gap-8 sm:p-8 ${tile}`}>
            <p data-from className="t-serif text-[clamp(22px,2.2vw,30px)] leading-[1.2] text-ink-2">
              <span data-strike className="geo-strike">
                {r.from}
              </span>
            </p>
            <Bead data-arrow tint="sky" className="hidden h-11 w-11 items-center justify-center text-white sm:flex">
              <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
            </Bead>
            <p data-to className="flex items-start gap-3 text-[clamp(18px,1.7vw,22px)] font-semibold leading-[1.3] tracking-[-0.02em] text-ink">
              <Ico i={CheckmarkCircle02Icon} s={22} c="mt-0.5 shrink-0 text-[var(--sky)]" />
              {r.to}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────────── Come funziona: tre schede col gradiente dei servizi, ognuna con il suo oggetto di vetro ───────────── */

function StepTile({ i, t, b, children }: { i: number; t: string; b: string; children: ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <article
      data-tile
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      className="theme-dark relative flex min-h-[560px] flex-col overflow-hidden rounded-[32px] bg-[#05070a] p-7 sm:min-h-[620px] sm:rounded-[40px] sm:p-9"
    >
      <ServiceBg k={K} v={i} live paused={!hover} />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,6,10,.6),rgba(3,6,10,.12)_48%,rgba(3,6,10,.3))]" />
      <div className="relative">
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-white/55">{pad(i + 1)}</p>
        <h3 className="mt-3 max-w-[18ch] text-[clamp(24px,2.1vw,32px)] font-semibold leading-[1.08] tracking-[-0.04em] text-white">{t}</h3>
        <p className="mt-3 max-w-[40ch] text-[15.5px] leading-[1.55] text-white/72">{b}</p>
      </div>
      <div aria-hidden className="relative mt-auto pt-10">
        {children}
      </div>
    </article>
  );
}

const BARS = [88, 74, 81, 34];

function How({ copy, how }: { copy: GeoCopy; how: ServiceStory["how"] }) {
  const c = copy.how;
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tiles = gsap.utils.toArray<HTMLElement>("[data-tile]");
      tiles.forEach((el, i) => {
        const q = gsap.utils.selector(el);
        const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
        tl.fromTo(el, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2 }, 0);
        if (i === 0) {
          // le domande arrivano come i nomi della riga firma: salgono, e il marchio si apre subito dopo
          tl.fromTo(q("[data-qb]"), { yPercent: 35, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.16 }, 0.35).fromTo(
            q("[data-ql]"),
            { scale: 0.6, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, stagger: 0.16 },
            0.5,
          );
        } else if (i === 1) {
          tl.fromTo(q("[data-kv]"), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, 0.4)
            .fromTo(q("[data-ok]"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.12, ease: "back.out(2.4)" }, 0.75)
            .fromTo(q("[data-ready]"), { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(2)" }, 1.3);
        } else {
          tl.fromTo(q("[data-bar]"), { scaleX: 0 }, { scaleX: 1, duration: 1.4, stagger: 0.12, ease: "power3.out" }, 0.4).fromTo(q("[data-st]"), { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.12 }, 1);
        }
        ScrollTrigger.create({ trigger: el, start: "top 82%", once: true, onEnter: () => void tl.play() });
      });
    },
    { scope: root },
  );
  return (
    <section ref={root} className="mx-auto w-full max-w-[1400px] px-3 pt-28 sm:px-5 sm:pt-48">
      <header className="mx-auto grid max-w-[1280px] gap-6 px-2 sm:px-3 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-16">
        <div>
          <p data-rise className={kick}>
            {c.kicker}
          </p>
          <h2 data-rise className={`${h2} mt-4 max-w-[17ch]`}>
            {c.title}
          </h2>
        </div>
        <p data-rise className="text-[18px] leading-[1.55] text-ink-2 sm:text-[20px] lg:pb-3">
          {c.lead}
        </p>
      </header>
      <div className="mx-auto mt-14 grid max-w-[1280px] gap-4 sm:mt-20 lg:grid-cols-3">
        <StepTile i={0} t={how.steps[0].t} b={how.steps[0].b}>
          <div className="grid gap-2.5">
            {c.v1.map((x, j) => (
              <Bead key={x} data-qb tint="rgba(255,255,255,.1)" radius={22} className={`liquid flex items-center gap-3 p-2.5 pr-4 text-[14.5px] text-white ${j === 1 ? "ml-5" : j === 2 ? "ml-2.5" : ""}`}>
                <span data-ql className="inline-flex">
                  <AiTile i={[0, 2, 3][j]} size={34} radius={10} />
                </span>
                <span className="truncate">{x}</span>
              </Bead>
            ))}
          </div>
        </StepTile>
        <StepTile i={1} t={how.steps[1].t} b={how.steps[1].b}>
          <Bead tint="rgba(255,255,255,.1)" radius={24} className="liquid block p-4 text-white">
            <span className="flex items-center justify-between border-b border-white/10 pb-3 text-[12.5px] text-white/65">
              <span className="flex items-center gap-1.5">
                <Ico i={LockKeyIcon} s={12} />
                studiobianchi.it
              </span>
              <span data-ready className="rounded-full bg-[var(--sky)] px-2.5 py-1 text-[11.5px] font-semibold text-[#03121c]">
                {c.ready}
              </span>
            </span>
            {c.v2.map((r) => (
              <span key={r.k} data-kv className="flex items-center gap-3 border-b border-white/[.06] py-2.5 last:border-0">
                <span className="w-[64px] shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-white/45">{r.k}</span>
                <span className="min-w-0 flex-1 truncate text-[14px]">{r.v}</span>
                <span data-ok className="inline-flex text-[var(--sky)]">
                  <Ico i={Tick02Icon} s={16} />
                </span>
              </span>
            ))}
          </Bead>
        </StepTile>
        <StepTile i={2} t={how.steps[2].t} b={how.steps[2].b}>
          <Bead tint="rgba(255,255,255,.1)" radius={24} className="liquid block p-4 text-white">
            <span className="block border-b border-white/10 pb-3 text-[12.5px] text-white/65">{c.v3.title}</span>
            {ASSISTANTS.map((a, j) => (
              <span key={a.n} className="flex items-center gap-3 py-2">
                <AiTile i={j} size={28} radius={8} />
                <span className="w-[74px] shrink-0 text-[13.5px]">{a.n}</span>
                <span className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
                  <span data-bar className="absolute inset-y-0 left-0 origin-left rounded-full bg-[linear-gradient(90deg,#5aa8ff,#5ec4ff,#cfeeff)]" style={{ width: `${BARS[j]}%` }} />
                </span>
                <span data-st className={`w-[78px] shrink-0 text-right text-[11.5px] ${j < 3 ? "text-[var(--sky)]" : "text-white/45"}`}>
                  {j < 3 ? c.v3.mentions : c.v3.soon}
                </span>
              </span>
            ))}
          </Bead>
        </StepTile>
      </div>
    </section>
  );
}

/* ───────────── Cosa ricevi: una griglia di tessere, la più grande con i quattro assistenti ───────────── */

const GET_ICONS = [QuoteDownIcon, DatabaseIcon, FileScriptIcon, Analytics01Icon];

function Gets({ copy, gets }: { copy: GeoCopy; gets: ServiceStory["gets"] }) {
  const [hover, setHover] = useState(false);
  return (
    <section className="mx-auto w-full max-w-[1400px] px-3 pt-28 sm:px-5 sm:pt-48">
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
            <Bead tint="sky" radius={16} className="flex h-12 w-12 items-center justify-center text-white">
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

/* ───────────── Le tappe: una linea che si riempie scorrendo e accende i punti ───────────── */

function Steps({ timeline }: { timeline: ServiceStory["timeline"] }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const dots = gsap.utils.toArray<HTMLElement>("[data-tdot]");
      const steps = gsap.utils.toArray<HTMLElement>("[data-tstep]");
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: "[data-tline]", start: "top 78%", end: "bottom 55%", scrub: 0.6 } });
      tl.fromTo("[data-tfill]", { scaleX: 0, scaleY: 0 }, { scaleX: 1, scaleY: 1, duration: dots.length }, 0);
      dots.forEach((d, i) => {
        tl.fromTo(d, { opacity: 0 }, { opacity: 1, duration: 0.2 }, i + 0.05).fromTo(steps[i], { opacity: 0.32 }, { opacity: 1, duration: 0.4 }, i);
      });
    },
    { scope: root },
  );
  return (
    <section ref={root} className="mx-auto w-full max-w-[1280px] px-5 pt-28 sm:px-8 sm:pt-48">
      <header className="grid gap-5 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-16">
        <h2 data-rise className={`${h2} max-w-[14ch]`}>
          {timeline.title}
        </h2>
        <p data-rise className="text-[18px] leading-[1.55] text-ink-2 lg:pb-3">
          {timeline.lead}
        </p>
      </header>
      <ol data-tline className="relative mt-16 grid gap-10 pl-12 sm:mt-24 lg:grid-cols-5 lg:gap-6 lg:pl-0 lg:pt-16">
        <span aria-hidden className="absolute bottom-4 left-[15px] top-4 w-[2px] rounded-full bg-[var(--hair-strong)] lg:inset-x-4 lg:bottom-auto lg:top-[15px] lg:h-[2px] lg:w-auto">
          <span data-tfill className="absolute inset-0 origin-top rounded-full bg-[linear-gradient(180deg,#5ec4ff,#5aa8ff)] lg:origin-left lg:bg-[linear-gradient(90deg,#5ec4ff,#5aa8ff)]" />
        </span>
        {timeline.items.map((it, i) => (
          <li key={it.t} data-tstep className="relative">
            <span className="absolute -left-12 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-[12.5px] font-semibold text-ink shadow-[inset_0_0_0_1.5px_var(--hair-strong)] lg:-top-16 lg:left-0">
              <span data-tdot className="absolute inset-0 rounded-full bg-[var(--sky)] shadow-[0_0_0_5px_rgba(94,196,255,.16),0_0_22px_rgba(94,196,255,.55)]" />
              <span className="relative">{i + 1}</span>
            </span>
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--sky)]">{it.at}</p>
            <p className="mt-3 text-[20px] font-semibold leading-[1.2] tracking-[-0.03em] text-ink">{it.t}</p>
            <p className="mt-3 text-[15px] leading-[1.55] text-ink-2">{it.b}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ───────────── Patti chiari: cosa garantisco, sul gradiente; cosa non prometto, accanto ───────────── */

function Promise({ copy, promise }: { copy: GeoCopy; promise: ServiceStory["promise"] }) {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-5 pt-28 sm:px-8 sm:pt-48">
      <header className="text-center">
        <p data-rise className={kick}>
          {copy.promise.kicker}
        </p>
        <h2 data-rise className={`${h2} mt-4`}>
          {promise.title}
        </h2>
      </header>
      <div className="mt-14 grid gap-4 sm:mt-20 lg:grid-cols-[1.25fr_1fr]">
        <article data-rise className="theme-dark relative overflow-hidden rounded-[32px] bg-[#05070a] p-8 sm:rounded-[40px] sm:p-11">
          <ServiceBg k={K} v={3} still />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(3,6,10,.55),rgba(3,6,10,.2))]" />
          <ul className="relative grid gap-5">
            {promise.yes.map((y) => (
              <li key={y} className="flex items-start gap-4 text-[17px] leading-[1.5] text-white">
                <Bead tint="rgba(255,255,255,.16)" className="flex h-8 w-8 shrink-0 items-center justify-center">
                  <Ico i={Tick02Icon} s={16} />
                </Bead>
                <span className="pt-1">{y}</span>
              </li>
            ))}
          </ul>
          <div className="relative mt-10 border-t border-white/15 pt-6">
            <p className="text-[17px] font-semibold tracking-[-0.02em] text-white">{promise.me}</p>
            <p className="mt-1.5 max-w-[56ch] text-[14.5px] leading-[1.55] text-white/70">{promise.meLead}</p>
          </div>
        </article>
        <article data-rise className={`p-8 sm:p-11 ${tile}`}>
          <h3 className="text-[clamp(24px,2.2vw,32px)] font-semibold leading-[1.1] tracking-[-0.04em] text-ink">{promise.noTitle}</h3>
          <ul className="mt-8 grid gap-5">
            {promise.no.map((n) => (
              <li key={n} className="flex items-start gap-4 text-[17px] leading-[1.5] text-ink-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--hover)] text-ink-3">
                  <Ico i={Cancel01Icon} s={15} />
                </span>
                <span className="pt-1">{n}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

/* ───────────── Domande: una alla volta ───────────── */

function Faq({ copy, faq }: { copy: GeoCopy; faq: ServiceStory["faq"] }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="mx-auto w-full max-w-[920px] px-5 pt-28 sm:px-8 sm:pt-48">
      <header className="text-center">
        <p data-rise className={kick}>
          {copy.faq.kicker}
        </p>
        <h2 data-rise className={`${h2} mt-4`}>
          {faq.title}
        </h2>
      </header>
      <ul className="mt-12 grid gap-3 sm:mt-16">
        {faq.items.map((it, i) => {
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
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color] duration-500 ease-[var(--ease-out)] ${on ? "rotate-45 bg-[var(--sky)] text-white" : "bg-[var(--hover)] text-ink"}`}>
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

/* ───────────── L'invito: di nuovo la riga firma, poi una frase grande e un solo tasto ───────────── */

function Close({ copy, t }: Pick<GeoPageProps, "copy" | "t">) {
  return (
    <section className="mx-auto mt-28 w-full max-w-[1400px] px-3 sm:mt-48 sm:px-5">
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
      // tutto quello che è segnato sale e si accende quando arriva sullo schermo, a gruppi
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
      <Shift copy={copy} facts={tale.facts} />
      <Scene copy={copy} />
      <Changes changes={tale.changes} labels={{ before: t.before, after: t.after }} />
      <How copy={copy} how={tale.how} />
      <Gets copy={copy} gets={tale.gets} />
      <Steps timeline={tale.timeline} />
      <Promise copy={copy} promise={tale.promise} />
      <Faq copy={copy} faq={tale.faq} />
      <Close copy={copy} t={t} />
      <Next next={p.next} others={p.others} t={t} />
    </div>
  );
}
