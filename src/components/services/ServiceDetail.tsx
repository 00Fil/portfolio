"use client";

import { useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ServiceKey } from "@/content/services";
import { prefersReducedMotion } from "@/lib/env";
import { onIntroLift } from "@/lib/intro";
import { Drop } from "@/components/glass/Drop";
import { Bead } from "@/components/glass/Bead";
import { ServiceBg } from "@/components/sections/ServiceBg";
import { ServiceVisual, type WidgetText } from "@/components/sections/ServiceWidgets";
import LogoLoop from "@/components/reactbits/LogoLoop";
import { ServiceIcon } from "./ServiceIcon";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

type Item = { title: string; body: string };
type Phase = { name: string; title: string; out: string };
type Other = { slug: string; k: ServiceKey; label: string; title: string; short: string };

export type ServiceDetailProps = {
  k: ServiceKey;
  need: number;
  label: string;
  title: string;
  short: string;
  lead: string;
  includes: Item[];
  stack: { name: string; path?: string }[];
  phases: Phase[];
  next: Other;
  others: { slug: string; k: ServiceKey; title: string }[];
  w: WidgetText;
  t: { services: string; cta: string; includes: string; tech: string; method: string; methodLead: string; next: string; all: string; };
};

const pad = (n: number) => String(n).padStart(2, "0");

/* ───────────── Apertura: titolo a sinistra, il servizio in movimento a destra ───────────── */

function Hero({ k, need, label, title, short, w, t }: ServiceDetailProps) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const split = SplitText.create("[data-h1]", { type: "words", mask: "words" });
      // parte quando il telo d'apertura inizia ad alzarsi (subito, se non c'è)
      const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      onIntroLift(() => intro.play());
      intro
        .from("[data-island]", { clipPath: "inset(6% 4% 6% 4% round 60px)", duration: 1.4, ease: "expo.inOut" })
        .from(split.words, { yPercent: 110, duration: 1.2, stagger: 0.06 }, 0.5)
        .from("[data-hrest]", { y: 18, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.8)
        .from("[data-hvis]", { autoAlpha: 0, scale: 0.94, filter: "blur(14px)", duration: 1.4, clearProps: "filter" }, 0.6);
      // uscendo, la tela si stringe appena
      gsap.to("[data-island]", { scale: 0.96, borderRadius: 56, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
    },
    { scope: root },
  );
  return (
    <section ref={root} className="px-3 pt-[calc(var(--bar-h)+20px)] sm:px-5">
      <div data-island className="theme-dark relative mx-auto max-w-[1400px] overflow-hidden rounded-[32px] bg-[#05070a] [clip-path:inset(0_0_0_0_round_0)] sm:rounded-[44px]">
        <ServiceBg k={k} live />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,6,10,.72)_0%,rgba(3,6,10,.35)_42%,transparent_70%)]" />
        <div className="relative grid lg:min-h-[min(880px,calc(100svh-var(--bar-h)-40px))] lg:grid-cols-12">
          <div className="flex flex-col justify-between gap-10 px-6 pb-2 pt-8 sm:px-12 sm:pb-14 sm:pt-12 lg:col-span-6 lg:px-14">
            <p className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.14em] text-white/70" data-hrest>
              <Link href="/#approach" className="transition-colors hover:text-white">
                {t.services}
              </Link>
              <span className="h-px w-6 bg-white/35" />
              {label}
            </p>
            <div>
              <h1 data-h1 className="max-w-[11ch] text-[clamp(44px,6.6vw,112px)] font-medium leading-[0.94] tracking-[-0.055em] text-white">
                {title}
              </h1>
              <p className="mt-5 max-w-[40ch] text-[16px] leading-[1.55] text-white/80 sm:mt-7 sm:text-[18px]" data-hrest>
                {short}
              </p>
              <div className="mt-7 sm:mt-9" data-hrest>
                <Drop href={`#brief-${k}`} accent className="h-[52px] px-6 text-[16px] font-medium text-ink">
                  {t.cta}
                  <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
                </Drop>
              </div>
            </div>
          </div>
          <div data-hvis className="relative h-[300px] sm:h-[440px] lg:col-span-6 lg:h-auto">
            <div className="absolute inset-0 lg:inset-y-10 lg:right-10">
              <ServiceVisual k={k} t={w} max={1.6} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── La promessa, letta parola per parola scorrendo ───────────── */

function Statement({ lead }: { lead: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const split = SplitText.create("[data-st]", { type: "words" });
      gsap.fromTo(split.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 45%", scrub: true } });
    },
    { scope: root },
  );
  return (
    <div ref={root} className="mx-auto w-full max-w-[1280px] px-5 py-20 sm:px-8 sm:py-40">
      <p data-st className="max-w-[24ch] text-[clamp(28px,4.2vw,64px)] font-medium leading-[1.1] tracking-[-0.04em] text-ink">
        {lead}
      </p>
    </div>
  );
}

/* ───────────── Cosa include: tele che si impilano una sull'altra ───────────── */

function Includes({ k, label, includes, t }: ServiceDetailProps) {
  const root = useRef<HTMLElement>(null);
  const [at, setAt] = useState(0);
  const [small, setSmall] = useState(false);
  const n = includes.length;
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // computer: tele impilate mentre scorri
      mm.add("(min-width: 1024px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-inner]");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "[data-stack]",
            start: "top 20%",
            end: "bottom bottom",
            scrub: prefersReducedMotion() ? false : 0.6,
            onUpdate: (s) => setAt(Math.min(n - 1, Math.floor(s.progress * n))),
          },
        });
        if (prefersReducedMotion()) return;
        cards.slice(0, -1).forEach((c, i) => {
          tl.to(c, { scale: 0.92 - (n - 2 - i) * 0.015, yPercent: -2, ease: "none", duration: 1 }, i);
        });
        gsap.utils.toArray<HTMLElement>("[data-card]").forEach((c) => {
          gsap.from(c.querySelectorAll("[data-in]"), { y: 40, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "expo.out", clearProps: "transform", scrollTrigger: { trigger: c, start: "top 70%", once: true } });
        });
      });
      // telefono: le tele una sotto l'altra, ognuna entra quando arriva
      mm.add("(max-width: 1023px)", () => {
        setSmall(true);
        if (prefersReducedMotion()) return;
        gsap.utils.toArray<HTMLElement>("[data-card]").forEach((c) =>
          gsap.from(c, { y: 40, autoAlpha: 0, duration: 0.9, ease: "expo.out", clearProps: "all", scrollTrigger: { trigger: c, start: "top 90%", once: true } }),
        );
        return () => setSmall(false);
      });
      return () => mm.revert();
    },
    { scope: root },
  );
  return (
    <section ref={root} id="include" className="mx-auto w-full max-w-[1400px] scroll-mt-10 px-3 sm:px-5">
      <header className="mx-auto mb-8 flex max-w-[1280px] items-end justify-between gap-8 px-2 sm:mb-16 sm:px-3">
        <h2 className="text-[clamp(40px,5vw,72px)] font-medium leading-none tracking-[-0.05em] text-ink">{t.includes}</h2>
        <p className="hidden font-mono text-[13px] tabular-nums tracking-[0.1em] text-ink-3 lg:block">
          {pad(at + 1)} / {pad(n)}
        </p>
      </header>
      <div data-stack className="grid gap-3 lg:block">
        {includes.map((it, i) => (
          <article key={it.title} data-card className="lg:sticky lg:pb-[8vh] lg:last:pb-0" style={{ top: `calc(var(--bar-h) + 20px + ${i * 12}px)` }}>
            <div data-inner className="theme-dark relative h-[360px] origin-top sm:h-[440px] lg:h-[min(640px,calc(100svh-var(--bar-h)-80px))] overflow-hidden rounded-[32px] bg-[#05070a] shadow-[0_-30px_60px_-40px_rgba(0,0,0,.6)] sm:rounded-[40px]">
              <ServiceBg k={k} v={i} still={small} active={small || i === at || i === at + 1} />
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(3,6,10,.7)_0%,rgba(3,6,10,.25)_55%,transparent_80%)]" />
              <span aria-hidden className="pointer-events-none absolute -bottom-[0.2em] right-[0.02em] select-none text-[clamp(150px,30vw,440px)] font-medium leading-none tracking-[-0.08em] text-white/[0.14]">
                {pad(i + 1)}
              </span>
              <div className="relative flex h-full flex-col justify-between p-6 sm:p-12 lg:p-14">
                <p className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.14em] text-white/65" data-in>
                  {pad(i + 1)} / {pad(n)}
                  <span className="h-px w-6 bg-white/30" />
                  {label}
                </p>
                <div>
                  <h3 className="max-w-[16ch] text-[clamp(30px,4.6vw,76px)] font-medium leading-[0.98] tracking-[-0.05em] text-white" data-in>
                    {it.title}
                  </h3>
                  <p className="mt-4 max-w-[44ch] text-[clamp(15px,1.3vw,19px)] sm:mt-6 leading-[1.6] text-white/78" data-in>
                    {it.body}
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Come lavoro: cinque tappe su una linea che si riempie ───────────── */

function Method({ phases, t }: ServiceDetailProps) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const dots = gsap.utils.toArray<HTMLElement>("[data-mdot]");
      const steps = gsap.utils.toArray<HTMLElement>("[data-mstep]");
      const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-mline]", start: "top 80%", end: "top 30%", scrub: 0.6 } });
      tl.fromTo("[data-mfill]", { scaleX: 0, scaleY: 0 }, { scaleX: 1, scaleY: 1, ease: "none", duration: dots.length });
      dots.forEach((d, i) => {
        tl.fromTo(d, { backgroundColor: "var(--bg-canvas)" }, { backgroundColor: "var(--label-primary)", duration: 0.2 }, i + 0.1).fromTo(steps[i], { opacity: 0.3 }, { opacity: 1, duration: 0.4 }, i);
      });
    },
    { scope: root },
  );
  return (
    <section ref={root} className="mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-44">
      <header className="mb-14 grid gap-4 sm:mb-20 sm:grid-cols-[1fr_auto] sm:items-end">
        <h2 className="text-[clamp(40px,5vw,72px)] font-medium leading-none tracking-[-0.05em] text-ink">{t.method}</h2>
        <p className="max-w-[40ch] text-[17px] text-ink-2 sm:text-right">{t.methodLead}</p>
      </header>
      <ol data-mline className="relative grid gap-10 pl-9 lg:grid-cols-5 lg:gap-8 lg:pl-0 lg:pt-12">
        <span aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px bg-[var(--hair-strong)] lg:inset-x-0 lg:bottom-auto lg:top-[7px] lg:h-px lg:w-auto">
          <span data-mfill className="absolute inset-0 origin-top bg-ink lg:origin-left" />
        </span>
        {phases.map((p, i) => (
          <li key={p.name} data-mstep className="relative">
            <span data-mdot aria-hidden className="absolute -left-9 top-1 h-[15px] w-[15px] rounded-full bg-canvas shadow-[inset_0_0_0_1.5px_var(--label-primary)] lg:-top-12 lg:left-0" />
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">
              {pad(i + 1)} · {p.name}
            </p>
            <p className="mt-3 text-[20px] font-medium leading-[1.2] tracking-[-0.025em] text-ink">{p.title}</p>
            <p className="mt-4 text-[14px] text-ink-3">→ {p.out}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ───────────── Tecnologie: un nastro che scorre ───────────── */

function Tech({ stack, t }: ServiceDetailProps) {
  const logos = useMemo(
    () =>
      stack.map((s) => ({
        title: s.name,
        node: (
          <span className="flex items-center gap-3 whitespace-nowrap text-[clamp(22px,2.4vw,34px)] font-medium tracking-[-0.03em] text-ink-2">
            {s.path && (
              <svg viewBox="0 0 24 24" className="h-[0.85em] w-[0.85em] fill-current text-ink-3" aria-hidden>
                <path d={s.path} />
              </svg>
            )}
            {s.name}
          </span>
        ),
      })),
    [stack],
  );
  return (
    <section className="mx-auto mt-24 w-full max-w-[1280px] px-5 sm:mt-44 sm:px-8">
      <p className="mb-8 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">{t.tech}</p>
      <div className="border-y border-[var(--hair)] py-8">
        <LogoLoop logos={logos} speed={32} direction="left" logoHeight={40} gap={64} pauseOnHover fadeOut scaleOnHover ariaLabel={t.tech} />
      </div>
    </section>
  );
}

/* ───────────── In fondo: il servizio successivo, grande, e tutti gli altri ───────────── */

function Next({ next, others, t }: ServiceDetailProps) {
  return (
    <section className="mx-auto mt-24 w-full max-w-[1400px] px-3 sm:mt-44 sm:px-5">
      <Link href={`/servizi/${next.slug}`} className="group theme-dark relative block h-[420px] overflow-hidden sm:h-[min(560px,72svh)] rounded-[32px] bg-[#05070a] sm:rounded-[44px]">
        <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.04]">
          <ServiceBg k={next.k} live />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(3,6,10,.6)_0%,transparent_60%)]" />
        <div className="relative flex h-full flex-col justify-between p-7 sm:p-12 lg:p-14">
          <div className="flex items-start justify-between gap-6">
            <p className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.14em] text-white/70">
              {t.next}
              <span className="h-px w-6 bg-white/35" />
              {next.label}
            </p>
            <Bead tint="rgba(255,255,255,.14)" className="flex h-14 w-14 items-center justify-center text-white transition-transform duration-700 ease-[var(--ease-out)] group-hover:rotate-45">
              <ArrowUpRight size={22} strokeWidth={1.6} aria-hidden />
            </Bead>
          </div>
          <div>
            <h2 className="max-w-[14ch] text-[clamp(48px,8vw,136px)] font-medium leading-[0.92] tracking-[-0.06em] text-white transition-transform duration-700 ease-[var(--ease-out)] group-hover:-translate-y-2">
              {next.title}
            </h2>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.55] text-white/75">{next.short}</p>
          </div>
        </div>
      </Link>
      <nav aria-label={t.all} className="mx-auto mt-16 max-w-[1280px] px-2 sm:px-3">
        <p className="mb-6 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">{t.all}</p>
        <ul className="grid border-t border-[var(--hair)] sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-10">
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

export function ServiceDetail(p: ServiceDetailProps) {
  return (
    <>
      <Hero {...p} />
      <Statement lead={p.lead} />
      <Includes {...p} />
      <Method {...p} />
      {p.stack.length > 0 && <Tech {...p} />}
      <Next {...p} />
    </>
  );
}
