"use client";

import { useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  CheckmarkCircle02Icon,
  CircleArrowReload01Icon,
  CustomerSupportIcon,
  DatabaseRestoreIcon,
  Globe02Icon,
  LockKeyIcon,
  Notification01Icon,
  Rocket01Icon,
  SecurityCheckIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import type { ServiceKey } from "@/content/services";
import { prefersReducedMotion } from "@/lib/env";
import { Bead } from "@/components/glass/Bead";
import { ServiceBg } from "@/components/sections/ServiceBg";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Icon = typeof Globe02Icon;
export type Story = {
  facts: { v: string; l: string }[];
  how: { title: string; lead: string; steps: { t: string; b: string }[] };
  timeline?: { title: string; lead: string; items: { at: string; t: string; b: string }[] };
  faq: { title: string; items: { q: string; a: string }[] };
  ui: Record<string, string>;
};

const pad = (n: number) => String(n).padStart(2, "0");
const h2 = "text-[clamp(36px,4.6vw,64px)] font-medium leading-[1.02] tracking-[-0.05em] text-ink";

/* ───────────── I numeri: tre impegni, grandi, senza contorno ───────────── */

export function Facts({ facts }: { facts: Story["facts"] }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-fact]", { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 80%", once: true } });
    },
    { scope: root },
  );
  return (
    <div ref={root} className="mx-auto grid w-full max-w-[1280px] gap-10 px-5 sm:grid-cols-3 sm:gap-8 sm:px-8">
      {facts.map((f) => (
        <div key={f.v} data-fact className="border-t border-[var(--hair-strong)] pt-6">
          <p className="text-[clamp(44px,5.4vw,80px)] font-medium leading-none tracking-[-0.055em] text-ink">{f.v}</p>
          <p className="mt-4 max-w-[26ch] text-[16px] leading-[1.5] text-ink-2">{f.l}</p>
        </div>
      ))}
    </div>
  );
}

/* ───────────── Come funziona: i passi scorrono a sinistra, a destra un pannello fermo che cambia scena ───────────── */

export function How({ k, how, ui }: { k: ServiceKey; how: Story["how"]; ui: Story["ui"] }) {
  const root = useRef<HTMLElement>(null);
  const [at, setAt] = useState(0);
  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el, i) => {
        ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setAt(i) });
      });
    },
    { scope: root },
  );
  const Scene = SCENES[k];
  return (
    <section ref={root} className="mx-auto w-full max-w-[1400px] px-3 pt-24 sm:px-5 sm:pt-40">
      <header className="mx-auto mb-12 max-w-[1280px] px-2 sm:mb-20 sm:px-3">
        <h2 className={h2}>{how.title}</h2>
        <p className="mt-5 max-w-[48ch] text-[18px] leading-[1.55] text-ink-2">{how.lead}</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-16">
        <ol className="px-2 sm:px-3 lg:pl-[max(12px,calc((100vw-1280px)/2-28px))]">
          {how.steps.map((s, i) => (
            <li key={s.t} data-step className="flex flex-col justify-center py-8 lg:min-h-[78vh] lg:py-0">
              {/* su telefono la scena sta sopra il testo */}
              <div className="theme-dark relative mb-6 aspect-[4/3] overflow-hidden rounded-[28px] bg-[#05070a] lg:hidden">
                <ServiceBg k={k} v={i} still />
                {Scene && <Scene i={i} on ui={ui} />}
              </div>
              <p className={`font-mono text-[12px] uppercase tracking-[0.14em] transition-colors duration-500 ${at === i ? "text-[var(--sky)]" : "text-ink-3"}`}>{pad(i + 1)}</p>
              <h3 className={`mt-3 max-w-[18ch] text-[clamp(26px,2.6vw,38px)] font-medium leading-[1.08] tracking-[-0.04em] transition-colors duration-500 ${at === i ? "text-ink" : "text-ink-3 lg:text-ink-3"}`}>{s.t}</h3>
              <p className="mt-4 max-w-[42ch] text-[17px] leading-[1.6] text-ink-2">{s.b}</p>
            </li>
          ))}
        </ol>
        <div className="hidden lg:block">
          <div className="theme-dark sticky top-[calc(var(--bar-h)+24px)] h-[calc(100svh-var(--bar-h)-48px)] max-h-[760px] overflow-hidden rounded-[40px] bg-[#05070a]">
            <ServiceBg k={k} v={at} still />
            {Scene && how.steps.map((_, i) => <Scene key={i} i={i} on={at === i} ui={ui} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Scene di "Come funziona": per ogni servizio un'interfaccia piccola e vera, una per passo ───────────── */

type SceneProps = { i: number; on: boolean; ui: Record<string, string> };

/** Contenitore di una scena: entra e esce in dissolvenza con un piccolo movimento. */
function Frame({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center p-8 transition-[opacity,transform,filter] duration-700 ease-[var(--ease-out)] ${on ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0 blur-[6px]"}`}>
      {children}
    </div>
  );
}
const glass = "rgba(12,18,26,.78)";
const Tile = ({ icon, tone = "sky" }: { icon: Icon; tone?: "sky" | "green" | "amber" }) => (
  <Bead tint={tone === "green" ? "rgba(48,209,88,.18)" : tone === "amber" ? "rgba(245,165,36,.2)" : "rgba(255,255,255,.1)"} radius={14} className="flex h-11 w-11 shrink-0 items-center justify-center text-white">
    <HugeiconsIcon icon={icon} size={22} strokeWidth={1.6} />
  </Bead>
);
const Row = ({ label, value, tone }: { label: string; value: string; tone?: string }) => (
  <div className="flex items-center justify-between border-t border-white/10 py-3 text-[14px] first:border-t-0">
    <span className="text-white/65">{label}</span>
    <span className={`font-mono tabular-nums ${tone ?? "text-white"}`}>{value}</span>
  </div>
);

function OpsScene({ i, on, ui }: SceneProps) {
  if (i === 0)
    return (
      <Frame on={on}>
        <Bead tint={glass} radius={28} className="w-full max-w-[400px] p-6 text-white">
          <div className="flex items-center gap-3.5">
            <Tile icon={Shield01Icon} />
            <div className="leading-tight">
              <p className="text-[17px] font-semibold tracking-[-0.02em]">{ui.s0t}</p>
              <p className="mt-0.5 text-[13px] text-white/55">{ui.s0s}</p>
            </div>
          </div>
          <div className="mt-5">
            <Row label={ui.s0r1} value="1.204" tone="text-[#ffb4ae]" />
            <Row label={ui.s0r2} value="86%" />
            <Row label={ui.s0r3} value="38 ms" />
          </div>
        </Bead>
      </Frame>
    );
  if (i === 1)
    return (
      <Frame on={on}>
        <div className="w-full max-w-[420px] space-y-3">
          <Bead tint={glass} radius={20} className="flex h-12 items-center gap-2.5 px-4 text-[14px] text-white">
            <HugeiconsIcon icon={LockKeyIcon} size={16} strokeWidth={1.8} className="text-[#6ee7a8]" />
            <span className="text-white/45">https://</span>
            <span className="-ml-2.5">studiobianchi.it</span>
          </Bead>
          <Bead tint={glass} radius={28} className="p-6 text-white">
            <div className="flex items-center gap-3.5">
              <Tile icon={SecurityCheckIcon} tone="green" />
              <div className="leading-tight">
                <p className="text-[17px] font-semibold tracking-[-0.02em]">{ui.s1t}</p>
                <p className="mt-0.5 text-[13px] text-white/55">{ui.s1s}</p>
              </div>
            </div>
            <div className="mt-5">
              <Row label={ui.s1r1} value="EU · FRA" />
              <Row label={ui.s1r2} value={ui.s1v2} tone="text-[#8ff0ad]" />
            </div>
          </Bead>
        </div>
      </Frame>
    );
  if (i === 2)
    return (
      <Frame on={on}>
        <Bead tint={glass} radius={28} className="w-full max-w-[420px] p-6 text-white">
          <div className="flex items-center gap-3.5">
            <Tile icon={Rocket01Icon} />
            <div className="leading-tight">
              <p className="text-[17px] font-semibold tracking-[-0.02em]">{ui.s2t}</p>
              <p className="mt-0.5 font-mono text-[12px] text-white/50">v2.4.1 · main</p>
            </div>
          </div>
          <ol className="mt-5 space-y-2">
            {[ui.s2a, ui.s2b, ui.s2c].map((s) => (
              <li key={s} className="flex items-center gap-3 rounded-[14px] bg-white/[.06] px-3.5 py-3 text-[14px]">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} strokeWidth={1.8} className="text-[#6ee7a8]" />
                {s}
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-center gap-2 text-[13px] text-white/55">
            <HugeiconsIcon icon={CircleArrowReload01Icon} size={15} strokeWidth={1.8} />
            {ui.s2d}
          </p>
        </Bead>
      </Frame>
    );
  return (
    <Frame on={on}>
      <div className="w-full max-w-[420px] space-y-3">
        <Bead tint={glass} radius={28} className="p-6 text-white">
          <div className="flex items-center gap-3.5">
            <Tile icon={DatabaseRestoreIcon} />
            <div className="leading-tight">
              <p className="text-[17px] font-semibold tracking-[-0.02em]">{ui.s3t}</p>
              <p className="mt-0.5 text-[13px] text-white/55">{ui.s3s}</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-1.5">
            {Array.from({ length: 14 }).map((_, d) => (
              <span key={d} className="flex aspect-square items-center justify-center rounded-[9px] bg-[rgba(110,231,168,.16)] text-[#8ff0ad] shadow-[inset_0_0_0_1px_rgba(110,231,168,.25)]">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} strokeWidth={2} />
              </span>
            ))}
          </div>
        </Bead>
        <Bead tint="rgba(30,34,40,.6)" radius={22} className="flex items-center gap-3 p-3 pr-4 text-white">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#0d0e10] text-[12px] font-medium shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)]">FC</span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[13px] font-semibold">{ui.s3n}</span>
            <span className="block truncate text-[12.5px] text-white/65">{ui.s3m}</span>
          </span>
          <HugeiconsIcon icon={Notification01Icon} size={16} strokeWidth={1.8} className="text-white/45" />
        </Bead>
      </div>
    </Frame>
  );
}

const SCENES: Partial<Record<ServiceKey, (p: SceneProps) => ReactNode>> = { ops: OpsScene };

/* ───────────── Una cronologia: cosa succede, ora per ora ───────────── */

export function Timeline({ timeline }: { timeline: NonNullable<Story["timeline"]> }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-tfill]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-tlist]", start: "top 70%", end: "bottom 60%", scrub: 0.5 } });
      gsap.utils.toArray<HTMLElement>("[data-titem]").forEach((el) =>
        gsap.from(el, { y: 24, autoAlpha: 0, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 82%", once: true } }),
      );
    },
    { scope: root },
  );
  return (
    <section ref={root} className="mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-40">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
        <header className="lg:sticky lg:top-[calc(var(--bar-h)+48px)] lg:self-start">
          <h2 className={h2}>{timeline.title}</h2>
          <p className="mt-5 max-w-[36ch] text-[18px] leading-[1.55] text-ink-2">{timeline.lead}</p>
        </header>
        <ol data-tlist className="relative">
          <span aria-hidden className="absolute bottom-3 left-[5px] top-3 w-px bg-[var(--hair-strong)]">
            <span data-tfill className="absolute inset-0 origin-top bg-[var(--sky)]" />
          </span>
          {timeline.items.map((it, i) => (
            <li key={i} data-titem className="relative grid grid-cols-[auto_1fr] gap-x-6 pb-12 pl-8 last:pb-0 sm:grid-cols-[84px_1fr]">
              <span aria-hidden className="absolute left-0 top-[7px] h-[11px] w-[11px] rounded-full bg-[var(--bg-canvas)] shadow-[inset_0_0_0_2px_var(--sky)]" />
              <p className="font-mono text-[14px] tabular-nums text-ink-3">{it.at}</p>
              <div>
                <p className="text-[20px] font-medium leading-[1.25] tracking-[-0.025em] text-ink">{it.t}</p>
                <p className="mt-2 max-w-[44ch] text-[16px] leading-[1.55] text-ink-2">{it.b}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ───────────── Cosa include: una griglia ordinata, un'icona per voce ───────────── */

const INCLUDE_ICONS: Partial<Record<ServiceKey, Icon[]>> = { ops: [Globe02Icon, Rocket01Icon, DatabaseRestoreIcon, CustomerSupportIcon] };

export function Bento({ k, title, items }: { k: ServiceKey; title: string; items: { title: string; body: string }[] }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-bento]", { y: 30, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 78%", once: true } });
    },
    { scope: root },
  );
  const icons = INCLUDE_ICONS[k] ?? [];
  return (
    <section ref={root} id="include" className="mx-auto w-full max-w-[1280px] scroll-mt-10 px-5 pt-24 sm:px-8 sm:pt-40">
      <h2 className={`${h2} mb-10 sm:mb-14`}>{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it, i) => (
          <article key={it.title} data-bento className="rounded-[28px] bg-[var(--bg-surface)] p-7 shadow-[inset_0_0_0_1px_var(--hair)] sm:p-9">
            {icons[i] && (
              <Bead radius={15} className="mb-8 flex h-12 w-12 items-center justify-center text-ink">
                <HugeiconsIcon icon={icons[i]} size={22} strokeWidth={1.6} />
              </Bead>
            )}
            <h3 className="text-[24px] font-medium leading-[1.15] tracking-[-0.03em] text-ink">{it.title}</h3>
            <p className="mt-3 max-w-[44ch] text-[16px] leading-[1.6] text-ink-2">{it.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Domande: una alla volta, la risposta si apre sotto ───────────── */

export function Faq({ faq }: { faq: Story["faq"] }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-40">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
        <h2 className={h2}>{faq.title}</h2>
        <ul className="border-t border-[var(--hair-strong)]">
          {faq.items.map((it, i) => {
            const on = open === i;
            return (
              <li key={it.q} className="border-b border-[var(--hair-strong)]">
                <button type="button" aria-expanded={on} onClick={() => setOpen(on ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                  <span className="text-[19px] font-medium leading-[1.3] tracking-[-0.02em] text-ink">{it.q}</span>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--hover)] text-ink transition-transform duration-500 ease-[var(--ease-out)] ${on ? "rotate-45" : ""}`}>
                    <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} />
                  </span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out)] ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="max-w-[56ch] pb-7 text-[16.5px] leading-[1.65] text-ink-2">{it.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

