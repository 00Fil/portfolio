"use client";

import { useState } from "react";
import { ArrowRight, Check, CheckCircle2, Copy } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ENGINES, type GeoContent } from "@/content/geo";
import { play } from "@/lib/sound";
import { Bead } from "@/components/glass/Bead";
import { Drop } from "@/components/glass/Drop";
import { ServiceBg } from "@/components/sections/ServiceBg";
import { ServiceIcon } from "@/components/services/ServiceIcon";
import { BrandTile } from "./BrandTile";

export function GeoDeliverables({ content }: { content: GeoContent["deliverables"] }) {
  const [copyMode, setCopyMode] = useState<"after" | "before">("after");
  const [fileTab, setFileTab] = useState<"llms" | "robots">("llms");
  const [copied, setCopied] = useState(false);
  const [schemaIdx, setSchemaIdx] = useState(0);

  const activeFileText = fileTab === "llms" ? content.llms.llmsCode : content.llms.robotsCode;
  const activeSchema = content.schema.tabs[schemaIdx] ?? content.schema.tabs[0];

  const handleCopy = () => {
    try {
      void navigator.clipboard?.writeText(activeFileText);
    } catch {
      /* ignore clipboard unavailability */
    }
    play("copy", 1.15);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section id="include" className="mx-auto w-full max-w-[1400px] scroll-mt-[calc(var(--bar-h)+12px)] px-3 pt-24 sm:px-5 sm:pt-40">
      <header className="mx-auto mb-12 max-w-[1280px] px-2 sm:mb-16 sm:px-3">
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">{content.eyebrow}</p>
        <h2 className="mt-3 max-w-[20ch] text-[clamp(34px,4.5vw,62px)] font-medium leading-[1.03] tracking-[-0.048em] text-ink">
          {content.title}
        </h2>
        <p className="mt-5 max-w-[52ch] text-[18px] leading-[1.55] text-ink-2">{content.lead}</p>
      </header>

      <div className="mx-auto grid max-w-[1280px] gap-5 px-2 sm:px-3 lg:grid-cols-12">
        {/* Card 1: Answer-First Copywriting (Dark Gradient Island) */}
        <article className="theme-dark relative min-w-0 overflow-hidden rounded-[32px] bg-[#04070d] p-6 shadow-[0_24px_70px_-32px_rgba(0,0,0,.55)] sm:p-10 lg:col-span-7">
          <ServiceBg k="geo" v={1} still />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,15,.46)_0%,rgba(4,8,15,.74)_100%)]"
          />

          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#8fd8ff]">{content.copywriting.tag}</p>
              <h3 className="mt-3 max-w-[22ch] text-[clamp(24px,2.5vw,34px)] font-medium leading-[1.1] tracking-[-0.04em] text-white">
                {content.copywriting.title}
              </h3>
              <p className="mt-3 max-w-[48ch] text-[16px] leading-[1.58] text-white/78">{content.copywriting.body}</p>
            </div>

            <div className="rounded-[24px] bg-[#0a1018]/82 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.15)] backdrop-blur-2xl sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/65">
                  {copyMode === "after" ? content.copywriting.afterLabel : content.copywriting.beforeLabel}
                </span>

                <div className="inline-flex rounded-full bg-black/45 p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,.12)]">
                  <button
                    type="button"
                    aria-pressed={copyMode === "before"}
                    onClick={() => {
                      setCopyMode("before");
                      play("toggle", 0.85);
                    }}
                    className={`rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors ${
                      copyMode === "before" ? "bg-white/16 text-white" : "text-white/55 hover:text-white"
                    }`}
                  >
                    {content.copywriting.btnBefore}
                  </button>
                  <button
                    type="button"
                    aria-pressed={copyMode === "after"}
                    onClick={() => {
                      setCopyMode("after");
                      play("toggle", 1.15);
                    }}
                    className={`rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors ${
                      copyMode === "after"
                        ? "bg-[rgba(94,196,255,.28)] text-white shadow-[inset_0_0_0_1px_rgba(94,196,255,.55)]"
                        : "text-white/55 hover:text-white"
                    }`}
                  >
                    {content.copywriting.btnAfter}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                {copyMode === "after" ? (
                  <p className="text-[16px] leading-[1.6] text-white/90 sm:text-[17px]">
                    {content.copywriting.afterPrefix}
                    <span className="font-semibold text-[#8fd8ff] underline decoration-[#5ec4ff] decoration-2 underline-offset-4">
                      {content.copywriting.afterHighlight}
                    </span>
                    {content.copywriting.afterSuffix}
                  </p>
                ) : (
                  <p className="text-[15.5px] leading-[1.6] text-white/60 line-through decoration-white/30">
                    “{content.copywriting.beforeText}”
                  </p>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Card 2: /llms.txt & Robots Explorer (Adaptive Theme Surface) */}
        <article className="flex min-w-0 flex-col justify-between gap-6 rounded-[32px] bg-surface p-6 shadow-[inset_0_0_0_1px_var(--hair-strong)] sm:p-9 lg:col-span-5">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--sky)]">{content.llms.tag}</p>
            <h3 className="mt-3 text-[clamp(24px,2.3vw,32px)] font-medium leading-[1.1] tracking-[-0.04em] text-ink">
              {content.llms.title}
            </h3>
            <p className="mt-3 text-[15.5px] leading-[1.58] text-ink-2">{content.llms.body}</p>
          </div>

          <div className="min-w-0 overflow-hidden rounded-[22px] bg-sunken shadow-[inset_0_0_0_1px_var(--hair-strong)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--hair-strong)] px-3.5 py-2.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setFileTab("llms");
                    play("tick");
                  }}
                  className={`rounded-full px-3 py-1 font-mono text-[11.5px] transition-colors ${
                    fileTab === "llms" ? "bg-[var(--bg-surface)] text-ink shadow-xs" : "text-ink-3 hover:text-ink"
                  }`}
                >
                  {content.llms.fileTab}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFileTab("robots");
                    play("tick");
                  }}
                  className={`rounded-full px-3 py-1 font-mono text-[11.5px] transition-colors ${
                    fileTab === "robots" ? "bg-[var(--bg-surface)] text-ink shadow-xs" : "text-ink-3 hover:text-ink"
                  }`}
                >
                  {content.llms.robotsTab}
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-surface)] px-3 py-1 text-[12px] font-medium text-ink shadow-[inset_0_0_0_1px_var(--hair-strong)] transition-colors hover:text-[var(--sky)]"
              >
                {copied ? <Check size={12} strokeWidth={2.2} className="text-[var(--positive)]" /> : <Copy size={12} strokeWidth={1.8} />}
                <span>{copied ? content.llms.copiedBtn : content.llms.copyBtn}</span>
              </button>
            </div>

            <pre className="max-w-full overflow-x-auto p-4 font-mono text-[12px] leading-[1.6] text-ink-2">
              <code>{activeFileText}</code>
            </pre>
          </div>
        </article>

        {/* Card 3: Schema.org JSON-LD Tabs (Adaptive Theme Surface) */}
        <article className="flex min-w-0 flex-col justify-between gap-6 rounded-[32px] bg-surface p-6 shadow-[inset_0_0_0_1px_var(--hair-strong)] sm:p-9 lg:col-span-5">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--sky)]">{content.schema.tag}</p>
            <h3 className="mt-3 text-[clamp(24px,2.3vw,32px)] font-medium leading-[1.1] tracking-[-0.04em] text-ink">
              {content.schema.title}
            </h3>
            <p className="mt-3 text-[15.5px] leading-[1.58] text-ink-2">{content.schema.body}</p>
          </div>

          <div className="min-w-0 overflow-hidden rounded-[22px] bg-sunken shadow-[inset_0_0_0_1px_var(--hair-strong)]">
            <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--hair-strong)] px-3.5 py-2.5" role="tablist">
              {content.schema.tabs.map((tab, idx) => {
                const active = idx === schemaIdx;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setSchemaIdx(idx);
                      play("tick", 0.95 + idx * 0.1);
                    }}
                    className={`rounded-full px-3 py-1 font-mono text-[11.5px] transition-colors ${
                      active ? "bg-[var(--bg-surface)] text-ink shadow-xs" : "text-ink-3 hover:text-ink"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <pre className="max-w-full overflow-x-auto p-4 font-mono text-[12px] leading-[1.6] text-ink-2">
              <code>{activeSchema.code}</code>
            </pre>
          </div>
        </article>

        {/* Card 4: Monthly 4-Engine Audit (Dark Gradient Island) */}
        <article className="theme-dark relative min-w-0 overflow-hidden rounded-[32px] bg-[#04070d] p-6 shadow-[0_24px_70px_-32px_rgba(0,0,0,.55)] sm:p-10 lg:col-span-7">
          <ServiceBg k="geo" v={3} still />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,15,.46)_0%,rgba(4,8,15,.78)_100%)]"
          />

          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#8fd8ff]">{content.audit.tag}</p>
              <h3 className="mt-3 max-w-[22ch] text-[clamp(24px,2.5vw,34px)] font-medium leading-[1.1] tracking-[-0.04em] text-white">
                {content.audit.title}
              </h3>
              <p className="mt-3 max-w-[48ch] text-[16px] leading-[1.58] text-white/78">{content.audit.body}</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {ENGINES.map((e) => (
                  <Bead
                    key={e.id}
                    tint="rgba(10,16,26,.72)"
                    radius={18}
                    className="inline-flex items-center gap-2.5 py-2 pl-2 pr-4 text-[14px] font-medium text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)]"
                  >
                    <BrandTile engine={e.id} size={28} radius={9} interactive />
                    <span>{e.name}</span>
                  </Bead>
                ))}
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {content.audit.checks.map((chk) => (
                  <div
                    key={chk}
                    className="flex items-center gap-2.5 rounded-[16px] bg-[#0a1018]/80 px-4 py-3 text-[14px] text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,.12)] backdrop-blur-xl"
                  >
                    <CheckCircle2 size={16} strokeWidth={2} className="shrink-0 text-[#4cc38a]" aria-hidden />
                    <span>{chk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* SEO + GEO Synergy Bar */}
      <div className="mx-auto mt-6 max-w-[1280px] px-2 sm:px-3">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[28px] bg-surface p-6 shadow-[inset_0_0_0_1px_var(--hair-strong)] sm:p-8 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-start gap-4 sm:gap-5">
            <ServiceIcon k="seo" size={44} className="mt-0.5" />
            <div className="min-w-0">
              <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-[var(--sky)]">
                {content.seoBridge.eyebrow}
              </p>
              <h3 className="mt-1.5 max-w-[44ch] text-[clamp(20px,2vw,26px)] font-medium leading-[1.2] tracking-[-0.03em] text-ink">
                {content.seoBridge.title}
              </h3>
              <p className="mt-2 max-w-[64ch] text-[15px] leading-[1.58] text-ink-2">{content.seoBridge.body}</p>
            </div>
          </div>

          <Drop href="/servizi/seo" className="h-[46px] shrink-0 px-5 text-[14.5px] font-medium text-ink">
            <span>{content.seoBridge.cta}</span>
            <ArrowRight size={15} strokeWidth={1.8} aria-hidden />
          </Drop>
        </div>
      </div>
    </section>
  );
}
