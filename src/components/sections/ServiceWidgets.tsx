"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import * as si from "simple-icons";
import { Cable, Check, ShoppingBag, Sparkles } from "lucide-react";
import { prefersReducedMotion } from "@/lib/env";

gsap.registerPlugin(useGSAP);

/**
 * Disegni animati dei servizi. Non si toccano: partono da soli quando entrano nello schermo
 * e mostrano quello che il servizio fa. Un solo colore, l'azzurro cielo.
 */
export type WidgetText = Record<
  "url" | "q" | "a" | "src" | "msgIn" | "msgOut" | "add" | "item" | "done" | "online" | "build" | "test" | "deploy" | "https" | "backup" | "wire" | "ui",
  string
>;

const SKY = "#5ec4ff";
const chip = "bg-white/[0.05] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]";

/** Costruisce la timeline in pausa e la fa partire la prima volta che il disegno è visibile (anche in un carosello orizzontale). */
function usePlay(build: (q: (s: string) => Element[], el: HTMLElement) => gsap.core.Timeline) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current!;
      const tl = build(gsap.utils.selector(el), el).pause();
      if (prefersReducedMotion()) {
        tl.progress(1);
        return;
      }
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            tl.play();
            io.disconnect();
          }
        },
        { threshold: 0.5 },
      );
      io.observe(el);
      return () => io.disconnect();
    },
    { scope: ref },
  );
  return ref;
}

/** Contenitore del disegno: se lo spazio della scheda è più piccolo del disegno, lo rimpicciolisce invece di farlo uscire. */
function Box({ r, className = "", children }: { r: React.RefObject<HTMLDivElement | null>; className?: string; children: React.ReactNode }) {
  const inner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const o = r.current;
    const i = inner.current;
    if (!o || !i) return;
    const fit = () => {
      const s = Math.min(1, o.clientHeight / (i.offsetHeight || 1), o.clientWidth / (i.offsetWidth || 1));
      i.style.scale = String(s);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [r]);
  return (
    <div ref={r} aria-hidden className="pointer-events-none relative flex h-full w-full select-none items-center justify-center">
      <div ref={inner} className={`flex w-full items-center justify-center ${className}`}>
        {children}
      </div>
    </div>
  );
}

/* Siti: l'indirizzo si scrive, la pagina si costruisce a blocchi, poi compare il sito vero. */
export function SiteW({ w }: { w: WidgetText }) {
  const r = usePlay((q) =>
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(q("[data-win]"), { y: 20, autoAlpha: 0, duration: 0.7 })
      .from(q("[data-ch]"), { autoAlpha: 0, duration: 0.01, stagger: 0.06 }, "-=.2")
      .from(q("[data-sk]"), { scaleX: 0, transformOrigin: "0 50%", duration: 0.5, stagger: 0.08 }, "-=.1")
      .fromTo(q("[data-shot]"), { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.1, ease: "expo.inOut" }, "+=.3")
      .fromTo(q("[data-scan]"), { top: "100%", autoAlpha: 1 }, { top: "0%", duration: 1.1, ease: "expo.inOut" }, "<")
      .to(q("[data-scan]"), { autoAlpha: 0, duration: 0.3 }),
  );
  return (
    <Box r={r}>
      <div data-win className="relative aspect-[16/10] h-[min(94cqh,58cqw)] overflow-hidden rounded-[12px] bg-[#16171a] shadow-[0_0_0_1px_rgba(255,255,255,.08),0_30px_60px_-30px_rgba(0,0,0,.9)]">
        <div className="flex h-7 items-center gap-1.5 bg-[#1d1e22] px-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-white/15" />
          ))}
          <span className="ml-3 flex h-4 flex-1 items-center rounded-full bg-white/[0.06] px-2 font-mono text-[9px] text-ink-3">
            {w.url.split("").map((c, i) => (
              <span key={i} data-ch>
                {c}
              </span>
            ))}
          </span>
        </div>
        <div className="relative h-[calc(100%-28px)]">
          <div className="absolute inset-0 space-y-[6%] p-[7%]">
            <span data-sk className="block h-[9%] w-1/2 rounded-full bg-white/15" />
            <span data-sk className="block h-[9%] w-1/3 rounded-full bg-white/10" />
            <span data-sk className="block h-[30%] w-full rounded-[8px] bg-white/[0.06]" />
            <span data-sk className="block h-[9%] w-2/5 rounded-full" style={{ background: SKY }} />
          </div>
          <img data-shot src="/work/unispace/studykit.webp" alt="" className="absolute inset-0 h-full w-full object-cover object-left-top" />
          <span data-scan className="absolute inset-x-0 h-px opacity-0" style={{ background: SKY, boxShadow: `0 0 16px ${SKY}` }} />
        </div>
      </div>
    </Box>
  );
}

/* SEO: i punteggi salgono a 100 e le tre metriche di Google rientrano nelle soglie. */
const SCORES = ["Performance", "Accessibility", "Best practices", "SEO"];
const VITALS = [
  ["LCP", "< 2,5 s"],
  ["INP", "< 200 ms"],
  ["CLS", "< 0,1"],
];
export function SeoW() {
  const r = usePlay((q) => {
    const tl = gsap.timeline();
    q("[data-ring]").forEach((ring, i) => {
      const arc = ring.querySelector("[data-arc]")!;
      const num = ring.querySelector("[data-num]")!;
      const o = { v: 0 };
      tl.fromTo(arc, { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1.4, ease: "power2.out" }, i * 0.12).to(
        o,
        { v: 100, duration: 1.4, ease: "power2.out", onUpdate: () => (num.textContent = String(Math.round(o.v))) },
        i * 0.12,
      );
    });
    tl.from(q("[data-vital]"), { y: 10, autoAlpha: 0, duration: 0.5, stagger: 0.12, ease: "power3.out" }, 0.9).from(
      q("[data-tick]"),
      { scale: 0, duration: 0.4, stagger: 0.12, ease: "back.out(2.5)" },
      1.2,
    );
    return tl;
  });
  return (
    <Box r={r} className="flex-col gap-4">
      <div className="flex w-full max-w-[460px] items-start justify-around">
        {SCORES.map((n) => (
          <div key={n} data-ring className="flex flex-col items-center gap-1.5">
            <span className="relative flex h-12 w-12 items-center justify-center">
              <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(94,196,255,.14)" strokeWidth="3.5" />
                <circle data-arc cx="24" cy="24" r="20" fill="none" stroke={SKY} strokeWidth="3.5" strokeLinecap="round" pathLength={100} strokeDasharray="100" />
              </svg>
              <span data-num className="t-fig text-[13px] font-medium" style={{ color: SKY }}>
                100
              </span>
            </span>
            <span className="whitespace-nowrap text-[10.5px] text-ink-3">{n}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {VITALS.map(([k, v]) => (
          <span key={k} data-vital className={`flex h-7 items-center gap-2 rounded-full pl-1 pr-3 text-[11.5px] ${chip}`}>
            <span data-tick className="flex h-5 w-5 items-center justify-center rounded-full text-black" style={{ background: SKY }}>
              <Check size={11} strokeWidth={3} />
            </span>
            <span className="font-medium text-ink">{k}</span>
            <span className="t-fig text-ink-3">{v}</span>
          </span>
        ))}
      </div>
    </Box>
  );
}

/* GEO: qualcuno chiede a un assistente AI, la risposta si scrive e cita il sito. */
export function GeoW({ w }: { w: WidgetText }) {
  const r = usePlay((q) =>
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(q("[data-q]"), { y: 12, autoAlpha: 0, duration: 0.5 })
      .from(q("[data-qc]"), { autoAlpha: 0, duration: 0.01, stagger: 0.025 }, "<")
      .from(q("[data-ans]"), { y: 12, autoAlpha: 0, duration: 0.5 }, "+=.2")
      .from(q("[data-line]"), { scaleX: 0, transformOrigin: "0 50%", duration: 0.6, stagger: 0.15, ease: "power2.out" })
      .from(q("[data-src]"), { scale: 0.6, autoAlpha: 0, duration: 0.6, ease: "back.out(2)" })
      .to(q("[data-src]"), { boxShadow: `0 0 0 1px ${SKY}, 0 0 24px -4px ${SKY}`, duration: 0.6, repeat: -1, yoyo: true, ease: "sine.inOut" }),
  );
  return (
    <Box r={r}>
      <div className="flex w-full max-w-[440px] flex-col gap-2.5">
        <p data-q className={`self-end rounded-[14px] rounded-br-[4px] px-3 py-2 text-[12px] text-ink ${chip}`}>
          {w.q.split("").map((c, i) => (
            <span key={i} data-qc>
              {c}
            </span>
          ))}
        </p>
        <div data-ans className="rounded-[14px] rounded-bl-[4px] bg-[#16171a] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]">
          <p className="flex items-center gap-1.5 text-[11px] text-ink-3">
            <Sparkles size={12} style={{ color: SKY }} />
            {w.a}
          </p>
          <span data-line className="mt-2.5 block h-1.5 w-[92%] rounded-full bg-white/15" />
          <span data-line className="mt-1.5 block h-1.5 w-[70%] rounded-full bg-white/10" />
          <span data-src className="mt-3 inline-flex h-6 items-center gap-1.5 rounded-full bg-[rgba(94,196,255,.12)] px-2.5 text-[11px]" style={{ color: SKY }}>
            {w.src} · {w.url}
          </span>
        </div>
      </div>
    </Box>
  );
}

/* App: le tre app compaiono e restano collegate, un impulso le attraversa. */
export function AppsW() {
  const r = usePlay((q) =>
    gsap
      .timeline()
      .from(q("[data-app]"), { scale: 0, autoAlpha: 0, duration: 0.7, stagger: 0.12, ease: "back.out(2)" })
      .from(q("[data-wire]"), { scaleX: 0, duration: 0.6, ease: "power2.out" }, "-=.2")
      .fromTo(q("[data-pulse]"), { left: "0%", autoAlpha: 0 }, { left: "100%", autoAlpha: 1, duration: 1.4, ease: "power1.inOut", repeat: -1, repeatDelay: 0.6, yoyo: true }),
  );
  return (
    <Box r={r}>
      <div className="relative flex items-center gap-5">
        <span data-wire className="absolute left-7 right-7 top-1/2 h-px origin-left bg-[rgba(94,196,255,.3)]">
          <span data-pulse className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: SKY, boxShadow: `0 0 12px ${SKY}` }} />
        </span>
        {["/work/relay/icon.webp", "/work/creacloud/icon.svg", "/work/unispace/mascot-base.webp"].map((src) => (
          <img key={src} data-app src={src} alt="" className="relative h-14 w-14 rounded-[14px] shadow-[0_14px_30px_-10px_rgba(0,0,0,.8)]" />
        ))}
      </div>
    </Box>
  );
}

/* Design: prima il wireframe tratteggiato, poi l'interfaccia ci scorre sopra e si colora. */
export function DesignW({ w }: { w: WidgetText }) {
  const r = usePlay((q) =>
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(q("[data-wf]"), { autoAlpha: 0, scale: 0.92, duration: 0.6 })
      .from(q("[data-wfl]"), { scaleX: 0, transformOrigin: "0 50%", duration: 0.4, stagger: 0.1 }, "-=.2")
      .from(q("[data-ui]"), { x: 40, autoAlpha: 0, duration: 0.8, ease: "expo.out" }, "+=.3")
      .from(q("[data-fill]"), { scaleX: 0, transformOrigin: "0 50%", duration: 0.7, ease: "power2.inOut" }, "-=.3")
      .from(q("[data-btn]"), { scale: 0, duration: 0.5, ease: "back.out(2.5)" }, "-=.2"),
  );
  return (
    <Box r={r}>
      <div className="relative h-[min(86cqh,140px)] w-[min(90cqw,220px)]">
        <div data-wf className="absolute left-0 top-0 h-[78%] w-[62%] rounded-[12px] border border-dashed border-white/20 p-2.5">
          <span className="block text-[9px] text-ink-3">{w.wire}</span>
          <span data-wfl className="mt-1.5 block h-2 w-1/2 rounded-full bg-white/15" />
          <span data-wfl className="mt-2 block h-7 rounded-[6px] border border-dashed border-white/15" />
          <span data-wfl className="mt-2 block h-2 w-2/3 rounded-full bg-white/10" />
        </div>
        <div data-ui className="absolute bottom-0 right-0 h-[78%] w-[62%] rounded-[12px] bg-[#1f2126] p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-16px_rgba(0,0,0,.9)]">
          <span className="block text-[9px] text-ink-2">{w.ui}</span>
          <span className="mt-1.5 block h-2 w-1/2 rounded-full bg-white/50" />
          <span data-fill className="mt-2 block h-7 rounded-[6px]" style={{ background: `linear-gradient(135deg,#9edcff,${SKY})` }} />
          <span className="mt-2 flex items-center justify-between">
            <span className="block h-2 w-1/2 rounded-full bg-white/20" />
            <span data-btn className="block h-4 w-9 rounded-full" style={{ background: SKY }} />
          </span>
        </div>
      </div>
    </Box>
  );
}

/* AI: arriva un messaggio, l'assistente scrive e risponde spostando la lezione. */
export function ChatW({ w }: { w: WidgetText }) {
  const r = usePlay((q) =>
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(q("[data-in]"), { y: 14, autoAlpha: 0, duration: 0.5 })
      .from(q("[data-typing]"), { autoAlpha: 0, scale: 0.8, duration: 0.3 }, "+=.3")
      .to(q("[data-dot]"), { y: -3, duration: 0.25, stagger: { each: 0.1, repeat: 3, yoyo: true }, ease: "sine.inOut" })
      .to(q("[data-typing]"), { autoAlpha: 0, scale: 0.8, duration: 0.2 })
      .from(q("[data-out]"), { y: 14, autoAlpha: 0, duration: 0.5 })
      .from(q("[data-ok]"), { scale: 0, duration: 0.4, ease: "back.out(3)" }, "-=.2"),
  );
  return (
    <Box r={r}>
      <div className="relative flex w-full max-w-[380px] flex-col gap-2 text-[12.5px]">
        <p data-in className={`max-w-[85%] self-start rounded-[14px] rounded-bl-[4px] px-3 py-2 text-ink ${chip}`}>
          {w.msgIn}
        </p>
        <div className="relative h-9 self-end">
          <span data-typing className={`absolute right-0 top-0 flex h-8 items-center gap-1 rounded-full px-3 ${chip}`}>
            {[0, 1, 2].map((i) => (
              <span key={i} data-dot className="h-1.5 w-1.5 rounded-full bg-white/50" />
            ))}
          </span>
          <p data-out className="flex h-9 items-center gap-2 whitespace-nowrap rounded-[14px] rounded-br-[4px] px-3 text-black" style={{ background: SKY }}>
            <span data-ok className="flex">
              <Check size={14} strokeWidth={2.6} />
            </span>
            {w.msgOut}
          </p>
        </div>
      </div>
    </Box>
  );
}

/* Integrazioni: il gestionale al centro, i collegamenti si tracciano e i dati viaggiano verso i servizi. */
const LINKED = [si.siWhatsapp, si.siStripe, si.siGoogle, si.siGithub];
const CORNERS = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
];
export function ApiW() {
  const r = usePlay((q, el) => {
    const box = el.querySelector<HTMLElement>("[data-hub]")!;
    const dx = box.offsetWidth / 2 - 20;
    const dy = box.offsetHeight / 2 - 20;
    const tl = gsap
      .timeline()
      .from(q("[data-core]"), { scale: 0, duration: 0.6, ease: "back.out(2)" })
      .from(q("[data-link]"), { strokeDashoffset: 100, duration: 0.6, stagger: 0.08, ease: "power2.out" }, "-=.2")
      .from(q("[data-svc]"), { scale: 0, autoAlpha: 0, duration: 0.5, stagger: 0.08, ease: "back.out(2)" }, "-=.4");
    q("[data-pk]").forEach((pk, i) => {
      const [sx, sy] = CORNERS[i];
      tl.fromTo(
        pk,
        { x: 0, y: 0, autoAlpha: 0 },
        { x: sx * dx, y: sy * dy, autoAlpha: 1, duration: 0.9, ease: "power1.inOut", repeat: -1, repeatDelay: 0.9, yoyo: true },
        1.4 + i * 0.25,
      );
    });
    return tl;
  });
  return (
    <Box r={r}>
      <div data-hub className="relative h-[min(86cqh,130px)] w-[min(90cqw,200px)]">
        <svg viewBox="0 0 200 130" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {[
            [20, 20],
            [180, 20],
            [20, 110],
            [180, 110],
          ].map(([x, y]) => (
            <line key={`${x}${y}`} data-link x1="100" y1="65" x2={x} y2={y} stroke="rgba(94,196,255,.35)" pathLength={100} strokeDasharray="100" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        {LINKED.map((ic, i) => (
          <span
            key={ic.slug}
            data-svc
            className={`absolute flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#1f2126] text-ink-2 shadow-[0_0_0_1px_rgba(255,255,255,.08)] ${["left-0 top-0", "right-0 top-0", "bottom-0 left-0", "bottom-0 right-0"][i]}`}
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current">
              <path d={ic.path} />
            </svg>
          </span>
        ))}
        {CORNERS.map((_, i) => (
          <span key={i} data-pk className="absolute left-1/2 top-1/2 -ml-1 -mt-1 h-2 w-2 rounded-full" style={{ background: SKY, boxShadow: `0 0 10px ${SKY}` }} />
        ))}
        <span data-core className="absolute left-1/2 top-1/2 -ml-6 -mt-6 flex h-12 w-12 items-center justify-center rounded-[14px] text-black" style={{ background: SKY, boxShadow: `0 0 30px -6px ${SKY}` }}>
          <Cable size={20} strokeWidth={1.9} />
        </span>
      </div>
    </Box>
  );
}

/* E-commerce: il prodotto finisce nel carrello e l'ordine si conferma. */
export function ShopW({ w }: { w: WidgetText }) {
  const r = usePlay((q) =>
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(q("[data-card]"), { y: 16, autoAlpha: 0, duration: 0.6 })
      .to(q("[data-add]"), { scale: 0.88, duration: 0.12, ease: "power2.in" }, "+=.5")
      .to(q("[data-add]"), { scale: 1, duration: 0.4, ease: "back.out(3)" })
      .fromTo(q("[data-badge]"), { scale: 0 }, { scale: 1, duration: 0.45, ease: "back.out(3)" }, "-=.3")
      .from(q("[data-toast]"), { y: 14, autoAlpha: 0, duration: 0.5 }, "+=.3"),
  );
  return (
    <Box r={r} className="flex-col gap-3">
      <div data-card className={`flex w-full max-w-[250px] items-center gap-3 rounded-[14px] p-2.5 ${chip}`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(94,196,255,.12)]" style={{ color: SKY }}>
          <ShoppingBag size={18} strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] text-ink">{w.item}</span>
          <span className="t-fig block text-[11px] text-ink-3">€ 49,00</span>
        </span>
        <span data-add className="relative flex h-7 items-center rounded-full px-3 text-[11px] font-medium text-black" style={{ background: SKY }}>
          {w.add}
          <span data-badge className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-semibold text-black">
            1
          </span>
        </span>
      </div>
      <span data-toast className={`flex h-7 items-center gap-1.5 rounded-full px-3 text-[11.5px] text-ink ${chip}`}>
        <Check size={13} strokeWidth={2.6} style={{ color: SKY }} />
        {w.done}
      </span>
    </Box>
  );
}

/* DevOps: build, test e deploy si completano in fila, poi il sito è online con HTTPS e backup. */
export function OpsW({ w }: { w: WidgetText }) {
  const r = usePlay((q) => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    q("[data-step]").forEach((s, i) => {
      tl.from(s, { autoAlpha: 0, y: 8, duration: 0.35 }, i * 0.7)
        .fromTo(s.querySelector("[data-spin]"), { rotate: 0 }, { rotate: 360, duration: 0.5, ease: "none" }, i * 0.7 + 0.1)
        .to(s.querySelector("[data-spin]"), { autoAlpha: 0, duration: 0.1 }, i * 0.7 + 0.55)
        .from(s.querySelector("[data-ok]"), { scale: 0, duration: 0.35, ease: "back.out(3)" }, i * 0.7 + 0.55);
    });
    tl.from(q("[data-join]"), { scaleX: 0, transformOrigin: "0 50%", duration: 0.3, stagger: 0.7 }, 0.6)
      .from(q("[data-live]"), { y: 10, autoAlpha: 0, duration: 0.5 }, "+=.2")
      .to(q("[data-ping]"), { scale: 2.4, autoAlpha: 0, duration: 1.2, repeat: -1, ease: "power1.out" });
    return tl;
  });
  return (
    <Box r={r} className="flex-col gap-4">
      <div className="flex items-center gap-2 text-[12px]">
        {[w.build, w.test, w.deploy].map((n, i) => (
          <span key={n} className="flex items-center gap-2">
            <span data-step className={`flex h-8 items-center gap-2 rounded-full pl-1.5 pr-3 text-ink ${chip}`}>
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span data-spin className="absolute inset-0 rounded-full border-2 border-white/15 border-t-[#5ec4ff]" />
                <span data-ok className="flex h-5 w-5 items-center justify-center rounded-full text-black" style={{ background: SKY }}>
                  <Check size={11} strokeWidth={3} />
                </span>
              </span>
              {n}
            </span>
            {i < 2 && <span data-join className="h-px w-4 sm:w-6" style={{ background: SKY }} />}
          </span>
        ))}
      </div>
      <span data-live className={`flex h-8 items-center gap-2.5 rounded-full px-3.5 text-[12px] text-ink ${chip}`}>
        <span className="relative flex h-2 w-2">
          <span data-ping className="absolute inset-0 rounded-full" style={{ background: SKY }} />
          <span className="relative h-2 w-2 rounded-full" style={{ background: SKY }} />
        </span>
        {w.online}
        <span className="text-ink-3">· {w.https} · {w.backup}</span>
      </span>
    </Box>
  );
}
