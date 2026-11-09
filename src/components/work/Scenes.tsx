"use client";

import type { gsap } from "gsap";
import { Check, Cloud, FileImage, Headphones, Laptop } from "lucide-react";

/**
 * Scene dei progetti: illustrazioni in HTML che una timeline GSAP porta in tre stati
 * (0 il problema, 1 la soluzione, 2 il risultato). Misure in cqw: scalano con il palco.
 * Ogni scena esporta il markup e la funzione che aggiunge i passaggi alla timeline.
 */

type Lang = "it" | "en";
type Q = (s: string) => Element[];
export type Build = (tl: gsap.core.Timeline, q: Q) => void;

const T = {
  it: {
    days: ["Lun", "Mar", "Mer", "Gio", "Ven"],
    msg: ["Giovedì posso alle 17 invece che alle 15?", "Spostata a giovedì alle 17 con Giulia. Confermi?", "Sì, grazie!"],
    ready: "Calendario di novembre pronto",
    approve: "Approva",
    copied: "Via Roma 12, Brescia",
    paste: "Incollato",
    shot: "Screenshot",
    phones: "Cuffie collegate",
    lecture: "Lezione 7 · Analisi I",
    transcript: ["Consideriamo ora il limite notevole", "che useremo spesso negli esercizi:"],
    later: "Il resto domani",
  },
  en: {
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    msg: ["Can I do Thursday at 5 instead of 3?", "Moved to Thursday at 5 with Giulia. Confirm?", "Yes, thanks!"],
    ready: "November schedule ready",
    approve: "Approve",
    copied: "12 Via Roma, Brescia",
    paste: "Pasted",
    shot: "Screenshot",
    phones: "Headphones connected",
    lecture: "Lecture 7 · Calculus I",
    transcript: ["Let us now look at the standard limit", "we will use often in the exercises:"],
    later: "The rest tomorrow",
  },
};

const panel = "absolute rounded-[2.4cqw] bg-surface shadow-[0_3cqw_8cqw_-2cqw_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(255,255,255,0.07)]";

/* ─────────────── CreaCloud: dai messaggi sparsi al calendario ─────────────── */

const SLOTS = [
  { c: 0, r: 0, n: "Giulia" },
  { c: 1, r: 1, n: "Marco" },
  { c: 2, r: 0, n: "Sara" },
  { c: 3, r: 2, n: "Giulia" },
  { c: 4, r: 1, n: "Luca" },
  { c: 0, r: 3, n: "Anna" },
  { c: 2, r: 2, n: "Marco" },
  { c: 4, r: 3, n: "Sara" },
  { c: 1, r: 4, n: "Luca" },
];
const SCATTER = [
  [-260, -40, -14], [-120, 160, 9], [-330, 120, -6], [-40, -150, 12], [-210, 260, -10],
  [60, 90, 7], [-380, 10, 16], [30, -60, -9], [-150, -190, 5],
];

export function CreaCloudScene({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <>
      <div data-cal className={`${panel} left-[38%] top-[6%] h-[88%] w-[60%] p-[2cqw]`} style={{ transform: "translateZ(0px)" }}>
        <div data-calgrid className="grid grid-cols-5 gap-[0.8cqw] pb-[1.4cqw] text-[1.6cqw] text-ink-3">
          {t.days.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="relative h-[calc(100%-4cqw)]">
          <div data-calgrid className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-[0.8cqw]">
            {Array.from({ length: 25 }).map((_, i) => (
              <span key={i} className="rounded-[1cqw] bg-white/[0.03]" />
            ))}
          </div>
          {SLOTS.map((s, i) => (
            <span
              key={i}
              data-slot
              className="absolute flex items-center rounded-[1cqw] bg-sunken px-[1cqw] text-[1.55cqw] font-medium text-ink-2 shadow-[0_1cqw_2cqw_rgba(0,0,0,0.5)]"
              style={{
                left: `calc(${s.c * 20}% + 0.4cqw)`,
                top: `calc(${s.r * 20}% + 0.4cqw)`,
                width: "calc(20% - 0.8cqw)",
                height: "calc(20% - 0.8cqw)",
              }}
            >
              <span data-fill className="absolute inset-0 rounded-[1cqw] bg-[var(--acc)] opacity-0" />
              <span className="relative">{s.n}</span>
            </span>
          ))}
        </div>
      </div>

      <div data-phone className={`${panel} left-[3%] top-[12%] flex h-[76%] w-[31%] flex-col gap-[1.4cqw] rounded-[3.6cqw] p-[1.8cqw] pt-[5cqw]`} style={{ transform: "translateZ(60px)" }}>
        <span className="absolute left-1/2 top-[1.6cqw] h-[1cqw] w-[8cqw] -translate-x-1/2 rounded-full bg-black" />
        <p data-b className="max-w-[85%] self-start rounded-[1.6cqw] rounded-bl-[0.4cqw] bg-sunken px-[1.4cqw] py-[1cqw] text-[1.6cqw] leading-[1.3] text-ink">{t.msg[0]}</p>
        <p data-b className="max-w-[85%] self-end rounded-[1.6cqw] rounded-br-[0.4cqw] bg-[var(--acc)] px-[1.4cqw] py-[1cqw] text-[1.6cqw] leading-[1.3] text-[var(--on-acc)]">{t.msg[1]}</p>
        <p data-b className="max-w-[85%] self-start rounded-[1.6cqw] rounded-bl-[0.4cqw] bg-sunken px-[1.4cqw] py-[1cqw] text-[1.6cqw] leading-[1.3] text-ink">{t.msg[2]}</p>
      </div>

      <div data-toast className="drop absolute bottom-[4%] left-[44%] flex items-center gap-[1.4cqw] py-[1cqw] pl-[1cqw] pr-[1.2cqw]" style={{ transform: "translateZ(120px)", ["--drop-tint" as string]: "rgba(28,28,30,0.7)" }}>
        <span className="flex h-[3.4cqw] w-[3.4cqw] items-center justify-center rounded-full bg-[var(--acc)]">
          <Check className="h-[2cqw] w-[2cqw] text-[var(--on-acc)]" strokeWidth={2.6} />
        </span>
        <span className="text-[1.8cqw] font-medium text-ink">{t.ready}</span>
        <span className="rounded-full bg-white/10 px-[1.4cqw] py-[0.6cqw] text-[1.6cqw] text-ink">{t.approve}</span>
      </div>
    </>
  );
}

export const creaCloudBuild: Build = (tl, q) => {
  const slots = q("[data-slot]");
  slots.forEach((el, i) => {
    const [x, y, r] = SCATTER[i];
    tl.set(el, { xPercent: x, yPercent: y, rotate: r }, 0);
  });
  tl.set(q("[data-phone]"), { autoAlpha: 0, xPercent: -20, rotateY: 18 }, 0)
    .set(q("[data-b]"), { autoAlpha: 0, y: 20, scale: 0.9 }, 0)
    .set(q("[data-toast]"), { autoAlpha: 0, y: 40, scale: 0.9 }, 0)
    .set(q("[data-calgrid]"), { autoAlpha: 0.3 }, 0)
    // 1: arriva il telefono, la conversazione si svolge
    .to(q("[data-phone]"), { autoAlpha: 1, xPercent: 0, rotateY: 0, duration: 0.35, ease: "power3.out" }, 0.75)
    .to(q("[data-b]"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.18, stagger: 0.16, ease: "back.out(2)" }, 0.95)
    // 2: le lezioni si mettono in ordine da sole
    .to(q("[data-calgrid]"), { autoAlpha: 1, duration: 0.3 }, 1.7)
    .to(slots, { xPercent: 0, yPercent: 0, rotate: 0, duration: 0.45, stagger: 0.035, ease: "power3.inOut" }, 1.75)
    .to(q("[data-fill]"), { opacity: 1, duration: 0.2, stagger: 0.035 }, 2.05)
    .to(slots, { color: "#ffffff", duration: 0.2, stagger: 0.035 }, 2.05)
    .to(q("[data-toast]"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.25, ease: "back.out(2)" }, 2.35);
};

/* ─────────────── Relay: dal giro lungo al passaggio diretto ─────────────── */

export function RelayScene({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <>
      <svg aria-hidden viewBox="0 0 100 80" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" fill="none">
        <path data-detour d="M30 26 C 30 10, 42 6, 50 8 C 58 6, 74 8, 76 14" stroke="#a6a6a1" strokeWidth="1.4" strokeDasharray="2 2.4" vectorEffect="non-scaling-stroke" />
        <path data-arc d="M34 34 Q 58 14 78 34" style={{ stroke: "var(--acc)" }} strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
      </svg>
      <div data-cloud className="absolute left-1/2 top-[2%] flex -translate-x-1/2 flex-col items-center text-ink-3">
        <Cloud className="h-[6cqw] w-[6cqw]" strokeWidth={1.2} />
      </div>

      {/* computer */}
      <div className="absolute left-[3%] top-[22%] w-[56%]" style={{ transform: "translateZ(0px)" }}>
        <div className={`${panel} relative aspect-[16/10] w-full p-[2.4cqw]`}>
          <div className="space-y-[1.2cqw]">
            <div className="h-[1.2cqw] w-[40%] rounded-full bg-white/10" />
            <div className="h-[1.2cqw] w-[70%] rounded-full bg-white/[0.06]" />
            <p className="text-[2cqw] text-ink">
              <span data-sel className="rounded-[0.4cqw] bg-[color-mix(in_srgb,var(--acc)_45%,transparent)] px-[0.4cqw] text-ink">{t.copied}</span>
            </p>
            <div className="h-[1.2cqw] w-[56%] rounded-full bg-white/[0.06]" />
            <div className="h-[1.2cqw] w-[64%] rounded-full bg-white/[0.06]" />
          </div>
          <Laptop className="absolute bottom-[2cqw] right-[2.4cqw] h-[3cqw] w-[3cqw] text-ink-3" strokeWidth={1.4} />
        </div>
        <div className="mx-auto h-[1.4cqw] w-[108%] -translate-x-[3.7%] rounded-b-[1.4cqw] bg-[#2c2c2e]" />
      </div>

      {/* telefono */}
      <div className={`${panel} left-[72%] top-[10%] flex h-[78%] w-[24%] flex-col gap-[1.4cqw] rounded-[3.6cqw] p-[1.6cqw] pt-[5cqw]`} style={{ transform: "translateZ(50px)" }}>
        <span className="absolute left-1/2 top-[1.6cqw] h-[1cqw] w-[7cqw] -translate-x-1/2 rounded-full bg-black" />
        <div className="rounded-[1.4cqw] bg-sunken p-[1.2cqw]">
          <p className="text-[1.3cqw] text-ink-3">{t.paste}</p>
          <p data-pasted className="mt-[0.4cqw] text-[1.6cqw] leading-tight text-ink">{t.copied}</p>
        </div>
        <div data-thumb-in className="flex aspect-[4/3] items-center justify-center rounded-[1.4cqw] bg-sunken">
          <FileImage className="h-[4cqw] w-[4cqw] text-[var(--acc)]" strokeWidth={1.2} />
        </div>
        <div data-hp-in className="mt-auto flex items-center gap-[1cqw] rounded-full bg-[var(--acc)] px-[1.2cqw] py-[0.8cqw] text-[var(--on-acc)]">
          <Headphones className="h-[2.2cqw] w-[2.2cqw]" strokeWidth={2} />
          <span className="text-[1.3cqw] font-medium leading-tight">{t.phones}</span>
        </div>
      </div>

      {/* oggetti in viaggio */}
      <span data-fly className="drop absolute left-[22%] top-[38%] whitespace-nowrap px-[1.4cqw] py-[0.8cqw] text-[1.7cqw] font-medium text-ink" style={{ transform: "translateZ(140px)", ["--drop-tint" as string]: "rgba(28,28,30,0.6)" }}>
        {t.copied}
      </span>
      <span data-shot className="absolute left-[24%] top-[44%] flex aspect-[4/3] w-[12%] items-center justify-center rounded-[1.2cqw] bg-[#2c2c2e] shadow-[0_2cqw_4cqw_rgba(0,0,0,0.6)]" style={{ transform: "translateZ(140px)" }}>
        <FileImage className="h-[3cqw] w-[3cqw] text-ink-2" strokeWidth={1.3} />
      </span>
      <span data-hp className="absolute left-[44%] top-[74%] flex h-[7cqw] w-[7cqw] items-center justify-center rounded-full bg-sunken text-ink shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" style={{ transform: "translateZ(100px)" }}>
        <Headphones className="h-[3.4cqw] w-[3.4cqw]" strokeWidth={1.5} />
        <span data-ring className="absolute inset-0 rounded-full border border-[var(--acc)] opacity-0" />
      </span>
    </>
  );
}

export const relayBuild: Build = (tl, q) => {
  tl.set(q("[data-fly]"), { autoAlpha: 0 }, 0)
    .set(q("[data-shot]"), { autoAlpha: 0 }, 0)
    .set(q("[data-pasted]"), { autoAlpha: 0 }, 0)
    .set(q("[data-thumb-in]"), { autoAlpha: 0, scale: 0.8 }, 0)
    .set(q("[data-hp-in]"), { autoAlpha: 0, y: 10 }, 0)
    // 0: il giro lungo, dal computer al cloud e giù al telefono
    .fromTo(q("[data-detour]"), { strokeDashoffset: 0 }, { strokeDashoffset: -12, duration: 0.7, ease: "none" }, 0)
    // 1: il cloud sparisce, il testo copiato va dritto al telefono, poi lo screenshot
    .to(q("[data-detour], [data-cloud]"), { autoAlpha: 0, duration: 0.2 }, 0.75)
    .to(q("[data-arc]"), { strokeDashoffset: 0, duration: 0.3, ease: "power2.inOut" }, 0.8)
    .to(q("[data-fly]"), { autoAlpha: 1, duration: 0.06 }, 0.85)
    .to(q("[data-fly]"), { keyframes: [{ left: "40%", top: "14%", scale: 0.95 }, { left: "70%", top: "24%", scale: 0.6 }], duration: 0.4, ease: "power1.inOut" }, 0.86)
    .to(q("[data-fly]"), { autoAlpha: 0, duration: 0.08 }, 1.24)
    .to(q("[data-pasted]"), { autoAlpha: 1, duration: 0.1 }, 1.24)
    .to(q("[data-shot]"), { autoAlpha: 1, duration: 0.06 }, 1.3)
    .to(q("[data-shot]"), { keyframes: [{ left: "46%", top: "18%", rotate: -6 }, { left: "76%", top: "36%", rotate: 0, scale: 0.7 }], duration: 0.4, ease: "power1.inOut" }, 1.32)
    .to(q("[data-shot]"), { autoAlpha: 0, duration: 0.08 }, 1.7)
    .to(q("[data-thumb-in]"), { autoAlpha: 1, scale: 1, duration: 0.15, ease: "back.out(2)" }, 1.7)
    // 2: le cuffie passano al telefono
    .to(q("[data-hp]"), { left: "78%", top: "78%", scale: 0.5, autoAlpha: 0, duration: 0.4, ease: "power3.inOut" }, 2.0)
    .fromTo(q("[data-ring]"), { scale: 1, opacity: 0.9 }, { scale: 2.2, opacity: 0, duration: 0.3 }, 2.0)
    .to(q("[data-hp-in]"), { autoAlpha: 1, y: 0, duration: 0.2, ease: "back.out(2)" }, 2.35);
};

/* ─────────────── uniSpace: la lezione si accorcia e si trascrive ─────────────── */

const WAVE = [7, 4, 9, 3, 6, 5, 8, 2, 7, 4, 6, 3, 9, 5];
const BARS = (seed: number) => Array.from({ length: 9 }, (_, i) => 25 + ((seed * 37 + i * 53) % 70));

export function UniSpaceScene({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <>
      <div data-player className={`${panel} left-[4%] top-[24%] w-[92%] p-[2.4cqw]`} style={{ transform: "translateZ(30px)" }}>
        <div className="flex items-center justify-between">
          <p className="text-[1.8cqw] font-medium text-ink">{t.lecture}</p>
          <span className="relative h-[3.2cqw] w-[6cqw] overflow-hidden rounded-full bg-sunken text-[1.6cqw] font-medium">
            <span data-x1 className="absolute inset-0 flex items-center justify-center text-ink-2">1×</span>
            <span data-x3 className="absolute inset-0 flex items-center justify-center bg-[var(--acc)] text-[var(--on-acc)]">3×</span>
          </span>
        </div>
        <div data-track className="mt-[2.4cqw] flex h-[9cqw] items-center">
          {WAVE.map((w, i) =>
            i % 2 === 0 ? (
              <span key={i} className="flex h-full shrink-0 items-center gap-[0.35cqw] px-[0.2cqw]" style={{ width: `${w * 1.3}%` }}>
                {BARS(i).map((h, k) => (
                  <span key={k} data-bar className="w-[0.45cqw] flex-1 rounded-full bg-[var(--acc)]" style={{ height: `${h}%` }} />
                ))}
              </span>
            ) : (
              <span key={i} data-gap className="h-px shrink-0 bg-white/20" style={{ width: `${w * 1.6}%` }} />
            ),
          )}
        </div>
        <div className="mt-[1.6cqw] h-[0.5cqw] w-full overflow-hidden rounded-full bg-sunken">
          <span data-progress className="block h-full w-full origin-left rounded-full bg-white/50" />
        </div>
      </div>

      <div data-script className={`${panel} left-[10%] top-[52%] w-[80%] p-[2.4cqw]`} style={{ transform: "translateZ(90px)" }}>
        {t.transcript.map((l) => (
          <p key={l} data-tl className="text-[1.9cqw] leading-[1.5] text-ink-2">
            {l}
          </p>
        ))}
        <p data-tl className="t-serif mt-[1cqw] text-center text-[3.4cqw] not-italic text-ink">
          <span className="italic">lim</span>
          <sub className="text-[1.6cqw]"> x→0 </sub>
          <span className="mx-[0.6cqw] inline-flex flex-col items-center align-middle text-[2.6cqw] leading-none">
            <span className="border-b border-white/60 px-[0.4cqw] pb-[0.2cqw] italic">sin x</span>
            <span className="pt-[0.2cqw] italic">x</span>
          </span>
          = 1
        </p>
      </div>
    </>
  );
}

export const uniSpaceBuild: Build = (tl, q) => {
  tl.set(q("[data-x3]"), { yPercent: 100 }, 0)
    .set(q("[data-script]"), { autoAlpha: 0, y: 30, rotateX: -20 }, 0)
    .set(q("[data-tl]"), { autoAlpha: 0, y: 10 }, 0)
    .fromTo(q("[data-progress]"), { scaleX: 0 }, { scaleX: 0.18, duration: 0.7, ease: "none" }, 0)
    // 1: i silenzi spariscono e la velocità sale
    .to(q("[data-gap]"), { width: 0, duration: 0.45, stagger: 0.03, ease: "power3.inOut" }, 0.8)
    .to(q("[data-x3]"), { yPercent: 0, duration: 0.2, ease: "back.out(2)" }, 0.9)
    .to(q("[data-progress]"), { scaleX: 0.75, duration: 0.6, ease: "power1.in" }, 1.1)
    .fromTo(q("[data-bar]"), { scaleY: 1 }, { scaleY: 0.55, duration: 0.15, stagger: { each: 0.004, yoyo: true, repeat: 1 } }, 1.1)
    // 2: arriva la trascrizione, formula compresa
    .to(q("[data-player]"), { top: "6%", duration: 0.3, ease: "power3.inOut" }, 1.8)
    .to(q("[data-script]"), { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.3, ease: "power3.out" }, 1.85)
    .to(q("[data-tl]"), { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.12 }, 2.0);
};
