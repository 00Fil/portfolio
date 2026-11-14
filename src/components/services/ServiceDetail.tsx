"use client";

import { useRef } from "react";
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
import { ServiceIcon } from "./ServiceIcon";
import { SHOTS, ShotView } from "@/components/sections/Spots";
import type { ServiceStory } from "@/content/stories";
import { Bento, Changes, Facts, Faq, How, OpsScene, Timeline, type Story } from "./ServiceStory";

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
  phases: Phase[];
  next: Other;
  others: { slug: string; k: ServiceKey; title: string }[];
  w: WidgetText;
  story?: Story;
  tale?: ServiceStory | null;
  t: { services: string; cta: string; ctaLead: string; includes: string; before: string; after: string; method: string; methodLead: string; next: string; all: string };
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
              <h1 data-h1 className="max-w-[11ch] hyphens-auto text-[clamp(44px,6.6vw,112px)] font-medium leading-[0.94] tracking-[-0.055em] text-white">
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
            <div className="absolute inset-0">
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

/* ───────────── L'invito, prima di passare oltre: una riga grande e un solo tasto ───────────── */

function Close({ k, t }: ServiceDetailProps) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-cl]", { y: 26, autoAlpha: 0, duration: 1, stagger: 0.09, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 80%", once: true } });
    },
    { scope: root },
  );
  return (
    <section ref={root} className="mx-auto w-full max-w-[1280px] px-5 pt-24 text-center sm:px-8 sm:pt-44">
      <h2 data-cl className="mx-auto max-w-[16ch] text-[clamp(40px,6vw,96px)] font-medium leading-[0.96] tracking-[-0.055em] text-ink">
        {t.cta}
      </h2>
      <p data-cl className="mx-auto mt-6 max-w-[40ch] text-[18px] leading-[1.55] text-ink-2">
        {t.ctaLead}
      </p>
      <div data-cl className="mt-9">
        <Drop href={`#brief-${k}`} accent className="h-[56px] px-7 text-[17px] font-medium text-ink">
          {t.cta}
          <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
        </Drop>
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
  const { tale, story, k } = p;
  // i nove servizi: risultato, cosa cambia, come funziona (con le scene dello spot), cosa ricevi, tappe, domande
  if (tale)
    return (
      <>
        <Hero {...p} />
        <Statement lead={p.lead} />
        <Facts facts={tale.facts} />
        <Changes changes={tale.changes} labels={{ before: p.t.before, after: p.t.after }} />
        <How k={k} how={tale.how} scene={(i, on) => <ShotView shots={SHOTS[k as keyof typeof SHOTS]} i={i} on={on} />} />
        <Bento k={k} title={tale.gets.title} items={tale.gets.items.map((x) => ({ title: x.t, body: x.b }))} />
        <Timeline timeline={tale.timeline} />
        <Faq faq={tale.faq} />
        <Close {...p} />
        <Next {...p} />
      </>
    );
  return (
    <>
      <Hero {...p} />
      <Statement lead={p.lead} />
      {story && (
        <>
          <Facts facts={story.facts} />
          <How k={k} how={story.how} scene={(i, on) => <OpsScene i={i} on={on} ui={story.ui} />} />
          {story.timeline && <Timeline timeline={story.timeline} />}
        </>
      )}
      <Bento k={k} title={p.t.includes} items={p.includes} />
      <Method {...p} />
      {story && <Faq faq={story.faq} />}
      <Close {...p} />
      <Next {...p} />
    </>
  );
}
