"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Drop } from "@/components/glass/Drop";
import { prefersReducedMotion } from "@/lib/env";
import { SectionHead } from "./SectionHead";
import { PinRail } from "@/components/motion/PinRail";
import { SkyGradient } from "@/components/motion/SkyGradient";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Reason = { kicker: string; title: string; body: string; metric: string; metricLabel: string };

/**
 * Perché scegliermi: quattro schede affiancate, ognuna con la prova in grande e la spiegazione sotto.
 * Tutto leggibile subito, senza dover scorrere per scoprirlo.
 */
export function Why() {
  const t = useTranslations("why");
  const items = t.raw("items") as Reason[];
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // su telefono le schede le muove PinRail: qui solo l'ingresso su schermi grandi
      if (prefersReducedMotion() || window.innerWidth < 1024) return;
      gsap.utils.toArray<HTMLElement>("[data-why]").forEach((card, i) => {
        gsap
          .timeline({ scrollTrigger: { trigger: card, start: "top 85%", once: true }, defaults: { ease: "expo.out" } })
          .from(card, { y: 60, autoAlpha: 0, duration: 1.1, delay: (i % 2) * 0.12, clearProps: "transform" })
          .from(card.querySelector("[data-metric]"), { yPercent: 100, duration: 1.2 }, "<0.15")
          .from(card.querySelectorAll("[data-wt]"), { y: 16, autoAlpha: 0, duration: 0.9, stagger: 0.07 }, "<0.2");
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="why" className="relative mx-auto w-full max-w-[1280px] px-5 pt-20 sm:px-8 sm:pt-36">
      <Reveal>
        <SectionHead index="03" title={t("title")} lead={t("lead")} />
      </Reveal>

      <PinRail className="-mx-5 py-2 sm:-mx-8 lg:mx-0 lg:py-0" trackClass="lg:grid lg:grid-cols-2 lg:gap-5">
        {items.map((it, i) => (
          <article
            key={it.title}
            data-why
            className="group flex min-h-[min(400px,60svh)] w-[80vw] max-w-[400px] shrink-0 flex-col rounded-[28px] max-lg:first:ml-[10vw] max-lg:last:mr-[10vw] lg:min-h-[440px] lg:w-auto lg:max-w-none lg:rounded-[32px] bg-[var(--card)] p-6 shadow-[inset_0_0_0_1px_var(--hair)] transition-[box-shadow] duration-500 hover:shadow-[inset_0_0_0_1px_var(--hair-strong),0_30px_60px_-40px_var(--shadow-strong)] sm:p-10"
          >
            <p className="flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3" data-wt>
              {it.kicker}
              <span className="tabular-nums">
                {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
            </p>
            <div className="mt-5 flex flex-col items-start gap-2 sm:mt-8 sm:gap-3 sm:flex-row sm:items-end sm:gap-5">
              <span className="overflow-hidden pb-[0.04em]">
                <span data-metric className="block text-[clamp(56px,7.4vw,116px)] whitespace-nowrap font-medium leading-[0.86] tracking-[-0.06em] text-ink">
                  {it.metric}
                </span>
              </span>
              <span className="max-w-[24ch] text-[14px] sm:text-[15px] sm:mb-2 sm:max-w-[18ch] leading-[1.35] text-ink-2" data-wt>
                {it.metricLabel}
              </span>
            </div>
            <div className="mt-auto pt-7 sm:pt-10 lg:pt-12">
              <h3 className="max-w-[22ch] text-[clamp(22px,2.3vw,32px)] font-medium leading-[1.1] tracking-[-0.035em] text-ink" data-wt>
                {it.title}
              </h3>
              <p className="mt-3 max-w-[52ch] text-[15px] leading-[1.5] text-ink-2 sm:mt-4 sm:text-[16.5px] sm:leading-[1.6]" data-wt>
                {it.body}
              </p>
            </div>
          </article>
        ))}
      </PinRail>

      {/* l'invito, su un gradiente vivo con i colori del sito */}
      <Reveal className="theme-dark relative mt-10 overflow-hidden rounded-[28px] bg-[#05131d] lg:mt-20 lg:rounded-[32px]">
        <SkyGradient angle={20} />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,10,16,.55),transparent_70%)]" />
        <div className="pointer-events-none relative flex min-h-[220px] flex-col items-start justify-between gap-8 p-7 sm:flex-row sm:items-center sm:p-12 lg:min-h-[260px]">
          <p className="max-w-[18ch] text-[clamp(28px,3.4vw,48px)] font-medium leading-[1.05] tracking-[-0.04em] text-white" data-reveal>
            {t("cta")}
          </p>
          <div className="pointer-events-auto" data-reveal>
            <Drop href="#brief" accent className="h-12 px-5 font-medium text-ink">
              {t("ctaBtn")}
              <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
            </Drop>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
