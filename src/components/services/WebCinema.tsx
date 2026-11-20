"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowLeft, ArrowRight, Bell, Check, FileText, Globe, Inbox, KeyRound, LifeBuoy, Lock, LockOpen, Menu, Pause, PencilLine, Play, Plus, RotateCcw, RotateCw, Search, ShieldCheck, Tag, UserRound, Volume2, VolumeX, X, EllipsisVertical } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { prefersReducedMotion } from "@/lib/env";
import { onIntroLift } from "@/lib/intro";
import { soundOn, onSound, setSound } from "@/lib/sound";
import { fx, filmMute } from "@/lib/filmsound";
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

/** Le parole tra asterischi diventano parole chiave, riempite dal gradiente animato. */
export function Kw({ text }: { text: string }) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2) {
          const m = /^[.,!?;:]+/.exec(parts[i + 1] ?? "");
          return (
            <span key={i} data-kw className="inline-block" style={{ fontFamily: "var(--font-logo), var(--font-sans)", fontWeight: 400, fontSize: "1.2em", fontSynthesis: "none", letterSpacing: "normal", lineHeight: 1, padding: "0.2em 0.34em 0.5em", margin: "-0.2em -0.34em -0.5em" }}>
              <GradientText colors={GT} animationSpeed={8} variant="flow" glow={1}>
                {p + (m ? m[0] : "")}
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


/**
 * Dissolvenza a particelle: fotografa il sito (immagine, barra e titolo) in una griglia di punti che si staccano da sinistra a destra,
 * salgono e svaniscono, come polvere portata dal vento.
 */
function makeDissolve(cv: HTMLCanvasElement, host: HTMLElement, img: HTMLImageElement | null, old: Cinema["old"]) {
  const W = host.offsetWidth;
  const H = host.offsetHeight;
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  const ctx = cv.getContext("2d")!;
  const oc = document.createElement("canvas");
  oc.width = W;
  oc.height = H;
  const o = oc.getContext("2d", { willReadFrequently: true })!;
  // la copia del vecchio sito com'è in quel momento: stesse proporzioni di OldSite
  const serif = (px: number, st = "") => `${st} ${Math.round(px)}px "Times New Roman", Times, serif`;
  o.fillStyle = "#e8e2d0";
  o.fillRect(0, 0, W, H);
  o.fillStyle = "#1d2b6b";
  o.fillRect(0, 0, W, H * 0.14);
  o.fillStyle = "#ffd200";
  o.font = serif(H * 0.07, "bold");
  o.textAlign = "center";
  o.textBaseline = "middle";
  o.fillText(old.brand, W / 2, H * 0.07);
  o.textAlign = "left";
  o.fillStyle = "#c8c0aa";
  o.fillRect(0, H * 0.14, W * 0.24, H * 0.86);
  o.font = serif(H * 0.045);
  o.fillStyle = "#0000ee";
  old.menu.forEach((m, i) => {
    const y = H * (0.22 + i * 0.08);
    o.fillText(m, W * 0.03, y);
    o.fillRect(W * 0.03, y + H * 0.022, o.measureText(m).width, 1);
  });
  o.fillStyle = "#c00000";
  o.font = serif(H * 0.05, "italic bold");
  o.fillText(old.hello, W * 0.28, H * 0.2);
  const ix = W * 0.28, iy = H * 0.27, iw = W * 0.4, ih = H * 0.42;
  o.fillStyle = "#888";
  o.fillRect(ix - 3, iy - 3, iw + 6, ih * 0.66 + 3);
  if (img && img.complete && img.naturalWidth) {
    o.save();
    o.beginPath();
    o.rect(ix, iy, iw, ih * 0.66);
    o.clip();
    o.filter = "sepia(.5) saturate(.7) contrast(.85)";
    const r = Math.max(iw / img.naturalWidth, ih / img.naturalHeight);
    o.drawImage(img, ix + (iw - img.naturalWidth * r) / 2, iy + (ih - img.naturalHeight * r) / 2, img.naturalWidth * r, img.naturalHeight * r);
    o.restore();
  }
  o.fillStyle = "#222";
  o.font = serif(H * 0.04);
  old.text.forEach((t, i) => o.fillText(t, W * 0.28, H * (0.77 + i * 0.065)));
  o.font = serif(H * 0.035);
  o.fillStyle = "#555";
  o.fillText(old.visits, W * 0.72, H * 0.93);
  const S = W < 420 ? 4 : 5;
  const px = o.getImageData(0, 0, W, H).data;
  const lim = H;
  const P: { x: number; y: number; c: string; d: number; vx: number; vy: number; s: number }[] = [];
  for (let y = 0; y < lim; y += S)
    for (let x = 0; x < W; x += S) {
      const i = (Math.floor(y + S / 2) * W + Math.floor(x + S / 2)) * 4;
      P.push({ x, y, c: `${px[i]},${px[i + 1]},${px[i + 2]}`, d: (x / W) * 0.5 + Math.random() * 0.14, vx: (120 + Math.random() * 380) * (W / 440), vy: (Math.random() - 0.62) * 170, s: S * (0.7 + Math.random() * 0.6) });
    }
  return (p: number) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (const q of P) {
      const t = Math.min(1, Math.max(0, (p - q.d) / 0.46));
      if (t >= 1) continue;
      const e = t * t;
      const a = 1 - t;
      if (t === 0) {
        ctx.fillStyle = `rgb(${q.c})`;
        ctx.fillRect(q.x, q.y, S, S);
      } else {
        const r = (q.s / 2) * (1 - 0.55 * t);
        ctx.fillStyle = `rgba(${q.c},${a})`;
        ctx.beginPath();
        ctx.arc(q.x + S / 2 + q.vx * e, q.y + S / 2 + q.vy * e - 26 * e, r, 0, 6.2832);
        ctx.fill();
      }
    }
  };
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

/** Lo stesso disegno prima di essere finito: solo le forme, nelle stesse posizioni. */
function Wire() {
  return (
    <div data-wire className="ms @container absolute inset-0 z-10 overflow-hidden bg-[var(--bg-sunken)]">
      <div className="cine-blk absolute left-[var(--i)] right-[var(--i)] top-[var(--i)]" style={{ borderRadius: R_IN, height: NAV_H }} />
      <div className="ms-hero absolute flex flex-col justify-center gap-[clamp(10px,2.4cqw,24px)]">
        <div className="cine-blk h-[clamp(10px,1.5cqw,14px)] w-[22%] rounded-full" />
        <div className="cine-blk h-[clamp(26px,6.6cqw,80px)] w-[88%] rounded-[10px]" />
        <div className="cine-blk h-[clamp(26px,6.6cqw,80px)] w-[70%] rounded-[10px]" />
        <div className="cine-blk h-[clamp(10px,1.5cqw,14px)] w-[30%] rounded-full" />
      </div>
      <div className="ms-photo cine-blk absolute" style={{ borderRadius: R_IN }} />
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
      const slam = (g: { a: HTMLElement[]; b: HTMLElement[] }, at: number, deg: number, L: gsap.core.Timeline = tl) => {
        if (g.a.length) {
          L.fromTo(g.a, { scale: 1.22, autoAlpha: 0, filter: "blur(10px)" }, { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out" }, at);
          L.call(() => (F.kick(0.9), F.tick(1)), undefined, at);
        }
        if (g.b.length) {
          const at2 = at + (g.a.length ? 0.25 : 0);
          L.fromTo(g.b, { scale: 1.3, autoAlpha: 0, filter: "blur(12px)" }, { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 0.5, ease: "expo.out" }, at2);
          L.call(() => F.pluck(deg + 7, 0.9, 0.5), undefined, at2);
        }
      };
      // il testo non sta più sopra la grafica: ogni frase ha il suo schermo, prima della sua scena (vedi il montaggio in fondo)
      const capAt = (..._: number[]) => void _;
      const cap = (i: number, b0: number, b1: number) => capAt(i, T(b0), T(b1));
      const punch = (b: number, s = 1.02) => tl.fromTo(cam, { scale: s }, { scale: 1, duration: 0.6, ease: "expo.out" }, T(b));

      /* 0 · Un cliente ti cerca: la camera parte vicina alla barra e si allontana mentre arrivano i risultati */
      const pill = one("[data-pill]");
      const res = $("[data-res]");
      const py = () => -150 * k();
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
      const spin = one("[data-spin]");
      const fav = one("[data-fav]");
      const stop = one("[data-stop]");
      const rl = one("[data-rl]");
      const ok = one("[data-ok]");
      const tt1 = one("[data-tt1]");
      const tt2 = one("[data-tt2]");
      const num = (n: number) => n.toFixed(1).replace(".", locale === "en" ? "." : ",") + " s";
      gsap.set([fav, rl, tt2, ok], { autoAlpha: 0 });
      tl.to([pill, ...res], { autoAlpha: 0, y: "-=40", filter: "blur(8px)", duration: 0.45, stagger: 0.03, ease: "power2.in" }, T(5.1))
        .call(() => (F.whoosh(0.5, false, 0.8), F.riser(U(6.5))), undefined, U(5.5))
        .fromTo(chrome, { autoAlpha: 0, y: 140 }, { autoAlpha: 1, y: 0, duration: 1.3, ease: "expo.out" }, U(5.7))
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
      // prima che finisca di caricare, il sito si scioglie in particelle: il cliente se ne va
      const sw = one("[data-sw]");
      const cv = one("[data-ptc]") as HTMLCanvasElement;
      const content = sw.parentElement as HTMLElement;
      let draw: ((p: number) => void) | null = null;
      const dis = { p: 0 };
      const D0 = 5.8;
      gsap.set(cv, { autoAlpha: 0 });
      tl.call(
        () => {
          draw = makeDissolve(cv, content, oimg.querySelector("img"), c.old);
          draw(0);
        },
        undefined,
        D0 - 0.05,
      )
        .set(cv, { autoAlpha: 1 }, D0 - 0.02)
        .set(oldEl, { autoAlpha: 0 }, D0)
        .call(() => F.whoosh(0.9, false, 0.8), undefined, D0)
        .fromTo(dis, { p: 0 }, { p: 1, duration: 0.8, ease: "none", onUpdate: () => draw?.(dis.p) }, D0)
        .set(cv, { autoAlpha: 0 }, D0 + 0.82);

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
      const wireBits = $("[data-wire] > div");
      tl.call(() => F.whoosh(0.8, true, 1), undefined, T(11.5))
        .to(chrome, { autoAlpha: 0, y: -50, duration: 0.8, ease: "power3.in" }, T(11.4))
        .fromTo(dev, { autoAlpha: 0, rotationX: 40, y: 160, scale: () => fit(wide)() * 0.7 }, { autoAlpha: 1, rotationX: 0, y: 0, scale: fit(wide), duration: 1.5, ease: "expo.out" }, T(11.9))
        .fromTo(wireBits, { autoAlpha: 0, scale: 0.86, y: 16 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)", stagger: T(0.4) }, T(12.6));
      wireBits.forEach((_, i) => tl.call(() => F.pluck(i * 2, 0.7, 0.3), undefined, T(12.6) + i * T(0.4)));
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
          .to(dev, { rotationY: turn, duration: 0.55, ease: "power2.out" }, T(b))
          .to(dev, { rotationY: 0, duration: 0.8, ease: "power3.inOut" }, T(b) + 0.55);
      };
      shape(18, mid, "34px", -16);
      shape(19.9, phone, "48px", 16);
      tl.call(() => F.pluck(9, 0.9, 0.6), undefined, T(21.2));
      cap(5, 18.2, 21.8);

      /* 6 · Arrivano i clienti: il telefono si inclina, le notifiche scendono dall'alto */
      const ns = $("[data-n]");
      tl.to(dev, { rotationX: 10, rotationY: -14, duration: 1.4, ease: "sine.inOut" }, T(21.6));
      ns.forEach((n, i) => {
        const at = T(22.2 + i * 1);
        tl.fromTo(n, { autoAlpha: 0, y: -50, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.4)" }, at).call(() => F.bell(7 + i * 2, 1), undefined, at);
      });
      cap(6, 21.8, 25.8);

      /* 7 · Online, al sicuro: la barra dell'indirizzo prende il posto del menù, la camera la segue */
      const nav = one("[data-nav]");
      const ub = one("[data-ub]");
      tl.to(ns, { x: 140, autoAlpha: 0, duration: 0.45, stagger: 0.05, ease: "power2.in" }, T(25.4))
        .to(dev, { rotationX: 0, rotationY: 0, duration: 0.9, ease: "expo.inOut" }, T(25.5))
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
      tl.to(saved, { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, T(40.6))
        .call(() => (F.kick(1), F.whoosh(0.8, false, 1)), undefined, T(40.8))
        .to(dev, { scale: () => fit(mid)() * 0.22, rotationY: 30, autoAlpha: 0, duration: 0.9, ease: "power3.in" }, T(40.6))
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
      tl.to(rr, { r: 0, duration: 0.7, ease: "power3.in", onUpdate: place }, T(49.2))
        .to(gs, { autoAlpha: 0, scale: 0.8, filter: "blur(8px)", duration: 0.5, ease: "power2.in" }, T(49.3))
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
      tl.to(ps, { autoAlpha: 0, y: "-=30", filter: "blur(8px)", duration: 0.45, stagger: 0.04, ease: "power2.in" }, T(54.2))
        .call(() => (F.kick(1.2), F.whoosh(0.9, true, 1)), undefined, T(54.8))
        .set(endCard, { autoAlpha: 1 }, T(54.8));
      slam(eg, T(55.0), 0);
      tl.call(() => (F.chord([0, 2, 4, 7], 1.2)), undefined, T(55.0))
        .to(endCard, { autoAlpha: 0, y: -30, filter: "blur(10px)", duration: 0.5, ease: "power2.in" }, T(55.0) + 1.7)
        .set(one("[data-end2]"), { autoAlpha: 1 }, T(55.0) + 2.1)
        .fromTo(one("[data-logo]"), { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out" }, T(55.0) + 2.1)
        .call(() => F.chord([0, 2, 4, 7], 1), undefined, T(55.0) + 2.1)
        .fromTo(one("[data-more]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }, T(55.0) + 2.9);
      punch(51.8, 1.03);
      tl.set({}, {}, T(55.0) + 4);

      /* Il tempo del video lo muoviamo noi, un fotogramma alla volta e con un passo massimo:
         se il dispositivo rallenta (pagina che carica, telefono sotto sforzo) il video rallenta con lui invece di saltare le scene. */
      /* montaggio: frase a schermo intero, poi la sua scena a schermo intero */
      const segs: [number, number][] = [
        [0, T(5.5)],
        [T(5.5), 6.5],
        [6.5, T(11.7)],
        [T(11.7), T(15.6)],
        [T(15.6), T(18)],
        [T(18), T(21.8)],
        [T(21.8), T(25.8)],
        [T(25.8), T(31.2)],
        [T(31.2), T(41.1)],
        [T(41.1), T(49.8)],
        [T(49.8), T(54.6)],
      ];
      const scene = tl;
      const mt = gsap.timeline({
        paused: true,
        onUpdate: () => {
          if (bar.current) bar.current.style.transform = `scaleX(${mt.progress()})`;
        },
      });
      let at = 0;
      const run = (a: number, b: number) => {
        mt.add(scene.tweenFromTo(a, b, { duration: b - a, ease: "none", immediateRender: false }), at);
        at += b - a;
      };
      segs.forEach(([a, b], i) => {
        const u = units[i];
        if (!u) return run(a, b);
        mt.to(cam, { autoAlpha: 0, duration: 0.35, ease: "power2.in" }, at);
        const c0 = at + 0.3;
        mt.set(caps[i], { autoAlpha: 1 }, c0);
        slam(u, c0, i % 5, mt);
        const len = Math.max(1.5, 1.1 + caps[i].textContent!.length * 0.035);
        mt.to([...u.a, ...u.b], { scale: 0.94, autoAlpha: 0, filter: "blur(8px)", duration: 0.3, ease: "power3.in" }, c0 + len);
        mt.set(caps[i], { autoAlpha: 0 }, c0 + len + 0.3);
        at = c0 + len + 0.3;
        mt.fromTo(cam, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out", immediateRender: false }, at);
        run(a, b);
      });
      run(T(54.6), scene.duration());
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
    { scope: root, dependencies: [locale] },
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
    const tl = tlRef.current;
    if (!tl) return;
    flags.current = { ...flags.current, ended: false, paused: false, playing: true };
    setEnded(false);
    setPlaying(true);
    F.reset();
    F.duck(false);
    tl.time(0);
  };

  const center = "absolute left-1/2 top-0";
  return (
    <section ref={root} className={embed ? "relative h-full w-full [container-type:size]" : "relative h-svh min-h-[560px] [container-type:size]"} aria-label={title} style={{ "--ft": "84px", "--fb": "16px" } as CSSProperties}>
      {!embed && <h1 className="sr-only">{title}</h1>}
      <div data-frame className={embed ? "cine-film cine-acr absolute inset-0 overflow-hidden" : "cine-film cine-acr absolute overflow-hidden rounded-[34px] shadow-[inset_0_0_0_1px_var(--hair-strong)] max-md:left-2 max-md:right-2 md:left-4 md:right-4"} style={embed ? undefined : { top: "var(--ft)", bottom: "var(--fb)" }}>
        {c.cap.map((t, i) => (
          <p key={t} data-cap={i} className={CAPF} style={HID}>
            <Kw text={t} />
          </p>
        ))}
        <div data-cam className="absolute inset-0 will-change-transform">
          <div className="absolute inset-x-0 top-[50%] h-0">
            {/* ricerca e risultati */}
            <Bead as="div" data-it data-pill radius={42} className={`cine-fg ${center} flex h-[clamp(60px,10cqh,84px)] w-[min(720px,76cqw)] items-center gap-4 px-[clamp(20px,3cqw,34px)] text-[clamp(18px,2.6cqw,30px)]`} style={HID}>
              <Search size={26} strokeWidth={1.8} className="cine-fg2 shrink-0" />
              <span data-typed className="tracking-[-0.015em]" />
              <span className="h-[1.1em] w-[2px] animate-pulse bg-[var(--label-primary)]" />
            </Bead>
            {[c.find.me, ...c.find.others].map(([t, u], i) => (
              <Bead as="div" key={u} data-it data-res radius={34} className={`cine-fg ${center} flex h-[clamp(56px,9cqh,74px)] w-[min(720px,76cqw)] items-center justify-between gap-4 px-[clamp(20px,3cqw,34px)]`} style={HID}>
                <span className={`text-[clamp(17px,2.2cqw,26px)] tracking-[-0.02em] ${i ? "cine-fg2" : "font-semibold"}`}>{t}</span>
                <span className="cine-fg2 text-[clamp(13px,1.5cqw,17px)]">{u}</span>
              </Bead>
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
                <Wire />
                <span data-scan className="pointer-events-none absolute inset-x-0 z-30 block h-[2px] bg-[#8fd8ff] shadow-[0_0_28px_6px_rgba(143,216,255,.6)]" style={HID} />
              </MiniSite>
            </div>
            {/* il browser: prima carica lento, poi tutto insieme */}
            <div data-it data-chrome className={`${center} w-[min(92cqw,calc(min(72cqh,600px)*1.58))] aspect-[1.58] max-md:aspect-[.82] flex flex-col overflow-hidden rounded-[18px] shadow-[0_40px_120px_-40px_rgba(0,0,0,.5),inset_0_0_0_1px_var(--hair-strong)]`} style={{ ...HID, ["--r" as string]: "20px" }}>
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
                <ArrowLeft size={17} strokeWidth={1.7} className="cine-fg2 opacity-60" />
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
                <div data-sw className="absolute inset-0">
                  <MiniSite c={c} />
                </div>
                <span data-wipe aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-20 block w-[3px] bg-[var(--accent)] shadow-[0_0_30px_8px_rgba(94,196,255,.55)]" style={HID} />
                <canvas data-ptc aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" style={HID} />
                <span data-prog aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px] origin-left" style={{ ...HID, background: "var(--accent)" }} />
                <svg data-cur viewBox="0 0 24 24" width="24" height="24" aria-hidden className="pointer-events-none absolute left-0 top-0 z-20" style={{ ...HID, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.45))" }}>
                  <path d="M5 3l14 8-6 1.6L10.4 19z" fill="#14171c" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
                <span className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center">
                  <Bead as="span" radius={999} className="cine-fg flex h-11 items-center gap-2.5 px-4 text-[15px]">
                    <span data-tagdot className="h-2 w-2 rounded-full" style={{ background: "var(--negative)" }} />
                    <span className="relative font-medium">
                      <span data-tag1>{c.ba[0]}</span>
                      <span data-tag2 className="absolute left-0 top-0" style={HID}>
                        {c.ba[1]}
                      </span>
                    </span>
                    <span className="h-4 w-px bg-[var(--hair-strong)]" />
                    <span data-count className="font-mono tabular-nums">
                      0,0 s
                    </span>
                    <Check data-ok size={16} strokeWidth={2.4} style={{ color: "var(--accent)" }} />
                  </Bead>
                </span>
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
      <div data-end className="absolute inset-0 flex flex-col items-center justify-center" style={HID}>
        <p data-eh className="mx-auto max-w-[14ch] px-6 text-center text-[clamp(38px,6.6cqw,108px)] font-medium leading-[1.04] tracking-[-0.05em] cine-fg">
          <Kw text={c.end.t} />
        </p>
      </div>
      <div data-end2 className="absolute inset-0 flex flex-col items-center justify-center gap-14" style={HID}>
        <div data-logo className="[--logo-size:clamp(46px,10.5cqw,136px)]" style={HID}>
          <Wordmark />
        </div>
        <span data-more className="cine-fg flex flex-col items-center gap-1 text-[clamp(24px,3.4cqw,40px)]" style={{ ...HID, fontFamily: "var(--font-logo), var(--font-sans)", fontWeight: 400, fontSynthesis: "none" }}>
          {c.end.more}
          <ArrowDown size={18} strokeWidth={1.8} className="animate-bounce" />
        </span>
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
