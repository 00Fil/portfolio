"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import type { LucideIcon } from "lucide-react";
import { ArrowUp, Camera, Mic, Sparkles, Frame, MessageCircle, MousePointer2, PenTool, Square, Type, ArrowLeft, ArrowRight, Bell, Check, FileText, Globe, Inbox, KeyRound, LifeBuoy, Lock, LockOpen, Menu, Pause, PencilLine, Play, Plus, RotateCcw, RotateCw, Search, ShieldCheck, Tag, UserRound, Volume2, VolumeX, X, EllipsisVertical } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { prefersReducedMotion } from "@/lib/env";
import { onIntroLift } from "@/lib/intro";
import { soundOn, onSound, setSound } from "@/lib/sound";
import { fx, filmMute, cue, setFilmVariant, BPM, type Mood } from "@/lib/filmsound";
import { getLenis, scrollToY } from "@/lib/scroll";
import { Bead } from "@/components/glass/Bead";
import { Wordmark } from "@/components/nav/Wordmark";
import { GradientText } from "@/components/ui/GradientText";
import { getCinema, type Cinema } from "@/content/cinema";
import { VW as VW_SITE } from "./film-words";
import { VW as VW_NONE } from "./film-words-none";
import { FilmIntake } from "./FilmIntake";
import { personalize, type Answers } from "@/content/intake";
import { AppIcon } from "@/components/chat/ChatDock";

gsap.registerPlugin(SplitText, useGSAP);

const DISP = { fontWeight: 600, letterSpacing: "-0.055em" } as const;
const GT = ["#1f8fd0", "#5ec4ff", "#2f6fe0", "#8fd8ff"];
const cin = (n: string) => `/visual/cinema/${n}.webp`;
const HID = { visibility: "hidden" as const, opacity: 0 };
type Q = (s: string) => HTMLElement[];

/** Le parole tra asterischi diventano parole chiave, riempite dal gradiente animato. Con "!" davanti (*!perso*) il gradiente è rosso: una cosa che si perde. */
const GT_RED = ["#d92d20", "#ff6b5e", "#b42318", "#ff8a80"];
const GT_VIOLET = ["#ff00ff", "#ffffff", "#5b00ff", "#ff00c9"];
const GT_GREEN = ["#25D366", "#9af5bd", "#128C7E", "#25D366"];
export function Kw({ text }: { text: string }) {
  const parts = text.split("*");
  // l'apostrofo resta attaccato alla parola evidenziata: «l'intelligenza» non va mai a capo dopo «l'»
  const glue = (p: string, i: number) => (i % 2 === 0 && i + 1 < parts.length ? /\S*['’]$/.exec(p)?.[0] ?? "" : "");
  const word = (p: string, i: number) => {
    const m = /^[.,!?;:]+/.exec(parts[i + 1] ?? "");
    const red = p.startsWith("!");
    const plain = p.startsWith("^");
    const violet = p.startsWith("~");
    const green = p.startsWith("%");
    const full = red || plain || violet || green ? p.slice(1) : p;
    // ogni parola evidenziata è un pezzo a sé: le scritte arrivano sempre parola per parola, anche nel corsivo
    const ws = full.split(" ");
    return (
      <Fragment key={i}>
        {ws.map((x, j) => (
          <Fragment key={j}>
            {j ? " " : ""}
            {one(x + (j === ws.length - 1 && m ? m[0] : ""), j)}
          </Fragment>
        ))}
      </Fragment>
    );
    function one(w: string, j: number) {
    if (plain)
      return (
        <span key={j} data-kw className="inline-block font-semibold" style={{ padding: "0.1em 0.12em", margin: "-0.1em -0.12em" }}>
          <GradientText colors={GT} animationSpeed={8} variant="flow" glow={0.6}>
            {w}
          </GradientText>
        </span>
      );
    return (
      <span key={j} data-kw className="inline-block" style={{ ...(red ? { "--gt-glow-color": "#ff5a52" } : green ? { "--gt-glow-color": "#25D366" } : {}), fontFamily: "var(--font-logo), var(--font-sans)", fontWeight: 400, fontSize: "1.2em", fontSynthesis: "none", letterSpacing: "normal", lineHeight: 1, padding: "0.45em 0.34em 0.5em", margin: "-0.45em -0.34em -0.5em" }}>
        <GradientText colors={red ? GT_RED : violet ? GT_VIOLET : green ? GT_GREEN : GT} animationSpeed={8} variant="flow" glow={violet || green ? 0.8 : 1}>
          {w}
        </GradientText>
      </span>
    );
    }
  };
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2) {
          const g = glue(parts[i - 1], i - 1);
          return g ? (
            <span key={i} className="whitespace-nowrap">
              {g}
              {word(p, i)}
            </span>
          ) : (
            word(p, i)
          );
        }
        const prev = /^[.,!?;:]+/.exec(p);
        const body = i > 0 && prev ? p.slice(prev[0].length) : p;
        const g = glue(p, i);
        return <Fragment key={i}>{g ? body.slice(0, body.length - g.length) : body}</Fragment>;
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
function OldSite({ c, port = false }: { c: Cinema; port?: boolean }) {
  const o = c.old;
  if (port)
    return (
      <div data-old className="absolute inset-0 overflow-hidden bg-white [container-type:size]" style={{ fontFamily: '"Times New Roman", Times, serif', color: "#222" }}>
        <div data-o className="absolute inset-0 bg-[#e8e2d0]" />
        <div data-o className="absolute inset-x-0 top-0 flex h-[11%] items-center justify-center whitespace-nowrap bg-[#1d2b6b] text-[min(5cqh,9cqw)] font-bold text-[#ffd200]">
          {o.brand}
        </div>
        <div data-o className="absolute inset-x-0 top-[11%] flex h-[5.5%] items-center justify-around bg-[#c8c0aa] px-[3%]">
          {o.menu.map((m) => (
            <span key={m} className="whitespace-nowrap text-[min(2.6cqh,5cqw)] text-[#0000ee] underline">
              {m}
            </span>
          ))}
        </div>
        <div data-o className="absolute inset-x-[6%] top-[18%] text-center text-[min(3.4cqh,6.4cqw)] font-bold italic leading-[1.15] text-[#c00000]">
          {o.hello}
        </div>
        <div data-oimg className="absolute left-[6%] top-[31%] h-[38%] w-[88%] overflow-hidden outline outline-[3px] outline-[#888]" style={{ clipPath: "inset(0 0 100% 0)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cin("lavoro")} alt="" draggable={false} className="h-full w-full object-cover" style={{ filter: "sepia(.5) saturate(.7) contrast(.85)" }} />
        </div>
        <div data-otext className="absolute inset-x-[6%] top-[24%] text-center text-[min(2.6cqh,5cqw)] leading-[1.5]">
          {o.text.map((t) => (
            <span key={t} className="block">
              {t}
            </span>
          ))}
        </div>
        <div data-o className="absolute inset-x-0 top-[92%] text-center text-[min(2.2cqh,4.2cqw)] text-[#555]">
          {o.visits}
        </div>
      </div>
    );
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

/* ───────────── La hero di questo portfolio, ricostruita pezzo per pezzo: è il sito d'esempio del video ───────────── */
const HM_ACC = "#2b9fe6";
function HeroMock({ edit = "hardware", port = false }: { edit?: string; port?: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden text-[#121316]" style={{ background: "radial-gradient(60% 50% at 15% 0%, rgba(94,196,255,.16), transparent 70%), radial-gradient(50% 50% at 100% 100%, rgba(94,196,255,.12), transparent 70%), #f6f6f3" }}>
      <div data-hx className={`absolute left-1/2 top-[18px] -translate-x-1/2 ${port ? "w-[404px]" : "w-[980px]"} overflow-hidden rounded-[22px] bg-white/85 shadow-[0_10px_30px_-16px_rgba(20,30,50,.35)] ring-1 ring-black/5`}>
        <div className="flex h-[54px] items-center justify-between px-5">
          <span className="text-[24px] leading-none" style={{ fontFamily: "var(--font-logo), var(--font-sans)", color: HM_ACC }}>
            Filippo Corsini
          </span>
          <span className={`items-center gap-7 text-[14px] text-[#55565c] ${port ? "hidden" : "flex"}`}>
            <span>Servizi</span>
            <span>Lavori</span>
            <span>Percorso</span>
          </span>
          <span className="flex items-center gap-2 text-[13px]">
            <span className={`rounded-full bg-[#ececE8] px-3 py-1 font-medium ${port ? "hidden" : ""}`}>IT</span>
            <span className="rounded-full bg-[#9edcff] px-4 py-1.5 font-medium">Contattami</span>
          </span>
        </div>
        <div className="flex h-[30px] items-center overflow-hidden whitespace-nowrap bg-[#dff1fc] px-5 text-[12px] text-[#55565c]">
          <b className="mr-1 font-semibold text-[#121316]">Area clienti inclusa in ogni progetto.</b> Parli con il team e segui l’avanzamento.
        </div>
      </div>
      <div className={`absolute inset-x-0 flex flex-col items-center px-5 text-center ${port ? "top-[150px]" : "top-[150px]"}`}>
        <span data-hx className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#55565c]">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: HM_ACC }} />
          Disponibile per nuovi progetti
        </span>
        <div className={`mt-6 font-medium leading-[1.02] tracking-[-0.05em] ${port ? "text-[40px]" : "text-[66px]"}`}>
          <span data-hx className={`flex items-center justify-center ${port ? "gap-2.5" : "gap-4"}`}>
            Progetto
            <span className={`flex items-center justify-center rounded-[14px] bg-gradient-to-b from-[#1b2b46] to-[#0c1424] shadow-[0_10px_24px_-10px_rgba(0,0,0,.6)] ${port ? "h-[32px] w-[52px] rounded-[10px]" : "h-[52px] w-[84px]"}`}>
              <span className={`flex items-center justify-center rounded-[8px] bg-[#3b8cff] text-white ${port ? "h-[18px] w-[18px] rounded-[5px]" : "h-7 w-7"}`}>
                <Sparkles size={port ? 10 : 15} strokeWidth={2.2} />
              </span>
            </span>
            e sviluppo
          </span>
          <span data-hx className={`flex items-center justify-center ${port ? "gap-2.5" : "gap-4"}`}>
            <span className="relative">
              <span data-hsel className="pointer-events-none absolute -inset-x-2 -inset-y-1 origin-left rounded-[10px] bg-[#5ec4ff]/30" style={HID} />
              <span data-hw className="relative" style={{ color: HM_ACC }}>
                {edit}
              </span>
            </span>
            <span className={`rounded-full ${port ? "h-[30px] w-[30px]" : "h-[50px] w-[50px]"}`} style={{ background: "radial-gradient(circle at 35% 30%, #c8ecff, #5ec4ff 55%, #2b9fe6)" }} />
            su misura
          </span>
          <span data-hx className="block">
            per <span style={{ color: HM_ACC }}>l’industria</span>
          </span>
        </div>
        <p data-hx className={`mt-7 leading-[1.6] text-[#55565c] ${port ? "max-w-[340px] text-[14px]" : "max-w-[560px] text-[16px]"}`}>
          Sono Filippo Corsini. Realizzo software su misura per aziende e professionisti: piattaforme web, app e sistemi con intelligenza artificiale che automatizzano i processi.
        </p>
        <span data-hx className={`mt-7 flex items-center gap-3 font-medium ${port ? "text-[13px]" : "text-[15px]"}`}>
          <span className="rounded-full bg-[#9edcff] px-6 py-3">Prenota una chiamata →</span>
          <span className="rounded-full bg-white px-6 py-3 ring-1 ring-black/5">Vedi i lavori ↓</span>
        </span>
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
/** La lente con la stella della Modalità IA (disegnata, non il marchio). */
function AiLens({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="shrink-0" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.4 15.4 20.5 20.5" />
      <path d="M10.5 7.2c.3 1.7 1.1 2.5 2.8 2.8-1.7.3-2.5 1.1-2.8 2.8-.3-1.7-1.1-2.5-2.8-2.8 1.7-.3 2.5-1.1 2.8-2.8Z" fill="currentColor" strokeWidth={1} strokeLinejoin="round" />
    </svg>
  );
}
/** Il pulsante della Modalità IA: bordo con la luce arcobaleno che gli gira intorno. */
function AiPill({ h, label }: { h: number; label: string }) {
  return (
    <span className="relative flex shrink-0 items-center rounded-full p-[1.5px]" style={{ height: h, background: "conic-gradient(from 200deg, #4285f4, #9b72f2, #ea4335, #fbbc04, #34a853, #4285f4)", boxShadow: "0 0 10px -1px rgba(155,114,242,.55), 0 0 18px -4px rgba(66,133,244,.5), 0 0 16px -6px rgba(251,188,4,.5)" }}>
      <span className="flex h-full items-center gap-[0.35em] rounded-full bg-white px-[0.75em] text-[0.82em] font-medium text-[#1f1f1f]">
        <AiLens size={h * 0.46} />
        {label}
      </span>
    </span>
  );
}
/** La barra di ricerca di Google di oggi: lente, testo, microfono, Lens e il pulsante della Modalità IA. */
function GBox({ q, w, h = 46, typed = false }: { q: string; w: number; h?: number; typed?: boolean }) {
  const en = useLocale() === "en";
  return (
    <span className="flex items-center gap-3 rounded-full border border-[#dadce0] bg-white pl-5 pr-[0.3em] text-[#1f1f1f] shadow-[0_2px_8px_-2px_rgba(32,33,36,.18)]" style={{ width: w, height: h, fontSize: h * 0.34, ...ARIAL }}>
      <Search size={h * 0.38} strokeWidth={2} className="shrink-0 text-[#1f1f1f]" />
      <span className="flex min-w-0 flex-1 items-center overflow-hidden">
        {typed ? (
          <span className="inline-flex items-center leading-none">
            <span data-typed className="whitespace-pre" />
            <span className="ml-[1px] inline-block h-[1.15em] w-[2px] animate-pulse bg-[#1f1f1f]" />
          </span>
        ) : (
          <span className="truncate">{q}</span>
        )}
      </span>
      {!typed && <X size={h * 0.4} strokeWidth={1.7} className="shrink-0 text-[#1f1f1f]" />}
      {!typed && <span className="h-[55%] w-px shrink-0 bg-[#dadce0]" />}
      <Mic size={h * 0.4} strokeWidth={1.9} className="shrink-0 text-[#1f1f1f]" />
      <Camera size={h * 0.4} strokeWidth={1.9} className="shrink-0 text-[#1f1f1f]" />
      <AiPill h={h * 0.72} label={en ? "AI Mode" : "Modalità IA"} />
    </span>
  );
}
/** La testata di Google: logo e barra affiancati sul computer, uno sopra l'altra sul telefono. */
function GHead({ q, port, compact = false }: { q: string; port: boolean; compact?: boolean }) {
  return port ? (
    <div className={`relative z-30 flex shrink-0 flex-col items-center gap-3 bg-white px-4 pb-3 ${compact ? "pt-5" : "pt-14"}`}>
      <GLogo size={28} />
      <GBox q={q} w={348} h={44} />
    </div>
  ) : (
    <div className="relative z-30 flex h-[84px] shrink-0 items-center gap-7 bg-white px-8">
      <GLogo size={32} />
      <GBox q={q} w={560} />
    </div>
  );
}
/** Le schede sotto la barra, come nella pagina dei risultati di oggi. */
function GTabs({ active = 1, port = false, ...rest }: { active?: number; port?: boolean } & Record<string, unknown>) {
  const en = useLocale() === "en";
  const tabs = en ? ["AI Mode", "All", "Images", "Videos", "News", "Shopping", "More"] : ["Modalità IA", "Tutti", "Immagini", "Video", "Notizie", "Shopping", "Altro"];
  return (
    <div {...rest} className={`relative z-30 flex h-[40px] shrink-0 items-end overflow-hidden whitespace-nowrap border-b border-[#ebebeb] bg-white text-[14px] text-[#4d5156] ${port ? "gap-5 pl-5" : "gap-6 pl-[118px]"}`} style={ARIAL}>
      {(port ? tabs.slice(0, 4) : tabs).map((t, i) => (
        <span key={t} className={`relative flex items-center gap-1.5 pb-2.5 ${i === active ? "font-medium text-[#1f1f1f]" : ""}`}>
          {i === 0 && <AiLens size={15} />}
          {t}
          {i === active && <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-t-full bg-[#1f1f1f]" />}
        </span>
      ))}
    </div>
  );
}
/** Un risultato di Google: sito, indirizzo, titolo blu, descrizione. `me` gli mette dietro la bolla di vetro per evidenziarlo. */
function GResult({ name, url, title, snip, me = false, port = false, ...rest }: { name: string; url: string; title: string; snip: string; me?: boolean; port?: boolean } & Record<string, unknown>) {
  return (
    <div {...rest} className={`relative ${port ? "w-full" : "w-[600px]"} ${me ? "z-20" : ""}`} style={ARIAL}>
      {me && <Bead as="span" data-bub radius={26} className="absolute -inset-x-6 -inset-y-4 -z-10" style={HID} />}
      <span className="flex items-center gap-3">
        <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full border border-[#dadce0] bg-white text-[13px] font-bold text-[#5f6368]">{name[0]}</span>
        <span className="min-w-0 flex-1 leading-[1.3]">
          <span className="block text-[14px] text-[#1f1f1f]">{name}</span>
          <span className="block text-[12px] text-[#4d5156]">https://{url}</span>
        </span>
        <EllipsisVertical size={16} strokeWidth={2} className="shrink-0 text-[#5f6368]" />
      </span>
      <span data-gt className="mt-2 block text-[20px] leading-[1.3] text-[#1a0dab]">{title}</span>
      <span className="mt-1 block text-[14px] leading-[1.58] text-[#474747]">{snip}</span>
    </div>
  );
}
/** Il velo: lo stesso gradiente blu della firma, leggero, sopra tutto quello che non conta. */
function Veil({ ...rest }: Record<string, unknown>) {
  return <span {...rest} aria-hidden className="pointer-events-none absolute inset-0 z-10" style={{ ...HID, background: "linear-gradient(135deg, rgba(31,143,208,.34), rgba(94,196,255,.24) 45%, rgba(47,111,224,.34))" }} />;
}
/** Il marchio di Claude (tracciato ufficiale, da Simple Icons). */
/** Il marchio di OpenAI/ChatGPT (tracciato ufficiale, da Simple Icons). */
const GPT_PATH = "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z";
function Spark({ size = 22, color = "#0d0d0d" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="shrink-0">
      <path d={GPT_PATH} fill={color} />
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
/** Ogni scritta sta su una riga sola: il corpo scende quanto serve perché la frase entri nella larghezza del film (il corsivo è più largo). */
export function fitLine(t: string, max: string) {
  const kw = (t.match(/\*[^*]*\*/g) ?? []).join("").replace(/[*!^~%]/g, "").length;
  const plain = t.replace(/\*[^*]*\*/g, "").length;
  const em = plain * 0.54 + kw * 0.66 + 0.4;
  return `min(${max}, calc((100cqw - 64px) / ${em.toFixed(2)}))`;
}
export const CAPS = "pointer-events-none absolute inset-x-0 top-1/2 mx-auto -translate-y-1/2 whitespace-nowrap px-6 text-center font-semibold leading-[1.16] tracking-[-0.045em] [word-spacing:0.16em] cine-fg";
export const CAPL = "pointer-events-none absolute inset-x-0 top-1/2 mx-auto max-w-none whitespace-nowrap -translate-y-1/2 px-6 text-center text-[clamp(30px,6.2cqw,104px)] font-semibold leading-[1.16] tracking-[-0.05em] cine-fg";
export const CAPF = "pointer-events-none absolute inset-x-0 top-1/2 mx-auto max-w-[14ch] -translate-y-1/2 px-6 text-center text-[clamp(38px,7cqw,120px)] font-semibold leading-[1.16] tracking-[-0.05em] cine-fg";
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
  const [ans, setAns] = useState<Answers | null>(null);
  const c = useMemo(() => personalize(getCinema(locale), ans, locale === "en"), [locale, ans]);
  const root = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const flags = useRef({ visible: false, paused: embed, ended: false, lifted: embed, playing: false, outro: false });
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [snd, setSnd] = useState(false);
  // all'inizio, a pagina, il video aspetta una scelta: con o senza audio
  const [gate, setGate] = useState(false);
  const gateRef = useRef<HTMLDivElement>(null);
  // ogni nuova riproduzione ricostruisce il video da zero: niente resti della volta prima
  const [run, setRun] = useState(0);
  // telefono in verticale: le scene si ridisegnano strette e alte
  const [port, setPort] = useState(false);

  useEffect(() => {
    setSnd(soundOn());
    const off = onSound(setSnd);
    return () => void off();
  }, []);
  useEffect(() => {
    if (embed || prefersReducedMotion()) return;
    let saved: Answers | null = null;
    try {
      saved = JSON.parse(sessionStorage.getItem("film-intake") ?? "null");
    } catch {}
    if (saved) {
      setFilmVariant(saved.site === "none" ? "none" : "");
      setAns(saved);
      setRun((r) => r + 1);
      return;
    }
    flags.current.paused = true;
    setGate(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /** Le risposte (o nessuna, se salta) entrano nelle scritte, il video si ricostruisce e parte. */
  const begin = (a: Answers | null, withSound: boolean) => {
    setFilmVariant(a?.site === "none" ? "none" : "");
    if (withSound) {
      setSound(true);
      F.preload();
    }
    if (a) {
      try {
        sessionStorage.setItem("film-intake", JSON.stringify(a));
      } catch {}
    }
    const done = () => {
      setGate(false);
      setAns(a);
      flags.current = { ...flags.current, ended: false, paused: false, playing: false, outro: false };
      F.reset();
      F.duck(false);
      setRun((r) => r + 1);
    };
    if (gateRef.current) gsap.to(gateRef.current, { autoAlpha: 0, duration: 0.5, ease: "power2.out", onComplete: done });
    else done();
  };

  /* immersione: mentre il film gira la barra del sito scivola via e la cornice sale; il mouse in alto, un tocco in alto o il tab la riportano subito */
  useEffect(() => {
    if (embed) return;
    const h = document.documentElement;
    const on = (playing || gate) && scrollY < 40;
    // la cornice si rimisura anche a barra arrivata: in pausa il riquadro dei comandi sale sopra la barra del sito
    const again = [120, 450, 900].map((d) => window.setTimeout(() => window.dispatchEvent(new Event("resize")), d));
    if (!on) {
      h.removeAttribute("data-film-immersive");
      h.removeAttribute("data-nav-peek");
      window.dispatchEvent(new Event("resize"));
      return () => again.forEach((x) => window.clearTimeout(x));
    }
    h.setAttribute("data-film-immersive", "");
    window.dispatchEvent(new Event("resize"));
    let t = 0;
    const peek = (v: boolean) => {
      window.clearTimeout(t);
      if (v) h.setAttribute("data-nav-peek", "");
      else t = window.setTimeout(() => h.removeAttribute("data-nav-peek"), 650);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (e.clientY < 56) peek(true);
      else if (e.clientY > 150) peek(false);
    };
    const down = (e: PointerEvent) => {
      const edge = e.clientY < 72 || e.clientY > innerHeight - 72;
      if (e.pointerType === "touch" && edge) peek(!h.hasAttribute("data-nav-peek"));
      else if (!edge && e.clientY > 150 && h.hasAttribute("data-nav-peek")) peek(false);
    };
    const fin = (e: FocusEvent) => {
      if ((e.target as HTMLElement).closest?.("[data-site-nav], [data-site-nav-b]")) peek(true);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("focusin", fin);
    return () => {
      window.clearTimeout(t);
      again.forEach((x) => window.clearTimeout(x));
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("focusin", fin);
      h.removeAttribute("data-film-immersive");
      h.removeAttribute("data-nav-peek");
    };
  }, [playing, gate, embed]);

  /* telefono in verticale: lo decide la forma della sezione, non il dispositivo */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const check = () => setPort(el.offsetWidth < 760 && el.offsetWidth / Math.max(1, el.offsetHeight) < 0.85);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
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
      const imm = document.documentElement.hasAttribute("data-film-immersive");
      document.querySelectorAll<HTMLElement>(".drop, .float-glass").forEach((d) => {
        if (el.contains(d)) return;
        if (imm && d.closest("[data-site-nav], [data-site-nav-b]")) return;
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
    // la barra in alto cambia altezza (intro, banner che si chiude): si rimisura ogni volta, così sopra il video non resta spazio vuoto
    const ts = [400, 1600, 3500, 7000].map((t) => window.setTimeout(measure, t));
    let raf = 0;
    const soon = () => {
      // a pagina scorsa la barra può nascondersi: lì non si tocca la cornice
      if (scrollY > 40) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    const off = onIntroLift(() => window.setTimeout(measure, 700));
    const ro = new ResizeObserver(soon);
    document.querySelectorAll("header, nav").forEach((n) => ro.observe(n));
    window.addEventListener("resize", soon);
    return () => {
      ts.forEach((t) => window.clearTimeout(t));
      cancelAnimationFrame(raf);
      off();
      ro.disconnect();
      window.removeEventListener("resize", soon);
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
      const reset: [string, string][] = [["[data-typed]", ""], ["[data-url]", ""], ["[data-url1]", c.find.me[1]], ["[data-tt1]", c.find.me[1]], ["[data-count]", "0,0 s"], ["[data-gat1]", ""], ["[data-gat2]", ""], ["[data-gat3]", ""], ["[data-cin]", ""], ["[data-fsz]", ""]];
      reset.forEach(([q, v]) => $(q).forEach((e) => (e.textContent = v)));
      F.reset();
      // le scene, senza testo: le guida il montaggio qui sotto, un capitolo alla volta
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.inOut" } });

      /* didascalie a ritmo: la prima parte colpisce sul battito, la parola chiave arriva subito dopo (un ottavo),
         e tutto esce insieme sul battito successivo */
      const split = (e: HTMLElement) => {
        SplitText.create(e, { type: "words", wordsClass: "cw", ignore: "[data-kw]" });
        const all = Array.from(e.querySelectorAll<HTMLElement>(".cw, [data-kw]"));
        const k = all.findIndex((w) => w.hasAttribute("data-kw"));
        return k < 0 ? { a: all, b: [] as HTMLElement[] } : { a: all.slice(0, k), b: all.slice(k) };
      };
      // il testo non sta più sopra la grafica: ogni frase ha il suo schermo, prima della sua scena (vedi il montaggio in fondo)
      const capAt = (..._: number[]) => void _;
      const cap = (i: number, b0: number, b1: number) => capAt(i, T(b0), T(b1));
      const punch = (b: number, s = 1.02) => (port ? tl : tl.fromTo(cam, { scale: s }, { scale: 1, duration: 0.6, ease: "expo.out" }, T(b)));

      /* 0 · Un cliente ti cerca: la camera parte vicina alla barra e si allontana mentre arrivano i risultati */
      const pill = one("[data-pill]");
      const res = $("[data-res]");
      const py = () => 0;
      // le interfacce disegnate a misura fissa si adattano al riquadro (anche nell'anteprima)
      // sul telefono in verticale le interfacce si allungano fino a riempire l'altezza, invece di restare piccole al centro
      const gfac = port ? 0.68 : 0.84;
      const fitAll = () =>
        $("[data-gfit]").forEach((e) => {
          if (e.hasAttribute("data-pfill")) e.style.height = "";
          if (port && e.hasAttribute("data-pfull")) {
            // sul telefono la finestra non è una scheda dentro lo schermo: è lo schermo
            const s = cam.offsetWidth / e.offsetWidth;
            e.style.height = `${Math.ceil(cam.offsetHeight / s) + 2}px`;
            gsap.set(e, { scale: s });
            return;
          }
          if (port && e.hasAttribute("data-pfill")) {
            const s = Math.min(1.25, (cam.offsetWidth * 0.92) / e.offsetWidth);
            e.style.height = `${Math.round(Math.min(1000, Math.max(560, (cam.offsetHeight * gfac) / s)))}px`;
          }
          gsap.set(e, { scale: Math.min(port ? 1.25 : 1, (cam.offsetWidth * (port ? 0.92 : 0.9)) / e.offsetWidth, (cam.offsetHeight * gfac) / e.offsetHeight) });
        });
      fitAll();
      // pagine dentro la finestra del browser: larghe come la finestra, alte fino in fondo
      const pinAll = () =>
        $("[data-pin]").forEach((e) => {
          const p = e.parentElement as HTMLElement;
          const k = p.offsetWidth / e.offsetWidth || 1;
          gsap.set(e, { scale: k, transformOrigin: "0 0" });
          e.style.minHeight = `${Math.ceil(p.offsetHeight / k)}px`;
        });
      pinAll();
      // la cornice cambia misura (la barra del sito che sparisce, il telefono che ruota): le interfacce si riadattano
      let fw = cam.offsetWidth;
      let fh = cam.offsetHeight;
      const fro = new ResizeObserver(() => {
        if (Math.abs(cam.offsetWidth - fw) < 2 && Math.abs(cam.offsetHeight - fh) < 2) return;
        fw = cam.offsetWidth;
        fh = cam.offsetHeight;
        fitAll();
        pinAll();
      });
      fro.observe(cam);
      const ry = (i: number) => () => (-40 + i * 92) * k();
      gsap.set(pill, { y: py });
      tl.call(() => F.whoosh(0.6, true, 0.7), undefined, 0)
        .fromTo(cam, { scale: () => (port ? 1 : small() ? 1.08 : 1.18), transformOrigin: aim(() => pill) }, { scale: () => (port ? 1 : small() ? 1.08 : 1.18), duration: 0.01 }, 0)
        .fromTo(pill, { autoAlpha: 0, scale: 0.86 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "expo.out" }, 0.05);
      typeTo(tl, one("[data-typed]"), c.find.typed, T(0.9), T(2.4), 0);
      tl.to(cam, { scale: 1, duration: 1.2, ease: "expo.inOut" }, T(3));
      res.forEach((r, i) => {
        tl.fromTo(r, { autoAlpha: 0, y: () => ry(i)() + 50, scale: 0.94 }, { autoAlpha: 1, y: ry(i), scale: 1, duration: 0.8, ease: "expo.out" }, T(3.3) + i * 0.13).call(() => F.pluck(10 + i, 0.6), undefined, T(3.3) + i * 0.13);
      });
      tl.to(res[0], { scale: 0.96, duration: 0.14, ease: "power2.out" }, T(4.6))
        .to(res[0], { scale: 1, boxShadow: "0 0 0 3px var(--accent)", duration: 0.45, ease: "expo.out" }, T(4.6) + 0.14)
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
        const cur = one("[data-cur]");
        const gres = one("[data-gres]");
        const rival = one("[data-rival]");
        const url1 = one("[data-url1]");
        const second = one('[data-gr="0"] [data-gt]');
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
          .fromTo(cur, { autoAlpha: 0, x: () => content.offsetWidth * 0.7, y: () => content.offsetHeight * 0.75, scale: 1 }, { autoAlpha: 1, x: () => bk().x, y: () => bk().y, immediateRender: false, duration: 0.5, ease: "power3.inOut" }, 0.05)
          .to(cur, { scale: 0.9, duration: 0.12, ease: "sine.inOut" }, 0.58)
          .to(cur, { scale: 1, duration: 0.3, ease: "power2.out" }, 0.65)
          .call(() => F.tick(1.4), undefined, 0.58)
          .set([spin, stop], { autoAlpha: 0 }, 0.58)
          .set([fav, rl], { autoAlpha: 1 }, 0.58)
          .fromTo(one("[data-back]"), { backgroundColor: "rgba(94,196,255,0)" }, { backgroundColor: "rgba(94,196,255,.25)", duration: 0.2, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0.58)
          .to(oldEl, { autoAlpha: 0, duration: 0.24, ease: "sine.inOut" }, 0.62)
          .fromTo(gres, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24, ease: "sine.inOut", immediateRender: false }, 0.62)
          .call(() => void (url1.textContent = c.find.typed), undefined, 0.68)
          .call(() => void (url1.textContent = c.find.me[1]), undefined, 0.67)
          .to(cur, { x: () => sc2().x, y: () => sc2().y, duration: 0.5, ease: "power3.inOut" }, 0.75)
          .set(second, { textDecoration: "underline" }, 1.2)
          .to(cur, { scale: 0.9, duration: 0.12, ease: "sine.inOut" }, 1.28)
          .to(cur, { scale: 1, duration: 0.3, ease: "power2.out" }, 1.35)
          .call(() => F.tick(1.4), undefined, 1.28)
          .to(gres, { autoAlpha: 0, duration: 0.26, ease: "sine.inOut" }, 1.32)
          .fromTo(rival, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.26, ease: "sine.inOut", immediateRender: false }, 1.32)
          .call(() => void (url1.textContent = c.find.others[0][1]), undefined, 1.38)
          .call(() => void (tt1.textContent = c.find.others[0][0]), undefined, 1.38)
          .call(() => void (tt1.textContent = c.find.me[1]), undefined, 1.37)
          .call(() => void (url1.textContent = c.find.typed), undefined, 1.37)
          .to(cur, { autoAlpha: 0, duration: 0.15 }, 1.45)
          .call(() => F.chord([0, 1, 3], 0.6), undefined, 1.38)
          .set({}, {}, 2.05);
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
          .fromTo(one("[data-tag2]"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "expo.out", immediateRender: false }, at2 + 0.16)
          .to(one("[data-tagdot]"), { backgroundColor: "var(--accent)", duration: 0.2 }, at2)
          .fromTo(meter, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "expo.out", immediateRender: false }, at2 + 0.3)
          .call(() => (F.chord([0, 2, 4, 5], 1), F.whoosh(0.35, true, 0.6)), undefined, at2 + 0.4)
          .to([spin, stop, tt1], { autoAlpha: 0, duration: 0.12 }, at2 + 0.36)
          .fromTo([fav, rl, tt2], { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "expo.out" }, at2 + 0.38)
          .fromTo(ok, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "expo.out" }, at2 + 0.4)
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
        tl.fromTo(cur, { autoAlpha: 0, x: () => content.offsetWidth * 0.85, y: () => content.offsetHeight * 0.95 }, { autoAlpha: 1, x: () => loc().x, y: () => loc().y, immediateRender: false, duration: 0.5, ease: "power3.inOut" }, A)
          .to(cur, { scale: 0.9, duration: 0.12, ease: "sine.inOut" }, A + 0.55)
          .to(cur, { scale: 1, duration: 0.3, ease: "power2.out" }, A + 0.63)
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
        .fromTo(wireBits, { autoAlpha: 0, scale: 0.86, y: 16 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: T(0.4) }, T(12.6));
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
          tl.fromTo(f, { autoAlpha: 0, x: () => wire.offsetWidth * start[j][0], y: () => wire.offsetHeight * start[j][1] }, { autoAlpha: 1, immediateRender: false, duration: 0.4, ease: "power2.out" }, T(12.1) + j * 0.12),
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
        tl.fromTo(n, { autoAlpha: 0, y: -50, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "expo.out" }, at).call(() => F.bell(7 + i * 2, 1), undefined, at);
      });
      cap(6, 21.8, 25.8);

      /* 7 · Online, al sicuro: la barra dell'indirizzo prende il posto del menù, la camera la segue */
      const nav = one("[data-nav]");
      const ub = one("[data-ub]");
      tl.to(ns, { x: 140, autoAlpha: 0, duration: 0.45, stagger: 0.05, ease: "power2.in" }, T(25.4))
        
        .to(nav, { autoAlpha: 0, scale: 0.96, duration: 0.3, ease: "power2.in" }, T(25.9))
        .fromTo(ub, { autoAlpha: 0, scaleX: 0.7 }, { autoAlpha: 1, scaleX: 1, duration: 0.6, ease: "expo.out" }, T(26.2))
        .call(() => F.whoosh(0.5, true, 0.7), undefined, T(26.2))
        .fromTo(cam, { scale: 1, transformOrigin: aim(() => ub) }, { scale: () => (port ? 1 : tight() ? 1.12 : 1.6), duration: 1.1, ease: "expo.inOut" }, T(26.4));
      typeTo(tl, one("[data-url]"), c.find.me[1], T(27), T(1.8), 3);
      tl.fromTo(one("[data-load2]"), { scaleX: 0 }, { scaleX: 1, duration: T(1), ease: "power2.inOut" }, T(28.9))
        .to(one("[data-lock1]"), { autoAlpha: 0, scale: 0.6, duration: 0.15, ease: "power2.in" }, T(29.9))
        .fromTo(one("[data-lock2]"), { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "expo.out" }, T(29.9))
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
        .fromTo(cam, { scale: 1, transformOrigin: aim(() => (tight() ? dev : ttl)) }, { scale: () => (port ? 1 : tight() ? 1.08 : 1.5), duration: 1, ease: "expo.inOut" }, T(33))
        .fromTo($("[data-focus]"), { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "expo.out" }, T(34.2))
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
        tl.fromTo(g, { autoAlpha: 0, scale: () => gS() * 0.5, filter: "blur(10px)" }, { autoAlpha: 1, scale: gS, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }, at)
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
        tl.fromTo(p, { autoAlpha: 0, scale: 0.82, x: () => pp(i).x, y: () => pp(i).y + 80 }, { autoAlpha: 1, scale: 1, x: () => pp(i).x, y: () => pp(i).y, immediateRender: false, duration: 0.7, ease: "expo.out" }, at)
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
      tl        .to(endCard, { autoAlpha: 0, y: -30, filter: "blur(10px)", duration: 0.5, ease: "power2.in" }, T(55.0) + 1.7)
        .set(one("[data-end2]"), { autoAlpha: 1 }, T(55.0) + 2.1)
        .fromTo(one("[data-logo]"), { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out" }, T(55.0) + 2.1)
        .call(() => F.shine(1), undefined, T(55.0) + 1.75)

      punch(51.8, 1.03);
      tl.set({}, {}, T(55.0) + 3.4);

      /* Il tempo del video lo muoviamo noi, un fotogramma alla volta e con un passo massimo:
         se il dispositivo rallenta (pagina che carica, telefono sotto sforzo) il video rallenta con lui invece di saltare le scene. */
      const rigEl = one("[data-rig]");
      const inl = $("[data-inline]");
      /* Il sito di oggi: fermo a metà, e la camera che si avvicina sempre di più. Poi un colpo indietro: il cliente si è stufato. */
      const slowTl = gsap.timeline({ paused: true });
      slowTl
        .set([chrome, oldEl], { autoAlpha: 1 }, 0)
        .set(chrome, { y: 0 }, 0)
        .set([sw, one("[data-gres]"), one("[data-rival]"), one("[data-hero]")], { autoAlpha: 0 }, 0)
        .set(os, { autoAlpha: 0 }, 0)
        .set(otext, { autoAlpha: 0, top: "24%" }, 0)
        .set(oimg, { clipPath: "inset(0% 0% 100% 0%)" }, 0)
        .set([spin, stop], { autoAlpha: 1 }, 0)
        .set([fav, rl, tt2], { autoAlpha: 0 }, 0)
        .set(tt1, { autoAlpha: 1 }, 0)
        .fromTo(rigEl, { scale: 1 }, { scale: port ? 1 : 1.42, duration: 2.8, ease: "sine.inOut" }, 0);
      // arriva a pacchetti: un pezzo, poi un altro, di scatto; quando arriva la foto il testo salta giù; la foto resta a metà
      const pk = (els: HTMLElement[], t: number) =>
        slowTl
          .set(els, { autoAlpha: 1 }, t)
          .fromTo(els, { y: -8 }, { y: 0, duration: 0.12, ease: "power3.out", immediateRender: false }, t);
      pk([os[0], os[1]], 0.25);
      pk([os[2]], 0.7);
      pk([os[3], otext], 1.15);
      slowTl
        .set(oimg, { clipPath: "inset(0% 0% 66% 0%)" }, 1.65)
        .set(otext, { top: "74%" }, 1.65)
        .fromTo(otext, { y: -12 }, { y: 0, duration: 0.15, ease: "power3.out", immediateRender: false }, 1.65)
        .set(oimg, { clipPath: "inset(0% 0% 34% 0%)" }, 2.2);
      pk([os[4]], 2.5);
      // il sospiro: un solo movimento continuo che torna indietro, senza scatti né rimbalzi
      slowTl.to(rigEl, { scale: 1, duration: 1.25, ease: "sine.inOut" }, 2.8).set({}, {}, 4.05);

      /* Il sito nuovo: dalla ricerca, clic sul primo risultato, una barra veloce e la pagina è lì. Poi lo stesso colpo indietro: il cliente resta. */
      const newTl = gsap.timeline({ paused: true });
      {
        const cur = one("[data-cur]");
        const seoBox = one("[data-seo]");
        const hero = one("[data-hero]");
        const prog = one("[data-prog]");
        const url1 = one("[data-url1]");
        // il clic avviene sulla stessa pagina di Google della scena prima: la tua attività è già in cima
        const rowsN = $("[data-sr]");
        const first = rowsN[rowsN.length - 1].querySelector<HTMLElement>("[data-gt]")!;
        const pt = () => {
          const a = content.getBoundingClientRect();
          const r = first.getBoundingClientRect();
          const sc = a.width / content.offsetWidth || 1;
          return { x: (r.left + Math.min(r.width * 0.4, 120) - a.left) / sc, y: (r.top + r.height * 0.6 - a.top) / sc };
        };
        newTl
          .set([oldEl, sw, one("[data-gres]"), one("[data-rival]"), hero], { autoAlpha: 0 }, 0)
          .set(seoBox, { autoAlpha: 1 }, 0)
          .set(chrome, { autoAlpha: 0, y: 0 }, 0)
          .set([spin, stop], { autoAlpha: 0 }, 0)
          .set([fav, rl, tt1], { autoAlpha: 1 }, 0)
          .set(tt2, { autoAlpha: 0 }, 0)
          .call(() => void ((url1.textContent = c.find.typed), (tt1.textContent = c.find.typed)), undefined, 0)
          .fromTo(cur, { autoAlpha: 0, x: () => content.offsetWidth * 0.75, y: () => content.offsetHeight * 0.8, scale: 1 }, { autoAlpha: 1, x: () => pt().x, y: () => pt().y, immediateRender: false, duration: 0.75, ease: "power3.inOut" }, 0.1)
          .to(cur, { scale: 0.9, duration: 0.12, ease: "sine.inOut" }, 0.9)
          .to(cur, { scale: 1, duration: 0.3, ease: "power2.out" }, 0.98)
          .call(() => F.tick(1.3), undefined, 0.9)
          // carica: rotella nella scheda, indirizzo nuovo, barra in alto che corre
          .set(seoBox, { autoAlpha: 0 }, 0.95)
          .set(chrome, { autoAlpha: 1 }, 0.95)
          .set([fav, rl], { autoAlpha: 0 }, 0.95)
          .set([spin, stop], { autoAlpha: 1 }, 0.95)
          .call(() => void (url1.textContent = c.find.me[1]), undefined, 0.95)
          .fromTo(prog, { autoAlpha: 1, scaleX: 0 }, { scaleX: 0.75, duration: 0.25, ease: "power2.out", immediateRender: false }, 0.95)
          .to(prog, { scaleX: 1, duration: 0.15, ease: "power1.in" }, 1.2)
          .to(prog, { autoAlpha: 0, duration: 0.15 }, 1.35)
          .fromTo(hero, { autoAlpha: 0, filter: "blur(6px)" }, { autoAlpha: 1, filter: "blur(0px)", duration: 0.3, ease: "power2.out", immediateRender: false }, 1.32)
          .set(cur, { autoAlpha: 0 }, 1.32)
          .call(() => F.glass(1), undefined, 1.32)
          .set([spin, stop], { autoAlpha: 0 }, 1.4)
          .set([fav, rl], { autoAlpha: 1 }, 1.4)
          .call(() => void (tt1.textContent = c.find.me[0]), undefined, 1.4)
          .call(() => void (tt1.textContent = c.find.typed), undefined, 1.39)
          .call(() => F.chord([0, 2, 4], 0.8), undefined, 1.6);
        // tutta la scena è una sola carrellata lenta e continua: la camera si allontana piano e la frase arriva con calma
        newTl.set({}, {}, 3.5);
      }

      /* Figma: la pagina vera ma vuota; il team, ognuno con il suo cursore, mette un pezzo alla volta. Ogni pezzo arriva selezionato. */
      const hm = one("[data-hm]");
      const hmIn = hm.firstElementChild as HTMLElement;
      const hx = $("[data-hx]");
      const hsl = one("[data-hsl]");
      const hsz = one("[data-hsz]");
      const hcs = $("[data-hc]");
      const offIn = (e: HTMLElement) => {
        const a = hmIn.getBoundingClientRect();
        const r = e.getBoundingClientRect();
        const sc = a.width / hmIn.offsetWidth || 1;
        return { x: (r.left - a.left) / sc, y: (r.top - a.top) / sc, w: r.width / sc, h: r.height / sc };
      };
      const figmaTl = gsap.timeline({ paused: true });
      {
        const start = [[0.2, 0.3], [0.78, 0.22], [0.55, 0.85]];
        // il nome segue il cursore ma non esce mai dal riquadro: verso il bordo destro passa a sinistra della freccia
        const flip = (f: HTMLElement) => {
          const lab = f.querySelector<HTMLElement>("[data-hcl]");
          if (!lab) return;
          const right = Number(gsap.getProperty(f, "x")) + lab.offsetWidth + 24 > hmIn.offsetWidth - 8;
          lab.style.left = right ? "auto" : "16px";
          lab.style.right = right ? "10px" : "auto";
          const low = Number(gsap.getProperty(f, "y")) + lab.offsetHeight + 30 > hmIn.offsetHeight - 8;
          lab.style.top = low ? "auto" : "18px";
          lab.style.bottom = low ? "18px" : "auto";
        };
        figmaTl
          .set([chrome, one("[data-devs]")], { autoAlpha: 0 }, 0)
          .set(hm, { autoAlpha: 1 }, 0)
          .set(hx, { autoAlpha: 0 }, 0)
          .set([one("[data-hcur]"), one("[data-hsaved]")], { autoAlpha: 0 }, 0)
          .fromTo(one("[data-hbar]"), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" }, 0.05);
        hcs.forEach((f, j) => figmaTl.fromTo(f, { autoAlpha: 0, x: () => hmIn.offsetWidth * start[j][0], y: () => hmIn.offsetHeight * start[j][1] }, { autoAlpha: 1, immediateRender: false, duration: 0.3, ease: "power2.out", onUpdate: () => flip(f) }, 0.1 + j * 0.08));
        hx.forEach((e, i) => {
          const j = i % hcs.length;
          const t = 0.55 + i * 0.42;
          // il cursore va dove il pezzo deve stare (angolo in basso a destra), lo «posa», e la selezione lo abbraccia
          figmaTl
            .to(hcs[j], { x: () => offIn(e).x + offIn(e).w - 4, y: () => offIn(e).y + offIn(e).h - 4, duration: 0.38, ease: "power3.inOut", onUpdate: () => flip(hcs[j]) }, t - 0.38)
            .fromTo(e, { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "expo.out", immediateRender: false }, t)
            .set(hsl, { autoAlpha: 1, x: () => offIn(e).x, y: () => offIn(e).y, width: () => offIn(e).w, height: () => offIn(e).h }, t)
            .call(() => void (hsz.textContent = `${Math.round(offIn(e).w)} × ${Math.round(offIn(e).h)}`), undefined, t)
            .call(() => F.place(0.9), undefined, t);
        });
        const end = 0.55 + hx.length * 0.42;
        figmaTl
          .set(hsl, { autoAlpha: 0 }, end + 0.15)
          .to(hcs, { autoAlpha: 0, duration: 0.3 }, end + 0.2)
          .to(one("[data-hbar]"), { autoAlpha: 0, y: 20, duration: 0.3, ease: "power2.in" }, end + 0.2)
          .set({}, {}, end + 0.7);
      }

      /* Lo cambi tu: la stessa pagina, un doppio clic su una parola, si cancella e si riscrive. Poi «Salvato» sale e se ne va. */
      const editTl = gsap.timeline({ paused: true });
      {
        const cur = one("[data-hcur]");
        const hw = one("[data-hw]");
        const hsel = one("[data-hsel]");
        const saved = one("[data-hsaved]");
        const p = () => {
          const o = offIn(hw);
          return { x: o.x + o.w * 0.55, y: o.y + o.h * 0.6 };
        };
        editTl
          .set([chrome, one("[data-devs]"), one("[data-hbar]"), hsl], { autoAlpha: 0 }, 0)
          .set(hcs, { autoAlpha: 0 }, 0)
          .set([hm], { autoAlpha: 1 }, 0)
          .set(hx, { autoAlpha: 1, scale: 1 }, 0)
          .call(() => void (hw.textContent = "hardware"), undefined, 0)
          .fromTo(cur, { autoAlpha: 0, x: () => hmIn.offsetWidth * 0.75, y: () => hmIn.offsetHeight * 0.85 }, { autoAlpha: 1, x: () => p().x, y: () => p().y, immediateRender: false, duration: 0.6, ease: "power3.inOut" }, 0.1)
          .to(cur, { scale: 0.92, duration: 0.14, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0.75)
          .call(() => F.tick(1), undefined, 0.75)
          .call(() => F.tick(0.9), undefined, 0.87)
          .fromTo(hsel, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power3.out", immediateRender: false }, 0.85)
          .set(hsel, { autoAlpha: 0 }, 1.2)
          .to(cur, { autoAlpha: 0, duration: 0.2 }, 1.2);
        eraseTo(editTl, hw, "hardware", 1.2, 0.3);
        typeTo(editTl, hw, "software", 1.55, 0.55, 3);
        hw.textContent = "hardware";
        editTl
          // «Salvato!»: la pagina si appanna, la parola arriva in corsivo a tutto schermo; poi vola via e la pagina torna nitida
          .fromTo(saved, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" }, 2.2)
          .fromTo(one("[data-hsavedt]"), { yPercent: 40, scale: 0.85, filter: "blur(12px)" }, { yPercent: 0, scale: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }, 2.25)
          .call(() => F.chord([0, 2, 4], 0.7), undefined, 2.25)
          .to(one("[data-hsavedt]"), { yPercent: -50, scale: 1.08, filter: "blur(10px)", autoAlpha: 0, duration: 0.4, ease: "power3.in" }, 3.1)
          .to(saved, { autoAlpha: 0, duration: 0.4, ease: "power2.inOut" }, 3.2)
          .set({}, {}, 3.65);
      }

      /* Prima: mille risultati, e la tua attività è in fondo; la lista scorre per trovarla */
      /* La Modalità IA: la domanda, la risposta che arriva parola per parola, tre consigli. Tu non ci sei. */
      const aiTl = gsap.timeline({ paused: true });
      {
        const box = one("[data-aim]");
        aiTl
          .set([pill, ...res], { autoAlpha: 0 }, 0)
          .fromTo(box, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, 0)
          .fromTo(one("[data-aq]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.35)
          .call(() => F.tick(0.8), undefined, 0.35)
          .fromTo($("[data-aw]"), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power2.out", stagger: 0.025 }, 1.0)
          .fromTo($("[data-ai]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.22 }, 1.35)
          .set({}, {}, 2.4);
      }
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
          .call(() => F.bell(7, 1), undefined, 0.8 + D)
          .set({}, {}, 0.8 + D + 0.7);

      }

      /* Il contrario, subito: la Modalità IA ora cita te, per primo */
      const aiMeTl = gsap.timeline({ paused: true });
      {
        const box = one("[data-aim2]");
        aiMeTl
          .set([pill, ...res, dev, chrome, meter], { autoAlpha: 0 }, 0)
          .fromTo(box, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, 0)
          .fromTo(one("[data-bq]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out" }, 0.2)
          .fromTo($("[data-bw]"), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power2.out", stagger: 0.022 }, 0.5)
          .fromTo($("[data-bi]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.12 }, 0.8)
          .fromTo(one("[data-bveil]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 1.2)
          .fromTo(one("[data-bub3]"), { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "expo.out" }, 1.25)
          .call(() => F.bell(7, 0.9), undefined, 1.2)
          .set({}, {}, 2.0);
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
        // il clic avviene sulla stessa pagina, nello stesso movimento di camera: una sola scena, niente ricarica del widget
        newTl.paused(false);
        seoTl.add(newTl, 3.6);
        if (!port) seoTl.fromTo(rigEl, { scale: 1.1 }, { scale: 0.8, duration: 7.1, ease: "sine.inOut", immediateRender: false }, 0);
      }
      /* Ogni schermo: computer, poi tablet e telefono che arrivano ai lati */
      const devsTl = gsap.timeline({ paused: true });
      {
        const box = one("[data-devs]");
        devsTl
          .set([dev, box, one("[data-hm]")], { autoAlpha: 0 }, 0)
          .set(box, { autoAlpha: 1 }, 0)
          .fromTo(one("[data-dpc]"), { autoAlpha: 0, y: 80, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "expo.out" }, 0.05)
          .fromTo(one("[data-dtab]"), { autoAlpha: 0, x: -160, scale: 0.92 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.9, ease: "expo.out" }, 0.55)
          .call(() => F.whoosh(0.45, true, 0.6), undefined, 0.55)
          .fromTo(one("[data-dphone]"), { autoAlpha: 0, x: 160, y: 40, scale: 0.92 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: "expo.out" }, 0.85)
          .call(() => F.whoosh(0.45, true, 0.6), undefined, 0.85)
          .set({}, {}, 2.9);
      }
      /* WhatsApp: tre domande all'assistente, tre risposte; la chat sale come su un telefono vero */
      const waTl = gsap.timeline({ paused: true });
      {
        const box = one("[data-wa]");
        const ph = one("[data-wph]");
        const list = one("[data-wlist]");
        const qs = [0, 1, 2].map((i) => one(`[data-wq="${i}"]`));
        const rs = [0, 1, 2].map((i) => one(`[data-wr="${i}"]`));
        const bars = $("[data-wbar]");
        const show = (m: HTMLElement, t: number) => waTl.to(list, { y: () => list.offsetHeight - (m.offsetTop + m.offsetHeight), duration: 0.45, ease: "power3.out" }, t);
        waTl
          .set([one("[data-seo]"), dev, one("[data-hm]"), one("[data-devs]")], { autoAlpha: 0 }, 0)
          .set(box, { autoAlpha: 1 }, 0)
          .set([...qs, ...rs], { autoAlpha: 0 }, 0)
          .set(list, { y: () => list.offsetHeight }, 0)
          .fromTo(ph, { autoAlpha: 0, y: 140, scale: 0.74 }, { autoAlpha: 1, y: 0, scale: 0.8, duration: 0.9, ease: "expo.out" }, 0.02)
          .call(() => F.whoosh(0.5, true, 0.5), undefined, 0.02);
        const tq = [0.55, 1.9, 3.25];
        tq.forEach((t, i) => {
          const ta = t + 0.45;
          waTl
            .fromTo(qs[i], { autoAlpha: 0, y: 18, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: "expo.out" }, t)
            .call(() => (F.tick(1), F.whoosh(0.3, true, 0.3)), undefined, t)
            .fromTo(rs[i], { autoAlpha: 0, y: 18, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "expo.out" }, ta)
            .call(() => F.bell(7, 0.55), undefined, ta);
          show(qs[i], t);
          show(rs[i], ta);
        });
        waTl.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.55, ease: "expo.out", stagger: 0.045 }, tq[1] + 0.55).set({}, {}, 5.2);
      }
      /* GEO: chiedi a un assistente AI, e ti consiglia */
      const geoTl = gsap.timeline({ paused: true });
      {
        const box = one("[data-geo]");
        const stage = box.firstElementChild as HTMLElement;
        const icon = one("[data-cicon]");
        const win = one("[data-cwin]");
        const cur = one("[data-ccur]");
        const src = one("[data-gsrc]");
        const W = () => stage.offsetWidth;
        const H = () => stage.offsetHeight;
        // il percorso di una mano: parte in basso a destra, curva, rallenta e si posa sull'icona (un filo oltre, poi torna)
        const path = { t: 0 };
        const P = () => {
          const p0 = { x: W() * 0.92, y: H() * 0.95 };
          const p1 = { x: W() * 0.78, y: H() * 0.38 };
          const p2 = { x: W() * 0.5 + 6, y: H() * 0.5 + 8 };
          const t = path.t;
          const u = 1 - t;
          return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
        };
        const move = () => gsap.set(cur, P());
        geoTl
          .set([one("[data-seo]"), dev, one("[data-hm]"), one("[data-devs]")], { autoAlpha: 0 }, 0)
          .set(box, { autoAlpha: 1 }, 0)
          .set([one("[data-gq]"), one("[data-ga]"), one("[data-cbar]"), src, one("[data-cspark]")], { autoAlpha: 0 }, 0)
          .set(one("[data-cnew]"), { autoAlpha: 1 }, 0)
          .fromTo(icon, { autoAlpha: 0, scale: 0.6, filter: "blur(10px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }, 0.05)
          .call(() => F.bell(7, 0.9), undefined, 0.1)
          .set(cur, { autoAlpha: 1 }, 0.35)
          .fromTo(path, { t: 0 }, { t: 1, duration: 0.95, ease: "power3.inOut", onUpdate: move, immediateRender: false }, 0.35)
          // clic: l'icona si schiaccia e rimbalza, come nel Dock
          .to(cur, { scale: 0.9, duration: 0.12, ease: "sine.inOut" }, 1.35)
          .to(cur, { scale: 1, duration: 0.3, ease: "power2.out" }, 1.42)
          .to(icon, { scale: 0.9, duration: 0.08, ease: "power2.out" }, 1.35)
          .to(icon, { scale: 1, y: -14, duration: 0.25, ease: "power2.out" }, 1.43)
          .to(icon, { y: 0, duration: 0.5, ease: "power2.inOut" }, 1.68)
          .call(() => F.tick(1.3), undefined, 1.35)
          // la finestra si apre dall'icona
          .fromTo(win, { autoAlpha: 0, scale: 0.16 }, { autoAlpha: 1, scale: 1, duration: 0.65, ease: "expo.out" }, 1.75)
          .to(icon, { autoAlpha: 0, scale: 0.6, duration: 0.25 }, 1.8)
          .set(cur, { autoAlpha: 0 }, 1.8)
          .call(() => (F.whoosh(0.5, true, 0.7), F.glass(0.7)), undefined, 1.75);
        typeTo(geoTl, one("[data-cin]"), c.geo.q, 2.45, 0.85, 1);
        geoTl
          .to(one("[data-csend]"), { scale: 0.92, duration: 0.14, yoyo: true, repeat: 1, ease: "sine.inOut" }, 3.4)
          .call(() => (F.tick(1), F.whoosh(0.4, true, 0.5)), undefined, 3.4)
          .to(one("[data-cnew]"), { autoAlpha: 0, y: -20, duration: 0.3, ease: "power2.in" }, 3.45)
          .fromTo(one("[data-gq]"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, 3.6)
          .fromTo(one("[data-cbar]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 3.6)
          .set(one("[data-ga]"), { autoAlpha: 1 }, 3.9);
        const [pre, post] = c.geo.a.split(c.find.me[0]);
        typeTo(geoTl, one("[data-gat1]"), pre, 3.95, 0.5, 2);
        typeTo(geoTl, one("[data-gat2]"), c.find.me[0], 4.45, 0.35, 4);
        typeTo(geoTl, one("[data-gat3]"), post ?? "", 4.8, 0.7, 6);
        geoTl
          .fromTo(src, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "expo.out" }, 5.5)
          .call(() => F.bell(7, 0.8), undefined, 5.5)
          .fromTo(one("[data-cspark]"), { autoAlpha: 0, rotation: -90 }, { autoAlpha: 1, rotation: 0, duration: 0.6, ease: "expo.out" }, 5.55)
          .fromTo(one("[data-cveil]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 5.75)
          .fromTo(one("[data-bub2]"), { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "expo.out" }, 5.8)
          .to(src, { scale: port ? 1.04 : 1.12, duration: 0.6, ease: "expo.out" }, 5.8)
          .call(() => F.chord([0, 2, 4, 7], 0.8), undefined, 5.75)
          .set({}, {}, 6.9);
      }
      // il secondo tempo del cliente che se ne va: i secondi continuano a salire finché non torna indietro
      {
        const o = { n: 8 };
        back.fromTo(o, { n: 8 }, { n: 8.8, duration: 1.4, ease: "none", onUpdate: () => void (cnt.textContent = num(o.n)) }, 0);
      }

      /* montaggio a tempo con la voce: ogni parola della ripresa ha il suo istante nel film (VW, da scripts/film-voice.py cut).
         Le scritte compaiono una parola alla volta mentre la voce le dice; dentro ogni scena i momenti chiave (il clic, il sito che si apre,
         il computer, il tablet, il telefono, ogni messaggio) cadono sulla parola che li nomina: tra due parole la scena corre in modo uniforme.
         Dove una scena ha bisogno di respiro, la ripresa si apre in un silenzio (GAP): la voce resta quella vera, mai accelerata. */
      // secondi di respiro aggiunti prima di una parola (sempre in una pausa della ripresa)
      const GAP: Record<number, number> = { 35: 0.3, 52: 0.35, 61: 0.4, 75: 0.6, 94: 0.4, 108: 0.3, 112: 0.2, 117: 0.2, 152: 0.5, 163: 0.35, 194: 0.3 };
      const noSite = ans?.site === "none";
      const VW = noSite ? VW_NONE : VW_SITE;
      const offs: number[] = [];
      {
        let acc = 0.2;
        VW.s.forEach((_, i) => offs.push((acc += GAP[i] ?? 0)));
      }
      const w = (i: number, d = 0) => VW.s[i] + offs[i] + d;
      const we = (i: number, d = 0) => VW.e[i] + offs[i] + d;
      const vo: [number, number][] = [0, ...Object.keys(GAP).map(Number)].sort((a, b) => a - b).map((i) => [i, offs[i]]);
      const cut = new Map<HTMLElement, HTMLElement[]>();
      const unitsOf = (e: HTMLElement) => {
        let u = cut.get(e);
        if (!u) {
          const g = split(e);
          u = [...g.a, ...g.b];
          cut.set(e, u);
        }
        return u;
      };
      const scene = tl;
      const AUTO = NaN;
      const END = -1;
      type Say = { el: HTMLElement; u: HTMLElement[]; at: number[]; end?: number; inScene?: boolean; mood?: Mood; q?: boolean; chain?: boolean };
      type Scn = { sub?: gsap.core.Timeline; seg?: [number, number]; map: [number, number][]; mood?: Mood; still?: boolean; full?: boolean; blank?: boolean; marks?: [number, string][]; after?: (t: number) => void };
      // una frase in più battute: le parole della voce si dividono tra le righe, ogni riga esce prima che entri la successiva
      const multi = (els: HTMLElement[], at: number[], end: number, base: Partial<Say>): Say[] => {
        const us = els.map(unitsOf);
        const N = us.reduce((n, u) => n + u.length, 0);
        const pick = (k: number) => (N === at.length ? at[k] : at[Math.min(at.length - 1, Math.floor((k * at.length) / N))]);
        let k = 0;
        return us.map((u, j) => {
          const sub = N === at.length ? at.slice(k, k + u.length) : [pick(k), pick(k + u.length - 1)];
          k += u.length;
          const last = j === us.length - 1;
          return { ...base, el: els[j], u, at: sub, end: last ? end : w(pick(k), -0.12), q: base.q || els.length > 1, chain: j > 0, mood: j ? undefined : base.mood } as Say;
        });
      };
      const S = (i: number, at: number[], end: number, mood?: Mood, q?: boolean) => multi($(`[data-say="${i}"]`), at, end, { mood, q });
      const I = (i: number, at: number[], end: number) => multi($(`[data-inline="${i}"]`), at, end, { inScene: true });
      one("[data-eh]").dataset.t = c.end.t.replace(/[*!^~%]/g, "");
      // senza sito il cliente non apre niente di tuo: la finestra parte già sui risultati di Google
      const noSiteBack = (t: number) =>
        mt
          .set(chrome, { autoAlpha: 1, y: 0 }, t)
          .set([oldEl, one("[data-rival]"), spin, stop, meter], { autoAlpha: 0 }, t)
          .set([one("[data-gres]"), fav, rl, tt1], { autoAlpha: 1 }, t)
          .call(() => void ((one("[data-url1]").textContent = c.find.typed), (tt1.textContent = c.find.typed)), undefined, t);
      // la parte della storia prima del nostro intervento cambia con le risposte: con il sito lento, oppure senza sito
      const story: (Say | Scn | Say[])[] = noSite
          ? [
              // senza sito: la lista scorre e tu non ci sei; poi sceglie il primo e apre il concorrente
              { sub: farTl, full: true, map: [[0, w(21, 0.06)], [0.8, w(26)], [0.8 + 3.4, w(32, 0.15)]], mood: "doubt", marks: [[0.8, "la lista dei risultati parte piano"], [0.8 + 3.4, "si ferma: tu non ci sei"]], after: (t: number) => void (mt.set(one("[data-far]"), { autoAlpha: 0 }, t), noSiteBack(t)) },
              S(1, [33, 34, 34], w(35, -0.5)),
              { sub: back, map: [[0.7, AUTO], [1.2, w(41)], [1.38, w(51)], [END, w(51, 0.6)]], marks: [[1.28, "clic sul concorrente"], [1.38, "si apre il concorrente"]], after: (t: number) => void mt.set([one("[data-rival]"), one("[data-cur]")], { autoAlpha: 0 }, t) },
              S(2, [52, 53, 54, 55, 56, 57, 58], we(58, 0.25), "stop"),
            ]
          : [
            { sub: farTl, full: true, map: [[0, w(21, 0.06)], [0.8, w(26)], [0.8 + 3.4, w(32, 0.15)], [END, w(33, -0.4)]], mood: "doubt", marks: [[0.8, "la lista dei risultati parte piano"], [0.8 + 3.4 * 0.5, "velocità massima, scie di luce"], [0.8 + 3.4, "si ferma sulla tua attività, evidenziata"]], after: (t) => void mt.set(one("[data-far]"), { autoAlpha: 0 }, t) },
            S(1, [33, 34, 34], w(35, -0.5)),
            { sub: slowTl, map: [[0, AUTO], [2.8, w(43, -0.58)], [END, w(45, -0.26)]], mood: "tense", still: true, marks: [[0, "il tuo sito carica a pacchetti, zoom in continuo"], [2.8, "sospiro: zoom indietro brusco"]] },
            I(0, [43, 44], w(45, -0.4)),
            { sub: back, still: true, map: [[0, w(45, -0.25)], [0.58, w(46)], [1.2, w(49)], [1.38, w(51)], [END, w(51, 0.6)]], marks: [[0.58, "clic su indietro"], [1.28, "clic sul concorrente"], [1.38, "si apre il concorrente"]], after: (t) => void mt.set([one("[data-rival]"), one("[data-cur]")], { autoAlpha: 0 }, t) },
              S(2, [52, 53, 54, 55, 56, 57, 58, 59, 60], we(60, 0.25), "stop"),
            ];
      const ch: (Say | Scn | Say[])[] = [
        // prima del nostro intervento
        S(0, [0, 2, 3], w(4, -0.02), "calm", true),
        S(10, [4, 5, 6, 7], w(8, -0.02), "calm", true),
        S(11, [8, 9, 10, 11, 12], w(13, -0.02), "calm", true),
        S(12, [13, 14, 15, 16], we(16, -0.2), "calm", true),
        { seg: [0, T(3.5)], map: [[0, AUTO], [T(0.9), w(17)], [T(3.3), w(18, -0.1)], [T(3.5), w(18, 0.05)]], marks: [[0, "home di Google, il cliente scrive la ricerca"]] },
        { sub: aiTl, full: true, map: [[0, w(18, 0.06)], [0.35, w(18, 0.7)], [1.0, w(19)], [1.35, w(20)], [END, w(21, -0.1)]], marks: [[0.35, "Modalità IA: la domanda"], [1.0, "la risposta"], [1.35, "consiglia gli altri"]], after: (t) => void mt.set(one("[data-aim]"), { autoAlpha: 0 }, t) },
        ...story,
        // con il nuovo sito
        S(3, [61, 62, 63, 64], w(65, -0.2), "rise"),
        { sub: aiMeTl, full: true, map: [[0, w(65, -0.15)], [0.5, w(65, 0.1)], [1.2, w(67)], [END, we(67, 0.05)]], marks: [[0.2, "Modalità IA: ora cita te"], [1.2, "sei il primo consiglio"]], after: (t) => void mt.set(one("[data-aim2]"), { autoAlpha: 0 }, t) },
        { sub: seoTl, full: true, map: [[0, w(68, -0.1)], [1.2, w(69, 0.05)], [2.4, w(72)], [3.6, w(74)], [3.6 + 0.75, w(75, -0.06)], [3.6 + 0.9, w(75, 0.05)], [3.6 + 0.95, w(75, 0.1)], [3.6 + 1.32, w(75, 0.42)], [END, we(93, 0.25)]], still: true, marks: [[0.05, "risultati di Google"], [1.2, "la tua attività sale in cima"], [2.4, "evidenziata con velo e bolla"], [3.6 + 0.9, "clic sul tuo risultato"], [3.6 + 1.32, "il sito nuovo appare"]], after: (t) => void mt.set(chrome, { autoAlpha: 0 }, t).set(meter, { autoAlpha: 0 }, t) },
        I(1, [80, 81, 82, 83], w(84, -0.2)),
        I(2, [87, 88, 89, 90, 90, 91, 92, 93, 93], we(93, 0.1)),
        S(4, [94, 95, 96, 97], w(99, -0.05)),
        { sub: figmaTl, map: [[0, AUTO], [0.55 + 6 * 0.42, w(107)], [END, w(108, -0.05)]], marks: [[0.55, "Figma: primo pezzo"], [0.55 + 6 * 0.42, "Figma: ultimo pezzo"]] },
        S(5, [108, 109, 110, 111], we(111, 0.05)),
        { sub: devsTl, map: [[0, w(112, -0.3)], [0.05, w(113, -0.12)], [0.55, w(114, -0.12)], [0.85, w(116, -0.12)], [1.75, we(116, 0.3)], [END, we(116, 0.75)]], marks: [[0.05, "computer"], [0.55, "tablet"], [0.85, "telefono"]], after: (t) => void mt.set(one("[data-devs]"), { autoAlpha: 0 }, t) },
        { sub: editTl, map: [[0, AUTO], [0.75, w(120)], [1.2, w(121, 0.1)], [2.15, we(124)]], mood: "light", marks: [[0.75, "doppio clic sulla parola"], [1.2, "si cancella"], [1.55, "si riscrive"]], after: (t) => void mt.set(hm, { autoAlpha: 0 }, t) },
        S(6, [125, 126, 127, 128], we(128, 0.05), undefined, true),
        S(7, [129, 130, 131, 132, 133, 134, 135, 136, 137], w(138, -0.45)),
        { sub: waTl, map: [[0, w(138, -0.2)], [0.3, w(139)], [1.0, we(141)], [1.9, w(146)], [2.35, we(148)], [3.25, we(150)], [3.7, we(151)], [END, we(151, 0.7)]], marks: [[0.55, "WhatsApp: modifica"], [1.9, "WhatsApp: visite"], [3.25, "WhatsApp: da richiamare"]], after: (t) => void mt.set(one("[data-wa]"), { autoAlpha: 0 }, t) },
        S(8, [153, 154, 155, 156, 157, 158, 159], we(162, 0.1)),
        S(9, [164, 165, 166, 168, 169, 170], w(171, -0.02)),
        { sub: geoTl, full: true, map: [[0, AUTO], [5.5, w(182)], [5.75, w(184)], [END, w(188, -0.45)]], marks: [[0.05, "icona dell'assistente"], [1.35, "clic sull'icona"], [3.4, "invio"], [5.5, "fonte citata"], [5.75, "evidenziata"]], after: (t) => void mt.set(one("[data-geo]"), { autoAlpha: 0 }, t) },
        { seg: [T(54.8), scene.duration()], map: [[T(54.8), w(188, -0.3)], [T(55.0) + 1.7, we(193, 0.3)], [T(55.0) + 2.1, w(194, -0.05)], [END, we(195, 1.4)]], blank: true, mood: "end", marks: [[T(55.0) + 2.1 - T(54.8), "firma: il tuo nome"]] },
        { el: one("[data-eh]"), u: [...eg.a, ...eg.b], at: [188, 189, 190, 191], inScene: true },
      ];
      const mt = gsap.timeline({
        paused: true,
        onUpdate: () => {
          if (bar.current) bar.current.style.transform = `scaleX(${mt.progress()})`;
        },
      });
      // segnaposto per la musica: quando succede cosa, in secondi dal primo fotogramma
      const marks: { t: number; what: string }[] = [];
      const rig = one("[data-rig]");
      // ogni scena entra con un movimento di camera diverso, poi la camera continua a muoversi piano
      const moves = [
        { scale: 1.14, yPercent: 4 },
        { scale: 0.9, xPercent: -3 },
        { scale: 1.12, xPercent: 4 },
        { scale: 1.15, yPercent: -3 },
        { scale: 0.92, yPercent: 3 },
      ];
      let shots = 0;
      const shoot = (t: number, d: number) => {
        const i = shots++;
        const m = moves[i % moves.length];
        mt.fromTo(rig, { xPercent: 0, yPercent: 0, ...m }, { scale: i % 2 ? 0.98 : 1.03, xPercent: 0, yPercent: 0, duration: Math.max(1.2, d), ease: "power2.out", immediateRender: false }, t);
      };
      // una scritta: ogni parola entra quando la voce la dice (in inglese, senza voce, le parole si dividono lo stesso tempo)
      const reveal = (k: Say, floor = 0) => {
        const n = k.u.length;
        // la frase nuova comincia solo quando l'uscita della precedente è finita del tutto
        const sh = Math.max(0, floor - w(k.at[0], -0.06));
        const t0 = w(k.at[0], -0.06) + sh;
        const t1 = w(k.at[k.at.length - 1], -0.06) + sh;
        const ts = k.u.map((_, j) => (n === k.at.length ? w(k.at[j], -0.06) + sh : n < 2 ? t0 : t0 + ((t1 - t0) * j) / (n - 1)));
        mt.set(k.el, { autoAlpha: 1 }, t0);
        k.u.forEach((x, j) => {
          mt.fromTo(x, { autoAlpha: 0, yPercent: 45, filter: "blur(8px)" }, { autoAlpha: 1, yPercent: 0, filter: "blur(0px)", duration: k.q ? 0.2 : 0.42, ease: "power3.out" }, ts[j]);
        });
        mt.call(() => F.whoosh(0.45, true, 0.3), undefined, t0);
        marks.push({ t: t0, what: `frase: ${k.el.dataset.t ?? k.el.textContent}` });
        if (k.end !== undefined) {
          const e = Math.max(k.end, ts[n - 1] + (k.q ? 0.2 : 0.55));
          mt.to(k.u, { autoAlpha: 0, yPercent: -30, filter: "blur(6px)", duration: k.q ? 0.14 : 0.32, ease: "power2.in", stagger: k.q ? 0 : 0.012 }, e);
          mt.set(k.el, { autoAlpha: 0 }, e + (k.q ? 0.16 : 0.42));
          return e;
        }
        return ts[n - 1];
      };
      let camOn = false;
      let pending: ((t: number) => void) | undefined;
      let prevEnd = 0;
      const slow: string[] = [];
      mt.set(cam, { autoAlpha: 0 }, 0);
      let inlEnd = 0;
      ch.flat().forEach((k) => {
        if ("el" in k) {
          if (k.inScene) return void (inlEnd = reveal(k, k.chain ? inlEnd : 0) + 0.16);
          const t0 = w(k.at[0], -0.06);
          if (k.mood) {
            const m = k.mood;
            mt.call(() => cue(m, t0 - 0.3), undefined, t0 - 0.3);
            marks.push({ t: t0 - 0.3, what: `umore: ${m}` });
          }
          if (t0 - (k.q ? 0.04 : 0.32) < prevEnd - 0.01) slow.push(`scritta «${k.el.dataset.t}» parte ${(prevEnd - t0 + 0.32).toFixed(2)} s prima che finisca la scena`);
          if (camOn) mt.to(cam, { autoAlpha: 0, duration: 0.3, ease: "sine.inOut" }, Math.max(prevEnd - 0.05, t0 - 0.32));
          camOn = false;
          pending?.(t0);
          pending = undefined;
          prevEnd = reveal(k, prevEnd) + (k.q ? 0.16 : 0.45);
          return;
        }
        const len = k.seg ? k.seg[1] - k.seg[0] : k.sub!.duration();
        const s0 = k.seg ? k.seg[0] : 0;
        const M = k.map.map(([s, f]) => [s === END ? s0 + len : s, Number.isNaN(f) ? prevEnd : f] as [number, number]);
        const f0 = M[0][1];
        const f1 = M[M.length - 1][1];
        if (f0 < prevEnd - 0.01) slow.push(`scena alle ${f0.toFixed(2)} parte ${(prevEnd - f0).toFixed(2)} s prima che finisca la precedente`);
        for (let j = 1; j < M.length; j++) {
          const r = (M[j][0] - M[j - 1][0]) / Math.max(0.001, M[j][1] - M[j - 1][1]);
          if (r > 2.6 || M[j][1] <= M[j - 1][1]) slow.push(`scena alle ${f0.toFixed(2)}: tratto ${M[j - 1][0].toFixed(2)}→${M[j][0].toFixed(2)} a ${r.toFixed(2)}×`);
        }
        if (k.mood) {
          const m = k.mood;
          mt.call(() => cue(m, f0), undefined, f0);
          marks.push({ t: f0, what: `umore: ${m}` });
        }
        if (k.blank) {
          if (camOn) mt.to(cam, { autoAlpha: 0, duration: 0.25, ease: "power2.in" }, f0 - 0.25);
          camOn = false;
          pending?.(f0);
          pending = undefined;
        } else if (!camOn) {
          pending?.(f0);
          pending = undefined;
          mt.fromTo(cam, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "sine.out", immediateRender: false }, f0);
          camOn = true;
        } else if (pending) {
          mt.to(cam, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, f0 - 0.22);
          pending(f0 - 0.01);
          pending = undefined;
          mt.fromTo(cam, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "sine.out", immediateRender: false }, f0);
        }
        // dal tempo del film al tempo della scena: a tratti, da una parola all'altra
        const ease = (p: number) => {
          const f = f0 + p * (f1 - f0);
          let j = 0;
          while (j < M.length - 2 && f > M[j + 1][1]) j++;
          const [sa, fa] = M[j];
          const [sb, fb] = M[j + 1];
          const s = sa + ((f - fa) / Math.max(1e-6, fb - fa)) * (sb - sa);
          return (s - M[0][0]) / Math.max(1e-6, M[M.length - 1][0] - M[0][0]);
        };
        const film = (s: number) => {
          let j = 0;
          while (j < M.length - 2 && s > M[j + 1][0]) j++;
          const [sa, fa] = M[j];
          const [sb, fb] = M[j + 1];
          return fa + ((s - sa) / Math.max(1e-6, sb - sa)) * (fb - fa);
        };
        const T0 = M[0][0];
        const T1 = M[M.length - 1][0];
        // sul telefono le finestre a schermo pieno non si muovono: ogni zoom taglierebbe i bordi
        // sul telefono la camera resta ferma: gli zoom spostano le pagine e destabilizzano soltanto
        if (port) mt.set(rig, { scale: 1, xPercent: 0, yPercent: 0 }, f0);
        else if (camOn && !k.still) shoot(f0, f1 - f0);
        mt.add((k.seg ? scene : k.sub!).tweenFromTo(T0, T1, { duration: f1 - f0, ease, immediateRender: false }), f0);
        (k.marks ?? []).forEach(([s, what]) => marks.push({ t: film(s0 + s), what }));
        prevEnd = f1;
        if (k.after) pending = k.after;
      });
      mt.call(() => cue("drive", w(75, -0.95)), undefined, w(75, -0.95));
      marks.push({ t: w(75, -0.95), what: "umore: drive" });
      if (slow.length && process.env.NODE_ENV !== "production") console.warn("[film]", slow.join("\n"));
      tlRef.current = mt;
      if (!embed) (window as unknown as { __film?: unknown }).__film = { bpm: BPM, total: mt.duration(), marks: marks.sort((a, b) => a.t - b.t), vo, seek: (t: number) => ((flags.current.paused = true), (flags.current.playing = false), mt.time(t)) };

      const drive = (_t: number, dt: number) => {
        if (!flags.current.playing) return;
        // la voce parte con il film: finché il brano non è scaricato, il film aspetta all'inizio
        if (mt.time() < 0.3 && !F.ready()) return void F.preload();
        // con la voce, comanda l'orologio dell'audio: se il disegno rallenta il film recupera, la voce non salta
        const ck = F.clock();
        const step = mt.time() + Math.min(dt, 34) / 1000;
        const next = Math.min(mt.duration(), ck !== null && Math.abs(ck - mt.time()) < 0.4 ? Math.max(mt.time(), ck) : step);
        mt.time(next);
        F.sync(next, true);
        if (next >= mt.duration()) {
          flags.current.ended = true;
          flags.current.playing = false;
          setEnded(true);
          setPlaying(false);
          F.chill(true);
        }
      };
      // sulla pagina, quando appare e viene detto il nome si scende già alla prima sezione scritta; il film finisce sotto, da solo
      if (!embed)
        mt.call(
          () => {
            const f = flags.current;
            if (!f.playing || f.outro) return;
            const nx = el.nextElementSibling as HTMLElement | null;
            if (!nx || el.getBoundingClientRect().top < -40 || el.getBoundingClientRect().top > innerHeight * 0.4) return;
            f.outro = true;
            const y = nx.getBoundingClientRect().top + scrollY + 18;
            const l = getLenis();
            // discesa lunga e morbida, che parte e arriva piano
            if (l) l.scrollTo(y, { duration: 2.2, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) });
            else scrollToY(y);
          },
          undefined,
          w(194, 0.1),
        );
      gsap.ticker.add(drive);
      let ready = document.readyState === "complete";
      const onReady = () => {
        ready = true;
        go();
      };
      if (!ready) window.addEventListener("load", onReady, { once: true });
      const go = () => {
        const f = flags.current;
        const run = ready && (f.visible || f.outro) && f.lifted && !f.paused && !f.ended;
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
        fro.disconnect();
        io.disconnect();
        gsap.ticker.remove(drive);
        window.removeEventListener("load", onReady);
        F.chill(false);
      };
    },
    { scope: root, dependencies: [locale, run, port], revertOnUpdate: true },
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
    flags.current = { ...flags.current, ended: false, paused: false, playing: false, outro: false };
    setEnded(false);
    F.reset();
    F.duck(false);
    setRun((r) => r + 1);
  };

  const center = "absolute left-1/2 top-0";
  return (
    <section ref={root} className={embed ? "relative h-full w-full [container-type:size]" : "relative h-svh min-h-[560px] [container-type:size]"} aria-label={title} style={{ "--ft": "84px", "--fb": "16px" } as CSSProperties}>
      {!embed && <h1 className="sr-only">{title}</h1>}
      <div key={run} data-frame className={embed ? "cine-film cine-acr absolute inset-0 overflow-hidden" : "cine-film cine-acr absolute overflow-hidden rounded-[34px] transition-[top,bottom] duration-[800ms] ease-[cubic-bezier(.22,1,.36,1)] shadow-[inset_0_0_0_1px_var(--hair-strong)] max-md:left-2 max-md:right-2 md:left-4 md:right-4"} style={embed ? undefined : { top: "var(--ft)", bottom: "var(--fb)" }}>
        {/* una frase troppo lunga per una riga si divide in più battute (|), ognuna su una riga sola */}
        {[c.far.tired, c.far.open, c.far.stays].map((t, i) =>
          t.split("|").map((x, j) => (
            <p key={`${i}-${j}`} data-inline={i} data-t={x.replace(/[*!^~%]/g, "")} className={`pointer-events-none absolute inset-x-0 z-20 mx-auto ${port ? "top-[4.5%]" : "top-[8%]"} whitespace-nowrap px-6 text-center font-semibold leading-[1.16] tracking-[-0.045em] [word-spacing:0.16em] cine-fg`} style={{ ...HID, fontSize: fitLine(x, "clamp(30px,4.6cqw,72px)") }}>
              <Kw text={x} />
            </p>
          )),
        )}
        {c.say.map((t, i) =>
          t.split("|").map((x, j) => (
            <p key={`${i}-${j}`} data-say={i} data-t={x.replace(/[*!^~%]/g, "")} className={CAPS} style={{ ...HID, fontSize: fitLine(x, "clamp(34px,6.4cqw,108px)") }}>
              <Kw text={x} />
            </p>
          )),
        )}
        <div data-rig className="absolute inset-0 will-change-transform">
        <div data-cam className="absolute inset-0 will-change-transform">
          <div className={`absolute inset-x-0 h-0 top-[50%]`}>
            {/* la home di Google: il cliente scrive */}
            <div data-it data-pill className={`${center} flex flex-col items-center gap-8`} style={HID}>
              <span data-gfit className="flex flex-col items-center gap-8">
                <GLogo size={port ? 64 : 92} />
                <GBox q="" w={port ? 340 : 680} h={port ? 48 : 54} typed />
                <span className="flex gap-3" style={ARIAL}>
                  {(locale === "en" ? ["Google Search", "I’m Feeling Lucky"] : ["Cerca con Google", "Mi sento fortunato"]).map((t) => (
                    <span key={t} className="rounded-[8px] border border-transparent bg-[#f8f9fa] px-4 py-2.5 text-[14px] text-[#3c4043]">
                      {t}
                    </span>
                  ))}
                </span>
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
              <div data-chrome className={`relative ${port ? "w-[min(88cqw,calc(62cqh*.6))] aspect-[.6]" : "w-[min(88cqw,calc(min(46cqh,440px)*1.58))] aspect-[1.58] max-md:aspect-[.82]"} flex flex-col overflow-hidden rounded-[18px] shadow-[0_40px_120px_-40px_rgba(0,0,0,.5),inset_0_0_0_1px_var(--hair-strong)]`} style={{ ...HID, ["--r" as string]: "20px" }}>
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
                <OldSite c={c} port={port} />
                {/* la ricerca, di nuovo: il cliente torna indietro */}
                <div data-gres className="absolute inset-0 z-[5] overflow-hidden bg-white text-[#1f1f1f]" style={{ ...HID, ...ARIAL }}>
                  <div data-pin className={`flex origin-top-left flex-col ${port ? "w-[400px]" : "w-[820px]"}`}>
                    <GHead q={c.find.typed} port={port} compact />
                    <GTabs port={port} />
                    <div className={`flex flex-col gap-[24px] pt-5 ${port ? "px-5" : "pl-[118px]"}`}>
                      {[...c.find.others, ...(ans?.site === "none" ? [] : [c.find.me])].map(([t, u], i) => (
                        <div key={u} data-gr={i}>
                          <GResult port={port} name={t} url={u} title={`${t} · ${c.far.title}`} snip={c.far.snip} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* il concorrente: si apre subito */}
                {/* il concorrente: brutto come il tuo di oggi, ma si apre tutto e subito */}
                <div data-rival className="absolute inset-0 z-[6] overflow-hidden bg-[#f4efe1] [container-type:size]" style={{ ...HID, fontFamily: '"Times New Roman", Times, serif', color: "#222" }}>
                  {port ? (
                    <>
                      <div className="flex h-[11%] items-center justify-center whitespace-nowrap bg-[#2f5d2a] text-[min(5cqh,9cqw)] font-bold text-[#fff6b0]">{c.find.others[0][0]}</div>
                      <div className="flex h-[5.5%] items-center justify-around bg-[#d9d2bb] px-[3%]">
                        {c.old.menu.map((m) => (
                          <span key={m} className="whitespace-nowrap text-[min(2.6cqh,5cqw)] text-[#0000ee] underline">
                            {m}
                          </span>
                        ))}
                      </div>
                      <div className="absolute inset-x-[6%] top-[19%] text-center text-[min(3.4cqh,6.4cqw)] font-bold italic leading-[1.15] text-[#a40000]">{c.old.hello}</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cin("negozio")} alt="" draggable={false} className="absolute left-[6%] top-[30%] h-[38%] w-[88%] object-cover outline outline-[3px] outline-[#888]" style={{ filter: "sepia(.4) saturate(.8) contrast(.9)" }} />
                      <div className="absolute inset-x-[6%] top-[73%] text-center text-[min(2.6cqh,5cqw)] leading-[1.5]">
                        {c.old.text.map((t) => (
                          <span key={t} className="block">
                            {t}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                    <div className="flex h-[14%] items-center justify-center bg-[#2f5d2a] text-[7cqh] font-bold text-[#fff6b0]">{c.find.others[0][0]}</div>
                    <div className="absolute bottom-0 left-0 top-[14%] w-[24%] bg-[#d9d2bb]">
                      {c.old.menu.map((m, i) => (
                        <span key={m} className="absolute left-[12%] whitespace-nowrap text-[4.5cqh] text-[#0000ee] underline" style={{ top: `${6 + i * 9}%` }}>
                          {m}
                        </span>
                      ))}
                    </div>
                    <div className="absolute left-[28%] top-[18%] whitespace-nowrap text-[5cqh] font-bold italic text-[#a40000]">{c.old.hello}</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cin("negozio")} alt="" draggable={false} className="absolute left-[28%] top-[28%] h-[40%] w-[40%] object-cover outline outline-[3px] outline-[#888]" style={{ filter: "sepia(.4) saturate(.8) contrast(.9)" }} />
                    <div className="absolute left-[28%] top-[73%] text-[4cqh] leading-[1.6]">
                      {c.old.text.map((t) => (
                        <span key={t} className="block whitespace-nowrap">
                          {t}
                        </span>
                      ))}
                    </div>
                    </>
                  )}
                </div>
                {/* il sito nuovo: la hero vera, che si dipinge appena arriva */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img data-hero src={cin(port ? "hero-phone" : "hero-desktop")} alt="" draggable={false} className="absolute inset-0 z-[7] h-full w-full object-cover object-top" style={HID} />
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
              <div data-meter className={`hidden cine-fg flex items-center gap-[0.4em] whitespace-nowrap text-[clamp(34px,5.4cqw,80px)] font-semibold leading-none tracking-[-0.045em]`} style={HID}>
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
            {/* la Modalità IA di Google: risponde, e consiglia qualcun altro */}
            <div data-it data-aim className={center} style={HID}>
              <div data-gfit data-pfill data-pfull className={`relative flex flex-col overflow-hidden bg-white ${port ? "h-[720px] w-[400px]" : "h-[560px] w-[820px] rounded-[22px] shadow-[0_40px_120px_-40px_rgba(0,0,0,.45)] ring-1 ring-black/5"}`} style={ARIAL}>
                <GHead q={c.find.typed} port={port} />
                <GTabs active={0} port={port} />
                <div className={`relative min-h-0 flex-1 pt-6 text-[#1f1f1f] ${port ? "px-5" : "px-[118px]"}`}>
                  <div data-aq className="ml-auto w-fit max-w-[70%] rounded-[20px] rounded-tr-[6px] bg-[#f1f3f4] px-4 py-2.5 text-[15px]" style={HID}>
                    {c.find.typed}
                  </div>
                  <p data-aa className="mt-6 text-[16px] leading-[1.6]">
                    {(locale === "en" ? "Here are three nearby businesses that reply quickly and have great reviews:" : "Ecco tre attività in zona che rispondono subito e hanno ottime recensioni:").split(" ").map((x, i) => (
                      <span key={i} data-aw className="inline-block" style={HID}>
                        {x}&nbsp;
                      </span>
                    ))}
                  </p>
                  <div className="mt-4 flex flex-col gap-3">
                    {c.far.list.slice(0, 3).map(([t, u]) => (
                      <div key={u} data-ai className="flex items-center gap-3 rounded-[16px] border border-[#e3e3e3] px-4 py-3" style={HID}>
                        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#dadce0] text-[13px] font-bold text-[#5f6368]">{t[0]}</span>
                        <span className="min-w-0 flex-1 leading-[1.35]">
                          <span className="block text-[15px] font-medium">{t}</span>
                          <span className="block text-[13px] text-[#4d5156]">{locale === "en" ? "Open today · replies in minutes" : "Aperto oggi · risponde in pochi minuti"}</span>
                        </span>
                        <span className="shrink-0 text-[12px] text-[#4d5156]">{u}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* il contrario: la Modalità IA ora cita te, per primo */}
            <div data-it data-aim2 className={center} style={HID}>
              <div data-gfit data-pfill data-pfull className={`relative flex flex-col overflow-hidden bg-white ${port ? "h-[720px] w-[400px]" : "h-[560px] w-[820px] rounded-[22px] shadow-[0_40px_120px_-40px_rgba(0,0,0,.45)] ring-1 ring-black/5"}`} style={ARIAL}>
                <GHead q={c.find.typed} port={port} />
                <GTabs active={0} port={port} />
                <div className={`relative min-h-0 flex-1 pt-6 text-[#1f1f1f] ${port ? "px-5" : "px-[118px]"}`}>
                  <div data-bq className="ml-auto w-fit max-w-[70%] rounded-[20px] rounded-tr-[6px] bg-[#f1f3f4] px-4 py-2.5 text-[15px]" style={HID}>
                    {c.find.typed}
                  </div>
                  <p className="mt-6 text-[16px] leading-[1.6]">
                    {(locale === "en" ? `The best choice nearby is ${c.find.me[0]}: quick to reply, with great reviews.` : `La scelta migliore in zona è ${c.find.me[0]}: risponde subito e ha ottime recensioni.`).split(" ").map((x, i) => (
                      <span key={i} data-bw className="inline-block" style={HID}>
                        {x}&nbsp;
                      </span>
                    ))}
                  </p>
                  <div className="relative mt-4 flex flex-col gap-3">
                    <Veil data-bveil />
                    {[c.find.me, ...c.far.list.slice(0, 2)].map(([t, u], i) => (
                      <div key={u} data-bi className={`relative flex items-center gap-3 rounded-[16px] border border-[#e3e3e3] bg-white px-4 py-3 ${i === 0 ? "z-20" : ""}`} style={HID}>
                        {i === 0 && <Bead as="span" data-bub3 radius={20} className="absolute -inset-x-3 -inset-y-2 -z-10" style={HID} />}
                        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#dadce0] text-[13px] font-bold text-[#5f6368]">{t[0]}</span>
                        <span className="min-w-0 flex-1 leading-[1.35]">
                          <span className="block text-[15px] font-medium">{t}</span>
                          <span className="block text-[13px] text-[#4d5156]">{locale === "en" ? "Open today · replies in minutes" : "Aperto oggi · risponde in pochi minuti"}</span>
                        </span>
                        <span className="shrink-0 text-[12px] text-[#4d5156]">{u}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* prima: la pagina dei risultati di Google, e tu in fondo */}
            <div data-it data-far className={center} style={HID}>
              <svg width="0" height="0" className="absolute" aria-hidden>
                <filter id="wc-vblur" x="0" y="-20%" width="100%" height="140%">
                  <feGaussianBlur data-vb stdDeviation="0 0" />
                </filter>
              </svg>
              <div data-gfit data-pfill data-pfull className={`relative flex flex-col overflow-hidden bg-white ${port ? "h-[720px] w-[400px]" : "h-[560px] w-[820px] rounded-[22px] shadow-[0_40px_120px_-40px_rgba(0,0,0,.45)] ring-1 ring-black/5"}`} style={ARIAL}>
                <GHead q={c.find.typed} port={port} />
                <GTabs data-fcount port={port} />
                <div className="relative min-h-0 flex-1 overflow-hidden">
                  <div data-fl className={`relative flex flex-col gap-[30px] pb-[200px] pt-2 will-change-transform ${port ? "px-5" : "pl-[118px]"}`}>
                    <Veil data-veil />
                    {Array.from({ length: FAR_N }, (_, i) => (i === FAR_N - 1 ? c.find.me : c.far.list[i % c.far.list.length])).map(([t, u], i) => (
                      <GResult key={i} data-fr port={port} me={i === FAR_N - 1 && ans?.site !== "none"} name={t} url={u} title={i === FAR_N - 1 ? c.far.mine : `${t} · ${c.far.title}`} snip={c.far.snip} />
                    ))}
                    {port && c.far.list.slice(0, 3).map(([t, u]) => <GResult key={`x${u}`} port name={t} url={u} title={`${t} · ${c.far.title}`} snip={c.far.snip} />)}
                  </div>
                  <div data-streak aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: 0 }}>
                    {STREAKS.map(([x, w, d], i) => (
                      <span key={i} className="absolute top-[-10%] h-[120%]" style={{ left: `${x}%`, width: w, opacity: d, background: "linear-gradient(transparent, #4285F4, transparent)" }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* la hero del portfolio: si compone in Figma e poi si modifica */}
            <div data-it data-hm className={center} style={HID}>
              <div data-gfit data-pfill className={`relative overflow-hidden rounded-[26px] shadow-[0_50px_140px_-40px_rgba(0,0,0,.45)] ring-1 ring-black/5 ${port ? "h-[760px] w-[440px]" : "h-[640px] w-[1100px]"}`}>
                <HeroMock port={port} />
                {/* selezione di Figma: rettangolo blu con i quadratini bianchi agli angoli */}
                <div data-hsl className="pointer-events-none absolute left-0 top-0 z-20 border-[1.5px] border-[#0d99ff]" style={HID}>
                  {["-left-[4px] -top-[4px]", "-right-[4px] -top-[4px]", "-left-[4px] -bottom-[4px]", "-right-[4px] -bottom-[4px]"].map((q) => (
                    <span key={q} className={`absolute h-[7px] w-[7px] border-[1.5px] border-[#0d99ff] bg-white ${q}`} />
                  ))}
                  <span data-hsz className="absolute left-1/2 top-[calc(100%+7px)] -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-[#0d99ff] px-1.5 py-[1px] text-[11px] font-medium tabular-nums text-white" />
                </div>
                <div data-hbar className="absolute bottom-[14px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-[14px] bg-white p-1.5 shadow-[0_12px_30px_-12px_rgba(0,0,0,.35)] ring-1 ring-black/10" style={HID}>
                  {[MousePointer2, Frame, Square, Type, PenTool, MessageCircle].map((I, i) => (
                    <span key={i} className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${i ? "text-[#55565c]" : "bg-[#0d99ff] text-white"}`}>
                      <I size={17} strokeWidth={1.8} />
                    </span>
                  ))}
                </div>
                {c.team.map((n, i) => (
                  <span key={n} data-hc className="pointer-events-none absolute left-0 top-0 z-30 block" style={HID}>
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,.3))" }}>
                      <path d="M5 3l14 8-6 1.6L10.4 19z" fill={TEAM_C[i % 3]} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                    <span data-hcl className="absolute left-[16px] top-[18px] whitespace-nowrap rounded-[7px] px-2 py-[3px] text-[12px] font-medium text-white" style={{ background: TEAM_C[i % 3] }}>
                      {n}
                    </span>
                  </span>
                ))}
                {/* il cursore di chi modifica */}
                <svg data-hcur viewBox="0 0 24 24" width="26" height="26" aria-hidden className="pointer-events-none absolute left-0 top-0 z-30" style={{ ...HID, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.45))" }}>
                  <path d="M5 3l14 8-6 1.6L10.4 19z" fill="#14171c" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
<div data-hsaved className="absolute inset-0 z-30 flex items-center justify-center" style={{ ...HID, background: "color-mix(in srgb, #f6f6f3 50%, transparent)", backdropFilter: "blur(18px) saturate(1.3)", WebkitBackdropFilter: "blur(18px) saturate(1.3)" }}>
                  <span data-hsavedt className={`leading-none ${port ? "text-[84px]" : "text-[150px]"}`} style={{ fontFamily: "var(--font-logo), var(--font-sans)", fontWeight: 400, fontSynthesis: "none", letterSpacing: "normal" }}>
                    <GradientText colors={["#25c06a", "#7df0ae", "#16a05a", "#b5f7cf"]} animationSpeed={8} variant="flow" glow={1}>
                      {c.edit.saved + "!"}
                    </GradientText>
                  </span>
                </div>
              </div>
            </div>
            {/* ogni schermo: il sito vero (la hero di questo portfolio) su computer, tablet e telefono */}
            <div data-it data-devs className={center} style={HID}>
              <div data-gfit className={port ? "relative grid h-[700px] w-[440px] grid-cols-[auto_auto] content-center items-end justify-center gap-x-8 gap-y-10" : "relative flex h-[560px] w-[1040px] items-end justify-center"}>
                <div data-dtab className={`relative z-10 rounded-[26px] bg-[#16181c] p-[9px] shadow-[0_30px_80px_-30px_rgba(0,0,0,.55)] ${port ? "order-2 w-[210px]" : "mb-[6px] mr-[-60px] w-[250px]"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cin("hero-tablet")} alt="" draggable={false} className="block w-full rounded-[18px]" />
                </div>
                <div data-dpc className={`relative flex flex-col items-center ${port ? "order-1 col-span-2" : ""}`}>
                  <div className={`rounded-t-[20px] bg-[#16181c] p-[10px] pb-[12px] shadow-[0_40px_100px_-40px_rgba(0,0,0,.55)] ${port ? "w-[376px]" : "w-[620px]"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cin("hero-desktop")} alt="" draggable={false} className="block w-full rounded-[10px]" />
                  </div>
                  <div className={`h-[16px] rounded-b-[16px] bg-gradient-to-b from-[#e4e5e9] to-[#b9bbc2] shadow-[0_20px_40px_-18px_rgba(0,0,0,.5)] ${port ? "w-[430px]" : "w-[720px]"}`} />
                </div>
                <div data-dphone className={`relative z-10 rounded-[30px] bg-[#16181c] p-[6px] shadow-[0_30px_70px_-26px_rgba(0,0,0,.6)] ${port ? "order-3 w-[112px]" : "mb-[-10px] ml-[-70px] w-[150px]"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cin("hero-phone")} alt="" draggable={false} className="block w-full rounded-[25px]" />
                </div>
              </div>
            </div>
            {/* SEO: la stessa pagina di Google, e la tua attività sale in cima */}
            <div data-it data-seo className={center} style={HID}>
              <div data-gfit data-pfill data-pfull className={`relative flex flex-col overflow-hidden bg-white ${port ? "h-[720px] w-[400px]" : "h-[560px] w-[820px] rounded-[22px] shadow-[0_40px_120px_-40px_rgba(0,0,0,.45)] ring-1 ring-black/5"}`} style={ARIAL}>
                <GHead q={c.find.typed} port={port} />
                <GTabs port={port} />
                <div className={`relative flex min-h-0 flex-1 flex-col gap-[24px] pt-5 ${port ? "px-5" : "pl-[118px]"}`}>
                  <Veil data-sveil />
                  {[...c.find.others, c.seo.more[0], c.find.me].map(([t, u], i, all) => (
                    <GResult key={u} data-sr port={port} me={i === all.length - 1} name={t} url={u} title={i === all.length - 1 ? c.far.mine : `${t} · ${c.far.title}`} snip={c.far.snip} />
                  ))}
                </div>
              </div>
            </div>
            {/* GEO: sul desktop, solo l'icona di ChatGPT; un cursore la apre, scrive la domanda, e ChatGPT cita il tuo sito */}
            <div data-it data-geo className={center} style={HID}>
              <div data-gfit data-pfill data-pfull className={`relative ${port ? "h-[720px] w-[400px]" : "h-[560px] w-[820px]"}`}>
                <span data-cicon className="absolute left-1/2 top-1/2 flex h-[128px] w-[128px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[30px] bg-gradient-to-b from-white to-[#ececec] shadow-[0_24px_50px_-18px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.9),inset_0_0_0_1px_rgba(0,0,0,.06)]">
                  <Spark size={76} />
                </span>
                <div data-cwin className={`absolute inset-0 overflow-hidden bg-white text-[#0d0d0d] ${port ? "" : "rounded-[18px] shadow-[0_40px_120px_-40px_rgba(0,0,0,.45)] ring-1 ring-black/10"}`} style={HID}>
                  <Veil data-cveil />
                  {/* barra della finestra */}
                  <div className="flex h-[44px] items-center gap-2 border-b border-black/[.06] px-4">
                    {["#ff5f57", "#febc2e", "#28c840"].map((k) => (
                      <span key={k} className="h-[11px] w-[11px] rounded-full" style={{ background: k }} />
                    ))}
                    <span className="ml-4 text-[13px] text-[#6b6b6b]">{c.geo.title}</span>
                  </div>
                  {/* nuova chat: saluto e campo al centro */}
                  <div data-cnew className={`absolute inset-x-0 flex flex-col items-center ${port ? "top-[34%]" : "top-[150px]"}`}>
                    <span className={`flex items-center gap-3 tracking-[-0.01em] ${port ? "text-[24px]" : "text-[34px]"}`}>
                      <Spark size={30} />
                      {c.geo.hello}
                    </span>
                    <div className={`mt-8 flex h-[104px] flex-col justify-between rounded-[20px] bg-white px-4 pb-3 pt-4 text-[16px] shadow-[0_4px_20px_-6px_rgba(0,0,0,.12)] ring-1 ring-black/10 ${port ? "w-[360px]" : "w-[620px]"}`}>
                      <span className="flex items-center">
                        <span data-cin className="whitespace-pre" />
                        <span className="ml-[1px] inline-block h-[1.15em] w-[2px] animate-pulse bg-[#0d0d0d]" />
                      </span>
                      <span className="flex items-center justify-between">
                        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] text-[#6b6b6b] ring-1 ring-black/10">
                          <Plus size={16} strokeWidth={2} />
                        </span>
                        <span className="flex items-center gap-3 text-[13px] text-[#6b6b6b]">
                          ChatGPT
                          <span data-csend className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#0d0d0d] text-white">
                            <ArrowUp size={16} strokeWidth={2.4} />
                          </span>
                        </span>
                      </span>
                    </div>
                  </div>
                  {/* la conversazione */}
                  <div className={`mx-auto flex flex-col ${port ? "w-[332px] pt-16" : "w-[620px] pt-8"}`}>
                    <div data-gq className="max-w-[80%] self-end rounded-[16px] bg-[#f4f4f4] px-4 py-2.5 text-[16px]" style={HID}>
                      {c.geo.q}
                    </div>
                    <div data-ga className="mt-6 flex flex-col items-start gap-3" style={HID}>
                      <p className="relative text-[18px] leading-[1.65]">
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
                      <span data-gsrc className="relative z-20 inline-flex items-center gap-2 rounded-[8px] bg-[#f4f4f4] px-2.5 py-1 text-[13px] text-[#2f2f2f]">
                        <Bead as="span" data-bub2 radius={18} className="absolute -inset-x-4 -inset-y-3 -z-10" style={HID} />
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-white">{c.find.me[0][0]}</span>
                        {c.find.me[1]}
                      </span>
                      <span data-cspark>
                        <Spark size={22} />
                      </span>
                    </div>
                  </div>
                  <div data-cbar className={`absolute left-1/2 ${port ? "bottom-[108px]" : "bottom-5"} flex h-[54px] -translate-x-1/2 ${port ? "w-[360px]" : "w-[620px]"} items-center justify-between rounded-[18px] bg-white pl-4 pr-2.5 text-[15px] text-[#8f8f8f] shadow-[0_4px_20px_-6px_rgba(0,0,0,.12)] ring-1 ring-black/10`} style={HID}>
                    {c.geo.reply}
                    <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#0d0d0d]/50 text-white">
                      <ArrowUp size={16} strokeWidth={2.4} />
                    </span>
                  </div>
                </div>
                <svg data-ccur viewBox="0 0 24 24" width="30" height="30" aria-hidden className="pointer-events-none absolute left-0 top-0 z-40" style={{ ...HID, filter: "drop-shadow(0 2px 4px rgba(0,0,0,.4))" }}>
                  <path d="M5 3l14 8-6 1.6L10.4 19z" fill="#14171c" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {/* l'assistente su WhatsApp, con la stessa finestra della chat di supporto del sito */}
            <div data-it data-wa className={center} style={HID}>
              <div data-wph>
                <Bead as="div" data-gfit data-pfill radius={26} className="acrylic relative flex h-[640px] w-[400px] flex-col overflow-hidden text-ink">
                  <div className="relative flex items-center gap-3 border-b border-[var(--hair)] px-4 py-3.5">
                    <span className="relative">
                      <AppIcon size={46} />
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#30d158] shadow-[0_0_0_2px_var(--acrylic-solid)]" />
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-[15px] font-semibold text-ink">{c.wa.name}</span>
                      <span className="block truncate text-[12.5px] text-ink-3">{c.wa.on}</span>
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full text-ink-2">
                      <X size={18} strokeWidth={1.9} />
                    </span>
                  </div>
                  <div className="relative flex-1 overflow-hidden">
                    <div data-wlist className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-4 pb-4">
                      {c.wa.chat.map(([q, a], i) => (
                        <Fragment key={q}>
                          <div data-wq={i} className="flex origin-bottom-right justify-end" style={HID}>
                            <Bead as="p" tint="sky" radius={20} className="drop-soft cine-sky max-w-[82%] px-3.5 py-2 text-[15px] leading-[1.38] text-ink">
                              {q}
                            </Bead>
                          </div>
                          <div data-wr={i} className="max-w-[90%] origin-bottom-left" style={HID}>
                            <Bead as="p" radius={20} className="drop-soft block w-fit px-3.5 py-2 text-[15px] leading-[1.42] text-ink">
                              {a}
                            </Bead>
                            {i === 1 && (
                              <Bead as="div" radius={16} className="drop-soft mt-2 flex w-[260px] flex-col p-3.5">
                                <span className="text-[12px] text-ink-3">{c.wa.week}</span>
                                <span className="mt-0.5 flex items-baseline gap-2">
                                  <span className="text-[26px] font-semibold tracking-[-0.02em] text-ink">{c.wa.n}</span>
                                  <span className="text-[13px] font-semibold text-[var(--accent)]">{c.wa.up}</span>
                                </span>
                                <span className="mt-2.5 flex h-[64px] items-end gap-[7px]">
                                  {[38, 52, 45, 61, 70, 84, 97].map((h, j) => (
                                    <span key={j} data-wbar className="flex-1 origin-bottom rounded-t-[4px] bg-gradient-to-t from-[#2a9be0] to-[#86d6ff]" style={{ height: `${h}%` }} />
                                  ))}
                                </span>
                                <span className="mt-1 flex justify-between px-[6px] text-[10px] text-ink-3">
                                  {c.wa.days.map((d, j) => (
                                    <span key={j}>{d}</span>
                                  ))}
                                </span>
                              </Bead>
                            )}
                            {i === 2 && (
                              <span className="mt-2 grid gap-1.5">
                                {c.clients.items.slice(0, 2).map(([, d]) => {
                                  const [who, why] = d.split(" · ");
                                  return (
                                    <Bead as="span" key={d} radius={16} className="drop-soft flex w-[260px] items-center gap-3 p-2 pr-3">
                                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] text-[15px] font-semibold text-ink">{who[0]}</span>
                                      <span className="min-w-0 flex-1 leading-tight">
                                        <span className="block text-[14px] font-medium text-ink">{who}</span>
                                        <span className="mt-0.5 block truncate text-[12px] text-ink-3">{why}</span>
                                      </span>
                                    </Bead>
                                  );
                                })}
                              </span>
                            )}
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-[var(--hair)] p-3">
                    <span className="flex items-center gap-2">
                      <Bead as="span" radius={22} className="drop-soft flex h-11 min-w-0 flex-1 items-center px-4 text-[15px] text-ink-3">
                        {c.wa.type}
                      </Bead>
                      <Bead as="span" tint="sky" radius={22} className="drop-soft cine-sky flex h-11 w-11 shrink-0 items-center justify-center text-ink">
                        <ArrowUp size={18} strokeWidth={2.2} />
                      </Bead>
                    </span>
                  </div>
                </Bead>
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
        <p data-eh className="mx-auto whitespace-nowrap px-6 text-center font-medium leading-[1.16] tracking-[-0.045em] [word-spacing:0.16em] cine-fg" style={{ fontSize: fitLine(c.end.t, "clamp(38px,6.6cqw,108px)") }}>
          <Kw text={c.end.t} />
        </p>
      </div>
      <div data-end2 className="absolute inset-0 flex flex-col items-center justify-center" style={HID}>
        <div data-logo className="[--logo-size:clamp(46px,10.5cqw,136px)]" style={HID}>
          <Wordmark />
        </div>

      </div>
      {gate && (
        <div ref={gateRef} className="absolute inset-0 z-30">
          <FilmIntake en={locale === "en"} onDone={(a, snd) => begin(a, snd)} onSkip={(snd) => begin(null, snd)} />
        </div>
      )}
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
