"use client";

import { useRef, useState } from "react";
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
 * Perché scegliermi, raccontato scorrendo: a destra le ragioni una dopo l'altra,
 * a sinistra, ferma, la prova di quella che stai leggendo.
 */
export function Why() {
  const t = useTranslations("why");
  const items = t.raw("items") as Reason[];
  const root = useRef<HTMLElement>(null);
  const [at, setAt] = useState(0);

  useGSAP(
    () => {
      const blocks = gsap.utils.toArray<HTMLElement>("[data-reason]");
      blocks.forEach((b, i) =>
        ScrollTrigger.create({
          trigger: b,
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (s) => s.isActive && setAt(i),
        }),
      );
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-fill]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-reasons]", start: "top 60%", end: "bottom 60%", scrub: true } });
    },
    { scope: root },
  );

  // la prova a sinistra cambia con una dissolvenza verticale
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-proof]", { yPercent: 30, autoAlpha: 0, filter: "blur(8px)" }, { yPercent: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out" });
    },
    { scope: root, dependencies: [at] },
  );

  const cur = items[at];
  return (
    <section ref={root} id="why" className="relative mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-36">
      <Reveal>
        <SectionHead index="03" title={t("title")} lead={t("lead")} />
      </Reveal>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* la prova, ferma mentre scorri */}
        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-[calc(var(--bar-h)+64px)] flex gap-8">
            <span aria-hidden className="relative w-px self-stretch bg-[var(--hair-strong)]">
              <span data-fill className="absolute inset-0 origin-top bg-ink" />
            </span>
            <div className="min-h-[300px] py-2">
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">
                {String(at + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")} · {cur.kicker}
              </p>
              <div key={at} data-proof>
                <p className="mt-8 text-[clamp(88px,10vw,148px)] font-medium leading-[0.85] tracking-[-0.06em] text-ink">{cur.metric}</p>
                <p className="mt-6 max-w-[26ch] text-[18px] leading-[1.45] text-ink-2">{cur.metricLabel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* le ragioni, una dopo l'altra */}
        <ol data-reasons className="lg:col-span-7">
          {items.map((it, i) => (
            <li
              key={it.title}
              data-reason
              className={`border-t border-[var(--hair)] py-10 transition-opacity duration-500 first:border-t-0 first:pt-0 lg:flex lg:min-h-[52vh] lg:flex-col lg:justify-center lg:py-16 ${i === at ? "lg:opacity-100" : "lg:opacity-30"}`}
            >
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">
                {String(i + 1).padStart(2, "0")} · {it.kicker}
              </p>
              <h3 className="mt-4 max-w-[20ch] text-[clamp(28px,3.2vw,44px)] font-medium leading-[1.05] tracking-[-0.04em] text-ink">{it.title}</h3>
              <p className="mt-5 max-w-[52ch] text-[17px] leading-[1.65] text-ink-2">{it.body}</p>
              {/* su telefono la prova sta sotto il testo */}
              <p className="mt-6 flex items-baseline gap-3 lg:hidden">
                <span className="text-[44px] font-medium leading-none tracking-[-0.05em] text-ink">{it.metric}</span>
                <span className="text-[14px] text-ink-3">{it.metricLabel}</span>
              </p>
            </li>
          ))}
        </ol>
      </div>

      <Reveal className="mt-20 flex flex-col items-start justify-between gap-6 rounded-[28px] bg-[var(--card)] p-8 shadow-[inset_0_0_0_1px_var(--hair)] sm:flex-row sm:items-center sm:p-10">
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
