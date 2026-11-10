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
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-why]").forEach((card, i) => {
        gsap
          .timeline({ scrollTrigger: { trigger: card, start: "top 85%", once: true }, defaults: { ease: "expo.out" } })
          .from(card, { y: 60, autoAlpha: 0, duration: 1.1, delay: (i % 2) * 0.12 + (window.innerWidth < 1024 ? i * 0.06 : 0), clearProps: "transform" })
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

      <ol className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
        {items.map((it, i) => (
          <li
            key={it.title}
            data-why
            className="group flex min-h-[400px] w-[84%] shrink-0 snap-center flex-col rounded-[28px] sm:w-[60%] lg:min-h-[440px] lg:w-auto lg:rounded-[32px] bg-[var(--card)] p-7 shadow-[inset_0_0_0_1px_var(--hair)] transition-[box-shadow] duration-500 hover:shadow-[inset_0_0_0_1px_var(--hair-strong),0_30px_60px_-40px_var(--shadow-strong)] sm:p-10"
          >
            <p className="flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3" data-wt>
              {it.kicker}
              <span className="tabular-nums">
                {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:gap-5">
              <span className="overflow-hidden pb-[0.04em]">
                <span data-metric className="block text-[clamp(64px,7.4vw,116px)] whitespace-nowrap font-medium leading-[0.86] tracking-[-0.06em] text-ink">
                  {it.metric}
                </span>
              </span>
              <span className="max-w-[22ch] text-[15px] sm:mb-2 sm:max-w-[18ch] leading-[1.35] text-ink-2" data-wt>
                {it.metricLabel}
              </span>
            </div>
            <div className="mt-auto pt-10 lg:pt-12">
              <h3 className="max-w-[22ch] text-[clamp(24px,2.3vw,32px)] font-medium leading-[1.1] tracking-[-0.035em] text-ink" data-wt>
                {it.title}
              </h3>
              <p className="mt-4 max-w-[52ch] text-[16.5px] leading-[1.6] text-ink-2" data-wt>
                {it.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <Reveal className="mt-10 flex flex-col items-start justify-between gap-6 rounded-[28px] bg-[var(--card)] p-8 shadow-[inset_0_0_0_1px_var(--hair)] sm:flex-row sm:items-center sm:p-10 lg:mt-20">
        <p className="text-[clamp(26px,3vw,40px)] font-medium tracking-[-0.035em] text-ink" data-reveal>
          {t("cta")}
        </p>
        <div data-reveal>
          <Drop href="#brief" accent className="h-12 px-5 font-medium text-ink">
            {t("ctaBtn")}
            <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
          </Drop>
        </div>
      </Reveal>
    </section>
  );
}
