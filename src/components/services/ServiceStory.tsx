"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  AiChat02Icon,
  Alert01Icon,
  Analytics01Icon,
  ArrowRight02Icon,
  BrowserIcon,
  ChartLineData01Icon,
  CheckmarkCircle02Icon,
  CircleArrowReload01Icon,
  Clock01Icon,
  ColorsIcon,
  ComputerIcon,
  CpuIcon,
  CreditCardIcon,
  CustomerSupportIcon,
  DashboardSpeed01Icon,
  DashboardSquare01Icon,
  DatabaseRestoreIcon,
  Download04Icon,
  FlashIcon,
  Globe02Icon,
  LaptopPhoneSyncIcon,
  Link01Icon,
  Location01Icon,
  LockKeyIcon,
  Notification01Icon,
  PackageIcon,
  PencilEdit02Icon,
  Plug01Icon,
  QuoteDownIcon,
  RepeatIcon,
  Rocket01Icon,
  Route01Icon,
  Route02Icon,
  Search01Icon,
  SecurityCheckIcon,
  SecurityLockIcon,
  Settings01Icon,
  Shield01Icon,
  ShieldUserIcon,
  SmartPhone01Icon,
  Store01Icon,
  TaskDone01Icon,
  TouchInteraction01Icon,
  UniversalAccessIcon,
  WorkflowSquare01Icon,
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

/** true su computer, false su telefono; null finché non si sa (prima del primo disegno nel browser). */
function useDesk() {
  const [desk, setDesk] = useState<boolean | null>(null);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const on = () => setDesk(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return desk;
}

export function How({ k, how, scene }: { k: ServiceKey; how: Story["how"]; scene: (i: number, on: boolean) => ReactNode }) {
  const root = useRef<HTMLElement>(null);
  // -1 finché non si arriva al primo passo: la scena parte quando la si guarda, non prima
  const [at, setAt] = useState(-1);
  const desk = useDesk();
  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el, i) => {
        ScrollTrigger.create({ trigger: el, start: i === 0 ? "top 92%" : "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setAt(i) });
      });
    },
    { scope: root, dependencies: [desk] },
  );
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
              {/* su telefono la scena sta sopra il testo e parte quando arriva a metà schermo */}
              <div className="theme-dark relative mb-6 aspect-[4/3] overflow-hidden rounded-[28px] bg-[#05070a] lg:hidden">
                <ServiceBg k={k} v={i} still />
                {desk === false && scene(i, at === i)}
              </div>
              <p className={`font-mono text-[12px] uppercase tracking-[0.14em] transition-colors duration-500 ${at === i ? "text-[var(--sky)]" : "text-ink-3"}`}>{pad(i + 1)}</p>
              <h3 className={`mt-3 max-w-[18ch] text-[clamp(26px,2.6vw,38px)] font-medium leading-[1.08] tracking-[-0.04em] transition-colors duration-500 ${at === i ? "text-ink" : "text-ink-3 lg:text-ink-3"}`}>{s.t}</h3>
              <p className="mt-4 max-w-[42ch] text-[17px] leading-[1.6] text-ink-2">{s.b}</p>
            </li>
          ))}
        </ol>
        <div className="hidden lg:block">
          <div className="theme-dark sticky top-[calc(var(--bar-h)+24px)] h-[calc(100svh-var(--bar-h)-48px)] max-h-[760px] overflow-hidden rounded-[40px] bg-[#05070a]">
            <ServiceBg k={k} v={Math.max(0, at)} still />
            {desk && how.steps.map((_, i) => <div key={i}>{scene(i, at === i)}</div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Cosa cambia: riga per riga, com'è oggi (che si spegne) e come diventa ───────────── */

export function Changes({ changes, labels }: { changes: { title: string; lead: string; rows: { from: string; to: string }[] }; labels: { before: string; after: string } }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-row]");
      if (prefersReducedMotion())
        return void rows.forEach((r) => {
          r.dataset.on = "1";
          (r.querySelector("[data-from]") as HTMLElement).style.opacity = "0.55";
        });
      rows.forEach((row) => {
        const q = gsap.utils.selector(row);
        gsap
          .timeline({ scrollTrigger: { trigger: row, start: "top 80%", once: true } })
          .fromTo(q("[data-from]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" })
          // "oggi" viene barrato e si spegne, la freccia ruota, "dopo" entra da sinistra
          .call(() => void (row.dataset.on = "1"), undefined, 0.45)
          .to(q("[data-from]"), { opacity: 0.55, duration: 0.6, ease: "power2.out" }, 0.45)
          .fromTo(q("[data-arrow]"), { scale: 0, rotate: -120 }, { scale: 1, rotate: 0, duration: 0.8, ease: "back.out(2)" }, 0.5)
          .fromTo(q("[data-to]"), { autoAlpha: 0, x: -22 }, { autoAlpha: 1, x: 0, duration: 0.9, ease: "expo.out" }, 0.62);
      });
    },
    { scope: root },
  );
  return (
    <section ref={root} className="mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-40">
      <header className="mb-10 grid gap-5 sm:mb-16 lg:grid-cols-[1fr_1.15fr] lg:items-end lg:gap-[120px]">
        <h2 className={h2}>{changes.title}</h2>
        <p className="max-w-[46ch] text-[18px] leading-[1.55] text-ink-2">{changes.lead}</p>
      </header>
      <div className="hidden grid-cols-[1fr_56px_1.15fr] gap-x-8 pb-4 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3 lg:grid">
        <span>{labels.before}</span>
        <span />
        <span className="text-[var(--sky)]">{labels.after}</span>
      </div>
      <ul className="border-b border-[var(--hair-strong)]">
        {changes.rows.map((r) => (
          <li key={r.from} data-row className="group grid items-center gap-x-8 gap-y-4 border-t border-[var(--hair-strong)] py-7 sm:py-9 lg:grid-cols-[1fr_56px_1.15fr]">
            <p data-from className="max-w-[36ch] text-[17px] leading-[1.45] text-ink-2 line-through decoration-transparent decoration-1 transition-[text-decoration-color] duration-700 group-data-[on]:decoration-current sm:text-[19px]">
              {r.from}
            </p>
            <span data-arrow className="justify-self-start">
              <Bead radius={22} className="flex h-11 w-11 rotate-90 items-center justify-center text-[var(--sky)] lg:rotate-0">
                <HugeiconsIcon icon={ArrowRight02Icon} size={19} strokeWidth={1.8} />
              </Bead>
            </span>
            <p data-to className="max-w-[30ch] text-[clamp(22px,2.3vw,31px)] font-medium leading-[1.14] tracking-[-0.035em] text-ink">
              {r.to}
            </p>
          </li>
        ))}
      </ul>
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

export function OpsScene({ i, on, ui }: SceneProps) {
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

/* ───────────── Una cronologia: cosa succede, ora per ora ───────────── */

export function Timeline({ timeline }: { timeline: NonNullable<Story["timeline"]> }) {
  const root = useRef<HTMLElement>(null);
  // orari (03:12) stanno in una colonna stretta; tappe a parole ("Ogni due settimane") vogliono più spazio e, su telefono, una riga loro
  const wide = timeline.items.some((x) => x.at.length > 6);
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
            <li key={i} data-titem className={`relative grid gap-x-6 gap-y-1.5 pb-12 pl-8 last:pb-0 ${wide ? "sm:grid-cols-[170px_1fr]" : "grid-cols-[auto_1fr] sm:grid-cols-[84px_1fr]"}`}>
              <span aria-hidden className="absolute left-0 top-[7px] h-[11px] w-[11px] rounded-full bg-[var(--bg-canvas)] shadow-[inset_0_0_0_2px_var(--sky)]" />
              <p className={`font-mono tabular-nums text-ink-3 ${wide ? "pt-1 text-[12px] uppercase tracking-[0.12em]" : "text-[14px]"}`}>{it.at}</p>
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

const INCLUDE_ICONS: Record<ServiceKey, Icon[]> = {
  ops: [Globe02Icon, Rocket01Icon, DatabaseRestoreIcon, CustomerSupportIcon],
  web: [BrowserIcon, DashboardSquare01Icon, SecurityLockIcon, PencilEdit02Icon],
  seo: [FlashIcon, Search01Icon, Location01Icon, ChartLineData01Icon],
  geo: [QuoteDownIcon, AiChat02Icon, Route01Icon, Analytics01Icon],
  apps: [SmartPhone01Icon, ComputerIcon, LaptopPhoneSyncIcon, Download04Icon],
  design: [Route02Icon, TouchInteraction01Icon, ColorsIcon, UniversalAccessIcon],
  ai: [AiChat02Icon, RepeatIcon, Plug01Icon, ShieldUserIcon],
  hw: [CpuIcon, DashboardSpeed01Icon, Notification01Icon, Clock01Icon],
  api: [Link01Icon, WorkflowSquare01Icon, TaskDone01Icon, Alert01Icon],
  shop: [Store01Icon, CreditCardIcon, PackageIcon, Settings01Icon],
};

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

