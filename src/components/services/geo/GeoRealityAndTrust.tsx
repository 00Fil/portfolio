"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";
import type { GeoContent } from "@/content/geo";
import { prefersReducedMotion } from "@/lib/env";
import { Bead } from "@/components/glass/Bead";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function GeoRealityAndTrust({
  reality,
  timeline,
  promise,
  github,
}: {
  reality: GeoContent["reality"];
  timeline: GeoContent["timeline"];
  promise: GeoContent["promise"];
  github?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-geo-row]", root.current);
      if (prefersReducedMotion()) {
        rows.forEach((r) => {
          r.dataset.on = "1";
        });
        return;
      }

      rows.forEach((row) => {
        const q = gsap.utils.selector(row);
        gsap
          .timeline({ scrollTrigger: { trigger: row, start: "top 90%", once: true } })
          .fromTo(q("[data-from]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "expo.out" })
          .call(() => void (row.dataset.on = "1"), undefined, 0.38)
          .to(q("[data-from]"), { opacity: 0.52, duration: 0.55, ease: "power2.out" }, 0.38)
          .fromTo(q("[data-arrow]"), { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.65, ease: "back.out(2)" }, 0.42)
          .fromTo(q("[data-to]"), { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.75, ease: "expo.out" }, 0.52);
      });

      gsap.fromTo(
        "[data-geo-tfill]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-geo-tlist]", start: "top 75%", end: "bottom 65%", scrub: 0.5 },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-geo-titem]", root.current).forEach((el) => {
        gsap.from(el, {
          y: 20,
          autoAlpha: 0,
          duration: 0.8,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-geo-pl]", root.current).forEach((list) => {
        const q = gsap.utils.selector(list);
        gsap
          .timeline({ scrollTrigger: { trigger: list, start: "top 90%", once: true } })
          .fromTo(q("[data-pi]"), { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.08, ease: "expo.out" });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      {/* Reality Check: Ti riconosci? */}
      <section className="mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-40">
        <header className="mb-10 grid gap-5 sm:mb-16 lg:grid-cols-[1fr_1.15fr] lg:items-end lg:gap-[110px]">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">{reality.eyebrow}</p>
            <h2 className="mt-3 text-[clamp(34px,4.5vw,62px)] font-medium leading-[1.03] tracking-[-0.048em] text-ink">
              {reality.title}
            </h2>
          </div>
          <p className="max-w-[48ch] text-[18px] leading-[1.55] text-ink-2">{reality.lead}</p>
        </header>

        <div className="hidden grid-cols-[1fr_56px_1.15fr] gap-x-8 pb-4 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3 lg:grid">
          <span>{reality.beforeLabel}</span>
          <span />
          <span className="text-[var(--sky)]">{reality.afterLabel}</span>
        </div>

        <ul className="border-b border-[var(--hair-strong)]">
          {reality.rows.map((r) => (
            <li
              key={r.from}
              data-geo-row
              className="group grid cursor-default items-center gap-x-8 gap-y-4 border-t border-[var(--hair-strong)] py-7 sm:py-9 lg:grid-cols-[1fr_56px_1.15fr]"
            >
              <p
                data-from
                className="max-w-[38ch] text-[17px] leading-[1.45] text-ink-2 line-through decoration-transparent decoration-1 transition-[text-decoration-color] duration-700 group-data-[on]:decoration-current sm:text-[19px]"
              >
                {r.from}
              </p>

              <span
                data-arrow
                className="justify-self-start transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1"
              >
                <Bead radius={22} className="flex h-11 w-11 rotate-90 items-center justify-center text-[var(--sky)] lg:rotate-0">
                  <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
                </Bead>
              </span>

              <p
                data-to
                className="max-w-[32ch] text-[clamp(21px,2.2vw,30px)] font-medium leading-[1.15] tracking-[-0.035em] text-ink transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1.5"
              >
                {r.to}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Timeline */}
      <section className="mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-40">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
          <header className="lg:sticky lg:top-[calc(var(--bar-h)+48px)] lg:self-start">
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">{timeline.eyebrow}</p>
            <h2 className="mt-3 text-[clamp(34px,4.5vw,62px)] font-medium leading-[1.03] tracking-[-0.048em] text-ink">
              {timeline.title}
            </h2>
            <p className="mt-5 max-w-[38ch] text-[18px] leading-[1.55] text-ink-2">{timeline.lead}</p>
          </header>

          <ol data-geo-tlist className="relative">
            <span aria-hidden className="absolute bottom-3 left-[5px] top-3 w-px bg-[var(--hair-strong)]">
              <span data-geo-tfill className="absolute inset-0 origin-top bg-[var(--sky)]" />
            </span>

            {timeline.items.map((it) => (
              <li
                key={it.at}
                data-geo-titem
                className="relative grid gap-x-6 gap-y-1.5 pb-12 pl-8 last:pb-0 sm:grid-cols-[140px_1fr]"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-[7px] h-[11px] w-[11px] rounded-full bg-[var(--bg-canvas)] shadow-[inset_0_0_0_2px_var(--sky)]"
                />
                <p className="pt-1 font-mono text-[12px] uppercase tracking-[0.12em] text-ink-3 tabular-nums">{it.at}</p>
                <div>
                  <p className="text-[20px] font-medium leading-[1.25] tracking-[-0.025em] text-ink">{it.title}</p>
                  <p className="mt-2 max-w-[46ch] text-[16px] leading-[1.58] text-ink-2">{it.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Honest Promises + Profile */}
      <section className="mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-40">
        <div className="grid gap-14 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
          <div>
            <h2 className="mb-8 text-[clamp(34px,4.5vw,62px)] font-medium leading-[1.03] tracking-[-0.048em] text-ink sm:mb-10">
              {promise.title}
            </h2>
            <ul data-geo-pl className="grid gap-6">
              {promise.yes.map((y) => (
                <li key={y} data-pi className="flex gap-4 text-[clamp(18px,1.65vw,23px)] leading-[1.38] tracking-[-0.02em] text-ink">
                  <CheckCircle2 size={24} strokeWidth={1.7} className="mt-1 shrink-0 text-[var(--sky)]" aria-hidden />
                  <span>{y}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:pt-4">
            <p className="mb-7 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3 sm:mb-9">{promise.noTitle}</p>
            <ul data-geo-pl className="grid gap-6 border-l border-[var(--hair-strong)] pl-6">
              {promise.no.map((n) => (
                <li key={n} data-pi className="flex gap-3 text-[16.5px] leading-[1.55] text-ink-2">
                  <XCircle size={20} strokeWidth={1.7} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Filippo Corsini Profile Strip */}
        <div className="mt-20 flex flex-col gap-6 border-t border-[var(--hair-strong)] pt-10 sm:mt-28 sm:flex-row sm:items-center sm:gap-10">
          <Bead
            tint="dark"
            radius={36}
            className="flex h-[72px] w-[72px] shrink-0 items-center justify-center text-[22px] font-medium tracking-[-0.02em] text-white"
          >
            FC
          </Bead>
          <div className="flex-1">
            <div className="flex flex-wrap items-baseline gap-3">
              <p className="text-[22px] font-medium tracking-[-0.03em] text-ink">{promise.me}</p>
              <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-3">{promise.meRole}</span>
            </div>
            <p className="mt-2 max-w-[64ch] text-[16.5px] leading-[1.6] text-ink-2">{promise.meLead}</p>
          </div>
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[15px] font-medium text-ink-2 transition-colors hover:text-ink"
            >
              <span>{promise.githubLabel}</span>
              <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden />
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
