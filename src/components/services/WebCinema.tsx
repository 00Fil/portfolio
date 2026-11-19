"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ArrowDown, ArrowLeft, ArrowRight, Bell, Check, FileText, Globe, Inbox, KeyRound, LifeBuoy, Lock, LockOpen, Menu, Pause, PencilLine, Play, Plus, RotateCcw, RotateCw, Search, ShieldCheck, UserRound, Volume2, VolumeX, X, EllipsisVertical } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { prefersReducedMotion } from "@/lib/env";
import { onIntroLift } from "@/lib/intro";
import { soundOn, onSound, setSound } from "@/lib/sound";
import { fx } from "@/lib/filmsound";
import { Bead } from "@/components/glass/Bead";
import { Wordmark } from "@/components/nav/Wordmark";
import { GradientText } from "@/components/ui/GradientText";
import { getCinema, type Cinema } from "@/content/cinema";

gsap.registerPlugin(SplitText, useGSAP);

const ACC = "#8fd8ff";
const DISP = { fontWeight: 600, letterSpacing: "-0.055em" } as const;
const GT = ["#1f8fd0", "#5ec4ff", "#2f6fe0", "#8fd8ff"];
const cin = (n: string) => `/visual/cinema/${n}.webp`;
const HID = { visibility: "hidden" as const, opacity: 0 };
type Q = (s: string) => HTMLElement[];

/** Le parole tra asterischi diventano parole chiave, riempite dal gradiente animato. */
function Kw({ text }: { text: string }) {
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

/** Illustrazioni tracciate a linea per le garanzie: si disegnano da sole durante il film. */
const ART: string[][] = [
  ["M16 8h24l9 9v39H16z", "M40 8v9h9", "M24 28h18", "M24 36h18", "M24 44h9", "M34 52c3-5 5 3 8-2s4 2 7-1"],
  ["M32 8a9 9 0 1 0 0.01 0", "M14 56c0-11 8-18 18-18s18 7 18 18", "M8 30a24 24 0 0 1 8-14", "M56 30a24 24 0 0 0-8-14"],
  ["M8 34 34 8h22v22L30 56z", "M46 18a3.5 3.5 0 1 0 0.01 0", "M24 36l12-12", "M28 44l16-16"],
  ["M14 30h36v26H14z", "M22 30V20a10 10 0 0 1 19-4", "M32 40v8", "M32 40a2 2 0 1 0 0.01 0"],
];
function PromiseArt({ i }: { i: number }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ART[i % ART.length].map((d, k) => (
        <path key={k} d={d} />
      ))}
    </svg>
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

/* ───────────── Il sito d'esempio: superfici piene, angoli interni = angolo esterno − margine ───────────── */

const SOLID = "bg-[#151a21] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08),inset_0_1px_0_rgba(255,255,255,.14)]";
const R_IN = "calc(var(--r) - var(--i))";
const R_IN2 = "calc(var(--r) - var(--i) - 6px)";

function MiniSite({ c, children }: { c: Cinema; children?: ReactNode }) {
  return (
    <div data-site className="@container relative h-full w-full overflow-hidden bg-[#0d1115] text-white" style={{ "--i": "12px" } as CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-simg src={cin("lavoro")} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,12,16,.6) 0%, rgba(8,12,16,.1) 28%, rgba(8,12,16,.3) 50%, rgba(8,12,16,.92) 100%)" }} />
      <div data-nav className={`absolute left-[var(--i)] right-[var(--i)] top-[var(--i)] flex h-[clamp(44px,6cqw,60px)] items-center justify-between pl-[clamp(14px,2.4cqw,22px)] pr-[6px] ${SOLID}`} style={{ borderRadius: R_IN }}>
        <span className="flex items-center gap-2 text-[clamp(14px,2.2cqw,19px)] font-semibold tracking-[-0.01em]">
          <span className="h-[7px] w-[7px] rounded-full" style={{ background: ACC }} />
          Marchio
        </span>
        <span className="flex h-full items-center gap-[clamp(14px,3cqw,28px)] py-[6px] text-[clamp(12px,1.6cqw,15px)]">
          <span className="hidden gap-[clamp(14px,3cqw,28px)] @min-[560px]:flex">
            {c.site.nav.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
          <span className="hidden h-full items-center bg-white px-[clamp(14px,2.4cqw,20px)] font-semibold text-black @min-[560px]:flex" style={{ borderRadius: R_IN2 }}>
            {c.site.book}
          </span>
          <span className="flex aspect-square h-full items-center justify-center bg-white text-black @min-[560px]:hidden" style={{ borderRadius: R_IN2 }}>
            <Menu size={16} strokeWidth={2} />
          </span>
        </span>
      </div>
      <div data-title className="absolute bottom-[clamp(62px,10cqw,100px)] left-[calc(var(--i)+2cqw)] text-white" style={{ ...DISP, fontSize: "clamp(30px,8.6cqw,100px)", lineHeight: 1.02 }}>
        <span data-focus className="pointer-events-none absolute -inset-x-[14px] -inset-y-[8px] rounded-[18px] border-2 border-[#8fd8ff]" style={HID} />
        <span data-sel className="pointer-events-none absolute -inset-x-[8px] bottom-[-4px] top-[50%] origin-left rounded-[10px] bg-[#8fd8ff]/35" style={HID} />
        <span className="relative block">{c.site.title[0]}</span>
        <span className="relative block whitespace-nowrap">
          <span data-l2>{c.site.title[1].replace(".", "")}</span>
          <span style={{ color: ACC }}>.</span>
        </span>
      </div>
      <div className={`absolute right-[calc(var(--i)+2cqw)] top-[clamp(72px,12cqw,120px)] hidden aspect-square w-[clamp(64px,12cqw,116px)] items-center justify-center rounded-full @min-[440px]:flex ${SOLID}`}>
        <svg viewBox="0 0 100 100" className="absolute inset-0" aria-hidden>
          <defs>
            <path id="wcc" d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0" />
          </defs>
          <text fontSize="9.4" fontWeight="600" letterSpacing="1.8" fill="#fff">
            <textPath href="#wcc">{c.site.badge}</textPath>
          </text>
        </svg>
        <span className="flex h-[38%] w-[38%] items-center justify-center rounded-full bg-white text-black">
          <ArrowDown size={16} strokeWidth={2} className="-rotate-[135deg]" />
        </span>
      </div>
      <div className="absolute bottom-[var(--i)] left-[var(--i)] flex gap-2 text-[clamp(11px,1.6cqw,14px)]">
        {[c.site.stars, c.site.since].map((s) => (
          <span key={s} className={`flex h-[clamp(32px,4.6cqw,42px)] items-center px-[clamp(12px,2cqw,18px)] ${SOLID}`} style={{ borderRadius: R_IN }}>
            {s}
          </span>
        ))}
      </div>
      {children}
    </div>
  );
}

/** Lo stesso disegno prima di essere finito: solo le forme, nelle stesse posizioni. */
function Wire() {
  const blk = "absolute cine-blk";
  return (
    <div data-wire className="@container absolute inset-0 z-10 overflow-hidden bg-[var(--bg-sunken)]">
      <div className={`${blk} left-[var(--i)] right-[var(--i)] top-[var(--i)] h-[clamp(44px,6cqw,60px)]`} style={{ borderRadius: R_IN }} />
      <div className={`${blk} right-[calc(var(--i)+2cqw)] top-[clamp(72px,12cqw,120px)] hidden aspect-square w-[clamp(64px,12cqw,116px)] rounded-full @min-[440px]:block`} />
      <div className={`${blk} bottom-[calc(clamp(62px,10cqw,100px)+10.6cqw)] left-[calc(var(--i)+2cqw)] h-[9.6cqw] min-h-[30px] w-[50cqw] rounded-[10px]`} />
      <div className={`${blk} bottom-[clamp(62px,10cqw,100px)] left-[calc(var(--i)+2cqw)] h-[9.6cqw] min-h-[30px] w-[66cqw] rounded-[10px]`} />
      <div className={`${blk} bottom-[var(--i)] left-[var(--i)] h-[clamp(32px,4.6cqw,42px)] w-[22cqw]`} style={{ borderRadius: R_IN }} />
      <div className={`${blk} bottom-[var(--i)] left-[calc(var(--i)+22cqw+8px)] h-[clamp(32px,4.6cqw,42px)] w-[16cqw]`} style={{ borderRadius: R_IN }} />
    </div>
  );
}

/* ───────────── Il video ─────────────
   Un oggetto solo che cambia forma, una camera che si avvicina e si allontana, una colonna sonora a 120 battiti.
   Nessun movimento lineare: ogni passaggio ha la sua curva. */

const B = 0.5;
/* dalla battuta 9.2 in poi tutto scorre di 3.4 battute: il caricamento lento ha bisogno di tempo per essere visto */
const T = (n: number) => (n >= 9.2 ? n + 9 : n) * B;
const U = (n: number) => n * B;
const ICONS_GETS = [Globe, KeyRound, ShieldCheck, PencilLine, Inbox, LifeBuoy];
const ICONS_PROMISE = [FileText, UserRound, KeyRound, LockOpen];
const CAP = "pointer-events-none absolute inset-x-0 top-[5%] mx-auto max-w-[19ch] px-6 text-center text-[clamp(30px,4.6vw,76px)] font-semibold leading-[1.06] tracking-[-0.05em] cine-fg md:top-[7%] md:max-w-[24ch]";

export function WebCinema({ title }: { title: string }) {
  const locale = useLocale() as Locale;
  const c = getCinema(locale);
  const root = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const flags = useRef({ visible: false, paused: false, ended: false, lifted: false, playing: false });
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
    if (!el) return;
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
      const small = () => innerWidth <= 760;
      const k = () => (small() ? 0.7 : 1);
      const wide = () => (small() ? 760 : 1100);
      const mid = () => (small() ? 520 : 640);
      const phone = () => 340;
      const fit = (w: () => number) => () => Math.min(1, (cam.offsetWidth * 0.92) / w(), (cam.offsetHeight * (small() ? 0.54 : 0.64)) / 640);
      // punto di mira della camera: il centro di un elemento, nelle coordinate della scena
      const aim = (t: () => HTMLElement) => () => {
        const w = cam.getBoundingClientRect();
        const r = t().getBoundingClientRect();
        return `${r.left + r.width / 2 - w.left}px ${r.top + r.height / 2 - w.top}px`;
      };

      gsap.set($("[data-it]"), { xPercent: -50, yPercent: -50 });
      gsap.set(dev, { width: wide, scale: fit(wide), "--r": "26px", transformPerspective: 1600 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.inOut" },
        onUpdate: () => {
          if (bar.current) bar.current.style.transform = `scaleX(${tl.progress()})`;
        },
      });
      tlRef.current = tl;

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
      const slam = (g: { a: HTMLElement[]; b: HTMLElement[] }, at: number, deg: number) => {
        if (g.a.length) {
          tl.fromTo(g.a, { scale: 1.22, autoAlpha: 0, filter: "blur(10px)" }, { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 0.42, ease: "expo.out" }, at);
          tl.call(() => (fx.kick(0.9), fx.tick(1)), undefined, at);
        }
        if (g.b.length) {
          const at2 = at + (g.a.length ? 0.25 : 0);
          tl.fromTo(g.b, { scale: 1.3, autoAlpha: 0, filter: "blur(12px)" }, { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 0.5, ease: "expo.out" }, at2);
          tl.call(() => fx.pluck(deg + 7, 0.9, 0.5), undefined, at2);
        }
      };
      const capAt = (i: number, a0: number, a1: number) => {
        const u = units[i];
        const t0 = Math.round(a0 / B) * B;
        const t1 = Math.round(a1 / B) * B;
        tl.set(caps[i], { autoAlpha: 1 }, t0);
        slam(u, t0, i % 5);
        tl.to([...u.a, ...u.b], { scale: 0.94, autoAlpha: 0, filter: "blur(8px)", duration: 0.28, ease: "power3.in" }, t1 - 0.28);
        tl.set(caps[i], { autoAlpha: 0 }, t1);
      };
      const cap = (i: number, b0: number, b1: number) => capAt(i, T(b0), T(b1));
      const punch = (b: number, s = 1.02) => tl.fromTo(cam, { scale: s }, { scale: 1, duration: 0.6, ease: "expo.out" }, T(b));

      /* 0 · Un cliente ti cerca: la camera parte vicina alla barra e si allontana mentre arrivano i risultati */
      const pill = one("[data-pill]");
      const res = $("[data-res]");
      const py = () => -150 * k();
      const ry = (i: number) => () => (-40 + i * 92) * k();
      gsap.set(pill, { y: py });
      tl.call(() => fx.whoosh(0.6, true, 0.7), undefined, 0)
        .fromTo(cam, { scale: () => (small() ? 1.2 : 1.5), transformOrigin: aim(() => pill) }, { scale: () => (small() ? 1.2 : 1.5), duration: 0.01 }, 0)
        .fromTo(pill, { autoAlpha: 0, scale: 0.86 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "back.out(1.4)" }, 0.05);
      typeTo(tl, one("[data-typed]"), c.find.typed, T(0.9), T(2.4), 0);
      tl.to(cam, { scale: 1, duration: 1.2, ease: "expo.inOut" }, T(3));
      res.forEach((r, i) => {
        tl.fromTo(r, { autoAlpha: 0, y: () => ry(i)() + 50, scale: 0.94 }, { autoAlpha: 1, y: ry(i), scale: 1, duration: 0.8, ease: "expo.out" }, T(3.3) + i * 0.13).call(() => fx.pluck(10 + i, 0.6), undefined, T(3.3) + i * 0.13);
      });
      tl.to(res[0], { scale: 0.96, duration: 0.14, ease: "power2.out" }, T(4.6))
        .to(res[0], { scale: 1, boxShadow: "0 0 0 3px var(--accent)", duration: 0.45, ease: "back.out(2.5)" }, T(4.6) + 0.14)
        .call(() => fx.tick(1.2), undefined, T(4.6));
      cap(0, 0.4, 5.5);

      /* 1 · Se è lento, se ne va: una finestra del browser che carica un pezzo alla volta, sempre in caricamento */
      const chrome = one("[data-chrome]");
      const bands = $("[data-band]");
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
        .call(() => (fx.whoosh(0.5, false, 0.8), fx.riser(U(6.5))), undefined, U(5.5))
        .fromTo(chrome, { autoAlpha: 0, y: 140 }, { autoAlpha: 1, y: 0, duration: 1.3, ease: "expo.out" }, U(5.7))
        .set(cam, { scale: 1 }, U(5.7));
      // un pezzo alla volta, a scatti, a intervalli irregolari; l'ultimo non arriva mai
      [7.0, 8.2, 9.0, 10.2].forEach((b, i) => {
        tl.set(bands[i], { autoAlpha: 0 }, U(b)).call(() => fx.tick(0.7 + i * 0.08), undefined, U(b));
      });
      {
        const o = { n: 0 };
        tl.fromTo(o, { n: 0 }, { n: 7, duration: U(4.6), ease: "none", onUpdate: () => void (cnt.textContent = num(o.n)) }, U(5.9));
      }
      // il cliente non aspetta: dalla tua attività passa al concorrente, che si apre subito
      const url = one("[data-url]");
      const tt3 = one("[data-tt3]");
      const comp = one("[data-comp]");
      const bp = one("[data-bp]");
      const bpPaths = $("[data-bp] svg *");
      bpPaths.forEach((x) => x.setAttribute("pathLength", "1"));
      gsap.set(bpPaths, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(tt3, { autoAlpha: 0 });
      const me = c.find.me[1];
      const rival = c.find.rival[1];
      const L = U(10.6);
      eraseTo(tl, url, me, L, 0.3);
      typeTo(tl, url, rival, L + 0.35, 0.55, 2);
      tl.to(tt1, { autoAlpha: 0, duration: 0.1 }, L + 0.9)
        .fromTo(tt3, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, L + 0.9)
        .call(() => (cnt.textContent = num(0.4)), undefined, L + 0.95)
        .set([spin, stop], { autoAlpha: 0 }, L + 0.95)
        .set([fav, rl], { autoAlpha: 1 }, L + 0.95)
        .fromTo(comp, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" }, L + 0.95)
        .call(() => fx.pluck(1, 0.8, 0.5), undefined, L + 0.95);
      capAt(1, T(5.6), U(14.4));

      /* 2 · Lo ricostruiamo per aprirlo in 0,8 secondi: stesso indirizzo, la pagina si ridisegna e poi si apre tutta insieme */
      const at2 = T(9.3);
      const R = U(14.4);
      eraseTo(tl, url, rival, R, 0.3);
      typeTo(tl, url, me, R + 0.35, 0.55, 3);
      tl.to(tt3, { autoAlpha: 0, duration: 0.1 }, R + 0.9)
        .fromTo(tt1, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, R + 0.9)
        .set(bands, { autoAlpha: 0 }, R + 0.9)
        .call(() => (cnt.textContent = num(0)), undefined, R + 0.9)
        .set([spin, stop], { autoAlpha: 1 }, R + 0.9)
        .set([fav, rl, ok], { autoAlpha: 0 }, R + 0.9)
        .to(comp, { autoAlpha: 0, y: 30, duration: 0.3, ease: "power2.in" }, R + 0.9)
        .fromTo(bp, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, R + 0.9)
        .to(bpPaths, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut", stagger: 0.035 }, R + 1.05)
        .call(() => fx.riser(at2 - R - 1.0), undefined, R + 1.0);
      {
        const o = { n: 0 };
        tl.fromTo(o, { n: 0 }, { n: 0.8, duration: 0.34, ease: "power1.out", onUpdate: () => void (cnt.textContent = num(o.n)) }, at2)
          .call(() => (fx.chord([0, 2, 4, 5], 1), fx.whoosh(0.35, true, 0.6)), undefined, at2 + 0.38)
          .to(bp, { autoAlpha: 0, duration: 0.12 }, at2 + 0.38)
          .to([spin, stop, tt1], { autoAlpha: 0, duration: 0.12 }, at2 + 0.38)
          .fromTo([fav, rl, tt2], { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2.2)" }, at2 + 0.4)
          .fromTo(ok, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2.4)" }, at2 + 0.42)
          .to(cnt, { color: "var(--accent)", duration: 0.3 }, at2 + 0.4);
      }
      capAt(2, U(14.6), T(11.7));

      /* 3 · Prima lo disegniamo: la camera entra nell'anello, dal fondo emerge la pagina inclinata */
      const wireBits = $("[data-wire] > div");
      tl.call(() => fx.whoosh(0.8, true, 1), undefined, T(11.5))
        .to(chrome, { autoAlpha: 0, y: -50, duration: 0.8, ease: "power3.in" }, T(11.4))
        .fromTo(dev, { autoAlpha: 0, rotationX: 40, y: 160, scale: () => fit(wide)() * 0.7 }, { autoAlpha: 1, rotationX: 0, y: 0, scale: fit(wide), duration: 1.5, ease: "expo.out" }, T(11.9))
        .fromTo(wireBits, { autoAlpha: 0, scale: 0.86, y: 16 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)", stagger: T(0.4) }, T(12.6));
      wireBits.forEach((_, i) => tl.call(() => fx.pluck(i * 2, 0.7, 0.3), undefined, T(12.6) + i * T(0.4)));
      cap(3, 11.9, 15.6);

      /* 4 · Poi lo costruiamo: una linea di luce lo trasforma nel sito vero */
      tl.call(() => fx.riser(T(1.5)), undefined, T(14.1))
        .call(() => (fx.kick(1), fx.whoosh(1, true, 1)), undefined, T(15.6))
        .fromTo(one("[data-wire]"), { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut" }, T(15.6))
        .fromTo(one("[data-scan]"), { top: "0%", autoAlpha: 1 }, { top: "100%", duration: 1.3, ease: "expo.inOut" }, T(15.6))
        .to(one("[data-scan]"), { autoAlpha: 0, duration: 0.2, ease: "power1.out" }, T(15.6) + 1.25)
        .fromTo(one("[data-simg]"), { scale: 1.3 }, { scale: 1, duration: 2.2, ease: "expo.out" }, T(15.8))
        .call(() => fx.chord([2, 4, 7], 0.8), undefined, T(17.6));
      punch(15.6);
      cap(4, 15.8, 18);

      /* 5 · Perfetto su ogni schermo: la pagina ruota e si stringe, e si riordina davvero */
      const shape = (b: number, w: () => number, r: string, turn: number) => {
        tl.call(() => (fx.whoosh(0.6, false, 0.9), fx.tick(1)), undefined, T(b))
          .to(dev, { width: w, scale: fit(w), "--r": r, duration: 1.1, ease: "expo.inOut" }, T(b))
          .to(dev, { rotationY: turn, duration: 0.55, ease: "power2.out" }, T(b))
          .to(dev, { rotationY: 0, duration: 0.8, ease: "power3.inOut" }, T(b) + 0.55);
      };
      shape(18, mid, "34px", -16);
      shape(19.9, phone, "48px", 16);
      tl.call(() => fx.pluck(9, 0.9, 0.6), undefined, T(21.2));
      cap(5, 18.2, 21.8);

      /* 6 · Arrivano i clienti: il telefono si inclina, le notifiche scendono dall'alto */
      const ns = $("[data-n]");
      tl.to(dev, { rotationX: 10, rotationY: -14, duration: 1.4, ease: "sine.inOut" }, T(21.6));
      ns.forEach((n, i) => {
        const at = T(22.2 + i * 1);
        tl.fromTo(n, { autoAlpha: 0, y: -50, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.4)" }, at).call(() => fx.bell(7 + i * 2, 1), undefined, at);
      });
      cap(6, 21.8, 25.8);

      /* 7 · Online, al sicuro: la barra dell'indirizzo prende il posto del menù, la camera la segue */
      const nav = one("[data-nav]");
      const ub = one("[data-ub]");
      tl.to(ns, { x: 140, autoAlpha: 0, duration: 0.45, stagger: 0.05, ease: "power2.in" }, T(25.4))
        .to(dev, { rotationX: 0, rotationY: 0, duration: 0.9, ease: "expo.inOut" }, T(25.5))
        .to(nav, { autoAlpha: 0, scale: 0.96, duration: 0.3, ease: "power2.in" }, T(25.9))
        .fromTo(ub, { autoAlpha: 0, scaleX: 0.7 }, { autoAlpha: 1, scaleX: 1, duration: 0.6, ease: "back.out(1.6)" }, T(26.2))
        .call(() => fx.whoosh(0.5, true, 0.7), undefined, T(26.2))
        .fromTo(cam, { scale: 1, transformOrigin: aim(() => ub) }, { scale: () => (small() ? 1.15 : 1.6), duration: 1.1, ease: "expo.inOut" }, T(26.4));
      typeTo(tl, one("[data-url]"), c.find.me[1], T(27), T(1.8), 3);
      tl.fromTo(one("[data-load2]"), { scaleX: 0 }, { scaleX: 1, duration: T(1), ease: "power2.inOut" }, T(28.9))
        .to(one("[data-lock1]"), { autoAlpha: 0, scale: 0.6, duration: 0.15, ease: "power2.in" }, T(29.9))
        .fromTo(one("[data-lock2]"), { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2.4)" }, T(29.9))
        .call(() => fx.chord([0, 2, 4, 5], 1), undefined, T(29.9))
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
        .call(() => fx.whoosh(0.6, true, 0.8), undefined, T(31.2))
        .to(dev, { width: mid, scale: fit(mid), "--r": "34px", duration: 0.9, ease: "expo.inOut" }, T(31.2))
        .fromTo(cam, { scale: 1, transformOrigin: aim(() => (small() ? dev : ttl)) }, { scale: () => (small() ? 1.15 : 1.5), duration: 1, ease: "expo.inOut" }, T(33))
        .fromTo($("[data-focus]"), { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, T(34.2))
        .call(() => fx.tick(1.3), undefined, T(34.2))
        .fromTo($("[data-sel]"), { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, T(34.8))
        .to($("[data-sel]"), { autoAlpha: 0, duration: 0.2, ease: "power1.out" }, T(35.8));
      eraseTo(tl, l2, oldT, T(35.8), 0.45);
      typeTo(tl, l2, c.title[1], T(36.8), T(2.2), 0);
      tl.to($("[data-focus]"), { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, T(39.2))
        .fromTo(saved, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, T(39.2))
        .fromTo(one("[data-saved-t]"), { y: 70, scale: 0.9, filter: "blur(10px)" }, { y: 0, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "expo.out" }, T(39.2) + 0.1)
        .call(() => fx.chord([0, 2, 4, 5], 1), undefined, T(39.2))
        .to(cam, { scale: 1, duration: 1, ease: "expo.inOut" }, T(39.6));
      cap(8, 31.4, 40.8);

      /* 9 · Tutto compreso: ogni cosa nasce come icona che si disegna al centro, diventa card e si unisce al cerchio */
      const gs = $("[data-g]");
      const orb = { a: -0.5 };
      const rr = gs.map(() => ({ r: 0, v: 0 }));
      const place = () =>
        gs.forEach((g, i) => {
          const { r, v } = rr[i];
          const h = g.offsetHeight;
          const w = g.offsetWidth;
          const cx = ((w - h) / 2) * (1 - v);
          const clip = `inset(0px ${(w - h) * (1 - v)}px 0px 0px round ${h * (0.3 + 0.2 * v)}px)`;
          if (small()) gsap.set(g, { x: cx, y: (i - 2.55) * 72 * r, clipPath: clip });
          else {
            const t = orb.a + (i / gs.length) * Math.PI * 2;
            gsap.set(g, { x: cx + Math.cos(t) * Math.min(cam.offsetWidth * 0.37, 540) * r, y: Math.sin(t) * Math.min(cam.offsetHeight * 0.3, 210) * r, clipPath: clip });
          }
        });
      const draws = gs.map((g) => {
        const ps = Array.from(g.querySelectorAll<SVGElement>("svg *"));
        ps.forEach((x) => x.setAttribute("pathLength", "1"));
        gsap.set(ps, { strokeDasharray: 1, strokeDashoffset: 1 });
        return ps;
      });
      place();
      tl.to(saved, { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, T(40.6))
        .call(() => (fx.kick(1), fx.whoosh(0.8, false, 1)), undefined, T(40.8))
        .to(dev, { scale: () => fit(mid)() * 0.22, rotationY: 30, autoAlpha: 0, duration: 0.9, ease: "power3.in" }, T(40.6))
        .fromTo(orb, { a: -0.5 }, { a: 0.7, duration: T(7.4), ease: "sine.inOut", onUpdate: place }, T(41.2));
      gs.forEach((g, i) => {
        const at = T(41.2 + i * 0.62);
        tl.fromTo(g, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.28, ease: "expo.out" }, at)
          .fromTo(g.querySelector("[data-tile]"), { rotationY: -34, rotationX: 16 }, { rotationY: 34, rotationX: -14, duration: Math.max(1, T(49) - at), ease: "sine.inOut" }, at)
          .to(draws[i], { strokeDashoffset: 0, duration: 0.3, ease: "power2.out", stagger: 0.03 }, at + 0.05)
          .to(rr[i], { v: 1, duration: 0.45, ease: "expo.inOut", onUpdate: place }, at + 0.4)
          .to(rr[i], { r: 1, duration: 0.8, ease: "expo.out", onUpdate: place }, at + 0.45)
          .call(() => fx.pluck(i + 2, 0.9, 0.5), undefined, at + 0.05)
          .call(() => fx.tick(1.2), undefined, at + 0.4);
      });
      tl.call(() => fx.chord([0, 2, 4, 5], 1), undefined, T(48.6));
      punch(48.6, 1.015);
      cap(9, 41, 49);

      /* 10 · Senza sorprese */
      const ps = $("[data-pr]");
      const pp = (i: number) => {
        const w = ps[i].offsetWidth;
        const h = ps[i].offsetHeight;
        return small() ? { x: (i % 2 ? 0.5 : -0.5) * (w + 12), y: (i < 2 ? -0.5 : 0.5) * (h + 12) } : { x: (i - 1.5) * (w + 16), y: 0 };
      };
      const pdraw = ps.map((p) => {
        const sh = Array.from(p.querySelectorAll<SVGElement>("svg *"));
        sh.forEach((x) => x.setAttribute("pathLength", "1"));
        gsap.set(sh, { strokeDasharray: 1, strokeDashoffset: 1 });
        return sh;
      });
      tl.to(rr, { r: 0, duration: 0.7, ease: "power3.in", onUpdate: place }, T(49.2))
        .to(gs, { autoAlpha: 0, scale: 0.7, duration: 0.5, ease: "power2.in" }, T(49.3))
        .call(() => fx.whoosh(0.5, true, 0.7), undefined, T(49.8));
      ps.forEach((p, i) => {
        const at = T(49.8 + i * 0.75);
        const l = p.querySelector("[data-pl]");
        tl.fromTo(p, { autoAlpha: 0, scale: 0.9, x: () => pp(i).x, y: () => pp(i).y + 90 }, { autoAlpha: 1, scale: 1, x: () => pp(i).x, y: () => pp(i).y, duration: 0.9, ease: "expo.out" }, at)
          .to(pdraw[i], { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut", stagger: 0.12 }, at + 0.25)
          .fromTo(l, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "expo.out" }, at + 0.6)
          .fromTo(p, { rotationX: 0 }, { rotationX: 0, duration: 0.01 }, at)
          .call(() => fx.bell(7 + i * 2, 0.9), undefined, at + 0.25);
      });
      cap(10, 50, 54.6);

      /* chiusura */
      const eg = (() => {
        const e = one("[data-eh]");
        return split(e);
      })();
      tl.to(ps, { autoAlpha: 0, y: "-=30", filter: "blur(8px)", duration: 0.45, stagger: 0.04, ease: "power2.in" }, T(54.2))
        .call(() => (fx.kick(1.2), fx.whoosh(0.9, true, 1)), undefined, T(54.8))
        .set(endCard, { autoAlpha: 1 }, T(54.8));
      slam(eg, T(55.0), 0);
      tl.call(() => (fx.chord([0, 2, 4, 7], 1.2)), undefined, T(55.0))
        .to(endCard, { autoAlpha: 0, y: -30, filter: "blur(10px)", duration: 0.5, ease: "power2.in" }, T(55.0) + 1.7)
        .set(one("[data-end2]"), { autoAlpha: 1 }, T(55.0) + 2.1)
        .fromTo(one("[data-logo]"), { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out" }, T(55.0) + 2.1)
        .call(() => fx.chord([0, 2, 4, 7], 1), undefined, T(55.0) + 2.1)
        .fromTo(one("[data-more]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }, T(55.0) + 2.9);
      punch(51.8, 1.03);
      tl.set({}, {}, T(55.0) + 4);

      /* Il tempo del video lo muoviamo noi, un fotogramma alla volta e con un passo massimo:
         se il dispositivo rallenta (pagina che carica, telefono sotto sforzo) il video rallenta con lui invece di saltare le scene. */
      const drive = (_t: number, dt: number) => {
        if (!flags.current.playing) return;
        const next = Math.min(tl.duration(), tl.time() + Math.min(dt, 34) / 1000);
        tl.time(next);
        fx.sync(next, true);
        if (next >= tl.duration()) {
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
        if (run !== f.playing) fx.duck(!run);
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
    fx.reset();
    fx.duck(false);
    tl.time(0);
  };

  const center = "absolute left-1/2 top-0";
  return (
    <section ref={root} className="relative h-svh min-h-[560px]" aria-label={title} style={{ "--ft": "84px", "--fb": "16px" } as CSSProperties}>
      <h1 className="sr-only">{title}</h1>
      <div data-frame className="cine-film cine-acr absolute overflow-hidden rounded-[34px] shadow-[inset_0_0_0_1px_var(--hair-strong)] max-md:left-2 max-md:right-2 md:left-4 md:right-4" style={{ top: "var(--ft)", bottom: "var(--fb)" }}>
        {c.cap.map((t, i) => (
          <p key={t} data-cap={i} className={CAP} style={HID}>
            <Kw text={t} />
          </p>
        ))}
        <div data-cam className="absolute inset-0 will-change-transform">
          <div className="absolute inset-x-0 top-[58%] h-0">
            {/* ricerca e risultati */}
            <Bead as="div" data-it data-pill radius={42} className={`cine-fg ${center} flex h-[clamp(60px,10svh,84px)] w-[min(860px,88vw)] items-center gap-4 px-[clamp(20px,3vw,34px)] text-[clamp(18px,2.6vw,30px)]`} style={HID}>
              <Search size={26} strokeWidth={1.8} className="cine-fg2 shrink-0" />
              <span data-typed className="tracking-[-0.015em]" />
              <span className="h-[1.1em] w-[2px] animate-pulse bg-[var(--label-primary)]" />
            </Bead>
            {[c.find.me, ...c.find.others].map(([t, u], i) => (
              <Bead as="div" key={u} data-it data-res radius={34} className={`cine-fg ${center} flex h-[clamp(56px,9svh,74px)] w-[min(860px,88vw)] items-center justify-between gap-4 px-[clamp(20px,3vw,34px)]`} style={HID}>
                <span className={`text-[clamp(17px,2.2vw,26px)] tracking-[-0.02em] ${i ? "cine-fg2" : "font-semibold"}`}>{t}</span>
                <span className="cine-fg2 text-[clamp(13px,1.5vw,17px)]">{u}</span>
              </Bead>
            ))}
            {/* il sito, con dentro la barra dell'indirizzo, le notifiche e la conferma */}
            <div data-it data-dev className={`${center} overflow-hidden bg-[#0d1115] shadow-[0_50px_140px_-40px_rgba(0,0,0,.6)]`} style={{ ...HID, width: 1100, height: 640, borderRadius: "var(--r)" }}>
              <MiniSite c={c}>
                <div data-ub className="absolute left-[var(--i)] right-[var(--i)] top-[var(--i)] z-20 flex h-[clamp(44px,6cqw,60px)] items-center gap-2.5 overflow-hidden bg-[#f3f4f6] px-[clamp(14px,2.4cqw,22px)] text-[clamp(14px,2cqw,18px)] text-[#111316]" style={{ ...HID, borderRadius: R_IN }}>
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
                  <div key={b} data-n className="absolute left-[var(--i)] right-[var(--i)] z-20 flex h-[66px] items-center gap-3 bg-[#f3f4f6] p-[10px] text-[#111316] shadow-[0_10px_30px_-12px_rgba(0,0,0,.5)]" style={{ ...HID, top: `calc(var(--i) + ${i * 74}px)`, borderRadius: R_IN }}>
                    <span className="flex aspect-square h-full shrink-0 items-center justify-center bg-[var(--accent)] text-white" style={{ borderRadius: "calc(var(--r) - var(--i) - 10px)" }}>
                      <Bell size={20} strokeWidth={2} />
                    </span>
                    <span className="block min-w-0 leading-tight">
                      <span className="block truncate text-[15px] font-semibold tracking-[-0.01em]">{t}</span>
                      <span className="block truncate text-[13px] text-[#5b5f66]">{b}</span>
                    </span>
                  </div>
                ))}
                <div data-saved className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-xl" style={{ ...HID, background: "rgba(13,17,21,.42)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)" }}>
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
            <div data-it data-chrome className={`${center} w-[min(92vw,calc(min(66svh,520px)*1.58))] aspect-[1.58] max-md:aspect-[.82] flex flex-col overflow-hidden rounded-[18px] shadow-[0_40px_120px_-40px_rgba(0,0,0,.5),inset_0_0_0_1px_var(--hair-strong)]`} style={{ ...HID, ["--r" as string]: "20px" }}>
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
                    <span data-tt3 className="absolute inset-0 block truncate">{c.find.rival[0]}</span>
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
                  <span data-url className="truncate">{c.find.me[1]}</span>
                </span>
                <EllipsisVertical size={17} strokeWidth={1.7} className="cine-fg2" />
              </div>
              <div className="relative min-h-0 flex-1 bg-[var(--bg-surface)]">
                <div className="absolute inset-0">
                  <MiniSite c={c} />
                </div>
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} data-band className="absolute inset-x-0 bg-[var(--bg-surface)]" style={{ top: `${(i * 100) / 7}%`, height: "calc(100% / 7 + 1px)" }} />
                ))}
                <div data-comp className="absolute inset-0 flex flex-col overflow-hidden bg-[#f3efe6]" style={HID}>
                  <span className="mx-4 mt-3 flex h-8 shrink-0 items-center gap-3 rounded-full bg-white px-4 shadow-[0_1px_0_rgba(0,0,0,.06)]">
                    <span className="h-3 w-3 rounded-full bg-[#e8743b]" />
                    <span className="h-2 w-10 rounded-full bg-[#c9c3b6]" />
                    <span className="h-2 w-10 rounded-full bg-[#c9c3b6]" />
                    <span className="ml-auto h-4 w-14 rounded-full bg-[#e8743b]" />
                  </span>
                  <span className="mx-4 mt-4 grid min-h-0 flex-1 grid-cols-[1.1fr_1fr] gap-4 pb-14">
                    <span className="flex flex-col justify-center gap-2.5">
                      <span className="h-4 w-[88%] rounded-full bg-[#2a2723]" />
                      <span className="h-4 w-[62%] rounded-full bg-[#2a2723]" />
                      <span className="mt-1 h-2 w-[80%] rounded-full bg-[#c9c3b6]" />
                      <span className="h-2 w-[70%] rounded-full bg-[#c9c3b6]" />
                      <span className="mt-2 h-7 w-24 rounded-full bg-[#e8743b]" />
                    </span>
                    <span className="rounded-2xl" style={{ background: "linear-gradient(145deg,#f6b17a,#e8743b 55%,#b9461c)" }} />
                  </span>
                </div>
                <div data-bp className="absolute inset-0 bg-[var(--bg-surface)]" style={HID}>
                  <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="h-full w-full text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth={1.4} vectorEffect="non-scaling-stroke" strokeDasharray="none">
                    <rect x="6" y="6" width="148" height="11" rx="4" vectorEffect="non-scaling-stroke" />
                    <rect x="6" y="22" width="148" height="46" rx="5" vectorEffect="non-scaling-stroke" />
                    <path d="M14 34h62" vectorEffect="non-scaling-stroke" />
                    <path d="M14 42h44" vectorEffect="non-scaling-stroke" />
                    <rect x="14" y="52" width="26" height="9" rx="4.5" vectorEffect="non-scaling-stroke" />
                    <rect x="6" y="74" width="46" height="20" rx="4" vectorEffect="non-scaling-stroke" />
                    <rect x="57" y="74" width="46" height="20" rx="4" vectorEffect="non-scaling-stroke" />
                    <rect x="108" y="74" width="46" height="20" rx="4" vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>
                <span className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
                  <Bead as="span" radius={999} className="cine-fg flex h-10 items-center gap-2 px-4">
                    <span data-count className="font-mono text-[15px] tabular-nums">
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
                <Bead as="div" key={t} data-it data-g radius={32} className={`cine-fg ${center} flex h-[clamp(66px,10svh,88px)] max-md:h-[58px] items-center whitespace-nowrap pr-[clamp(22px,2.6vw,32px)] text-[clamp(17px,2.1vw,25px)] font-medium tracking-[-0.015em] [--gp:clamp(18px,2.2vw,26px)]`} style={HID}>
                  <span className="flex aspect-square h-full shrink-0 items-center justify-center [perspective:220px]">
                    <span data-tile className="relative block h-[72%] w-[72%]" style={{ transformStyle: "preserve-3d" }}>
                      {[6, 5, 4, 3, 2, 1].map((z) => (
                        <span key={z} className="absolute inset-0 rounded-[30%]" style={{ transform: `translateZ(${-z * 1.7}px)`, background: `color-mix(in srgb, #1e56c8 ${70 + z * 5}%, #07225f)` }} />
                      ))}
                      <span className="absolute inset-0 flex items-center justify-center rounded-[30%] text-white" style={{ transformStyle: "preserve-3d", background: "linear-gradient(150deg,#b4e8ff 0%,#52b0f4 42%,#2f6fe0 100%)", boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.85), inset 0 -3px 6px rgba(10,50,140,.4)" }}>
                        <Icon size={26} strokeWidth={2.1} style={{ transform: "translateZ(7px)", filter: "drop-shadow(0 3px 2px rgba(10,50,140,.55))" }} />
                      </span>
                    </span>
                  </span>
                  <span className="pl-1">{t}</span>
                </Bead>
              );
            })}
            {/* cosa garantisco */}
            {c.promise.items.map(([t], i) => (
              <Bead as="div" key={t} data-it data-pr radius={30} className={`cine-fg ${center} flex aspect-[.86] w-[clamp(140px,19vw,250px)] flex-col items-center justify-center gap-4 px-3`} style={HID}>
                <span className="relative block aspect-square w-[52%] text-[var(--accent)]">
                  <PromiseArt i={i} />
                </span>
                <span className="text-center text-[clamp(14px,1.6vw,21px)] font-medium leading-tight tracking-[-0.015em]">{t}</span>
                <span data-pl className="absolute bottom-3 h-[3px] w-[34%] origin-left rounded-full" style={{ background: "linear-gradient(90deg,#5ec4ff,#2f6fe0)" }} />
              </Bead>
            ))}
          </div>
        </div>
      <div data-end className="absolute inset-0 flex flex-col items-center justify-center" style={HID}>
        <p data-eh className="mx-auto max-w-[14ch] px-6 text-center text-[clamp(38px,6.6vw,108px)] font-medium leading-[1.04] tracking-[-0.05em] cine-fg">
          <Kw text={c.end.t} />
        </p>
      </div>
      <div data-end2 className="absolute inset-0 flex flex-col items-center justify-center gap-14" style={HID}>
        <div data-logo className="[--logo-size:clamp(46px,10.5vw,136px)]" style={HID}>
          <Wordmark />
        </div>
        <span data-more className="cine-fg flex flex-col items-center gap-1 text-[clamp(24px,3.4vw,40px)]" style={{ ...HID, fontFamily: "var(--font-logo), var(--font-sans)", fontWeight: 400, fontSynthesis: "none" }}>
          {c.end.more}
          <ArrowDown size={18} strokeWidth={1.8} className="animate-bounce" />
        </span>
      </div>
      {!prefersReducedMotion() && (
        <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center px-5">
          <Bead as="div" radius={24} className="cine-fg relative flex h-12 items-center gap-1 overflow-hidden px-1.5">
            <button type="button" onClick={ended ? replay : toggle} aria-label={ended ? c.ctl.replay : playing ? c.ctl.pause : c.ctl.play} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--hover)]">
              {ended ? <RotateCcw size={18} strokeWidth={1.9} /> : playing ? <Pause size={18} strokeWidth={1.9} /> : <Play size={18} strokeWidth={1.9} />}
            </button>
            <span className="relative mx-1 block h-[3px] w-[clamp(96px,22vw,200px)] overflow-hidden rounded-full bg-[var(--hair-strong)]">
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
