"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ENGINES, type GeoContent } from "@/content/geo";
import type { ServiceKey } from "@/content/services";
import { prefersReducedMotion } from "@/lib/env";
import { play } from "@/lib/sound";
import { Bead } from "@/components/glass/Bead";
import { Drop } from "@/components/glass/Drop";
import { ServiceBg } from "@/components/sections/ServiceBg";
import { ServiceIcon } from "@/components/services/ServiceIcon";
import { BrandTile } from "./BrandTile";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type NextServiceInfo = {
  slug: string;
  k: ServiceKey;
  label: string;
  title: string;
  short: string;
};

export type OtherServiceInfo = {
  slug: string;
  k: ServiceKey;
  title: string;
};

export function GeoFaqClose({
  faq,
  close,
  next,
  others,
  nextLabel,
  allLabel,
}: {
  faq: GeoContent["faq"];
  close: GeoContent["close"];
  next: NextServiceInfo;
  others: OtherServiceInfo[];
  nextLabel: string;
  allLabel: string;
}) {
  const [open, setOpen] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap
        .timeline({ scrollTrigger: { trigger: q("[data-close-card]")[0], start: "top 82%", once: true } })
        .fromTo(q("[data-close-tile]"), { scale: 0.65, y: 12, autoAlpha: 0 }, { scale: 1, y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.1, ease: "expo.out" }, 0)
        .fromTo(q("[data-close-tx]"), { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: "expo.out" }, 0.25)
        .fromTo(q("[data-close-ul]"), { scaleX: 0 }, { scaleX: 1, duration: 0.65, ease: "expo.out" }, 0.55);
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      {/* FAQ Accordion */}
      <section className="mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-40">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-24">
          <div className="lg:sticky lg:top-[calc(var(--bar-h)+48px)] lg:self-start">
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">{faq.eyebrow}</p>
            <h2 className="mt-3 text-[clamp(34px,4.5vw,60px)] font-medium leading-[1.03] tracking-[-0.048em] text-ink">
              {faq.title}
            </h2>
          </div>

          <ul className="border-t border-[var(--hair-strong)]">
            {faq.items.map((it, i) => {
              const on = open === i;
              return (
                <li key={it.q} className="border-b border-[var(--hair-strong)]">
                  <button
                    type="button"
                    aria-expanded={on}
                    onClick={() => {
                      setOpen(on ? -1 : i);
                      play("tick", on ? 0.9 : 1.08);
                    }}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="text-[19px] font-medium leading-[1.3] tracking-[-0.02em] text-ink">{it.q}</span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--hover)] text-ink transition-transform duration-500 ease-[var(--ease-out)] ${
                        on ? "rotate-45" : ""
                      }`}
                    >
                      <Plus size={16} strokeWidth={1.9} aria-hidden />
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out)] ${
                      on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[58ch] pb-7 text-[16.5px] leading-[1.65] text-ink-2">{it.a}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Closing Apple Keynote Island */}
      <section className="mx-auto mt-24 w-full max-w-[1400px] px-3 sm:mt-40 sm:px-5">
        <div
          data-close-card
          className="theme-dark relative overflow-hidden rounded-[32px] bg-[#04070d] px-6 py-16 text-center shadow-[0_32px_90px_-34px_rgba(0,0,0,.65)] sm:rounded-[44px] sm:px-12 sm:py-24"
        >
          <ServiceBg k="geo" v={2} still />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_80%_at_50%_40%,rgba(4,7,13,.22)_0%,rgba(4,7,13,.72)_100%)]"
          />

          <div className="relative mx-auto flex max-w-[820px] flex-col items-center">
            <p data-close-tx className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#8fd8ff]">
              {close.eyebrow}
            </p>

            <div className="mt-6 flex items-center justify-center gap-3 sm:gap-4">
              {ENGINES.map((e) => (
                <span key={e.id} data-close-tile className="inline-flex">
                  <BrandTile engine={e.id} interactive radius={15} sizeClass="h-11 w-11 sm:h-14 sm:w-14" />
                </span>
              ))}
            </div>

            <h2
              data-close-tx
              className="mt-8 max-w-[18ch] text-[clamp(34px,5.2vw,74px)] font-semibold leading-[1.04] tracking-[-0.05em] text-white"
            >
              {close.prefix}{" "}
              <span className="relative inline-block text-[#8fd8ff]">
                {close.highlight}
                <span
                  data-close-ul
                  aria-hidden
                  className="absolute -bottom-1.5 left-0 h-[3.5px] w-full origin-left rounded-full bg-[#5ec4ff]"
                />
              </span>
            </h2>

            <p data-close-tx className="mt-6 max-w-[46ch] text-[17px] leading-[1.6] text-white/78 sm:text-[18.5px]">
              {close.lead}
            </p>

            <div data-close-tx className="mt-9">
              <Drop href="#brief-geo" accent className="h-[56px] px-7 text-[16.5px] font-medium text-ink">
                <span>{close.cta}</span>
                <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
              </Drop>
            </div>
          </div>
        </div>
      </section>

      {/* Next Service Card & Directory */}
      <section className="mx-auto mt-16 w-full max-w-[1400px] px-3 sm:mt-24 sm:px-5">
        <Link
          href={`/servizi/${next.slug}`}
          className="group theme-dark relative block h-[400px] overflow-hidden rounded-[32px] bg-[#05070a] sm:h-[min(540px,70svh)] sm:rounded-[44px]"
        >
          <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.04]">
            <ServiceBg k={next.k} live />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(3,6,10,.62)_0%,transparent_60%)]"
          />
          <div className="relative flex h-full flex-col justify-between p-7 sm:p-12 lg:p-14">
            <div className="flex items-start justify-between gap-6">
              <p className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.14em] text-white/70">
                {nextLabel}
                <span className="h-px w-6 bg-white/35" />
                {next.label}
              </p>
              <Bead
                tint="rgba(255,255,255,.14)"
                className="flex h-14 w-14 items-center justify-center text-white transition-transform duration-700 ease-[var(--ease-out)] group-hover:rotate-45"
              >
                <ArrowUpRight size={22} strokeWidth={1.6} aria-hidden />
              </Bead>
            </div>
            <div>
              <h2 className="max-w-[14ch] text-[clamp(44px,7.5vw,124px)] font-medium leading-[0.92] tracking-[-0.06em] text-white transition-transform duration-700 ease-[var(--ease-out)] group-hover:-translate-y-2">
                {next.title}
              </h2>
              <p className="mt-5 max-w-[46ch] text-[17px] leading-[1.55] text-white/75">{next.short}</p>
            </div>
          </div>
        </Link>

        <nav aria-label={allLabel} className="mx-auto mt-16 max-w-[1280px] px-2 sm:px-3">
          <p className="mb-6 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">{allLabel}</p>
          <ul className="grid border-t border-[var(--hair)] sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug} className="border-b border-[var(--hair)]">
                <Link
                  href={`/servizi/${o.slug}`}
                  className="group flex items-center gap-4 py-4 text-[17px] text-ink-2 transition-colors hover:text-ink"
                >
                  <ServiceIcon
                    k={o.k}
                    size={36}
                    className="transition-transform duration-500 ease-[var(--ease-out)] group-hover:-rotate-6"
                  />
                  <span className="flex-1">{o.title}</span>
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.8}
                    className="shrink-0 text-ink-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>
    </div>
  );
}
