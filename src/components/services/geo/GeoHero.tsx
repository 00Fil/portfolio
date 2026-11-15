"use client";

import { useCallback, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown, ArrowRight, RotateCcw } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ENGINES, type GeoContent } from "@/content/geo";
import { prefersReducedMotion } from "@/lib/env";
import { onIntroLift } from "@/lib/intro";
import { play } from "@/lib/sound";
import { scrollToY } from "@/lib/scroll";
import { Drop } from "@/components/glass/Drop";
import { ServiceBg } from "@/components/sections/ServiceBg";
import { BrandTile, ENGINE_PITCH } from "./BrandTile";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function GeoHero({
  locale,
  content,
  servicesLabel,
}: {
  locale: Locale;
  content: GeoContent["hero"];
  servicesLabel: string;
}) {
  const root = useRef<HTMLElement>(null);
  const keynoteRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const q = gsap.utils.selector(root);

      const keynote = gsap.timeline({ paused: true });
      keynote
        .fromTo(q("[data-brand-n]"), { yPercent: 32, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.65, stagger: 0.14, ease: "expo.out" }, 0)
        .fromTo(q("[data-brand-tile]"), { scale: 0.56, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.58, stagger: 0.14, ease: "expo.out" }, 0.16)
        .fromTo(q("[data-hero-end]"), { yPercent: 28, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.65, ease: "expo.out" }, 0.68)
        .fromTo(q("[data-hero-ul]"), { scaleX: 0 }, { scaleX: 1, duration: 0.72, ease: "expo.out" }, 0.92);

      keynoteRef.current = keynote;

      const intro = gsap.timeline({ paused: true });
      onIntroLift(() => intro.play());
      intro
        .from(q("[data-island]"), { clipPath: "inset(5% 3% 5% 3% round 56px)", duration: 1.35, ease: "expo.inOut", clearProps: "clipPath" }, 0)
        .from(q("[data-h-top]"), { y: 14, autoAlpha: 0, duration: 0.85, stagger: 0.08, ease: "expo.out" }, 0.32)
        .add(() => void keynote.play(0), 0.45)
        .from(q("[data-h-foot]"), { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: "expo.out" }, 0.92);

      if (window.matchMedia("(min-width: 1024px)").matches) {
        gsap.to(q("[data-island]"), {
          scale: 0.965,
          borderRadius: 56,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      }
    },
    { scope: root },
  );

  const handleReplay = useCallback(() => {
    const tl = keynoteRef.current;
    if (!tl || prefersReducedMotion()) return;
    tl.restart();
    ENGINES.forEach((e, idx) => {
      window.setTimeout(() => play("copy", ENGINE_PITCH[e.id]), 160 + idx * 140);
    });
    window.setTimeout(() => play("success"), 940);
  }, []);

  const jumpToStage = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    play("tick", 0.95);
    const el = document.getElementById("come-sceglie");
    if (el) {
      const mt = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      scrollToY(Math.max(0, Math.min(el.getBoundingClientRect().top + window.scrollY - mt, document.documentElement.scrollHeight - window.innerHeight)));
    }
  };

  const joiner = locale === "en" ? "and" : "e";

  return (
    <section ref={root} className="px-3 pt-[calc(var(--bar-h)+14px)] sm:px-5 sm:pt-[calc(var(--bar-h)+18px)]">
      <div
        data-island
        className="theme-dark relative mx-auto max-w-[1400px] overflow-hidden rounded-[32px] bg-[#04070d] shadow-[0_32px_90px_-34px_rgba(0,0,0,.7)] sm:rounded-[44px]"
      >
        <ServiceBg k="geo" v={0} live />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_75%_at_50%_42%,rgba(4,8,15,.16)_0%,rgba(4,8,15,.64)_100%)]"
        />

        <div className="relative flex min-h-[min(735px,calc(100svh-var(--bar-h)-30px))] flex-col justify-between px-5 pb-7 pt-6 sm:px-12 sm:pb-9 sm:pt-8 lg:px-16">
          {/* Top utility bar */}
          <div className="flex flex-wrap items-center justify-between gap-3" data-h-top>
            <p className="flex items-center gap-3 font-mono text-[11.5px] uppercase tracking-[0.14em] text-white/75 sm:text-[12px]">
              <Link href="/#approach" className="transition-colors hover:text-white">
                {servicesLabel}
              </Link>
              <span className="h-px w-5 bg-white/30 sm:w-6" />
              <span>{content.kicker}</span>
            </p>

            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/[0.1] px-3.5 text-[12px] font-medium text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,.16)] backdrop-blur-md transition-all duration-300 hover:bg-white/[0.18] hover:text-white active:scale-95"
            >
              <RotateCcw size={12} strokeWidth={1.9} aria-hidden />
              <span>{content.replay}</span>
            </button>
          </div>

          {/* Centerpiece Shot-2 Keynote Typography + Tiles */}
          <div className="mx-auto my-auto flex max-w-[1040px] flex-col items-center py-6 text-center sm:py-8">
            <h1 className="text-[clamp(27px,4.55vw,68px)] font-semibold leading-[1.2] tracking-[-0.048em] text-white">
              <span data-h-top className="block text-[0.68em] font-medium tracking-[-0.032em] text-white/78 sm:mb-1.5">
                {content.leadPrefix}
              </span>

              <span className="mt-1 inline-flex flex-wrap items-center justify-center gap-x-[0.26em] gap-y-2 sm:gap-y-2.5">
                <span data-brand-n className="inline-flex items-baseline whitespace-nowrap">
                  <span className="inline-flex items-center gap-[0.2em]">
                    <span>ChatGPT</span>
                    <span data-brand-tile className="inline-flex align-middle">
                      <BrandTile
                        engine="chatgpt"
                        interactive
                        radius={14}
                        sizeClass="h-8 w-8 sm:h-[46px] sm:w-[46px] lg:h-[52px] lg:w-[52px]"
                      />
                    </span>
                  </span>
                  <span className="ml-[0.04em] text-white/65">,</span>
                </span>

                <span data-brand-n className="inline-flex items-baseline whitespace-nowrap">
                  <span className="inline-flex items-center gap-[0.2em]">
                    <span>Gemini</span>
                    <span data-brand-tile className="inline-flex align-middle">
                      <BrandTile
                        engine="gemini"
                        interactive
                        radius={14}
                        sizeClass="h-8 w-8 sm:h-[46px] sm:w-[46px] lg:h-[52px] lg:w-[52px]"
                      />
                    </span>
                  </span>
                  <span className="ml-[0.04em] text-white/65">,</span>
                </span>

                <span className="hidden basis-full sm:block" aria-hidden />

                <span data-brand-n className="inline-flex items-center gap-[0.2em] whitespace-nowrap">
                  <span>Claude</span>
                  <span data-brand-tile className="inline-flex align-middle">
                    <BrandTile
                      engine="claude"
                      interactive
                      radius={14}
                      sizeClass="h-8 w-8 sm:h-[46px] sm:w-[46px] lg:h-[52px] lg:w-[52px]"
                    />
                  </span>
                </span>

                <span data-brand-n className="inline-flex items-center gap-[0.2em] whitespace-nowrap">
                  <span className="font-medium text-white/78">{joiner}</span>
                  <span>Perplexity</span>
                  <span data-brand-tile className="inline-flex align-middle">
                    <BrandTile
                      engine="perplexity"
                      interactive
                      radius={14}
                      sizeClass="h-8 w-8 sm:h-[46px] sm:w-[46px] lg:h-[52px] lg:w-[52px]"
                    />
                  </span>
                </span>
              </span>

              <span data-hero-end className="mt-3.5 block text-[0.75em] font-semibold leading-[1.12] tracking-[-0.045em] text-white/95 sm:mt-5">
                {content.leadSuffix}{" "}
                <span className="whitespace-nowrap">
                  <span className="relative inline-block text-[#8fd8ff]">
                    {content.highlight}
                    <span
                      data-hero-ul
                      aria-hidden
                      className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-[#5ec4ff] sm:-bottom-1.5 sm:h-[3.5px]"
                    />
                  </span>
                  <span>{content.endDot}</span>
                </span>
              </span>
            </h1>

            <p data-h-foot className="mt-5 max-w-[54ch] text-[15px] leading-[1.55] text-white/80 sm:mt-7 sm:text-[18px]">
              {content.sub}
            </p>

            <div data-h-foot className="mt-6 flex flex-wrap items-center justify-center gap-3.5 sm:mt-8 sm:gap-4">
              <Drop href="#brief-geo" accent className="h-[50px] px-6 text-[15.5px] font-medium text-ink sm:h-[52px] sm:px-7">
                <span>{content.ctaPrimary}</span>
                <ArrowRight size={17} strokeWidth={1.8} aria-hidden />
              </Drop>
              <a
                href="#come-sceglie"
                onClick={jumpToStage}
                className="inline-flex h-[50px] items-center gap-2 rounded-full bg-white/[0.1] px-6 text-[15px] font-medium text-white/92 shadow-[inset_0_0_0_1px_rgba(255,255,255,.18)] backdrop-blur-md transition-all duration-300 hover:bg-white/[0.17] hover:text-white active:scale-[0.98] sm:h-[52px]"
              >
                <span>{content.ctaSecondary}</span>
                <ArrowDown size={15} strokeWidth={1.8} aria-hidden />
              </a>
            </div>
          </div>

          {/* Grounding line */}
          <p data-h-foot className="mx-auto max-w-[60ch] text-center font-mono text-[11.5px] leading-[1.5] tracking-[0.03em] text-white/60 sm:text-[12px]">
            {content.trust}
          </p>
        </div>
      </div>
    </section>
  );
}
