"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check, CheckCircle2, Search } from "lucide-react";
import { ENGINES, type GeoContent } from "@/content/geo";
import { prefersReducedMotion } from "@/lib/env";
import { play } from "@/lib/sound";
import { Bead } from "@/components/glass/Bead";
import { ServiceBg } from "@/components/sections/ServiceBg";
import { BrandTile } from "./BrandTile";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function StageScene({
  index,
  ui,
  caption,
}: {
  index: number;
  ui: GeoContent["process"]["stageUi"];
  caption: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(wrap);
      gsap.fromTo(
        q("[data-st-item]"),
        { y: 16, opacity: 0.2 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: "expo.out", overwrite: true },
      );
      gsap.fromTo(
        q("[data-st-ul]"),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6, delay: 0.25, ease: "expo.out", overwrite: true },
      );
    },
    { scope: wrap, dependencies: [index] },
  );

  return (
    <div ref={wrap} className="relative flex h-full w-full flex-col justify-between p-5 sm:p-8 lg:p-10">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8fd8ff]">{caption}</span>
        <Bead tint="rgba(255,255,255,.10)" radius={99} className="px-2.5 py-0.5 font-mono text-[11px] text-white/75">
          0{index + 1} / 03
        </Bead>
      </div>

      {/* Stage 1: Multi-Engine Prompt Scan */}
      {index === 0 && (
        <div className="my-auto flex flex-col gap-4 py-4">
          <div
            data-st-item
            className="flex items-center gap-3 rounded-[20px] bg-[#0a1018]/82 px-4 py-3.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.16)] backdrop-blur-2xl"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(94,196,255,.2)] text-[#8fd8ff]">
              <Search size={15} strokeWidth={2} aria-hidden />
            </span>
            <p className="text-[14px] font-medium text-white/95 sm:text-[15px]">“{ui.step1Prompt}”</p>
          </div>

          <div className="flex justify-center" aria-hidden>
            <span className="h-4 w-px bg-[linear-gradient(180deg,rgba(94,196,255,.8),rgba(94,196,255,.15))]" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {ENGINES.map((e) => (
              <div
                key={e.id}
                data-st-item
                className="flex min-w-0 items-center gap-3 rounded-[20px] bg-[#0a1018]/80 p-3.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.12)] backdrop-blur-2xl"
              >
                <BrandTile engine={e.id} size={36} radius={11} />
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold tracking-[-0.02em] text-white">{e.name}</p>
                  <p className="truncate text-[12px] text-white/65">{ui.step1Notes[e.id]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage 2: 3-Layer Source Architecture Stack */}
      {index === 1 && (
        <div className="my-auto flex flex-col gap-3.5 py-4">
          {ui.step2Layers.map((layer, lIdx) => (
            <div
              key={layer.tag}
              data-st-item
              className="rounded-[22px] bg-[#0a1018]/82 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)] backdrop-blur-2xl sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8fd8ff]">{layer.tag}</span>
                <span className="h-2 w-2 rounded-full bg-[#4cc38a]" aria-hidden />
              </div>
              <p className="mt-1.5 text-[16px] font-semibold tracking-[-0.025em] text-white sm:text-[17px]">
                {lIdx === 0 ? (
                  <span className="relative inline-block">
                    {layer.title}
                    <span
                      data-st-ul
                      aria-hidden
                      className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full bg-[#5ec4ff]"
                    />
                  </span>
                ) : (
                  layer.title
                )}
              </p>
              <p className="mt-1 text-[13px] leading-[1.45] text-white/70">{layer.detail}</p>
            </div>
          ))}
        </div>
      )}

      {/* Stage 3: Monthly Multi-Engine Tracker */}
      {index === 2 && (
        <div className="my-auto py-4">
          <div
            data-st-item
            className="overflow-hidden rounded-[24px] bg-[#0a1018]/84 shadow-[inset_0_0_0_1px_rgba(255,255,255,.15)] backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
              <p className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-white/70">{ui.step3Header}</p>
              <CheckCircle2 size={15} strokeWidth={2} className="text-[#4cc38a]" aria-hidden />
            </div>

            <div className="grid grid-cols-[1.2fr_1fr_1.1fr] gap-2 border-b border-white/10 px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-white/45 sm:px-5">
              <span>{ui.step3Cols[0]}</span>
              <span>{ui.step3Cols[1]}</span>
              <span className="text-[#8fd8ff]">{ui.step3Cols[2]}</span>
            </div>

            <ul className="divide-y divide-white/[0.07]">
              {ui.step3Rows.map((row) => {
                const eng = ENGINES.find((e) => e.id === row.engine)!;
                return (
                  <li
                    key={row.engine}
                    data-st-item
                    className="grid grid-cols-[1.2fr_1fr_1.1fr] items-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <BrandTile engine={eng.id} size={28} radius={9} />
                      <span className="truncate text-[13.5px] font-medium text-white">{eng.name}</span>
                    </div>
                    <span className="truncate text-[12.5px] text-white/45 line-through decoration-white/30">{row.m1}</span>
                    <span className="inline-flex min-w-0 items-center gap-1.5 text-[12.5px] font-medium text-[#8fd8ff]">
                      <Check size={13} strokeWidth={2.2} className="shrink-0 text-[#4cc38a]" aria-hidden />
                      <span className="truncate">{row.m3}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <p data-st-item className="mt-3 text-center font-mono text-[11px] text-white/48">
            {ui.step3Footnote}
          </p>
        </div>
      )}

      {/* Bottom dots indicator */}
      <div className="flex items-center justify-center gap-1.5" aria-hidden>
        {[0, 1, 2].map((d) => (
          <span
            key={d}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              d === index ? "w-6 bg-[#5ec4ff]" : "w-1.5 bg-white/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function GeoProcess({ content }: { content: GeoContent["process"] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [isDesk, setIsDesk] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesk(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useGSAP(
    () => {
      if (!isDesk) return;
      const steps = gsap.utils.toArray<HTMLElement>("[data-proc-step]");
      steps.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: i === 0 ? "top 85%" : "top 55%",
          end: "bottom 50%",
          onEnter: () => setActive(i),
          onEnterBack: () => setActive(i),
        });
      });
    },
    { scope: root, dependencies: [isDesk] },
  );

  return (
    <section ref={root} id="come-funziona" className="mx-auto w-full max-w-[1400px] scroll-mt-[calc(var(--bar-h)+12px)] px-3 pt-24 sm:px-5 sm:pt-40">
      <header className="mx-auto mb-12 max-w-[1280px] px-2 sm:mb-16 sm:px-3">
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">{content.eyebrow}</p>
        <h2 className="mt-3 max-w-[22ch] text-[clamp(34px,4.5vw,62px)] font-medium leading-[1.03] tracking-[-0.048em] text-ink">
          {content.title}
        </h2>
        <p className="mt-5 max-w-[52ch] text-[18px] leading-[1.55] text-ink-2">{content.lead}</p>
      </header>

      <div className="mx-auto grid max-w-[1280px] gap-8 px-2 sm:px-3 lg:grid-cols-12 lg:gap-14">
        {/* Left: Steps */}
        <ol className="flex min-w-0 flex-col gap-12 lg:col-span-5 lg:gap-0">
          {content.steps.map((step, i) => {
            const on = !isDesk || active === i;
            return (
              <li
                key={step.num}
                data-proc-step
                onClick={() => {
                  if (!isDesk) return;
                  setActive(i);
                  play("tick", 0.95 + i * 0.12);
                }}
                className="flex flex-col justify-center lg:min-h-[68vh] lg:cursor-pointer"
              >
                {/* Mobile visual card */}
                <div className="theme-dark relative mb-6 min-h-[340px] overflow-hidden rounded-[28px] bg-[#04070d] lg:hidden">
                  <ServiceBg k="geo" v={i} still />
                  <StageScene index={i} ui={content.stageUi} caption={step.stageCaption} />
                </div>

                <span
                  className={`font-mono text-[12.5px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                    on ? "text-[var(--sky)]" : "text-ink-3"
                  }`}
                >
                  {step.num}
                </span>

                <h3
                  className={`mt-3 text-[clamp(26px,2.7vw,38px)] font-medium leading-[1.08] tracking-[-0.04em] transition-colors duration-300 ${
                    on ? "text-ink" : "text-ink-3"
                  }`}
                >
                  {step.title}
                </h3>

                <p className="mt-4 max-w-[44ch] text-[16.5px] leading-[1.6] text-ink-2">{step.body}</p>

                <ul className="mt-6 space-y-2 border-l border-[var(--hair-strong)] pl-4">
                  {step.metrics.map((m) => (
                    <li key={m} className="text-[14px] text-ink-3">
                      {m}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>

        {/* Right: Sticky Stage (Desktop) */}
        <div className="hidden lg:col-span-7 lg:block">
          <div className="theme-dark sticky top-[calc(var(--bar-h)+28px)] h-[min(640px,calc(100svh-var(--bar-h)-56px))] overflow-hidden rounded-[40px] bg-[#04070d] shadow-[0_32px_80px_-32px_rgba(0,0,0,.6)]">
            <ServiceBg k="geo" v={active} still />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_90%_at_50%_50%,transparent_25%,rgba(3,6,12,.48)_100%)]"
            />
            <StageScene
              index={active}
              ui={content.stageUi}
              caption={content.steps[active]?.stageCaption ?? ""}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
