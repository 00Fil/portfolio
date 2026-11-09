"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import * as si from "simple-icons";
import { Check, Database, Sparkles } from "lucide-react";
import { prefersReducedMotion } from "@/lib/env";
import type { ServiceKey } from "@/content/services";

gsap.registerPlugin(useGSAP);

/**
 * Disegni dei servizi: pannelli di vetro con contenuti veri, su un fondo di fibre azzurre.
 * Non si toccano: partono da soli quando entrano nello schermo e mostrano cosa fa il servizio.
 * Ognuno è disegnato su una tela fissa e scalato per stare nello spazio che ha.
 */
export type WidgetText = Record<string, string>;

const SKY = "#5ec4ff";
const glass = "rounded-[16px] bg-[rgba(14,16,20,.66)] backdrop-blur-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,.09),0_24px_60px_-24px_rgba(0,0,0,.95)]";
const Brand = ({ icon, className = "h-4 w-4" }: { icon: { path: string }; className?: string }) => (
  <svg viewBox="0 0 24 24" className={`fill-current ${className}`} aria-hidden>
    <path d={icon.path} />
  </svg>
);
const WindowsGlyph = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`fill-current ${className}`} aria-hidden>
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <rect x="13" y="3" width="8" height="8" rx="1" />
    <rect x="3" y="13" width="8" height="8" rx="1" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
  </svg>
);

/** Tela fissa W×H scalata nello spazio disponibile; la timeline parte la prima volta che è visibile. */
function Canvas({
  w,
  h,
  max = 1,
  build,
  children,
}: {
  w: number;
  h: number;
  max?: number;
  build: (q: (s: string) => Element[]) => gsap.core.Timeline;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const o = box.current!;
    const ro = new ResizeObserver(() => {
      const s = Math.min(max, o.clientWidth / w, o.clientHeight / h);
      stage.current!.style.transform = `translate(-50%, -50%) scale(${s})`;
    });
    ro.observe(o);
    return () => ro.disconnect();
  }, [w, h, max]);
  useGSAP(
    () => {
      const tl = build(gsap.utils.selector(stage.current)).pause();
      if (prefersReducedMotion()) return void tl.progress(1);
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            tl.play();
            io.disconnect();
          }
        },
        { threshold: 0.4 },
      );
      io.observe(box.current!);
      return () => io.disconnect();
    },
    { scope: box },
  );
  return (
    <div ref={box} aria-hidden className="pointer-events-none relative h-full w-full min-w-0 select-none overflow-hidden">
      <div ref={stage} className="absolute left-1/2 top-1/2" style={{ width: w, height: h, transform: "translate(-50%, -50%) scale(0.5)" }}>
        {children}
      </div>
    </div>
  );
}

const enter = { y: 12, autoAlpha: 0, duration: 0.7, ease: "power3.out" };

/* Siti e web app: la finestra si apre e il sito vero si mette a fuoco. */
function WebV({ t, max }: { t: WidgetText; max?: number }) {
  return (
    <Canvas
      w={440}
      h={290}
      max={max}
      build={(q) =>
        gsap
          .timeline()
          .from(q("[data-win]"), { ...enter, y: 20, duration: 0.9 })
          .fromTo(q("[data-shot]"), { scale: 1.08, filter: "blur(10px)", opacity: 0 }, { scale: 1, filter: "blur(0px)", opacity: 1, duration: 1.2, ease: "power2.out" }, 0.3)
          .from(q("[data-chip]"), { ...enter, stagger: 0.12 }, 0.9)
      }
    >
      <div data-win className={`absolute inset-x-0 top-0 h-[260px] overflow-hidden ${glass}`}>
        <div className="flex h-8 items-center gap-1.5 border-b border-white/[0.06] px-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/15" />
          ))}
          <span className="mx-auto flex h-5 w-44 items-center justify-center rounded-md bg-white/[0.06] font-mono text-[10px] text-ink-3">{t.url}</span>
        </div>
        <div className="relative h-[228px] overflow-hidden">
          <img data-shot src="/work/unispace/studykit.webp" alt="" className="h-full w-full object-cover object-left-top" />
        </div>
      </div>
      <div className="absolute bottom-0 right-4 flex gap-2">
        {[
          [si.siNextdotjs, "Next.js"],
          [si.siPostgresql, "PostgreSQL"],
        ].map(([ic, n]) => (
          <span key={n as string} data-chip className={`flex h-9 items-center gap-2 px-3 text-[12px] text-ink ${glass} rounded-full`}>
            <Brand icon={ic as { path: string }} className="h-3.5 w-3.5 text-ink-2" />
            {n as string}
          </span>
        ))}
      </div>
    </Canvas>
  );
}

/* SEO: il report del sito, punteggi a 100 e Core Web Vitals entro le soglie. */
const SCORES = ["Performance", "Accessibility", "Best practices", "SEO"];
function SeoV({ t, max }: { t: WidgetText; max?: number }) {
  const vit = [
    ["LCP", "< 2,5 s", 0.46],
    ["INP", "< 200 ms", 0.32],
    ["CLS", "< 0,1", 0.2],
  ] as const;
  return (
    <Canvas
      w={560}
      h={150}
      max={max}
      build={(q) => {
        const tl = gsap.timeline().from(q("[data-panel]"), enter);
        q("[data-ring]").forEach((r, i) => {
          const o = { v: 0 };
          const num = r.querySelector("[data-num]")!;
          tl.fromTo(r.querySelector("[data-arc]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1.5, ease: "power2.out" }, 0.3 + i * 0.1).to(
            o,
            { v: 100, duration: 1.5, ease: "power2.out", onUpdate: () => void (num.textContent = String(Math.round(o.v))) },
            0.3 + i * 0.1,
          );
        });
        return tl.from(q("[data-bar]"), { scaleX: 0, transformOrigin: "0 50%", duration: 1, stagger: 0.12, ease: "power2.out" }, 0.6);
      }}
    >
      <div data-panel className={`absolute inset-0 flex items-center gap-6 px-6 ${glass}`}>
        <div className="flex gap-4">
          {SCORES.map((n) => (
            <div key={n} data-ring className="flex w-[58px] flex-col items-center gap-2">
              <span className="relative flex h-[52px] w-[52px] items-center justify-center">
                <svg viewBox="0 0 52 52" className="absolute inset-0 -rotate-90">
                  <circle cx="26" cy="26" r="23" fill="none" stroke="rgba(94,196,255,.14)" strokeWidth="2.5" />
                  <circle data-arc cx="26" cy="26" r="23" fill="none" stroke={SKY} strokeWidth="2.5" strokeLinecap="round" pathLength={100} strokeDasharray="100" />
                </svg>
                <span data-num className="t-fig text-[17px] font-medium text-ink">
                  100
                </span>
              </span>
              <span className="text-center text-[10px] leading-tight text-ink-3">{n}</span>
            </div>
          ))}
        </div>
        <span className="h-[96px] w-px bg-white/[0.08]" />
        <div className="flex flex-1 flex-col gap-3">
          {vit.map(([k, th, v]) => (
            <div key={k} className="grid grid-cols-[30px_64px_1fr] items-center gap-3 text-[11.5px]">
              <span className="font-mono text-ink">{k}</span>
              <span className="relative block h-1 w-[64px] rounded-full bg-white/[0.07]">
                <span data-bar className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${v * 100}%`, background: SKY }} />
              </span>
              <span className="t-fig whitespace-nowrap text-ink-3">
                {th}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Canvas>
  );
}

/* GEO: la domanda a un assistente AI, la risposta si scrive e cita il sito. */
function GeoV({ t, max }: { t: WidgetText; max?: number }) {
  const words = t.geoA.split(" ");
  return (
    <Canvas
      w={560}
      h={150}
      max={max}
      build={(q) =>
        gsap
          .timeline()
          .from(q("[data-panel]"), enter)
          .from(q("[data-q]"), enter, 0.2)
          .from(q("[data-w]"), { autoAlpha: 0, duration: 0.05, stagger: 0.045 }, 0.7)
          .from(q("[data-src]"), { ...enter, y: 6 })
          .fromTo(q("[data-src]"), { boxShadow: "inset 0 0 0 1px rgba(94,196,255,.25)" }, { boxShadow: `inset 0 0 0 1px ${SKY}, 0 0 22px -6px ${SKY}`, duration: 0.8 })
      }
    >
      <div data-panel className={`absolute inset-0 flex flex-col justify-center gap-3 px-6 ${glass}`}>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-ink-3">
            <Sparkles size={13} style={{ color: SKY }} />
            {t.geoLabel}
          </span>
          <span data-q className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[11.5px] text-ink">
            {t.geoQ}
          </span>
        </div>
        <p className="text-[13px] leading-[1.5] text-ink">
          {words.map((w, i) => (
            <span key={i} data-w>
              {w}{" "}
            </span>
          ))}
          <sup data-w className="font-mono text-[10px]" style={{ color: SKY }}>
            [1]
          </sup>
        </p>
        <span data-src className="inline-flex h-6 w-max items-center gap-2 rounded-full bg-[rgba(94,196,255,.08)] px-2.5 text-[11px] text-ink-2">
          <span className="font-mono" style={{ color: SKY }}>
            1
          </span>
          {t.url}
        </span>
      </div>
    </Canvas>
  );
}

/* App multipiattaforma: un'app al centro, le piattaforme si accendono una a una. */
const PLATFORMS: [string, ReactNode][] = [
  ["Android", <Brand key="a" icon={si.siAndroid} className="h-5 w-5" />],
  ["iOS", <Brand key="i" icon={si.siApple} className="h-5 w-5" />],
  ["macOS", <Brand key="m" icon={si.siMacos} className="h-5 w-8" />],
  ["Windows", <WindowsGlyph key="w" className="h-[18px] w-[18px]" />],
  ["Linux", <Brand key="l" icon={si.siLinux} className="h-5 w-5" />],
];
function AppsV({ max }: { max?: number }) {
  return (
    <Canvas
      w={320}
      h={170}
      max={max}
      build={(q) =>
        gsap
          .timeline()
          .from(q("[data-core]"), { ...enter, scale: 0.85 })
          .from(q("[data-link]"), { strokeDashoffset: 100, duration: 0.7, stagger: 0.1, ease: "power2.out" }, 0.4)
          .to(q("[data-pf]"), { color: "#f2f2f0", boxShadow: "inset 0 0 0 1px rgba(94,196,255,.55)", duration: 0.4, stagger: 0.1 }, 0.8)
      }
    >
      <img data-core src="/work/relay/icon.webp" alt="" className="absolute left-1/2 top-0 h-14 w-14 -translate-x-1/2 rounded-[16px] shadow-[0_18px_40px_-14px_rgba(0,0,0,.9)]" />
      <svg viewBox="0 0 320 170" className="absolute inset-0 h-full w-full">
        {PLATFORMS.map((_, i) => {
          const x = 32 + i * 64;
          return <path key={i} data-link d={`M160 58 C160 86 ${x} 82 ${x} 106`} fill="none" stroke="rgba(94,196,255,.35)" pathLength={100} strokeDasharray="100" />;
        })}
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex justify-between px-1">
        {PLATFORMS.map(([n, ic]) => (
          <div key={n} className="flex w-[56px] flex-col items-center gap-1.5">
            <span data-pf className={`flex h-11 w-11 items-center justify-center text-ink-3 ${glass} rounded-[12px]`}>
              {ic}
            </span>
            <span className="text-[10px] text-ink-3">{n}</span>
          </div>
        ))}
      </div>
    </Canvas>
  );
}

/* Design: una schermata in un editor, selezionata; il cursore va sul tasto e lo preme. */
function DesignV({ t, max }: { t: WidgetText; max?: number }) {
  return (
    <Canvas
      w={320}
      h={170}
      max={max}
      build={(q) =>
        gsap
          .timeline()
          .from(q("[data-frame]"), enter)
          .from(q("[data-sel]"), { autoAlpha: 0, scale: 1.04, duration: 0.5, ease: "power2.out" }, 0.6)
          .fromTo(q("[data-cur]"), { x: 70, y: 40, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 1.1, ease: "power3.inOut" }, 0.8)
          .to(q("[data-time]"), { backgroundColor: SKY, color: "#000", duration: 0.25 }, 1.6)
          .to(q("[data-cta]"), { scale: 0.96, duration: 0.12, yoyo: true, repeat: 1 }, 2.1)
      }
    >
      <div className="absolute inset-0 rounded-[14px] [background-image:radial-gradient(rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:12px_12px]" />
      <span className="absolute left-10 top-0.5 font-mono text-[9.5px] text-ink-3">{t.frame} · 240 × 144</span>
      <div data-frame className={`absolute left-10 top-[18px] h-[144px] w-[240px] p-3.5 ${glass} rounded-[14px]`}>
        <p className="text-[12px] font-medium text-ink">{t.designTitle}</p>
        <p className="mt-0.5 text-[10.5px] text-ink-3">{t.designSub}</p>
        <div className="mt-3 flex gap-1.5">
          {["15:00", "16:30", "17:00"].map((h, i) => (
            <span key={h} data-time={i === 2 ? "" : undefined} className="t-fig rounded-full bg-white/[0.06] px-2.5 py-1 text-[10.5px] text-ink-2">
              {h}
            </span>
          ))}
        </div>
        <span data-cta className="mt-3 flex h-8 items-center justify-center rounded-full text-[11.5px] font-medium text-black" style={{ background: SKY }}>
          {t.designCta}
        </span>
      </div>
      <span data-sel className="absolute left-[54px] top-[114px] h-[32px] w-[212px] rounded-full" style={{ boxShadow: `0 0 0 1px ${SKY}` }}>
        {[
          "-left-1 -top-1",
          "-right-1 -top-1",
          "-bottom-1 -left-1",
          "-bottom-1 -right-1",
        ].map((p) => (
          <span key={p} className={`absolute h-2 w-2 bg-white ${p}`} style={{ boxShadow: `0 0 0 1px ${SKY}` }} />
        ))}
      </span>
      <span data-cur className="absolute left-[196px] top-[126px] flex items-start gap-1">
        <svg viewBox="0 0 16 16" className="h-4 w-4 drop-shadow" aria-hidden>
          <path d="M2 1l11 6-5 1.5L6 14z" fill={SKY} stroke="#000" strokeWidth=".8" />
        </svg>
        <span className="mt-3 rounded-full px-2 py-0.5 text-[9.5px] font-medium text-black" style={{ background: SKY }}>
          Filippo
        </span>
      </span>
    </Canvas>
  );
}

/* AI e sistemi integrati: un processo intero, dall'email al cliente, eseguito passo per passo. */
function AiV({ t, max }: { t: WidgetText; max?: number }) {
  const nodes: [ReactNode, string][] = [
    [<Brand key="g" icon={si.siGmail} className="h-[18px] w-[18px]" />, t.ai1],
    [<Sparkles key="s" size={18} />, t.ai2],
    [<Database key="d" size={18} />, t.ai3],
    [<Brand key="w" icon={si.siWhatsapp} className="h-[18px] w-[18px]" />, t.ai4],
  ];
  return (
    <Canvas
      w={560}
      h={150}
      max={max}
      build={(q) => {
        const tl = gsap.timeline().from(q("[data-node]"), { ...enter, stagger: 0.1 });
        const run = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
        q("[data-node]").forEach((n, i) => {
          run
            .to(n, { boxShadow: `inset 0 0 0 1px ${SKY}, 0 0 30px -10px ${SKY}`, duration: 0.3 }, i * 0.9)
            .fromTo(n.querySelector("[data-ok]"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "power3.out" }, i * 0.9 + 0.35);
          const pk = q("[data-pk]")[i];
          if (pk) run.fromTo(pk, { left: "0%", autoAlpha: 1 }, { left: "100%", autoAlpha: 1, duration: 0.5, ease: "power1.inOut" }, i * 0.9 + 0.4).set(pk, { autoAlpha: 0 });
        });
        run.to(q("[data-node]"), { boxShadow: "inset 0 0 0 1px rgba(255,255,255,.09), 0 24px 60px -24px rgba(0,0,0,.95)", duration: 0.5 }, "+=1").to(q("[data-ok]"), { autoAlpha: 0, duration: 0.3 }, "<");
        return tl.add(run, 0.8);
      }}
    >
      <div className="absolute inset-0 flex items-center justify-between">
        {nodes.map(([ic, label], i) => (
          <div key={i} className="contents">
            <div data-node className={`relative flex h-[112px] w-[112px] flex-col justify-between p-3 ${glass}`}>
              <span className="text-ink-2">{ic}</span>
              <span className="text-[11px] leading-[1.3] text-ink">{label}</span>
              <span data-ok className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full text-black opacity-0" style={{ background: SKY }}>
                <Check size={10} strokeWidth={3} />
              </span>
            </div>
            {i < nodes.length - 1 && (
              <span className="relative h-px flex-1 bg-white/10">
                <span data-pk className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0" style={{ background: SKY, boxShadow: `0 0 10px ${SKY}` }} />
              </span>
            )}
          </div>
        ))}
      </div>
    </Canvas>
  );
}

/* Integrazioni: i servizi collegati al centro, i dati viaggiano e il registro conferma. */
const LINKED = [si.siStripe, si.siHubspot, si.siGooglecalendar, si.siWhatsapp];
function ApiV({ t, max }: { t: WidgetText; max?: number }) {
  return (
    <Canvas
      w={320}
      h={170}
      max={max}
      build={(q) => {
        const tl = gsap.timeline().from(q("[data-core]"), enter).from(q("[data-svc]"), { ...enter, stagger: 0.08 }, 0.2).from(q("[data-link]"), { strokeDashoffset: 100, duration: 0.6, stagger: 0.08 }, 0.4);
        const run = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
        q("[data-pk]").forEach((p, i) => run.fromTo(p, { offsetDistance: "0%", autoAlpha: 1 }, { offsetDistance: "100%", duration: 0.9, ease: "power1.inOut" }, i * 0.45).set(p, { autoAlpha: 0 }));
        return tl.add(run, 1).from(q("[data-log]"), enter, 1.2);
      }}
    >
      <svg viewBox="0 0 320 170" className="absolute inset-0 h-full w-full">
        {[40, 120, 200, 280].map((x) => (
          <path key={x} data-link d={`M160 22 C160 56 ${x} 50 ${x} 84`} fill="none" stroke="rgba(94,196,255,.35)" pathLength={100} strokeDasharray="100" />
        ))}
      </svg>
      {[40, 120, 200, 280].map((x) => (
        <span
          key={x}
          data-pk
          className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full opacity-0"
          style={{ background: SKY, boxShadow: `0 0 10px ${SKY}`, offsetPath: `path("M160 22 C160 56 ${x} 50 ${x} 84")`, offsetRotate: "0deg" }}
        />
      ))}
      <span data-core className={`absolute left-1/2 top-0 flex h-9 -translate-x-1/2 items-center rounded-full px-3.5 font-mono text-[11px] text-ink ${glass}`}>
        api.{t.url}
      </span>
      {LINKED.map((ic, i) => (
        <span key={ic.slug} data-svc className={`absolute top-[84px] flex h-10 w-10 -translate-x-1/2 items-center justify-center text-ink-2 ${glass} rounded-[12px]`} style={{ left: 40 + i * 80 }}>
          <Brand icon={ic} className="h-[18px] w-[18px]" />
        </span>
      ))}
      <span data-log className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap font-mono text-[10.5px] text-ink-3">
        <span style={{ color: SKY }}>POST</span> /webhooks/stripe <span className="text-ink">200</span>
      </span>
    </Canvas>
  );
}

/* Negozi online: l'ordine passa da "in attesa" a "pagato". */
function ShopV({ t, max }: { t: WidgetText; max?: number }) {
  return (
    <Canvas
      w={300}
      h={160}
      max={max}
      build={(q) =>
        gsap
          .timeline()
          .from(q("[data-panel]"), enter)
          .from(q("[data-row]"), { ...enter, stagger: 0.1 }, 0.3)
          .to(q("[data-pending]"), { autoAlpha: 0, y: -6, duration: 0.3 }, 1.6)
          .from(q("[data-paid]"), { autoAlpha: 0, y: 6, duration: 0.4, ease: "power3.out" }, 1.8)
      }
    >
      <div data-panel className={`absolute inset-0 flex flex-col p-4 ${glass}`}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-ink-3">{t.order} #1042</span>
          <span className="relative h-6 w-[92px]">
            <span data-pending className="absolute inset-0 flex items-center justify-center rounded-full bg-white/[0.06] text-[10.5px] text-ink-3">
              {t.pending}
            </span>
            <span data-paid className="absolute inset-0 flex items-center justify-center gap-1 rounded-full text-[10.5px] font-medium text-black" style={{ background: SKY }}>
              <Check size={11} strokeWidth={3} />
              {t.paid}
            </span>
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-2 text-[12px]">
          {[
            [t.item1, "€ 39,00"],
            [t.item2, "€ 10,00"],
          ].map(([n, p]) => (
            <div key={n} data-row className="flex items-center justify-between">
              <span className="text-ink-2">{n}</span>
              <span className="t-fig text-ink-2">{p}</span>
            </div>
          ))}
        </div>
        <div data-row className="mt-auto flex items-center justify-between border-t border-white/[0.07] pt-2.5 text-[12.5px]">
          <span className="flex items-center gap-1.5 text-ink-3">
            <Brand icon={si.siStripe} className="h-3.5 w-3.5" />
            {t.total}
          </span>
          <span className="t-fig font-medium text-ink">€ 49,00</span>
        </div>
      </div>
    </Canvas>
  );
}

/* DevOps: il rilascio scorre nel terminale e il sito risponde online. */
function OpsV({ t, max }: { t: WidgetText; max?: number }) {
  const lines: [string, string, string][] = [
    ["$", "git push origin main", ""],
    ["✓", "build", "41 s"],
    ["✓", "test", `128 ${t.passed}`],
    ["✓", "deploy", "production"],
  ];
  return (
    <Canvas
      w={560}
      h={150}
      max={max}
      build={(q) =>
        gsap
          .timeline()
          .from(q("[data-panel]"), enter)
          .from(q("[data-ln]"), { autoAlpha: 0, x: -6, duration: 0.35, stagger: 0.45, ease: "power2.out" }, 0.4)
          .from(q("[data-live]"), enter, "+=.2")
          .to(q("[data-ping]"), { scale: 2.6, autoAlpha: 0, duration: 1.4, repeat: -1, ease: "power1.out" })
      }
    >
      <div data-panel className={`absolute inset-0 flex gap-6 px-6 py-5 ${glass}`}>
        <div className="flex flex-1 flex-col justify-center gap-1.5 font-mono text-[12px]">
          {lines.map(([m, a, b]) => (
            <p key={a} data-ln className="flex gap-3">
              <span style={{ color: m === "$" ? undefined : SKY }} className={m === "$" ? "text-ink-3" : ""}>
                {m}
              </span>
              <span className="w-[150px] text-ink">{a}</span>
              <span className="text-ink-3">{b}</span>
            </p>
          ))}
        </div>
        <div data-live className="flex w-[170px] flex-col justify-center gap-2 border-l border-white/[0.07] pl-6">
          <span className="flex items-center gap-2 text-[12.5px] text-ink">
            <span className="relative flex h-2 w-2">
              <span data-ping className="absolute inset-0 rounded-full" style={{ background: SKY }} />
              <span className="relative h-2 w-2 rounded-full" style={{ background: SKY }} />
            </span>
            {t.online}
          </span>
          <span className="font-mono text-[11px] text-ink-3">https://{t.url}</span>
          <span className="font-mono text-[11px] text-ink-3">
            HTTPS · {t.backup} 03:00
          </span>
        </div>
      </div>
    </Canvas>
  );
}

export function ServiceVisual({ k, t, max }: { k: ServiceKey; t: WidgetText; max?: number }) {
  switch (k) {
    case "web":
      return <WebV t={t} max={max} />;
    case "seo":
      return <SeoV t={t} max={max} />;
    case "geo":
      return <GeoV t={t} max={max} />;
    case "apps":
      return <AppsV max={max} />;
    case "design":
      return <DesignV t={t} max={max} />;
    case "ai":
      return <AiV t={t} max={max} />;
    case "api":
      return <ApiV t={t} max={max} />;
    case "shop":
      return <ShopV t={t} max={max} />;
    case "ops":
      return <OpsV t={t} max={max} />;
  }
}
