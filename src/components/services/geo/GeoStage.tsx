"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { AlertCircle, CheckCircle2, Globe, Sparkles, XCircle } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { ENGINES, type EngineId, type GeoContent } from "@/content/geo";
import { prefersReducedMotion } from "@/lib/env";
import { play } from "@/lib/sound";
import { Bead } from "@/components/glass/Bead";
import { ServiceBg } from "@/components/sections/ServiceBg";
import { BrandTile, ENGINE_PITCH } from "./BrandTile";

gsap.registerPlugin(useGSAP);

export function GeoStage({
  locale,
  content,
}: {
  locale: Locale;
  content: GeoContent["stage"];
}) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [engineId, setEngineId] = useState<EngineId>("chatgpt");
  const [mode, setMode] = useState<"after" | "before">("after");

  const root = useRef<HTMLElement>(null);
  const responseBox = useRef<HTMLDivElement>(null);

  const engineIndex = ENGINES.findIndex((e) => e.id === engineId);
  const activeEngine = ENGINES[engineIndex] ?? ENGINES[0];
  const scenario = content.scenarios[scenarioIdx] ?? content.scenarios[0];
  const resp = scenario.responses[engineId];

  useGSAP(
    () => {
      if (prefersReducedMotion() || !responseBox.current) return;
      const q = gsap.utils.selector(responseBox.current);
      gsap.fromTo(
        responseBox.current,
        { y: 10, opacity: 0.35 },
        { y: 0, opacity: 1, duration: 0.42, ease: "expo.out", overwrite: true },
      );
      if (mode === "after") {
        gsap.fromTo(
          q("[data-stage-ul]"),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.55, delay: 0.14, ease: "expo.out", overwrite: true },
        );
      }
    },
    { scope: root, dependencies: [scenarioIdx, engineId, mode] },
  );

  const pickScenario = (idx: number) => {
    setScenarioIdx(idx);
    play("tick", 1 + idx * 0.08);
  };

  const pickEngine = (id: EngineId) => {
    setEngineId(id);
    play("copy", ENGINE_PITCH[id]);
  };

  const toggleMode = (next: "after" | "before") => {
    if (mode === next) return;
    setMode(next);
    play("toggle", next === "after" ? 1.15 : 0.85);
  };

  return (
    <section
      ref={root}
      id="come-sceglie"
      className="mx-auto mt-24 w-full max-w-[1400px] scroll-mt-[calc(var(--bar-h)+12px)] px-3 sm:mt-40 sm:px-5"
    >
      <div className="theme-dark relative overflow-hidden rounded-[32px] bg-[#04070d] shadow-[0_32px_90px_-34px_rgba(0,0,0,.65)] sm:rounded-[44px]">
        <ServiceBg k="geo" v={Math.max(0, engineIndex)} live />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,13,.56)_0%,rgba(4,7,13,.42)_50%,rgba(4,7,13,.72)_100%)]"
        />

        <div className="relative px-5 py-10 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          {/* Header & Scenario Switcher */}
          <header className="grid gap-8 lg:grid-cols-[1.1fr_auto] lg:items-end">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#8fd8ff]">{content.eyebrow}</p>
              <h2 className="mt-3 max-w-[20ch] text-[clamp(30px,4.2vw,58px)] font-medium leading-[1.03] tracking-[-0.045em] text-white">
                {content.title}
              </h2>
              <p className="mt-4 max-w-[52ch] text-[16.5px] leading-[1.55] text-white/75">{content.lead}</p>
            </div>

            <div className="flex flex-wrap gap-2" role="tablist" aria-label={content.promptLabel}>
              {content.scenarios.map((s, idx) => {
                const active = idx === scenarioIdx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => pickScenario(idx)}
                    className={`group rounded-full px-4 py-2 text-[13.5px] font-medium transition-all duration-300 ${
                      active
                        ? "bg-white text-black shadow-[0_10px_28px_-10px_rgba(255,255,255,.6)]"
                        : "bg-white/[0.08] text-white/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)] hover:bg-white/[0.14] hover:text-white"
                    }`}
                  >
                    {s.tab}
                  </button>
                );
              })}
            </div>
          </header>

          {/* Engine Selector Bar + After/Before Toggle */}
          <div className="mt-9 flex flex-col gap-4 border-t border-white/10 pt-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap" role="tablist" aria-label="AI Assistants">
              {ENGINES.map((eng) => {
                const active = eng.id === engineId;
                return (
                  <button
                    key={eng.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => pickEngine(eng.id)}
                    className={`inline-flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-[14.5px] font-medium transition-all duration-300 ${
                      active
                        ? "bg-white/[0.18] text-white shadow-[inset_0_0_0_1px_rgba(94,196,255,.65),0_12px_30px_-14px_rgba(94,196,255,.55)]"
                        : "bg-white/[0.06] text-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)] hover:bg-white/[0.12] hover:text-white"
                    }`}
                  >
                    <BrandTile engine={eng.id} size={30} radius={10} variant={active ? "light" : "glass"} />
                    <span>{eng.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Segmented Mode Control */}
            <div
              className="inline-flex w-fit items-center rounded-full bg-black/45 p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)] backdrop-blur-md"
              role="group"
              aria-label="Compare before and after GEO"
            >
              <button
                type="button"
                aria-pressed={mode === "before"}
                onClick={() => toggleMode("before")}
                className={`rounded-full px-4 py-1.5 text-[13.5px] font-medium transition-all duration-300 ${
                  mode === "before"
                    ? "bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.2)]"
                    : "text-white/60 hover:text-white/90"
                }`}
              >
                {content.toggleBefore}
              </button>
              <button
                type="button"
                aria-pressed={mode === "after"}
                onClick={() => toggleMode("after")}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13.5px] font-medium transition-all duration-300 ${
                  mode === "after"
                    ? "bg-[rgba(94,196,255,.28)] text-white shadow-[inset_0_0_0_1px_rgba(94,196,255,.65)]"
                    : "text-white/60 hover:text-white/90"
                }`}
              >
                <Sparkles size={13} strokeWidth={2} className="text-[#8fd8ff]" aria-hidden />
                {content.toggleAfter}
              </button>
            </div>
          </div>

          {/* Interactive Stage Window */}
          <div className="mt-7 grid gap-5 lg:grid-cols-12">
            {/* Left / Assistant Window */}
            <div className="flex min-w-0 flex-col justify-between rounded-[28px] bg-[#0a1018]/82 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.14),0_26px_70px_-30px_rgba(0,0,0,.85)] backdrop-blur-2xl sm:p-8 lg:col-span-7">
              <div>
                {/* Window Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <BrandTile engine={activeEngine.id} size={38} radius={12} />
                    <div className="min-w-0">
                      <p className="text-[16px] font-semibold tracking-[-0.02em] text-white">{activeEngine.name}</p>
                      <p className="text-[12.5px] text-white/60">{activeEngine.surfaceNote[locale]}</p>
                    </div>
                  </div>
                  <Bead
                    tint={mode === "after" ? "rgba(76,195,138,.18)" : "rgba(240,165,74,.18)"}
                    radius={99}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium ${
                      mode === "after" ? "text-[#78e0b0]" : "text-[#f7be76]"
                    }`}
                  >
                    {mode === "after" ? (
                      <CheckCircle2 size={13} strokeWidth={2} aria-hidden />
                    ) : (
                      <AlertCircle size={13} strokeWidth={2} aria-hidden />
                    )}
                    <span>{mode === "after" ? content.citedTag : content.missingTag}</span>
                  </Bead>
                </div>

                {/* User Prompt */}
                <div className="mt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11.5px] uppercase tracking-[0.12em] text-white/45">
                    <span>{content.promptLabel}</span>
                    <span>{scenario.sector}</span>
                  </div>
                  <div className="mt-2 rounded-[18px] bg-white/[0.06] px-4 py-3 text-[15px] leading-[1.5] text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] sm:px-5 sm:py-3.5 sm:text-[15.5px]">
                    “{scenario.prompt}”
                  </div>
                </div>

                {/* Assistant Answer */}
                <div ref={responseBox} className="mt-6">
                  {mode === "after" ? (
                    <div className="space-y-4">
                      <p className="text-[17px] leading-[1.6] tracking-[-0.015em] text-white/92 sm:text-[19.5px]">
                        {resp.after.prefix}
                        <span className="relative inline-block font-semibold text-[#8fd8ff]">
                          {resp.after.highlight}
                          <span
                            data-stage-ul
                            aria-hidden
                            className="absolute -bottom-0.5 left-0 h-[2.5px] w-full origin-left rounded-full bg-[#5ec4ff]"
                          />
                        </span>
                        {resp.after.suffix}
                      </p>

                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/50">
                          {resp.after.sourceLabel}
                        </span>
                        <Bead
                          tint="rgba(94,196,255,.16)"
                          radius={99}
                          className="inline-flex max-w-full items-center gap-1.5 px-3 py-1 text-[13px] font-medium text-[#bfe8ff]"
                        >
                          <Globe size={13} strokeWidth={1.8} className="shrink-0" aria-hidden />
                          <span className="truncate">{resp.after.citationUrl}</span>
                        </Bead>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-[16.5px] leading-[1.6] text-white/75 sm:text-[18.5px]">{resp.before.text}</p>
                      <div className="rounded-[16px] bg-[rgba(240,165,74,.11)] px-4 py-3 text-[13.5px] leading-[1.5] text-[#f7be76] shadow-[inset_0_0_0_1px_rgba(240,165,74,.25)]">
                        {resp.before.gap}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-7 border-t border-white/10 pt-4 font-mono text-[11.5px] text-white/45">
                {content.disclaimer}
              </p>
            </div>

            {/* Right / Verification Signal Inspector */}
            <div className="flex min-w-0 flex-col justify-between rounded-[28px] bg-[#0a1018]/82 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.14),0_26px_70px_-30px_rgba(0,0,0,.85)] backdrop-blur-2xl sm:p-8 lg:col-span-5">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-white/65">
                    {content.signalsTitle}
                  </p>
                  <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 font-mono text-[11px] text-[#8fd8ff]">
                    {activeEngine.bot}
                  </span>
                </div>

                <ul className="mt-5 grid gap-3">
                  {(mode === "after" ? resp.after.signals : resp.before.signals).map((sig) => (
                    <li
                      key={sig.label}
                      className={`flex items-center justify-between gap-3 rounded-[16px] px-4 py-3.5 transition-colors duration-300 ${
                        sig.ok
                          ? "bg-white/[0.07] shadow-[inset_0_0_0_1px_rgba(94,196,255,.28)]"
                          : "bg-white/[0.03] shadow-[inset_0_0_0_1px_rgba(255,255,255,.07)]"
                      }`}
                    >
                      <span className={`text-[14.5px] leading-[1.35] ${sig.ok ? "text-white" : "text-white/55"}`}>
                        {sig.label}
                      </span>
                      {sig.ok ? (
                        <CheckCircle2 size={18} strokeWidth={2} className="shrink-0 text-[#4cc38a]" aria-hidden />
                      ) : (
                        <XCircle size={18} strokeWidth={1.7} className="shrink-0 text-white/30" aria-hidden />
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 rounded-[18px] bg-white/[0.05] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/45">
                  {content.sourcePanelTitle}
                </p>
                <p className="mt-1.5 text-[13.5px] leading-[1.5] text-white/78">
                  {mode === "after"
                    ? resp.after.sourceLabel + " · " + resp.after.citationUrl
                    : resp.before.gap}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
