"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import type { LucideIcon } from "lucide-react";
import { ArrowUp, Frame, MessageCircle, MousePointer2, PenTool, Square, Type, ArrowLeft, ArrowRight, Bell, Check, FileText, Globe, Inbox, KeyRound, LifeBuoy, Lock, LockOpen, Menu, Pause, PencilLine, Play, Plus, RotateCcw, RotateCw, Search, ShieldCheck, Tag, UserRound, Volume2, VolumeX, X, EllipsisVertical } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { prefersReducedMotion } from "@/lib/env";
import { onIntroLift } from "@/lib/intro";
import { soundOn, onSound, setSound } from "@/lib/sound";
import { fx, filmMute, cue, type Mood } from "@/lib/filmsound";
import { scrollToY } from "@/lib/scroll";
import { Bead } from "@/components/glass/Bead";
import { Wordmark } from "@/components/nav/Wordmark";
import { GradientText } from "@/components/ui/GradientText";
import { getCinema, type Cinema } from "@/content/cinema";

gsap.registerPlugin(SplitText, useGSAP);

const DISP = { fontWeight: 600, letterSpacing: "-0.055em" } as const;
const GT = ["#1f8fd0", "#5ec4ff", "#2f6fe0", "#8fd8ff"];
const cin = (n: string) => `/visual/cinema/${n}.webp`;
const HID = { visibility: "hidden" as const, opacity: 0 };
type Q = (s: string) => HTMLElement[];

/** Le parole tra asterischi diventano parole chiave, riempite dal gradiente animato. Con "!" davanti (*!perso*) il gradiente è rosso: una cosa che si perde. */
const GT_RED = ["#d92d20", "#ff6b5e", "#b42318", "#ff8a80"];
export function Kw({ text }: { text: string }) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2) {
          const m = /^[.,!?;:]+/.exec(parts[i + 1] ?? "");
          const red = p.startsWith("!");
          const w = red ? p.slice(1) : p;
          return (
            <span key={i} data-kw className="inline-block" style={{ ...(red ? { "--gt-glow-color": "#ff5a52" } : {}), fontFamily: "var(--font-logo), var(--font-sans)", fontWeight: 400, fontSize: "1.2em", fontSynthesis: "none", letterSpacing: "normal", lineHeight: 1, padding: "0.2em 0.34em 0.5em", margin: "-0.2em -0.34em -0.5em" }}>
              <GradientText colors={red ? GT_RED : GT} animationSpeed={8} variant="flow" glow={1}>
                {w + (m ? m[0] : "")}
              </GradientText>
            </span>
          );
        }
        const prev = /^[.,!?;:]+/.exec(p);
        return <Fragment key={i}>{i > 0 && prev ? p.slice(prev[0].length) : p}</Fragment>;
      })}
    </>
  );
}

/** Tessera 3D: faccia di vetro azzurro con spessore (strati dietro) e icona in rilievo. Si inclina con rotationX/Y da fuori. */
function Tile3D({ Icon, size = 26, className = "" }: { Icon: LucideIcon; size?: number; className?: string }) {
  return (
    <span className={`[perspective:240px] ${className}`}>
      <span data-tile className="relative block h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {[6, 5, 4, 3, 2, 1].map((z) => (
          <span key={z} className="absolute inset-0 rounded-[30%]" style={{ transform: `translateZ(${-z * 1.7}px)`, background: `color-mix(in srgb, #1e56c8 ${70 + z * 5}%, #07225f)` }} />
        ))}
        <span className="absolute inset-0 flex items-center justify-center rounded-[30%] text-white" style={{ transformStyle: "preserve-3d", background: "linear-gradient(150deg,#b4e8ff 0%,#52b0f4 42%,#2f6fe0 100%)", boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.85), inset 0 -3px 6px rgba(10,50,140,.4)" }}>
          <Icon size={size} strokeWidth={2.1} style={{ transform: "translateZ(7px)", filter: "drop-shadow(0 3px 2px rgba(10,50,140,.55))" }} />
        </span>
      </span>
    </span>
  );
}



/** Scrive lettera per lettera; ogni due lettere una nota che sale nella scala. */
const typeTo = (tl: gsap.core.Timeline, el: Element, text: string, at: number, dur: number, deg = 0) => {
  const o = { n: 0 };
  tl.fromTo(o, { n: 0 }, { n: text.length, duration: dur, ease: "sine.inOut", onUpdate: () => void (el.textContent = text.slice(0, Math.round(o.n))) }, at);
  const steps = Math.max(1, Math.floor(text.length / 2));
  for (let k = 0; k < steps; k++) tl.call(() => fx.pluck(deg + (k % 7), 0.5, 0.2), undefined, at + dur * (0.5 - Math.cos((Math.PI * k) / steps) / 2));
};
/** Cancella all'indietro, una lettera alla volta. */
const eraseTo = (tl: gsap.core.Timeline, el: Element, text: string, at: number, dur: number) => {
  const o = { n: text.length };
  tl.fromTo(o, { n: text.length }, { n: 0, duration: dur, ease: "power1.in", onUpdate: () => void (el.textContent = text.slice(0, Math.round(o.n))) }, at);
  for (let k = 0; k < 5; k++) tl.call(() => fx.tick(0.5), undefined, at + (dur * k) / 5);
};

/* ───────────── Il sito d'esempio, nello stile di questo: vetro chiaro, accento azzurro, la parola chiave nel corsivo del nome ───────────── */

const R_IN = "calc(var(--r) - var(--i))";
const R_IN2 = "calc(var(--r) - var(--i) - 6px)";
const SCRIPT = { fontFamily: "var(--font-logo), var(--font-sans)", fontWeight: 400, fontSynthesis: "none", letterSpacing: "normal" } as const;
const NAV_H = "clamp(44px,6cqw,60px)";

function MiniSite({ c, children }: { c: Cinema; children?: ReactNode }) {
  return (
    <div data-site className="ms @container relative h-full w-full overflow-hidden text-[var(--label-primary)]" style={{ "--i": "12px" } as CSSProperties}>
      <div aria-hidden className="ms-bg absolute inset-0" />
      <div data-nav className={`ms-glass z-[5] absolute left-[var(--i)] right-[var(--i)] top-[var(--i)] flex items-center justify-between pl-[clamp(16px,2.6cqw,24px)] pr-[6px]`} style={{ borderRadius: R_IN, height: NAV_H }}>
        <span className="text-[clamp(18px,3.2cqw,30px)] leading-none" style={{ ...SCRIPT, color: "var(--accent)" }}>
          Marchio
        </span>
        <span className="flex h-full items-center gap-[clamp(6px,1.4cqw,14px)] py-[6px] text-[clamp(12px,1.6cqw,15px)]">
          <span className="hidden gap-[clamp(4px,1cqw,10px)] @min-[560px]:flex">
            {c.site.nav.map((n) => (
              <span key={n} className="cin-nav rounded-full px-[clamp(8px,1.4cqw,14px)] py-1.5 text-[var(--label-secondary)]">
                {n}
              </span>
            ))}
          </span>
          <span className="hidden h-full items-center bg-[var(--accent)] px-[clamp(14px,2.4cqw,22px)] font-medium text-white @min-[560px]:flex" style={{ borderRadius: R_IN2 }}>
            {c.site.book}
          </span>
          <span className="cin-menu flex aspect-square h-full items-center justify-center bg-[var(--accent)] text-white @min-[560px]:hidden" style={{ borderRadius: R_IN2 }}>
            <Menu size={16} strokeWidth={2} />
          </span>
        </span>
      </div>
      <div className="ms-hero absolute flex flex-col justify-center gap-[clamp(10px,2.4cqw,24px)]">
        <span className="flex items-center gap-2 text-[clamp(11px,1.5cqw,14px)] text-[var(--label-secondary)]">
          <span className="h-[7px] w-[7px] rounded-full bg-[var(--accent)]" />
          {c.site.since}
        </span>
        <div data-title className="relative" style={{ ...DISP, fontSize: "clamp(26px,6.4cqw,80px)", lineHeight: 1.04 }}>
          <span data-focus className="pointer-events-none absolute -inset-x-[14px] -inset-y-[8px] rounded-[18px] border-2 border-[var(--accent)]" style={HID} />
          <span data-sel className="pointer-events-none absolute -inset-x-[8px] bottom-[-4px] top-[50%] origin-left rounded-[10px] bg-[var(--accent)]/25" style={HID} />
          <span className="relative block">{c.site.title[0]}</span>
          <span className="relative block">
            <span data-l2 style={{ ...SCRIPT, color: "var(--accent)", fontSize: "1.06em" }}>
              {c.site.title[1].replace(".", "")}
            </span>
            <span style={{ color: "var(--accent)" }}>.</span>
          </span>
        </div>
        <span className="flex items-center gap-2 text-[clamp(11px,1.5cqw,14px)] text-[var(--label-secondary)]">
          <span className="h-[7px] w-[7px] rounded-full bg-[var(--positive)]" />
          {c.site.stars}
        </span>
      </div>
      <div className="ms-photo absolute overflow-hidden shadow-[0_24px_60px_-30px_rgba(0,0,0,.45)]" style={{ borderRadius: R_IN }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-simg src={cin("lavoro")} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      {children}
    </div>
  );
}

/** Lo stesso disegno prima di essere finito, nel file di progetto: le forme nelle stesse posizioni, e il team al lavoro con i suoi cursori. */
const FAR_N = 46;
/* posizione (%), spessore e intensità delle scie di luce */
const STREAKS: [number, number, number][] = [[4, 1, 0.5], [11, 2, 0.8], [19, 1, 0.4], [27, 1, 0.7], [33, 2, 0.5], [41, 1, 0.9], [48, 1, 0.4], [55, 2, 0.7], [62, 1, 0.5], [69, 1, 0.8], [76, 2, 0.4], [83, 1, 0.7], [90, 1, 0.5], [96, 2, 0.6]];
const TEAM_C = ["#9b6bff", "#14b86e", "#ff7a59"];
function Wire({ team }: { team: string[] }) {
  return (
    <div data-wire className="ms @container absolute inset-0 z-10 overflow-hidden bg-[var(--bg-sunken)]" style={{ backgroundImage: "radial-gradient(color-mix(in srgb, var(--label-primary) 14%, transparent) 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
      <div data-wb className="cine-blk absolute left-[var(--i)] right-[var(--i)] top-[var(--i)]" style={{ borderRadius: R_IN, height: NAV_H }} />
      <div className="ms-hero absolute flex flex-col justify-center gap-[clamp(10px,2.4cqw,24px)]">
        <div data-wb className="cine-blk h-[clamp(10px,1.5cqw,14px)] w-[22%] rounded-full" />
        <div data-wb className="cine-blk h-[clamp(26px,6.6cqw,80px)] w-[88%] rounded-[10px]" />
        <div data-wb className="cine-blk h-[clamp(26px,6.6cqw,80px)] w-[70%] rounded-[10px]" />
        <div data-wb className="cine-blk h-[clamp(10px,1.5cqw,14px)] w-[30%] rounded-full" />
      </div>
      <div data-wb className="ms-photo cine-blk absolute" style={{ borderRadius: R_IN }} />
      {/* selezione */}
      <div data-fsel className="pointer-events-none absolute left-0 top-0 z-20 border-2 border-[var(--accent)]" style={HID}>
        {["-left-[5px] -top-[5px]", "-right-[5px] -top-[5px]", "-left-[5px] -bottom-[5px]", "-right-[5px] -bottom-[5px]"].map((p) => (
          <span key={p} className={`absolute h-2 w-2 border-2 border-[var(--accent)] bg-white ${p}`} />
        ))}
        <span data-fsz className="absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-[var(--accent)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white" />
      </div>
      {/* strumenti, in basso come nel file di progetto */}
      <div data-fbar className="absolute bottom-[calc(var(--i)+10px)] left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-[14px] bg-[var(--bg-surface)] p-1.5 shadow-[0_12px_30px_-12px_rgba(0,0,0,.35)] ring-1 ring-[var(--hair-strong)]">
        {[MousePointer2, Frame, Square, Type, PenTool, MessageCircle].map((I, i) => (
          <span key={i} className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${i ? "text-[var(--label-secondary)]" : "bg-[var(--accent)] text-white"}`}>
            <I size={17} strokeWidth={1.8} />
          </span>
        ))}
      </div>
      {/* il team */}
      {team.map((n, i) => (
        <span key={n} data-fc className="pointer-events-none absolute left-0 top-0 z-30 block" style={HID}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,.3))" }}>
            <path d="M5 3l14 8-6 1.6L10.4 19z" fill={TEAM_C[i % 3]} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          <span className="absolute left-[16px] top-[18px] whitespace-nowrap rounded-[7px] px-2 py-[3px] text-[12px] font-medium text-white" style={{ background: TEAM_C[i % 3] }}>
            {n}
          </span>
        </span>
      ))}
    </div>
  );
}

/** Il sito di oggi: vecchio, pesante, arriva a pezzi. Ogni pezzo compare di scatto (data-o). */
function OldSite({ c }: { c: Cinema }) {
  const o = c.old;
  return (
    <div data-old className="absolute inset-0 overflow-hidden bg-white [container-type:size]" style={{ fontFamily: '"Times New Roman", Times, serif', color: "#222" }}>
      <div data-o className="absolute inset-0 bg-[#e8e2d0]" />
      <div data-o className="absolute inset-x-0 top-0 flex h-[14%] items-center justify-center bg-[#1d2b6b] text-[7cqh] font-bold text-[#ffd200]">
        {o.brand}
      </div>
      <div data-o className="absolute bottom-0 left-0 top-[14%] w-[24%] bg-[#c8c0aa]">
        {o.menu.map((m, i) => (
          <span key={m} className="absolute left-[12%] whitespace-nowrap text-[4.5cqh] text-[#0000ee] underline" style={{ top: `${(0.22 + i * 0.08 - 0.14) * 100 / 0.86 - 3}%` }}>
            {m}
          </span>
        ))}
      </div>
      <div data-o className="absolute left-[28%] top-[16.5%] whitespace-nowrap text-[5cqh] font-bold italic text-[#c00000]">
        {o.hello}
      </div>
      <div data-oimg className="absolute left-[28%] top-[27%] h-[42%] w-[40%] overflow-hidden outline outline-[3px] outline-[#888]" style={{ clipPath: "inset(0 0 100% 0)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cin("lavoro")} alt="" draggable={false} className="h-full w-full object-cover" style={{ filter: "sepia(.5) saturate(.7) contrast(.85)" }} />
      </div>
      <div data-otext className="absolute left-[28%] top-[24%] text-[4cqh] leading-[1.6]">
        {o.text.map((t) => (
          <span key={t} className="block whitespace-nowrap">
            {t}
          </span>
        ))}
      </div>
      <div data-o className="absolute left-[72%] top-[90.5%] whitespace-nowrap text-[3.5cqh] text-[#555]">
        {o.visits}
      </div>
    </div>
  );
}

/* ───────────── Le interfacce vere: la ricerca di Google e l'app di Claude, ridisegnate per il video ───────────── */
const G_COL = ["#4285F4", "#EA4335", "#FBBC05", "#4285F4", "#34A853", "#EA4335"];
const ARIAL = { fontFamily: "Arial, Helvetica, sans-serif" } as const;
function GLogo({ size }: { size: number }) {
  return (
    <span className="inline-block select-none font-medium leading-none" style={{ fontSize: size, letterSpacing: "-0.03em", ...ARIAL }}>
      {"Google".split("").map((ch, i) => (
        <span key={i} style={{ color: G_COL[i] }}>
          {ch}
        </span>
      ))}
    </span>
  );
}
function GBox({ q, w, h = 46, typed = false }: { q: string; w: number; h?: number; typed?: boolean }) {
  return (
    <span className="flex items-center gap-3 rounded-full bg-white px-5 text-[#202124] shadow-[0_1px_6px_rgba(32,33,36,.28)]" style={{ width: w, height: h, fontSize: h * 0.36, ...ARIAL }}>
      <Search size={h * 0.4} strokeWidth={2} className="shrink-0 text-[#9aa0a6]" />
      {typed ? (
        <>
          <span data-typed />
          <span className="h-[1.1em] w-[1.5px] animate-pulse bg-[#202124]" />
        </>
      ) : (
        <span className="truncate">{q}</span>
      )}
    </span>
  );
}
/** Un risultato di Google: sito, indirizzo, titolo blu, descrizione. `me` gli mette dietro la bolla di vetro per evidenziarlo. */
function GResult({ name, url, title, snip, me = false, ...rest }: { name: string; url: string; title: string; snip: string; me?: boolean } & Record<string, unknown>) {
  return (
    <div {...rest} className={`relative w-[600px] ${me ? "z-20" : ""}`} style={ARIAL}>
      {me && <Bead as="span" data-bub radius={26} className="absolute -inset-x-6 -inset-y-4 -z-10" style={HID} />}
      <span className="flex items-center gap-3">
        <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#f1f3f4] text-[13px] font-bold text-[#5f6368]">{name[0]}</span>
        <span className="leading-tight">
          <span className="block text-[14px] text-[#202124]">{name}</span>
          <span className="block text-[12px] text-[#4d5156]">https://{url}</span>
        </span>
      </span>
      <span className="mt-1.5 block text-[20px] leading-tight text-[#1a0dab]">{title}</span>
      <span className="mt-1 block text-[14px] leading-snug text-[#4d5156]">{snip}</span>
    </div>
  );
}
/** Il velo: lo stesso gradiente blu della firma, leggero, sopra tutto quello che non conta. */
function Veil({ ...rest }: Record<string, unknown>) {
  return <span {...rest} aria-hidden className="pointer-events-none absolute inset-0 z-10" style={{ ...HID, background: "linear-gradient(135deg, rgba(31,143,208,.34), rgba(94,196,255,.24) 45%, rgba(47,111,224,.34))" }} />;
}
/** La stella di Claude. */
function Spark({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="shrink-0">
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r = i % 2 ? 7.4 : 10.4;
        const f = (v: number) => Math.round(v * 100) / 100;
        return <line key={i} x1={f(12 + Math.cos(a) * 2.2)} y1={f(12 + Math.sin(a) * 2.2)} x2={f(12 + Math.cos(a) * r)} y2={f(12 + Math.sin(a) * r)} stroke="#d97757" strokeWidth={2.4} strokeLinecap="round" />;
      })}
    </svg>
  );
}

/* ───────────── Il video ─────────────
   Un oggetto solo che cambia forma, una camera che si avvicina e si allontana, una colonna sonora a 120 battiti.
   Nessun movimento lineare: ogni passaggio ha la sua curva. */

const B = 0.5;
/* dalla battuta 9.2 in poi tutto scorre di 3.4 battute: il caricamento lento ha bisogno di tempo per essere visto */
const T = (n: number) => (n >= 9.2 ? n + 5 : n) * B;
const U = (n: number) => n * B;
const ICONS_GETS = [Globe, KeyRound, ShieldCheck, PencilLine, Inbox, LifeBuoy];
const ICONS_PROMISE = [FileText, UserRound, Tag, LockOpen];
export const CAPF = "pointer-events-none absolute inset-x-0 top-1/2 mx-auto max-w-[14ch] -translate-y-1/2 px-6 text-center text-[clamp(38px,7cqw,120px)] font-semibold leading-[1.04] tracking-[-0.05em] cine-fg";
export const CAP = "pointer-events-none absolute inset-x-0 top-[5%] mx-auto max-w-[19ch] px-6 text-center text-[clamp(30px,4.6cqw,76px)] font-semibold leading-[1.06] tracking-[-0.05em] cine-fg md:top-[7%] md:max-w-[24ch]";

/** `embed`: dentro una scheda, a misura del contenitore, muto, senza comandi; `play` lo avvia e lo ferma, e in fondo riparte da solo. */
export function WebCinema({ title, embed = false, play = true }: { title: string; embed?: boolean; play?: boolean }) {
  const F = fx;
  useEffect(() => {
    if (!embed) return;
    filmMute(true);
    return () => filmMute(false);
  }, [embed]);
  const locale = useLocale() as Locale;
  const c = getCinema(locale);
  const root = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const flags = useRef({ visible: false, paused: embed, ended: false, lifted: embed, playing: false });
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [snd, setSnd] = useState(false);
  // ogni nuova riproduzione ricostruisce il video da zero: niente resti della volta prima
  const [run, setRun] = useState(0);

  useEffect(() => {
    setSnd(soundOn());
    const off = onSound(setSnd);
    return () => void off();
  }, []);


  /* la cornice sta tra la barra in alto e quella in basso, qualunque siano: le misuro */
  useEffect(() => {
    const el = root.current;
    if (!el || embed) return;
    // le barre del sito sono vetri dentro contenitori fissi: prendo i vetri visibili in alto e quelli larghi in basso
    const measure = () => {
      const W = innerWidth;
      const H = innerHeight;
      let top = 0;
      let bot = H;
      document.querySelectorAll<HTMLElement>(".drop, .float-glass").forEach((d) => {
        if (el.contains(d)) return;
        let x: HTMLElement | null = d;
        let fixed = false;
        while (x && x !== document.body) {
          if (getComputedStyle(x).position === "fixed") {
            fixed = true;
            break;
          }
          x = x.parentElement;
        }
        if (!fixed) return;
        const r = d.getBoundingClientRect();
        if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > H) return;
        if (d.checkVisibility && !d.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return;
        if (r.bottom < H * 0.3) top = Math.max(top, r.bottom);
        else if (r.top > H * 0.6 && r.width > W * 0.5) bot = Math.min(bot, r.top);
      });
      const gap = W < 768 ? 8 : 14;
      el.style.setProperty("--ft", `${Math.round(top + gap)}px`);
      el.style.setProperty("--fb", `${Math.round(H - bot + gap)}px`);
    };
    const t1 = window.setTimeout(measure, 400);
    const t2 = window.setTimeout(measure, 1600);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useGSAP(
    () => {
      const el = root.current!;
      const $ = gsap.utils.selector(el) as Q;
      const one = (s: string) => $(s)[0];
      const endCard = one("[data-end]");
      if (prefersReducedMotion()) {
        gsap.set(endCard, { autoAlpha: 1 });
        return;
      }
      // il sito dentro la finestra del browser è solo una copia da guardare: non deve rispondere ai selettori del resto del video
      el.querySelectorAll<HTMLElement>("[data-chrome] [data-site], [data-chrome] [data-site] *").forEach((n) => Array.from(n.attributes).filter((a) => a.name.startsWith("data-")).forEach((a) => n.removeAttribute(a.name)));
      const cam = one("[data-cam]");
      const dev = one("[data-dev]");
      const small = () => !embed && innerWidth <= 760;
      const tight = () => small() || cam.offsetWidth < 820;
      const k = () => (small() ? 0.7 : 1);
      const wide = () => (small() ? 760 : 1100);
      const mid = () => (small() ? 520 : 640);
      const phone = () => 340;
      const fit = (w: () => number) => () => Math.min(1, (cam.offsetWidth * 0.92) / w(), (cam.offsetHeight * (small() ? 0.7 : 0.8)) / 640);
      // punto di mira della camera: il centro di un elemento, nelle coordinate della scena
      const aim = (t: () => HTMLElement) => () => {
        const w = cam.getBoundingClientRect();
        const r = t().getBoundingClientRect();
        return `${r.left + r.width / 2 - w.left}px ${r.top + r.height / 2 - w.top}px`;
      };

      gsap.set($("[data-it]"), { xPercent: -50, yPercent: -50 });
      gsap.set(dev, { width: wide, scale: fit(wide), "--r": "26px", transformPerspective: 1600 });

      // a ogni riproduzione i testi scritti dal video tornano come all'inizio
      const reset: [string, string][] = [["[data-typed]", ""], ["[data-url]", ""], ["[data-url1]", c.find.me[1]], ["[data-tt1]", c.find.me[1]], ["[data-count]", "0,0 s"], ["[data-gat1]", ""], ["[data-gat2]", ""], ["[data-gat3]", ""], ["[data-fsz]", ""]];
      reset.forEach(([q, v]) => $(q).forEach((e) => (e.textContent = v)));
      F.reset();
      // le scene, senza testo: le guida il montaggio qui sotto, un capitolo alla volta
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.inOut" } });

      /* didascalie a ritmo: la prima parte colpisce sul battito, la parola chiave arriva subito dopo (un ottavo),
         e tutto esce insieme sul battito successivo */
      const caps = c.cap.map((_, i) => one(`[data-cap="${i}"]`));
      const split = (e: HTMLElement) => {
        SplitText.create(e, { type: "words", wordsClass: "cw", ignore: "[data-kw]" });
        const all = Array.from(e.querySelectorAll<HTMLElement>(".cw, [data-kw]"));
        const k = all.findIndex((w) => w.hasAttribute("data-kw"));
        return k < 0 ? { a: all, b: [] as HTMLElement[] } : { a: all.slice(0, k), b: all.slice(k) };
      };
      const units = caps.map(split);
      // le parole entrano una alla volta, morbide: salgono appena e si mettono a fuoco
      const slam = (g: { a: HTMLElement[]; b: HTMLElement[] }, at: number, deg: number, L: gsap.core.Timeline = tl) => {
        if (g.a.length) L.fromTo(g.a, { autoAlpha: 0, yPercent: 70, filter: "blur(6px)" }, { autoAlpha: 1, yPercent: 0, filter: "blur(0px)", duration: 0.6, ease: "expo.out", stagger: 0.035 }, at);
        const kt = at + 0.035 * g.a.length;
        if (g.b.length) L.fromTo(g.b, { autoAlpha: 0, scale: 0.86, filter: "blur(12px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }, kt);
        L.call(() => F.tick(0.8), undefined, at);
        if (g.b.length) L.call(() => F.pluck(deg + 7, 0.9, 0.5), undefined, kt);
      };
      // il testo non sta più sopra la grafica: ogni frase ha il suo schermo, prima della sua scena (vedi il montaggio in fondo)
      const capAt = (..._: number[]) => void _;
      const cap = (i: number, b0: number, b1: number) => capAt(i, T(b0), T(b1));
      const punch = (b: number, s = 1.02) => tl.fromTo(cam, { scale: s }, { scale: 1, duration: 0.6, ease: "expo.out" }, T(b));

      /* 0 · Un cliente ti cerca: la camera parte vicina alla barra e si allontana mentre arrivano i risultati */
      const pill = one("[data-pill]");
      const res = $("[data-res]");
      const py = () => 0;
      // le interfacce disegnate a misura fissa si adattano al riquadro (anche nell'anteprima)
      $("[data-gfit]").forEach((e) => gsap.set(e, { scale: () => Math.min(1, (cam.offsetWidth * 0.9) / e.offsetWidth, (cam.offsetHeight * 0.84) / e.offsetHeight) }));
      const ry = (i: number) => () => (-40 + i * 92) * k();
      gsap.set(pill, { y: py });
      tl.call(() => F.whoosh(0.6, true, 0.7), undefined, 0)
        .fromTo(cam, { scale: () => (small() ? 1.08 : 1.18), transformOrigin: aim(() => pill) }, { scale: () => (small() ? 1.08 : 1.18), duration: 0.01 }, 0)
        .fromTo(pill, { autoAlpha: 0, scale: 0.86 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "back.out(1.4)" }, 0.05);
      typeTo(tl, one("[data-typed]"), c.find.typed, T(0.9), T(2.4), 0);
      tl.to(cam, { scale: 1, duration: 1.2, ease: "expo.inOut" }, T(3));
      res.forEach((r, i) => {
        tl.fromTo(r, { autoAlpha: 0, y: () => ry(i)() + 50, scale: 0.94 }, { autoAlpha: 1, y: ry(i), scale: 1, duration: 0.8, ease: "expo.out" }, T(3.3) + i * 0.13).call(() => F.pluck(10 + i, 0.6), undefined, T(3.3) + i * 0.13);
      });
      tl.to(res[0], { scale: 0.96, duration: 0.14, ease: "power2.out" }, T(4.6))
        .to(res[0], { scale: 1, boxShadow: "0 0 0 3px var(--accent)", duration: 0.45, ease: "back.out(2.5)" }, T(4.6) + 0.14)
        .call(() => F.tick(1.2), undefined, T(4.6));
      cap(0, 0.4, 5.5);

      /* 1 · Se è lento, se ne va: una finestra del browser che carica un pezzo alla volta, sempre in caricamento */
      const chrome = one("[data-chrome]");
      const cnt = one("[data-count]");
      const meter = one("[data-meter]");
      const spin = one("[data-spin]");
      const fav = one("[data-fav]");
      const stop = one("[data-stop]");
      const rl = one("[data-rl]");
      const ok = one("[data-ok]");
      const tt1 = one("[data-tt1]");
      const tt2 = one("[data-tt2]");
      const num = (n: number) => n.toFixed(1).replace(".", locale === "en" ? "." : ",") + " s";
      gsap.set([fav, rl, tt2, ok], { autoAlpha: 0 });
      tl.set([pill, ...res], { autoAlpha: 0 }, U(5.7))
        .call(() => (F.whoosh(0.5, false, 0.8), F.riser(U(6.5))), undefined, U(5.5))
        .fromTo(chrome, { autoAlpha: 0, y: 140 }, { autoAlpha: 1, y: 0, duration: 1.3, ease: "expo.out" }, U(5.7))
        .fromTo(meter, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, U(5.7) + 0.7)
        .set(cam, { scale: 1 }, U(5.7));
      // il sito di oggi: arriva a pezzi, di scatto, a intervalli irregolari; quando arriva la foto il testo salta giù; la foto non finisce mai
      const sw0 = one("[data-sw]");
      const oldEl = one("[data-old]");
      const os = $("[data-o]");
      const oimg = one("[data-oimg]");
      const otext = one("[data-otext]");
      const snap = (els: HTMLElement[], at: number, i: number) => {
        tl.set(els, { autoAlpha: 1 }, at)
          .fromTo(els, { y: -7 }, { y: 0, duration: 0.14, ease: "power3.out", immediateRender: false }, at)
          .call(() => F.tick(0.7 + i * 0.08), undefined, at);
      };
      gsap.set(os, { autoAlpha: 0 });
      gsap.set(otext, { autoAlpha: 0, top: "24%" });
      gsap.set(oimg, { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(sw0, { autoAlpha: 0 });
      tl.set(oldEl, { autoAlpha: 1 }, 0).set(sw0, { autoAlpha: 0 }, 0);
      snap([os[0], os[1]], 3.2, 0);
      snap([os[2]], 3.65, 1);
      snap([os[3], otext], 4.1, 2);
      tl.set(oimg, { clipPath: "inset(0% 0% 66% 0%)" }, 4.6)
        .set(otext, { top: "74%" }, 4.6)
        .fromTo(otext, { y: -10 }, { y: 0, duration: 0.16, ease: "power3.out", immediateRender: false }, 4.6)
        .call(() => F.tick(0.95), undefined, 4.6);
      tl.set(oimg, { clipPath: "inset(0% 0% 34% 0%)" }, 5.1).call(() => F.tick(1), undefined, 5.1);
      snap([os[4]], 5.45, 4);
      {
        const o = { n: 0 };
        tl.fromTo(o, { n: 0 }, { n: 10.2, duration: 6.5 - U(5.9), ease: "none", onUpdate: () => void (cnt.textContent = num(o.n)) }, U(5.9));
      }
      capAt(1, T(5.6), 6.5);
      const sw = one("[data-sw]");
      const content = sw.parentElement as HTMLElement;

      /* 1b · Il cliente non aspetta: torna alla ricerca e apre il secondo risultato. Montato a parte, tra una scena e l'altra. */
      const back = gsap.timeline({ paused: true });
      {
        back.call(() => F.sigh(1), undefined, 0.05);
        const cur = one("[data-cur]");
        const gres = one("[data-gres]");
        const rival = one("[data-rival]");
        const url1 = one("[data-url1]");
        const second = one('[data-gr="0"] [data-grt]');
        // un punto di un elemento qualsiasi della finestra, nelle coordinate del contenuto (la finestra può essere scalata)
        const at = (e: () => HTMLElement, fx = 0.5, fy = 0.6) => () => {
          const a = content.getBoundingClientRect();
          const r = e().getBoundingClientRect();
          const sc = a.width / content.offsetWidth || 1;
          return { x: (r.left + r.width * fx - a.left) / sc, y: (r.top + r.height * fy - a.top) / sc };
        };
        const bk = at(() => one("[data-back]"), 0.4, 0.55);
        const sc2 = at(() => second, 0.3, 0.7);
        back
          .fromTo(cur, { autoAlpha: 0, x: () => content.offsetWidth * 0.7, y: () => content.offsetHeight * 0.75, scale: 1 }, { autoAlpha: 1, x: () => bk().x, y: () => bk().y, duration: 1.1, ease: "power3.inOut" }, 0.2)
          .to(cur, { scale: 0.8, duration: 0.09, ease: "power2.out" }, 1.4)
          .to(cur, { scale: 1, duration: 0.3, ease: "back.out(3)" }, 1.49)
          .call(() => F.tick(1.4), undefined, 1.4)
          .fromTo(one("[data-back]"), { backgroundColor: "rgba(94,196,255,0)" }, { backgroundColor: "rgba(94,196,255,.25)", duration: 0.12, yoyo: true, repeat: 1 }, 1.4)
          .set(oldEl, { autoAlpha: 0 }, 1.55)
          .set(gres, { autoAlpha: 1 }, 1.55)
          .call(() => void (url1.textContent = c.find.typed), undefined, 1.55)
          .call(() => void (url1.textContent = c.find.me[1]), undefined, 1.54)
          .fromTo(gres, { y: 8 }, { y: 0, duration: 0.25, ease: "power3.out", immediateRender: false }, 1.55)
          .to(cur, { x: () => sc2().x, y: () => sc2().y, duration: 1.2, ease: "power3.inOut" }, 2.1)
          .set(second, { textDecoration: "underline" }, 3.2)
          .to(cur, { scale: 0.8, duration: 0.09, ease: "power2.out" }, 3.7)
          .to(cur, { scale: 1, duration: 0.3, ease: "back.out(3)" }, 3.79)
          .call(() => F.tick(1.4), undefined, 3.7)
          .set(gres, { autoAlpha: 0 }, 3.95)
          .set(rival, { autoAlpha: 1 }, 3.95)
          .call(() => void (url1.textContent = c.find.others[0][1]), undefined, 3.95)
          .call(() => void (tt1.textContent = c.find.others[0][0]), undefined, 3.95)
          .call(() => void (tt1.textContent = c.find.me[1]), undefined, 3.94)
          .call(() => void (url1.textContent = c.find.typed), undefined, 3.94)
          .fromTo(rival.children, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.08, immediateRender: false }, 3.95)
          .to(cur, { autoAlpha: 0, duration: 0.3 }, 4.2)
          .to(one("[data-meter]"), { autoAlpha: 0, duration: 0.25 }, 3.95)
          .call(() => F.chord([0, 1, 3], 0.6), undefined, 4.1)
          .set({}, {}, 6.2);
      }

      /* 2 · Il tuo si apre in 0,8 secondi: stessa pagina, un nuovo caricamento, tutto insieme; poi si naviga */
      const at2 = 6.6;
      {
        const o = { n: 0 };
        tl.call(
          () => {
            cnt.textContent = num(0);
            chrome.querySelectorAll<HTMLElement>(".cin-nav,.cin-menu").forEach((n) => gsap.set(n, { clearProps: "boxShadow,backgroundColor,borderRadius" }));
            const u1 = one("[data-url1]");
            if (u1) u1.textContent = c.find.me[1];
          },
          undefined,
          at2,
        )
          .fromTo(o, { n: 0 }, { n: 0.8, duration: 0.34, ease: "power1.out", onUpdate: () => void (cnt.textContent = num(o.n)) }, at2)
          // dopo: il sito nuovo entra da sinistra dietro una linea di luce, e l'etichetta cambia
          .set(sw, { autoAlpha: 1, clipPath: "inset(0% 100% 0% 0%)" }, at2)
          .to(sw, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.34, ease: "power3.inOut" }, at2 + 0.02)
          .fromTo(one("[data-wipe]"), { autoAlpha: 1, left: "0%" }, { left: "100%", duration: 0.34, ease: "power3.inOut", immediateRender: false }, at2 + 0.02)
          .set(one("[data-wipe]"), { autoAlpha: 0 }, at2 + 0.38)
          .to(one("[data-tag1]"), { autoAlpha: 0, y: -8, duration: 0.18, ease: "power2.in" }, at2)
          .fromTo(one("[data-tag2]"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "back.out(2)", immediateRender: false }, at2 + 0.16)
          .to(one("[data-tagdot]"), { backgroundColor: "var(--accent)", duration: 0.2 }, at2)
          .fromTo(meter, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "expo.out", immediateRender: false }, at2 + 0.3)
          .call(() => (F.chord([0, 2, 4, 5], 1), F.whoosh(0.35, true, 0.6)), undefined, at2 + 0.4)
          .to([spin, stop, tt1], { autoAlpha: 0, duration: 0.12 }, at2 + 0.36)
          .fromTo([fav, rl, tt2], { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2.2)" }, at2 + 0.38)
          .fromTo(ok, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2.4)" }, at2 + 0.4)
          .to(cnt, { color: "var(--accent)", duration: 0.3 }, at2 + 0.38);
      }
      // inizia la navigazione: il cursore va sul menù, clicca, la pagina cambia
      {
        const cur = one("[data-cur]");
        const prog = one("[data-prog]");
        const url1 = one("[data-url1]");
        const navT = () => {
          const n = chrome.querySelectorAll<HTMLElement>(".cin-nav")[1];
          return n && n.offsetParent ? n : chrome.querySelector<HTMLElement>(".cin-menu")!;
        };
        const loc = () => {
          const a = content.getBoundingClientRect();
          const r = navT().getBoundingClientRect();
          const sc = a.width / content.offsetWidth;
          return { x: (r.left + r.width * 0.5 - a.left) / sc, y: (r.top + r.height * 0.6 - a.top) / sc };
        };
        const A = 7.05;
        const nxt = c.site.nav[1].toLowerCase().replace(/\s+/g, "-");
        tl.fromTo(cur, { autoAlpha: 0, x: () => content.offsetWidth * 0.85, y: () => content.offsetHeight * 0.95 }, { autoAlpha: 1, x: () => loc().x, y: () => loc().y, duration: 0.5, ease: "power3.inOut" }, A)
          .to(cur, { scale: 0.82, duration: 0.08, ease: "power2.out" }, A + 0.55)
          .to(cur, { scale: 1, duration: 0.25, ease: "back.out(3)" }, A + 0.63)
          .call(() => F.tick(1.4), undefined, A + 0.55)
          .call(() => void gsap.fromTo(navT(), { boxShadow: "0 0 0 0 rgba(94,196,255,0)", backgroundColor: "rgba(94,196,255,0)" }, { boxShadow: "0 0 0 5px rgba(94,196,255,.2)", backgroundColor: "rgba(94,196,255,.2)", duration: 0.18, overwrite: true }), undefined, A + 0.55)
          .fromTo(prog, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.32, ease: "power2.out" }, A + 0.6)
          .to(prog, { autoAlpha: 0, duration: 0.15 }, A + 0.95)
          .to(sw, { y: 10, autoAlpha: 0.35, duration: 0.14, ease: "power2.in" }, A + 0.62)
          .fromTo(sw, { y: -10 }, { y: 0, autoAlpha: 1, duration: 0.3, ease: "power2.out", immediateRender: false }, A + 0.78)
          .call(() => void (url1.textContent = `${c.find.me[1]}/${nxt}`), undefined, A + 0.66)
          .call(() => F.pluck(7, 0.8, 0.4), undefined, A + 0.8)
          .to(cur, { autoAlpha: 0, duration: 0.2 }, A + 1.0);
      }
      capAt(2, 6.5, T(11.7));

      /* 3 · Prima lo disegniamo: la camera entra nell'anello, dal fondo emerge la pagina inclinata */
      const wireBits = $("[data-wb]");
      tl.call(() => F.whoosh(0.8, true, 1), undefined, T(11.5))
        .set([chrome, meter], { autoAlpha: 0 }, T(11.9))
        .fromTo(dev, { autoAlpha: 0, y: 160, scale: () => fit(wide)() * 0.7 }, { autoAlpha: 1, y: 0, scale: fit(wide), duration: 1.5, ease: "expo.out" }, T(11.9))
        .fromTo(wireBits, { autoAlpha: 0, scale: 0.86, y: 16 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)", stagger: T(0.4) }, T(12.6));
      wireBits.forEach((_, i) => tl.call(() => F.pluck(i * 2, 0.7, 0.3), undefined, T(12.6) + i * T(0.4)));
      // il team nel file di progetto: ogni cursore va sul pezzo che sta disegnando, la selezione lo segue
      {
        const wire = one("[data-wire]");
        const fcs = $("[data-fc]");
        const sel = one("[data-fsel]");
        const fsz = one("[data-fsz]");
        const off = (e: HTMLElement) => {
          let x = 0;
          let y = 0;
          let n: HTMLElement | null = e;
          while (n && n !== wire) {
            x += n.offsetLeft;
            y += n.offsetTop;
            n = n.offsetParent as HTMLElement | null;
          }
          return { x, y, w: e.offsetWidth, h: e.offsetHeight };
        };
        const start = [[0.16, 0.34], [0.74, 0.2], [0.5, 0.78]];
        const drift = [[0.3, 0.6], [0.6, 0.42], [0.72, 0.68]];
        fcs.forEach((f, j) =>
          tl.fromTo(f, { autoAlpha: 0, x: () => wire.offsetWidth * start[j][0], y: () => wire.offsetHeight * start[j][1] }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, T(12.1) + j * 0.12),
        );
        wireBits.forEach((b, i) => {
          const j = i % fcs.length;
          const t = T(12.6) + i * T(0.4);
          tl.to(fcs[j], { x: () => off(b).x + off(b).w * 0.9, y: () => off(b).y + off(b).h * 0.8, duration: 0.5, ease: "power3.inOut" }, t - 0.45)
            .set(sel, { autoAlpha: 1, x: () => off(b).x, y: () => off(b).y, width: () => off(b).w, height: () => off(b).h }, t)
            .call(() => void (fsz.textContent = `${b.offsetWidth} × ${b.offsetHeight}`), undefined, t);
        });
        const end = T(12.6) + wireBits.length * T(0.4);
        fcs.forEach((f, j) => tl.to(f, { x: () => wire.offsetWidth * drift[j][0], y: () => wire.offsetHeight * drift[j][1], duration: 1.4, ease: "sine.inOut" }, end + j * 0.15));
        tl.set(sel, { autoAlpha: 0 }, T(15.5));
      }
      cap(3, 11.9, 15.6);

      /* 4 · Poi lo costruiamo: una linea di luce lo trasforma nel sito vero */
      tl.call(() => F.riser(T(1.5)), undefined, T(14.1))
        .call(() => (F.kick(1), F.whoosh(1, true, 1)), undefined, T(15.6))
        .fromTo(one("[data-wire]"), { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut" }, T(15.6))
        .fromTo(one("[data-scan]"), { top: "0%", autoAlpha: 1 }, { top: "100%", duration: 1.3, ease: "expo.inOut" }, T(15.6))
        .to(one("[data-scan]"), { autoAlpha: 0, duration: 0.2, ease: "power1.out" }, T(15.6) + 1.25)
        .fromTo(one("[data-simg]"), { scale: 1.3 }, { scale: 1, duration: 2.2, ease: "expo.out" }, T(15.8))
        .call(() => F.chord([2, 4, 7], 0.8), undefined, T(17.6));
      punch(15.6);
      cap(4, 15.8, 18);

      /* 5 · Perfetto su ogni schermo: la pagina ruota e si stringe, e si riordina davvero */
      const shape = (b: number, w: () => number, r: string, turn: number) => {
        tl.call(() => (F.whoosh(0.6, false, 0.9), F.tick(1)), undefined, T(b))
          .to(dev, { width: w, scale: fit(w), "--r": r, duration: 1.1, ease: "expo.inOut" }, T(b))
          ;
        void turn;
      };
      shape(18, mid, "34px", -16);
      shape(19.9, phone, "48px", 16);
      tl.call(() => F.pluck(9, 0.9, 0.6), undefined, T(21.2));
      cap(5, 18.2, 21.8);

      /* 6 · Arrivano i clienti: il telefono si inclina, le notifiche scendono dall'alto */
      const ns = $("[data-n]");
      
      ns.forEach((n, i) => {
        const at = T(22.2 + i * 1);
        tl.fromTo(n, { autoAlpha: 0, y: -50, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.4)" }, at).call(() => F.bell(7 + i * 2, 1), undefined, at);
      });
      cap(6, 21.8, 25.8);

      /* 7 · Online, al sicuro: la barra dell'indirizzo prende il posto del menù, la camera la segue */
      const nav = one("[data-nav]");
      const ub = one("[data-ub]");
      tl.to(ns, { x: 140, autoAlpha: 0, duration: 0.45, stagger: 0.05, ease: "power2.in" }, T(25.4))
        
        .to(nav, { autoAlpha: 0, scale: 0.96, duration: 0.3, ease: "power2.in" }, T(25.9))
        .fromTo(ub, { autoAlpha: 0, scaleX: 0.7 }, { autoAlpha: 1, scaleX: 1, duration: 0.6, ease: "back.out(1.6)" }, T(26.2))
        .call(() => F.whoosh(0.5, true, 0.7), undefined, T(26.2))
        .fromTo(cam, { scale: 1, transformOrigin: aim(() => ub) }, { scale: () => (tight() ? 1.12 : 1.6), duration: 1.1, ease: "expo.inOut" }, T(26.4));
      typeTo(tl, one("[data-url]"), c.find.me[1], T(27), T(1.8), 3);
      tl.fromTo(one("[data-load2]"), { scaleX: 0 }, { scaleX: 1, duration: T(1), ease: "power2.inOut" }, T(28.9))
        .to(one("[data-lock1]"), { autoAlpha: 0, scale: 0.6, duration: 0.15, ease: "power2.in" }, T(29.9))
        .fromTo(one("[data-lock2]"), { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2.4)" }, T(29.9))
        .call(() => F.chord([0, 2, 4, 5], 1), undefined, T(29.9))
        .fromTo(one("[data-live]"), { autoAlpha: 0, x: 8 }, { autoAlpha: 1, x: 0, duration: 0.45, ease: "expo.out" }, T(30))
        .to(cam, { scale: 1, duration: 1, ease: "expo.inOut" }, T(30.6));
      cap(7, 26, 31.2);

      /* 8 · Lo cambi tu: la camera va sul titolo, si cancella e si riscrive */
      const l2 = one("[data-l2]");
      const ttl = one("[data-title]");
      const saved = one("[data-saved]");
      const oldT = c.site.title[1].replace(".", "");
      tl.to(ub, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, T(31))
        .to(nav, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power2.out" }, T(31.2))
        .call(() => F.whoosh(0.6, true, 0.8), undefined, T(31.2))
        .to(dev, { width: mid, scale: fit(mid), "--r": "34px", duration: 0.9, ease: "expo.inOut" }, T(31.2))
        .fromTo(cam, { scale: 1, transformOrigin: aim(() => (tight() ? dev : ttl)) }, { scale: () => (tight() ? 1.08 : 1.5), duration: 1, ease: "expo.inOut" }, T(33))
        .fromTo($("[data-focus]"), { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, T(34.2))
        .call(() => F.tick(1.3), undefined, T(34.2))
        .fromTo($("[data-sel]"), { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, T(34.8))
        .to($("[data-sel]"), { autoAlpha: 0, duration: 0.2, ease: "power1.out" }, T(35.8));
      eraseTo(tl, l2, oldT, T(35.8), 0.45);
      typeTo(tl, l2, c.title[1], T(36.8), T(2.2), 0);
      l2.textContent = oldT;
      tl.to($("[data-focus]"), { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, T(39.2))
        .fromTo(saved, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, T(39.2))
        .fromTo(one("[data-saved-t]"), { y: 70, scale: 0.9, filter: "blur(10px)" }, { y: 0, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "expo.out" }, T(39.2) + 0.1)
        .call(() => F.chord([0, 2, 4, 5], 1), undefined, T(39.2))
        .to(cam, { scale: 1, duration: 1, ease: "expo.inOut" }, T(39.6));
      cap(8, 31.4, 40.8);

      /* 9 · Tutto compreso: ogni cosa nasce come icona che si disegna al centro, diventa card e si unisce al cerchio */
      const gs = $("[data-g]");
      const orb = { a: -0.5 };
      const rr = gs.map(() => ({ r: 0 }));
      // anteprima stretta o telefono: le voci in colonna, e più piccole se serve, così non escono dal riquadro
      const narrow = () => cam.offsetWidth < 820;
      const gS = () => (narrow() ? Math.min(1, cam.offsetWidth / 600, cam.offsetHeight / 560) : Math.min(1, cam.offsetWidth / 1250));
      const place = () =>
        gs.forEach((g, i) => {
          const { r } = rr[i];
          if (narrow()) gsap.set(g, { x: 0, y: (i - 2.55) * 72 * gS() * r });
          else {
            const t = orb.a + (i / gs.length) * Math.PI * 2;
            gsap.set(g, { x: Math.cos(t) * Math.min(cam.offsetWidth * 0.33, 540) * r, y: Math.sin(t) * Math.min(cam.offsetHeight * 0.34, 260) * r });
          }
        });
      place();
      tl.set(saved, { autoAlpha: 0 }, T(41.2))
        .call(() => (F.kick(1), F.whoosh(0.8, false, 1)), undefined, T(40.8))
        .set(dev, { autoAlpha: 0 }, T(41.2))
        .fromTo(orb, { a: -0.5 }, { a: 0.4, duration: T(7.4), ease: "none", onUpdate: place }, T(41.2));
      // ogni voce esce dal centro con una molla e si ferma sul suo posto dell'ellisse: niente deformazioni, solo posizione e messa a fuoco
      gs.forEach((g, i) => {
        const at = T(41.2 + i * 0.55);
        tl.fromTo(g, { autoAlpha: 0, scale: () => gS() * 0.5, filter: "blur(10px)" }, { autoAlpha: 1, scale: gS, filter: "blur(0px)", duration: 0.7, ease: "back.out(1.5)" }, at)
          .to(rr[i], { r: 1, duration: 1, ease: "expo.out", onUpdate: place }, at)
          .call(() => F.pluck(i + 2, 0.9, 0.5), undefined, at + 0.05);
      });
      tl.call(() => F.chord([0, 2, 4, 5], 1), undefined, T(48.6));
      punch(48.6, 1.015);
      cap(9, 41, 49);

      /* 10 · Senza sorprese */
      const ps = $("[data-pr]");
      const pp = (i: number) => {
        const w = ps[i].offsetWidth;
        const h = ps[i].offsetHeight;
        return narrow() ? { x: (i % 2 ? 0.5 : -0.5) * (w + 12), y: (i < 2 ? -0.5 : 0.5) * (h + 12) } : { x: (i - 1.5) * (w + 16), y: 0 };
      };
      tl.set(gs, { autoAlpha: 0 }, T(49.8))
        .call(() => F.whoosh(0.5, true, 0.7), undefined, T(49.8));
      ps.forEach((p, i) => {
        const at = T(49.8 + i * 0.4);
        tl.fromTo(p, { autoAlpha: 0, scale: 0.82, x: () => pp(i).x, y: () => pp(i).y + 80 }, { autoAlpha: 1, scale: 1, x: () => pp(i).x, y: () => pp(i).y, duration: 0.7, ease: "expo.out" }, at)
          .fromTo(p.querySelector("[data-tile]"), { rotationY: -40, rotationX: 18 }, { rotationY: 30, rotationX: -12, duration: Math.max(1, T(54.2) - at), ease: "sine.inOut" }, at)
          .call(() => F.bell(7 + i * 2, 0.9), undefined, at + 0.05);
      });
      cap(10, 50, 54.6);

      /* chiusura */
      const eg = (() => {
        const e = one("[data-eh]");
        return split(e);
      })();
      tl.set(ps, { autoAlpha: 0 }, T(54.8))
        .call(() => (F.kick(1.2), F.whoosh(0.9, true, 1)), undefined, T(54.8))
        .set(endCard, { autoAlpha: 1 }, T(54.8));
      slam(eg, T(55.0), 0);
      tl        .to(endCard, { autoAlpha: 0, y: -30, filter: "blur(10px)", duration: 0.5, ease: "power2.in" }, T(55.0) + 1.7)
        .set(one("[data-end2]"), { autoAlpha: 1 }, T(55.0) + 2.1)
        .fromTo(one("[data-logo]"), { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out" }, T(55.0) + 2.1)

      punch(51.8, 1.03);
      tl.set({}, {}, T(55.0) + 3.4);

      /* Il tempo del video lo muoviamo noi, un fotogramma alla volta e con un passo massimo:
         se il dispositivo rallenta (pagina che carica, telefono sotto sforzo) il video rallenta con lui invece di saltare le scene. */
      /* Prima: mille risultati, e la tua attività è in fondo; la lista scorre per trovarla */
      const farTl = gsap.timeline({ paused: true });
      {
        const box = one("[data-far]");
        const list = one("[data-fl]");
        const win = list.parentElement as HTMLElement;
        const rows = $("[data-fr]");
        const me = rows[rows.length - 1];
        // parte piano, accelera fino a diventare scie di luce, rallenta e si ferma su di te
        const vb = one("[data-vb]");
        const streak = one("[data-streak]");
        vb.setAttribute("stdDeviation", "0 0");
        list.style.filter = "none";
        streak.style.opacity = "0";
        const endY = () => -(me.offsetTop - (win.offsetHeight - me.offsetHeight) / 2);
        const ease = gsap.parseEase("power4.inOut");
        const run = { p: 0 };
        const D = 3.4;
        const paint = () => {
          const y = endY() * ease(run.p);
          const e = 0.004;
          const v = Math.abs(ease(Math.min(1, run.p + e)) - ease(Math.max(0, run.p - e))) / (2 * e) / 4; // 0…1 circa
          gsap.set(list, { y, scaleY: 1 + v * 0.06, transformOrigin: `50% ${-y + win.offsetHeight / 2}px` });
          vb.setAttribute("stdDeviation", `0 ${(v * v * 26).toFixed(2)}`);
          list.style.filter = v > 0.04 ? "url(#wc-vblur)" : "none";
          streak.style.opacity = String(Math.max(0, v * 1.3 - 0.35));
        };
        farTl
          .set([pill, ...res], { autoAlpha: 0 }, 0)
          .set(box, { autoAlpha: 1 }, 0)
          .fromTo(one("[data-fcount]"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.05)
          .fromTo(rows.slice(0, 5), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 }, 0.15)
          .fromTo(run, { p: 0 }, { p: 1, duration: D, ease: "none", onUpdate: paint, onReverseComplete: paint }, 0.8)
          .call(() => F.riser(D * 0.5), undefined, 0.8)
          .call(() => F.whoosh(1, false, 1), undefined, 0.8 + D * 0.4)
          .fromTo(one("[data-veil]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 0.8 + D)
          .fromTo(me.querySelector("[data-bub]"), { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "expo.out" }, 0.85 + D)
          .call(() => F.tick(1.2), undefined, 0.8 + D)
          .set({}, {}, 0.8 + D + 0.7);

      }

      /* SEO: i risultati della ricerca, e la tua attività che sale in cima */
      const seoTl = gsap.timeline({ paused: true });
      {
        const box = one("[data-seo]");
        const rows = $("[data-sr]");
        const me = rows[rows.length - 1];
        // sale in cima: la tua attività va al posto del primo, gli altri scendono di un posto
        const up = () => rows[0].offsetTop - me.offsetTop;
        const down = () => me.offsetHeight + 24;
        seoTl
          .set([dev, chrome, meter], { autoAlpha: 0 }, 0)
          .set(box, { autoAlpha: 1 }, 0)
          .fromTo(rows, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 }, 0.05)
          .to(me, { opacity: 0.6, duration: 0.3 }, 0.7);
        rows.slice(0, -1).forEach((r, i) => seoTl.to(r, { y: down, duration: 1.1, ease: "expo.inOut" }, 1.2 + 0.04 * (rows.length - 2 - i)));
        seoTl
          .to(me, { y: up, opacity: 1, duration: 1.1, ease: "expo.inOut" }, 1.2)
          .call(() => F.whoosh(0.5, true, 0.6), undefined, 1.2)
          .fromTo(one("[data-sveil]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 2.4)
          .fromTo(me.querySelector("[data-bub]"), { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "expo.out" }, 2.45)
          .call(() => F.chord([0, 2, 4, 5], 0.8), undefined, 2.4)
          .set({}, {}, 3.6);
      }
      /* Ogni schermo: computer, poi tablet e telefono che arrivano ai lati */
      const devsTl = gsap.timeline({ paused: true });
      {
        const box = one("[data-devs]");
        devsTl
          .set([dev, box], { autoAlpha: 0 }, 0)
          .set(box, { autoAlpha: 1 }, 0)
          .fromTo(one("[data-dpc]"), { autoAlpha: 0, y: 80, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "expo.out" }, 0.05)
          .fromTo(one("[data-dtab]"), { autoAlpha: 0, x: -160, scale: 0.92 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.9, ease: "expo.out" }, 0.55)
          .call(() => F.whoosh(0.45, true, 0.6), undefined, 0.55)
          .fromTo(one("[data-dphone]"), { autoAlpha: 0, x: 160, y: 40, scale: 0.92 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: "expo.out" }, 0.85)
          .call(() => F.whoosh(0.45, true, 0.6), undefined, 0.85)
          .set({}, {}, 2.9);
      }
      /* GEO: chiedi a un assistente AI, e ti consiglia */
      const geoTl = gsap.timeline({ paused: true });
      {
        const box = one("[data-geo]");
        const src = one("[data-gsrc]");
        geoTl
          .set([one("[data-seo]"), dev], { autoAlpha: 0 }, 0)
          .set(box, { autoAlpha: 1 }, 0)
          .fromTo(one("[data-gq]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.1)
          .fromTo(one("[data-ga]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", clearProps: "transform" }, 0.9)
          .set(src, { autoAlpha: 0 }, 0);
        const [pre, post] = c.geo.a.split(c.find.me[0]);
        typeTo(geoTl, one("[data-gat1]"), pre, 1.4, 0.7, 2);
        typeTo(geoTl, one("[data-gat2]"), c.find.me[0], 2.1, 0.5, 4);
        typeTo(geoTl, one("[data-gat3]"), post ?? "", 2.6, 1.0, 6);
        geoTl
          .fromTo(src, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2.4)" }, 3.75)
          .fromTo(one("[data-cveil]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 3.95)
          .fromTo(one("[data-bub2]"), { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "expo.out" }, 4.0)
          .call(() => F.chord([0, 2, 4, 7], 0.8), undefined, 3.75)
          .set({}, {}, 5.4);
      }
      // il secondo tempo del cliente che se ne va: i secondi continuano a salire finché non torna indietro
      {
        const o = { n: 8 };
        back.fromTo(o, { n: 8 }, { n: 8.8, duration: 1.4, ease: "none", onUpdate: () => void (cnt.textContent = num(o.n)) }, 0);
      }

      /* montaggio: la frase a schermo intero, poi la sua scena a schermo intero, poi un attimo fermi sul finale */
      const xcaps = [0, 1, 2, 3].map((i) => one(`[data-capx="${i}"]`));
      const xunits = xcaps.map(split);
      const scene = tl;
      type Ch = { mood?: Mood; textOnly?: boolean; u?: { a: HTMLElement[]; b: HTMLElement[] }; el?: HTMLElement; seg?: [number, number]; sub?: gsap.core.Timeline; speed?: number; hold?: number; after?: (t: number) => void };
      // solo i passaggi che dicono qualcosa: il problema, poi cosa cambia (in cima, veloce, fatto su misura, ogni schermo, lo modifichi tu, l'AI ti cita, tutto compreso)
      const ch: Ch[] = [
        // prima del nostro intervento
        { u: units[0], el: caps[0], seg: [0, T(3)], speed: 1.3, mood: "calm" },
        { u: xunits[2], el: xcaps[2], sub: farTl, speed: 1.2, mood: "doubt", after: (t) => void mt.set(one("[data-far]"), { autoAlpha: 0 }, t) },
        { u: units[1], el: caps[1], seg: [U(5.7) + 0.02, 5.75], hold: 0, mood: "tense" },
        { sub: back, speed: 1.6, hold: 0.25, after: (t) => void mt.set([one("[data-rival]"), one("[data-cur]")], { autoAlpha: 0 }, t) },
        { u: xunits[3], el: xcaps[3], textOnly: true, mood: "stop" },
        // con il nuovo sito
        { u: xunits[0], el: xcaps[0], sub: seoTl, speed: 1.55, mood: "rise", after: (t) => void mt.set(one("[data-seo]"), { autoAlpha: 0 }, t).set(chrome, { autoAlpha: 1 }, t).set(meter, { autoAlpha: 0 }, t).call(() => void (tt1.textContent = c.find.me[1]), undefined, t) },
        { u: units[2], el: caps[2], seg: [6.5, T(11.4)], speed: 1.15, mood: "drive" },
        { u: units[3], el: caps[3], seg: [T(11.9), T(18)], speed: 1 },
        { u: units[5], el: caps[5], sub: devsTl, after: (t) => void mt.set(one("[data-devs]"), { autoAlpha: 0 }, t).set(dev, { autoAlpha: 1 }, t) },
        { u: units[8], el: caps[8], seg: [T(31.6), T(40.6)], speed: 1.45, mood: "light" },
        { u: xunits[1], el: xcaps[1], sub: geoTl, speed: 1.5, after: (t) => void mt.set(one("[data-geo]"), { autoAlpha: 0 }, t) },
        { seg: [T(54.8), scene.duration()], hold: 0, mood: "end" },
      ];
      const mt = gsap.timeline({
        paused: true,
        onUpdate: () => {
          if (bar.current) bar.current.style.transform = `scaleX(${mt.progress()})`;
        },
      });
      let at = 0;
      let pending: ((t: number) => void) | undefined;
      let cstyle = 0;
      // tutto cade sulla griglia della musica: ottavi a 120 bpm (0,25 s)
      const q8 = (t: number) => Math.ceil(t * 4 - 1e-6) / 4;
      const r8 = (t: number) => Math.max(0.5, Math.round(t * 4) / 4);
      const rig = one("[data-rig]");
      // ogni scena entra con un movimento di camera diverso, poi la camera continua a muoversi piano
      const moves = [
        { scale: 1.3, yPercent: 8 },
        { scale: 0.8, xPercent: -6 },
        { scale: 1.22, xPercent: 8 },
        { scale: 1.32, yPercent: -6 },
        { scale: 0.84, yPercent: 6 },
      ];
      const shoot = (i: number, t: number, d: number) => {
        const m = moves[i % moves.length];
        mt.fromTo(rig, { xPercent: 0, yPercent: 0, ...m }, { scale: 1, xPercent: 0, yPercent: 0, duration: 0.9, ease: "expo.out", immediateRender: false }, t);
        if (d > 1.2) mt.to(rig, { scale: i % 2 ? 0.96 : 1.05, duration: d - 0.9, ease: "sine.inOut" }, t + 0.9);
      };
      ch.forEach((k, i) => {
        at = q8(at);
        if (k.mood) {
          const m = k.mood;
          const t0 = at;
          mt.call(() => cue(m, t0), undefined, t0);
        }
        let shot = -1;
        if (k.u && k.el) {
          mt.to(cam, { autoAlpha: 0, duration: 0.22, ease: "power2.in" }, at);
          pending?.(at + 0.23);
          pending = undefined;
          const words = [...k.u.a, ...k.u.b];
          const c0 = q8(at + 0.2);
          const el = k.el;
          mt.set(el, { autoAlpha: 1 }, c0);
          // ogni frase entra in un modo diverso: salita, zoom indietro, zoom attraverso, spaziatura che si chiude, tendina
          const style = cstyle++ % 5;
          const glow = "inset(-40% -12% -40% -12%)";
          if (style === 0) slam(k.u, c0, i % 5, mt);
          else {
            mt.set(words, { autoAlpha: 1, yPercent: 0, scale: 1, filter: "blur(0px)" }, c0);
            if (style === 1) mt.fromTo(el, { scale: 2.6, filter: "blur(18px)", autoAlpha: 0 }, { scale: 1, filter: "blur(0px)", autoAlpha: 1, duration: 0.75, ease: "expo.out" }, c0);
            if (style === 2) mt.fromTo(el, { scale: 0.55, filter: "blur(8px)", autoAlpha: 0 }, { scale: 1, filter: "blur(0px)", autoAlpha: 1, duration: 0.7, ease: "expo.out" }, c0);
            if (style === 3) mt.fromTo(el, { letterSpacing: "0.35em", filter: "blur(10px)", autoAlpha: 0 }, { letterSpacing: "-0.05em", filter: "blur(0px)", autoAlpha: 1, duration: 0.85, ease: "expo.out" }, c0);
            if (style === 4) mt.fromTo(el, { clipPath: "inset(-40% 112% -40% -12%)", x: -30 }, { clipPath: glow, x: 0, duration: 0.7, ease: "expo.inOut" }, c0);
            mt.call(() => F.tick(0.8), undefined, c0);
          }
          const c1 = q8(c0 + 0.5 + 0.035 * (words.length - 1) + (el.textContent?.length ?? 20) * 0.009);
          if (style === 2) mt.to(el, { scale: 6, autoAlpha: 0, filter: "blur(6px)", duration: 0.32, ease: "power3.in" }, c1);
          else if (style === 1) mt.to(el, { scale: 0.7, autoAlpha: 0, filter: "blur(8px)", duration: 0.28, ease: "power3.in" }, c1);
          else if (style === 4) mt.to(el, { clipPath: "inset(-40% -12% -40% 112%)", x: 30, duration: 0.3, ease: "expo.in" }, c1);
          else {
            if (k.u.a.length) mt.to(k.u.a, { autoAlpha: 0, yPercent: -60, filter: "blur(6px)", duration: 0.25, ease: "power3.in", stagger: 0.015 }, c1);
            if (k.u.b.length) mt.to(k.u.b, { autoAlpha: 0, scale: 1.08, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, c1);
          }
          mt.set(el, { autoAlpha: 0 }, c1 + 0.32);
          at = c1 + 0.32;
          if (k.textOnly) {
            at += 0.25;
            return;
          }
          mt.fromTo(cam, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power2.out", immediateRender: false }, at);
          shot = i;
        }
        if (!k.el && pending) {
          mt.to(cam, { autoAlpha: 0, duration: 0.22, ease: "power2.in" }, at);
          pending(at + 0.23);
          pending = undefined;
          at = q8(at + 0.25);
        }
        let d = 0;
        if (k.seg) d = r8((k.seg[1] - k.seg[0]) / (k.speed ?? 1));
        if (k.sub) d = r8(k.sub.duration() / (k.speed ?? 1));
        if (shot >= 0) shoot(shot, at, d);
        if (k.seg) mt.add(scene.tweenFromTo(k.seg[0], k.seg[1], { duration: d, ease: "none", immediateRender: false }), at);
        if (k.sub) mt.add(k.sub.tweenFromTo(0, k.sub.duration(), { duration: d, ease: "none", immediateRender: false }), at);
        at += d + (k.hold ?? 0.35);
        if (k.after) pending = k.after;
      });
      tlRef.current = mt;

      const drive = (_t: number, dt: number) => {
        if (!flags.current.playing) return;
        const next = Math.min(mt.duration(), mt.time() + Math.min(dt, 34) / 1000);
        mt.time(next);
        F.sync(next, true);
        if (next >= mt.duration()) {
          flags.current.ended = true;
          flags.current.playing = false;
          setEnded(true);
          setPlaying(false);
          // sulla pagina, finita la firma si passa da soli alla prima sezione scritta
          if (!embed) {
            const nx = el.nextElementSibling as HTMLElement | null;
            if (nx && el.getBoundingClientRect().top > -40 && el.getBoundingClientRect().top < innerHeight * 0.4) window.setTimeout(() => scrollToY(nx.getBoundingClientRect().top + scrollY), 500);
          }
        }
      };
      gsap.ticker.add(drive);
      let ready = document.readyState === "complete";
      const onReady = () => {
        ready = true;
        go();
      };
      if (!ready) window.addEventListener("load", onReady, { once: true });
      const go = () => {
        const f = flags.current;
        const run = ready && f.visible && f.lifted && !f.paused && !f.ended;
        if (run !== f.playing) F.duck(!run);
        f.playing = run;
        setPlaying(run);
      };
      const io = new IntersectionObserver(
        ([en]) => {
          flags.current.visible = en.isIntersecting;
          go();
        },
        { threshold: 0.55 },
      );
      io.observe(el);
      if (embed) go();
      else
        onIntroLift(() => {
          flags.current.lifted = true;
          go();
        });
      (el as unknown as { __go: () => void }).__go = go;
      return () => {
        io.disconnect();
        gsap.ticker.remove(drive);
        window.removeEventListener("load", onReady);
      };
    },
    { scope: root, dependencies: [locale, run], revertOnUpdate: true },
  );

  useEffect(() => {
    if (!embed) return;
    flags.current.paused = !play;
    (root.current as unknown as { __go?: () => void } | null)?.__go?.();
  }, [embed, play]);
  useEffect(() => {
    if (!embed || !ended) return;
    const t = window.setTimeout(() => {
      if (flags.current.paused) return;
      replay();
    }, 2200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embed, ended]);

  const toggle = () => {
    if (flags.current.ended) return;
    flags.current.paused = flags.current.playing;
    (root.current as unknown as { __go: () => void }).__go();
  };
  const replay = () => {
    flags.current = { ...flags.current, ended: false, paused: false, playing: false };
    setEnded(false);
    F.reset();
    F.duck(false);
    setRun((r) => r + 1);
  };

  const center = "absolute left-1/2 top-0";
  return (
    <section ref={root} className={embed ? "relative h-full w-full [container-type:size]" : "relative h-svh min-h-[560px] [container-type:size]"} aria-label={title} style={{ "--ft": "84px", "--fb": "16px" } as CSSProperties}>
      {!embed && <h1 className="sr-only">{title}</h1>}
      <div key={run} data-frame className={embed ? "cine-film cine-acr absolute inset-0 overflow-hidden" : "cine-film cine-acr absolute overflow-hidden rounded-[34px] shadow-[inset_0_0_0_1px_var(--hair-strong)] max-md:left-2 max-md:right-2 md:left-4 md:right-4"} style={embed ? undefined : { top: "var(--ft)", bottom: "var(--fb)" }}>
        {c.cap.map((t, i) => (
          <p key={t} data-cap={i} className={CAPF} style={HID}>
            <Kw text={t} />
          </p>
        ))}
        {[c.seo.cap, c.geo.cap, c.far.cap, c.far.lost].map((t, i) => (
          <p key={t} data-capx={i} className={CAPF} style={HID}>
            <Kw text={t} />
          </p>
        ))}
        <div data-rig className="absolute inset-0 will-change-transform">
        <div data-cam className="absolute inset-0 will-change-transform">
          <div className="absolute inset-x-0 top-[50%] h-0">
            {/* la home di Google: il cliente scrive */}
            <div data-it data-pill className={`${center} flex flex-col items-center gap-8`} style={HID}>
              <span data-gfit className="flex flex-col items-center gap-8">
                <GLogo size={92} />
                <GBox q="" w={620} h={54} typed />
              </span>
            </div>
            {[c.find.me, ...c.find.others].map(([t, u]) => (
              <span key={u} data-it data-res className={center} style={HID} />
            ))}
            {/* il sito, con dentro la barra dell'indirizzo, le notifiche e la conferma */}
            <div data-it data-dev className={`${center} overflow-hidden bg-[var(--bg-canvas)] shadow-[0_50px_140px_-40px_rgba(0,0,0,.4),inset_0_0_0_1px_var(--hair-strong)]`} style={{ ...HID, width: 1100, height: 640, borderRadius: "var(--r)" }}>
              <MiniSite c={c}>
                <div data-ub className="absolute left-[var(--i)] right-[var(--i)] top-[var(--i)] ms-glass z-20 flex h-[clamp(44px,6cqw,60px)] items-center gap-2.5 overflow-hidden px-[clamp(14px,2.4cqw,22px)] text-[clamp(14px,2cqw,18px)] text-[var(--label-primary)]" style={{ ...HID, borderRadius: R_IN }}>
                  <span className="relative block h-[18px] w-[18px] shrink-0">
                    <Lock data-lock1 size={17} strokeWidth={2} className="absolute inset-0 text-[#6b6f76]" />
                    <ShieldCheck data-lock2 size={18} strokeWidth={2} className="absolute inset-0 text-[#1a9e55]" style={HID} />
                  </span>
                  <span data-url className="tracking-[-0.01em]" />
                  <span data-live className="ml-auto flex items-center gap-1.5 text-[0.78em] font-medium text-[#1a9e55]" style={HID}>
                    <span className="h-2 w-2 rounded-full bg-[#30d158]" />
                    {c.online.live}
                  </span>
                  <span data-load2 className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-[var(--accent)]" style={{ transform: "scaleX(0)" }} />
                </div>
                {c.clients.items.map(([t, b], i) => (
                  <div key={b} data-n className="absolute left-[var(--i)] right-[var(--i)] z-20 flex h-[66px] items-center gap-3 bg-[var(--bg-surface)] p-[10px] text-[var(--label-primary)] ring-1 ring-[var(--hair-strong)] shadow-[0_10px_30px_-12px_rgba(0,0,0,.5)]" style={{ ...HID, top: `calc(var(--i) + ${i * 74}px)`, borderRadius: R_IN }}>
                    <span className="flex aspect-square h-full shrink-0 items-center justify-center bg-[var(--accent)] text-white" style={{ borderRadius: "calc(var(--r) - var(--i) - 10px)" }}>
                      <Bell size={20} strokeWidth={2} />
                    </span>
                    <span className="block min-w-0 leading-tight">
                      <span className="block truncate text-[15px] font-semibold tracking-[-0.01em]">{t}</span>
                      <span className="block truncate text-[13px] text-[var(--label-secondary)]">{b}</span>
                    </span>
                  </div>
                ))}
                <div data-saved className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-xl" style={{ ...HID, background: "color-mix(in srgb, var(--bg-canvas) 55%, transparent)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)" }}>
                  <span data-saved-t className="text-[clamp(34px,15cqw,110px)]" style={{ fontFamily: "var(--font-logo), var(--font-sans)", fontWeight: 400, fontSynthesis: "none", letterSpacing: "normal", lineHeight: 1 }}>
                    <GradientText colors={["#25c06a", "#7df0ae", "#16a05a", "#b5f7cf"]} animationSpeed={8} variant="flow" glow={1}>
                      {c.edit.saved + "!"}
                    </GradientText>
                  </span>
                </div>
                <Wire team={c.team} />
                <span data-scan className="pointer-events-none absolute inset-x-0 z-30 block h-[2px] bg-[#8fd8ff] shadow-[0_0_28px_6px_rgba(143,216,255,.6)]" style={HID} />
              </MiniSite>
            </div>
            {/* il browser: prima carica lento, poi tutto insieme */}
            <div data-it className={`${center} flex flex-col items-center gap-[clamp(16px,3cqh,32px)]`}>
              <div data-chrome className={`relative w-[min(88cqw,calc(min(46cqh,440px)*1.58))] aspect-[1.58] max-md:aspect-[.82] flex flex-col overflow-hidden rounded-[18px] shadow-[0_40px_120px_-40px_rgba(0,0,0,.5),inset_0_0_0_1px_var(--hair-strong)]`} style={{ ...HID, ["--r" as string]: "20px" }}>
              <div className="flex h-[38px] shrink-0 items-end gap-3 bg-[color-mix(in_srgb,var(--label-primary)_9%,var(--bg-canvas))] px-3">
                <span className="mb-[13px] flex gap-[7px]">
                  {["#ff5f57", "#febc2e", "#28c840"].map((k) => (
                    <span key={k} className="h-[11px] w-[11px] rounded-full" style={{ background: k }} />
                  ))}
                </span>
                <span className="cine-fg relative flex h-[31px] w-[min(210px,58%)] items-center gap-2 rounded-t-[11px] bg-[var(--bg-surface)] px-3 text-[12px]">
                  <span className="relative block h-4 w-4 shrink-0">
                    <svg data-spin viewBox="0 0 16 16" className="absolute inset-0 animate-spin" fill="none" aria-hidden>
                      <circle cx="8" cy="8" r="6" stroke="var(--hair-strong)" strokeWidth="2" />
                      <path d="M8 2a6 6 0 0 1 6 6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <Globe data-fav size={16} strokeWidth={1.8} className="absolute inset-0" style={{ color: "var(--accent)" }} />
                  </span>
                  <span className="relative block min-w-0 flex-1 truncate">
                    <span data-tt1 className="block truncate">{c.find.me[1]}</span>
                    <span data-tt2 className="absolute inset-0 block truncate font-medium">Marchio</span>
                  </span>
                  <X size={13} strokeWidth={1.8} className="cine-fg2 shrink-0" />
                </span>
                <Plus size={15} strokeWidth={1.8} className="cine-fg2 mb-[10px]" />
              </div>
              <div className="cine-fg flex h-[44px] shrink-0 items-center gap-2 bg-[var(--bg-surface)] px-3">
                <ArrowLeft data-back size={17} strokeWidth={1.7} className="cine-fg2 rounded-full" />
                <ArrowRight size={17} strokeWidth={1.7} className="cine-fg2 opacity-60" />
                <span className="relative block h-[18px] w-[18px] shrink-0">
                  <X data-stop size={17} strokeWidth={1.8} className="absolute inset-0" />
                  <RotateCw data-rl size={17} strokeWidth={1.8} className="absolute inset-0" />
                </span>
                <span className="flex h-[30px] min-w-0 flex-1 items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--label-primary)_7%,var(--bg-surface))] px-3 text-[13px]">
                  <Lock size={13} strokeWidth={1.9} className="cine-fg2 shrink-0" />
                  <span data-url1 className="truncate">{c.find.me[1]}</span>
                </span>
                <EllipsisVertical size={17} strokeWidth={1.7} className="cine-fg2" />
              </div>
              <div className="relative min-h-0 flex-1 bg-[var(--bg-surface)]">
                <OldSite c={c} />
                {/* la ricerca, di nuovo: il cliente torna indietro */}
                <div data-gres className="absolute inset-0 z-[5] bg-white px-[6%] pt-[5%] text-[#202124] [container-type:size]" style={{ ...HID, ...ARIAL }}>
                  <div className="mb-[4cqh]">
                    <GLogo size={24} />
                  </div>
                  <div className="flex h-[11cqh] min-h-[30px] w-[min(520px,80%)] items-center gap-2.5 rounded-full px-4 text-[clamp(11px,3.6cqh,16px)] shadow-[0_1px_6px_rgba(32,33,36,.28)]">
                    <Search size={15} strokeWidth={1.8} className="shrink-0 text-[var(--label-secondary)]" />
                    {c.find.typed}
                  </div>
                  <div className="mt-[6cqh] flex flex-col gap-[5cqh]">
                    {[...c.find.others, c.find.me].map(([t, u], i) => (
                      <div key={u} data-gr={i}>
                        <span className="block text-[clamp(10px,3cqh,13px)] text-[#4d5156]">https://{u}</span>
                        <span data-grt className="block text-[clamp(14px,5cqh,22px)] text-[#1a0dab] underline-offset-4">
                          {t}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* il concorrente: si apre subito */}
                <div data-rival className="absolute inset-0 z-[6] flex flex-col items-center justify-center gap-[3cqh] bg-[var(--bg-canvas)] [container-type:size]" style={HID}>
                  <span className="text-[clamp(22px,10cqh,56px)] font-semibold tracking-[-0.045em] text-[var(--label-primary)]">{c.find.others[0][0]}</span>
                  <span className="flex items-center gap-2 text-[clamp(11px,3.6cqh,16px)] text-[var(--label-secondary)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--positive)]" />
                    {c.rival.open}
                  </span>
                </div>
                <div data-sw className="absolute inset-0">
                  <MiniSite c={c} />
                </div>
                <span data-wipe aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-20 block w-[3px] bg-[var(--accent)] shadow-[0_0_30px_8px_rgba(94,196,255,.55)]" style={HID} />
                <span data-prog aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px] origin-left" style={{ ...HID, background: "var(--accent)" }} />
                <svg data-cur viewBox="0 0 24 24" width="24" height="24" aria-hidden className="pointer-events-none absolute left-0 top-0 z-20" style={{ ...HID, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.45))" }}>
                  <path d="M5 3l14 8-6 1.6L10.4 19z" fill="#14171c" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {/* sotto la finestra: prima o dopo, e quanto ci mette. Testo, non una scheda */}
              <div data-meter className={`cine-fg flex items-center gap-[0.4em] whitespace-nowrap text-[clamp(34px,5.4cqw,80px)] font-semibold leading-none tracking-[-0.045em]`} style={HID}>
                <span data-tagdot className="h-[0.3em] w-[0.3em] rounded-full" style={{ background: "var(--negative)" }} />
                <span className="relative font-semibold tracking-[-0.02em]">
                  <span data-tag1>{c.ba[0]}</span>
                  <span data-tag2 className="absolute left-0 top-0" style={HID}>
                    {c.ba[1]}
                  </span>
                </span>
                <span data-count className="tabular-nums">
                  0,0 s
                </span>
                <Check data-ok size={"0.8em" as unknown as number} strokeWidth={2.6} style={{ color: "var(--accent)" }} />
              </div>
            </div>
            {/* prima: la pagina dei risultati di Google, e tu in fondo */}
            <div data-it data-far className={center} style={HID}>
              <svg width="0" height="0" className="absolute" aria-hidden>
                <filter id="wc-vblur" x="0" y="-20%" width="100%" height="140%">
                  <feGaussianBlur data-vb stdDeviation="0 0" />
                </filter>
              </svg>
              <div data-gfit className="relative h-[560px] w-[820px] overflow-hidden rounded-[22px] bg-white shadow-[0_40px_120px_-40px_rgba(0,0,0,.45)] ring-1 ring-black/5" style={ARIAL}>
                <div className="relative z-30 flex h-[84px] items-center gap-7 border-b border-[#ebebeb] bg-white px-8">
                  <GLogo size={32} />
                  <GBox q={c.find.typed} w={560} />
                </div>
                <p data-fcount className="relative z-30 bg-white pb-3 pl-[118px] pt-3 text-[13px] text-[#70757a]">
                  {c.far.count}
                </p>
                <div className="absolute inset-x-0 bottom-0 top-[124px] overflow-hidden">
                  <div data-fl className="relative flex flex-col gap-[30px] pb-[200px] pl-[118px] pt-2 will-change-transform">
                    <Veil data-veil />
                    {Array.from({ length: FAR_N }, (_, i) => (i === FAR_N - 1 ? c.find.me : c.far.list[i % c.far.list.length])).map(([t, u], i) => (
                      <GResult key={i} data-fr me={i === FAR_N - 1} name={t} url={u} title={i === FAR_N - 1 ? c.far.mine : `${t} · ${c.far.title}`} snip={c.far.snip} />
                    ))}
                  </div>
                  <div data-streak aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: 0 }}>
                    {STREAKS.map(([x, w, d], i) => (
                      <span key={i} className="absolute top-[-10%] h-[120%]" style={{ left: `${x}%`, width: w, opacity: d, background: "linear-gradient(transparent, #4285F4, transparent)" }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* ogni schermo: il sito vero (la hero di questo portfolio) su computer, tablet e telefono */}
            <div data-it data-devs className={center} style={HID}>
              <div data-gfit className="relative flex h-[560px] w-[1040px] items-end justify-center">
                <div data-dtab className="relative z-10 mb-[6px] mr-[-60px] w-[250px] rounded-[26px] bg-[#16181c] p-[9px] shadow-[0_30px_80px_-30px_rgba(0,0,0,.55)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cin("hero-tablet")} alt="" draggable={false} className="block w-full rounded-[18px]" />
                </div>
                <div data-dpc className="relative flex flex-col items-center">
                  <div className="w-[620px] rounded-t-[20px] bg-[#16181c] p-[10px] pb-[12px] shadow-[0_40px_100px_-40px_rgba(0,0,0,.55)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cin("hero-desktop")} alt="" draggable={false} className="block w-full rounded-[10px]" />
                  </div>
                  <div className="h-[16px] w-[720px] rounded-b-[16px] bg-gradient-to-b from-[#e4e5e9] to-[#b9bbc2] shadow-[0_20px_40px_-18px_rgba(0,0,0,.5)]" />
                </div>
                <div data-dphone className="relative z-10 mb-[-10px] ml-[-70px] w-[150px] rounded-[30px] bg-[#16181c] p-[6px] shadow-[0_30px_70px_-26px_rgba(0,0,0,.6)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cin("hero-phone")} alt="" draggable={false} className="block w-full rounded-[25px]" />
                </div>
              </div>
            </div>
            {/* SEO: la stessa pagina di Google, e la tua attività sale in cima */}
            <div data-it data-seo className={center} style={HID}>
              <div data-gfit className="relative h-[560px] w-[820px] overflow-hidden rounded-[22px] bg-white shadow-[0_40px_120px_-40px_rgba(0,0,0,.45)] ring-1 ring-black/5" style={ARIAL}>
                <div className="relative z-30 flex h-[84px] items-center gap-7 border-b border-[#ebebeb] bg-white px-8">
                  <GLogo size={32} />
                  <GBox q={c.find.typed} w={560} />
                </div>
                <div className="absolute inset-x-0 bottom-0 top-[84px] flex flex-col gap-[24px] pl-[118px] pt-6">
                  <Veil data-sveil />
                  {[...c.find.others, c.seo.more[0], c.find.me].map(([t, u], i, all) => (
                    <GResult key={u} data-sr me={i === all.length - 1} name={t} url={u} title={i === all.length - 1 ? c.far.mine : `${t} · ${c.far.title}`} snip={c.far.snip} />
                  ))}
                </div>
              </div>
            </div>
            {/* GEO: l'app di Claude risponde e cita il tuo sito */}
            <div data-it data-geo className={center} style={HID}>
              <div data-gfit className="relative h-[560px] w-[820px] overflow-hidden rounded-[22px] bg-[#faf9f5] text-[#141413] shadow-[0_40px_120px_-40px_rgba(0,0,0,.45)] ring-1 ring-black/5">
                <Veil data-cveil />
                <div className="flex h-[58px] items-center gap-2.5 px-6">
                  <Spark size={20} />
                  <span className="text-[17px] font-medium" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    Claude
                  </span>
                </div>
                <div className="mx-auto flex w-[600px] flex-col pt-6">
                  <div data-gq className="max-w-[80%] self-end rounded-[18px] bg-[#f0eee6] px-4 py-3 text-[16px]">
                    {c.geo.q}
                  </div>
                  <div data-ga className="mt-7 flex gap-3.5">
                    <span className="mt-1">
                      <Spark size={24} />
                    </span>
                    <div className="flex flex-col items-start gap-3">
                      <p className="relative text-[18px] leading-[1.6]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        <span className="invisible">
                          {c.geo.a.split(c.find.me[0])[0]}
                          <strong className="font-semibold">{c.find.me[0]}</strong>
                          {c.geo.a.split(c.find.me[0])[1]}
                        </span>
                        <span className="absolute inset-0">
                          <span data-gat1 />
                          <strong data-gat2 className="font-semibold" />
                          <span data-gat3 />
                        </span>
                      </p>
                      <span data-gsrc className="relative z-20 inline-flex items-center gap-2 rounded-[10px] border border-[#e5e2d9] bg-white px-3 py-1.5 text-[14px]">
                        <Bead as="span" data-bub2 radius={18} className="absolute -inset-x-4 -inset-y-3 -z-10" style={HID} />
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-white">{c.find.me[0][0]}</span>
                        {c.find.me[1]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-6 left-1/2 flex h-[58px] w-[600px] -translate-x-1/2 items-center justify-between rounded-[18px] bg-white pl-5 pr-2.5 text-[15px] text-[#8a8780] ring-1 ring-[#e5e2d9]">
                  {c.geo.reply}
                  <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#d97757] text-white">
                    <ArrowUp size={18} strokeWidth={2.4} />
                  </span>
                </div>
              </div>
            </div>
            {/* cosa ricevi */}
            {c.gets.items.map(([t], i) => {
              const Icon = ICONS_GETS[i];
              return (
                <Bead as="div" key={t} data-it data-g radius={32} className={`cine-fg ${center} flex h-[clamp(66px,10cqh,88px)] max-md:h-[58px] items-center whitespace-nowrap pr-[clamp(22px,2.6cqw,32px)] text-[clamp(17px,2.1cqw,25px)] font-medium tracking-[-0.015em] [--gp:clamp(18px,2.2cqw,26px)]`} style={HID}>
                  <span className="flex aspect-square h-full shrink-0 items-center justify-center">
                    <Tile3D Icon={Icon} className="block h-[72%] w-[72%]" />
                  </span>
                  <span className="pl-1">{t}</span>
                </Bead>
              );
            })}
            {/* cosa garantisco */}
            {c.promise.items.map(([t], i) => (
              <Bead as="div" key={t} data-it data-pr radius={34} className={`cine-fg ${center} flex aspect-[.86] w-[clamp(140px,19cqw,250px)] flex-col items-center justify-center gap-5 px-3`} style={HID}>
                <Tile3D Icon={ICONS_PROMISE[i % ICONS_PROMISE.length]} size={34} className="block aspect-square w-[44%]" />
                <span className="text-center text-[clamp(15px,1.7cqw,22px)] font-medium leading-tight tracking-[-0.015em]">{t}</span>
              </Bead>
            ))}
          </div>
        </div>
      </div>
      <div data-end className="absolute inset-0 flex flex-col items-center justify-center" style={HID}>
        <p data-eh className="mx-auto max-w-[14ch] px-6 text-center text-[clamp(38px,6.6cqw,108px)] font-medium leading-[1.04] tracking-[-0.05em] cine-fg">
          <Kw text={c.end.t} />
        </p>
      </div>
      <div data-end2 className="absolute inset-0 flex flex-col items-center justify-center" style={HID}>
        <div data-logo className="[--logo-size:clamp(46px,10.5cqw,136px)]" style={HID}>
          <Wordmark />
        </div>

      </div>
      {!embed && !prefersReducedMotion() && (
        <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center px-5">
          <Bead as="div" radius={24} className="cine-fg relative flex h-12 items-center gap-1 overflow-hidden px-1.5">
            <button type="button" onClick={ended ? replay : toggle} aria-label={ended ? c.ctl.replay : playing ? c.ctl.pause : c.ctl.play} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--hover)]">
              {ended ? <RotateCcw size={18} strokeWidth={1.9} /> : playing ? <Pause size={18} strokeWidth={1.9} /> : <Play size={18} strokeWidth={1.9} />}
            </button>
            <span className="relative mx-1 block h-[3px] w-[clamp(96px,22cqw,200px)] overflow-hidden rounded-full bg-[var(--hair-strong)]">
              <span ref={bar} className="absolute inset-0 origin-left bg-[var(--accent)]" style={{ transform: "scaleX(0)" }} />
            </span>
            <button type="button" onClick={() => setSound(!snd)} aria-label={snd ? c.ctl.on : c.ctl.off} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--hover)]">
              {snd ? <Volume2 size={18} strokeWidth={1.9} /> : <VolumeX size={18} strokeWidth={1.9} />}
            </button>
          </Bead>
        </div>
      )}
      </div>
    </section>
  );
}
