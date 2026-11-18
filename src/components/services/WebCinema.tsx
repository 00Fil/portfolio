"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ArrowDown, ArrowUpRight, Bell, Check, Lock, Menu, Pause, Play, RotateCcw, Search, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { prefersReducedMotion } from "@/lib/env";
import { onIntroLift } from "@/lib/intro";
import { play as sfx, soundOn, onSound, setSound, type Sfx } from "@/lib/sound";
import { Bead } from "@/components/glass/Bead";
import { GradientText } from "@/components/ui/GradientText";
import { getCinema, type Cinema } from "@/content/cinema";

gsap.registerPlugin(SplitText, useGSAP);

/* Il video del servizio: una cornice con angoli arrotondati che sta sempre tra la barra in alto e quella in basso,
   dentro scene a tutto campo con fotografie, titoli grandi e le interfacce che facciamo davvero. */

const INK = "#0b0e12";
const ACC = "#8fd8ff";
const BLUES = ["#5ec4ff", "#b9e6ff", "#2f8fe0", "#8fd8ff"];
const DISP: CSSProperties = { fontFamily: "var(--font-anton), Impact, sans-serif", textTransform: "uppercase", letterSpacing: "0.005em" };
const cin = (n: string) => `/visual/cinema/${n}.webp`;
const HID = { visibility: "hidden" as const, opacity: 0 };
type Q = (s: string) => HTMLElement[];

function Kw({ text }: { text: string }) {
  return (
    <>
      {text.split("*").map((p, i) =>
        i % 2 ? (
          <span key={i} data-kw className="inline-block">
            <GradientText colors={BLUES} animationSpeed={8} variant="flow" glow={1}>
              {p}
            </GradientText>
          </span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

const Ph = ({ n, pos = "50% 50%", ...r }: { n: string; pos?: string; [k: string]: unknown }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={cin(n)} alt="" draggable={false} decoding="async" className="absolute inset-0 block h-full w-full object-cover will-change-transform" style={{ objectPosition: pos }} {...r} />
);
const SHADE = "linear-gradient(180deg, rgba(8,12,16,.45) 0%, rgba(8,12,16,.05) 30%, rgba(8,12,16,.25) 55%, rgba(8,12,16,.92) 100%)";

/** Titolo della scena: grande, in basso a sinistra, sale dalla sua maschera. */
const Cap = ({ t }: { t: string }) => (
  <p data-cap className="absolute bottom-[9cqmin] left-[6cqw] right-[6cqw] text-white" style={{ ...DISP, fontSize: "min(9cqw, 11.5cqh)", lineHeight: 1 }}>
    <Kw text={t.toUpperCase()} />
  </p>
);

/* ───────────── Il sito d'esempio: superfici piene, angoli interni = esterno − margine ───────────── */

const SOLID = "bg-[#151a21] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08),inset_0_1px_0_rgba(255,255,255,.14)]";
const R_IN = "calc(var(--r) - var(--i))";
const R_IN2 = "calc(var(--r) - var(--i) - 6px)";

function MiniSite({ c, r = 34, i = 14, nr = 0, children }: { c: Cinema; r?: number; i?: number; nr?: number; children?: ReactNode }) {
  return (
    <div data-site className="@container relative h-full w-full overflow-hidden bg-[#0d1115] text-white" style={{ "--r": `${r}px`, "--i": `${i}px`, "--nr": `${nr}px` } as CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-simg src={cin("lavoro")} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,12,16,.6) 0%, rgba(8,12,16,.1) 28%, rgba(8,12,16,.3) 50%, rgba(8,12,16,.92) 100%)" }} />
      <div data-nav className={`absolute left-[var(--i)] right-[calc(var(--i)+var(--nr))] top-[var(--i)] flex h-[clamp(30px,7cqw,58px)] items-center justify-between pl-[clamp(10px,2.4cqw,22px)] pr-[5px] ${SOLID}`} style={{ borderRadius: R_IN }}>
        <span className="flex items-center gap-[1.4cqw] text-[clamp(10px,2.4cqw,19px)] font-semibold tracking-[-0.01em]">
          <span className="h-[clamp(5px,1cqw,7px)] w-[clamp(5px,1cqw,7px)] rounded-full" style={{ background: ACC }} />
          Marchio
        </span>
        <span className="flex h-full items-center gap-[clamp(10px,3cqw,28px)] py-[5px] text-[clamp(9px,1.7cqw,15px)]">
          <span className="hidden gap-[clamp(10px,3cqw,28px)] @min-[520px]:flex">
            {c.site.nav.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
          <span className="hidden h-full items-center bg-white px-[clamp(10px,2.4cqw,20px)] font-semibold text-black @min-[520px]:flex" style={{ borderRadius: R_IN2 }}>
            {c.site.book}
          </span>
          <span className="flex aspect-square h-full items-center justify-center bg-white text-black @min-[520px]:hidden" style={{ borderRadius: R_IN2 }}>
            <Menu size={14} strokeWidth={2} />
          </span>
        </span>
      </div>
      <div data-title className="absolute bottom-[clamp(44px,10cqw,100px)] left-[calc(var(--i)+2cqw)] text-white" style={{ ...DISP, fontSize: "clamp(18px,10.5cqw,120px)", lineHeight: 0.98 }}>
        <span data-focus className="pointer-events-none absolute -inset-x-[0.14em] -inset-y-[0.08em] rounded-[0.16em] border-2 border-[#8fd8ff]" style={HID} />
        <span data-sel className="pointer-events-none absolute -inset-x-[0.08em] bottom-[-0.04em] top-[50%] origin-left rounded-[0.1em] bg-[#8fd8ff]/35" style={HID} />
        <span className="relative block">{c.site.title[0]}</span>
        <span className="relative block whitespace-nowrap">
          <span data-l2>{c.site.title[1].replace(".", "")}</span>
          <span data-caret className="ml-[0.04em] inline-block h-[0.8em] w-[0.05em] translate-y-[0.06em] bg-[#8fd8ff] align-baseline" style={HID} />
          <span style={{ color: ACC }}>.</span>
        </span>
      </div>
      <div className={`absolute right-[calc(var(--i)+2cqw)] top-[clamp(52px,13cqw,124px)] hidden aspect-square w-[clamp(54px,12cqw,116px)] items-center justify-center rounded-full @min-[400px]:flex ${SOLID}`}>
        <svg viewBox="0 0 100 100" className="absolute inset-0" aria-hidden>
          <defs>
            <path id="wcc" d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0" />
          </defs>
          <text fontSize="9.4" fontWeight="600" letterSpacing="1.8" fill="#fff">
            <textPath href="#wcc">{c.site.badge}</textPath>
          </text>
        </svg>
        <span className="flex h-[38%] w-[38%] items-center justify-center rounded-full bg-white text-black">
          <ArrowUpRight size={14} strokeWidth={2} />
        </span>
      </div>
      <div className="absolute bottom-[var(--i)] left-[var(--i)] hidden gap-[6px] text-[clamp(9px,1.6cqw,14px)] @min-[300px]:flex">
        {[c.site.stars, c.site.since].map((s) => (
          <span key={s} className={`flex h-[clamp(24px,4.6cqw,42px)] items-center px-[clamp(9px,2cqw,18px)] ${SOLID}`} style={{ borderRadius: R_IN }}>
            {s}
          </span>
        ))}
      </div>
      {children}
    </div>
  );
}

/* ───────────── Il video ───────────── */

export function WebCinema({ title }: { title: string }) {
  const locale = useLocale() as Locale;
  const c = getCinema(locale);
  const root = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const ring = useRef<SVGCircleElement>(null);
  const flags = useRef({ visible: false, paused: false, ended: false, lifted: false, playing: false });
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [snd, setSnd] = useState(false);
  const comma = locale === "en" ? "." : ",";

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
      const S = $("[data-s]");
      const endS = S[S.length - 1];
      if (prefersReducedMotion()) {
        gsap.set(endS, { autoAlpha: 1 });
        return;
      }
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.inOut" },
        onUpdate: () => {
          ring.current?.setAttribute("stroke-dashoffset", String(100 - tl.progress() * 100));
        },
      });
      tlRef.current = tl;
      const snd = (n: Sfx, at: number, p = 1) => tl.call(() => sfx(n, p), undefined, at);
      const s$ = (i: number) => gsap.utils.selector(S[i]) as Q;

      /* titoli: le parole salgono dalla maschera, la parola chiave arriva dal basso e si accende */
      const caption = (i: number, at: number) => {
        const p = S[i].querySelector<HTMLElement>("[data-cap]");
        if (!p) return;
        SplitText.create(p, { type: "words", mask: "words", wordsClass: "cw", ignore: "[data-kw]" });
        p.querySelectorAll<HTMLElement>(".cw, [data-kw]").forEach((w, j) => {
          const kw = w.hasAttribute("data-kw");
          tl.fromTo(w, kw ? { y: "0.5em", autoAlpha: 0 } : { yPercent: 110 }, kw ? { y: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out" } : { yPercent: 0, duration: 0.85, ease: "expo.out" }, at + j * 0.06);
        });
      };
      const show = (i: number, at: number) => tl.set(S[i], { autoAlpha: 1, zIndex: i + 1 }, at);
      const hide = (i: number, at: number) => tl.set(S[i], { autoAlpha: 0 }, at);

      /* 0 · Un cliente ti cerca: la foto si apre, la barra di ricerca si scrive */
      let a = 0;
      {
        const q = s$(0);
        show(0, a);
        tl.fromTo(S[0], { clipPath: "inset(9% 9% 9% 9% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.5, ease: "expo.inOut" }, a)
          .fromTo(q("img")[0], { scale: 1.35 }, { scale: 1.06, duration: 3.6, ease: "expo.out" }, a)
          .fromTo(q("[data-search]"), { autoAlpha: 0, y: 30, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: "expo.out" }, a + 0.7);
        snd("open", a + 0.1);
        const typed = q("[data-typed]")[0];
        const o = { n: 0 };
        const txt = c.find.typed;
        tl.fromTo(o, { n: 0 }, { n: txt.length, duration: 1.3, ease: "sine.inOut", onUpdate: () => void (typed.textContent = txt.slice(0, Math.round(o.n))) }, a + 1.2);
        for (let k = 0; k < 7; k++) snd("key", a + 1.25 + k * 0.17, 0.9 + (k % 3) * 0.08);
        caption(0, a + 0.9);
      }
      /* 1 · Se è lento, se ne va: la scena sale a tendina, un contatore enorme che non finisce mai */
      a = 3.4;
      {
        const q = s$(1);
        show(1, a);
        tl.fromTo(S[1], { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power4.inOut" }, a)
          .to(s$(0)("img")[0], { scale: 1.2, yPercent: -6, duration: 1, ease: "power4.inOut" }, a);
        hide(0, a + 1.05);
        snd("whoosh", a);
        const cnt = q("[data-count]")[0];
        const o = { n: 0 };
        tl.fromTo(o, { n: 0 }, { n: 8.4, duration: 2.6, ease: "sine.in", onUpdate: () => void (cnt.textContent = o.n.toFixed(1).replace(".", comma) + " S") }, a + 0.5)
          .fromTo(q("[data-line]"), { scaleX: 0 }, { scaleX: 0.32, duration: 2.6, ease: "power4.out" }, a + 0.5)
          .fromTo(cnt, { scale: 0.92 }, { scale: 1, duration: 2.6, ease: "sine.out" }, a + 0.5);
        for (let k = 0; k < 5; k++) snd("tick", a + 0.7 + k * 0.48, 0.8 + k * 0.04);
        caption(1, a + 0.6);
      }
      /* 2 · Il tuo si apre in 0,8 secondi: un cerchio di luce si apre dal centro */
      a = 6.7;
      {
        const q = s$(2);
        show(2, a);
        tl.fromTo(S[2], { clipPath: "circle(0% at 50% 45%)" }, { clipPath: "circle(75% at 50% 45%)", duration: 1.1, ease: "expo.inOut" }, a)
          .fromTo(q("[data-big]"), { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2, ease: "expo.out" }, a + 0.35)
          .fromTo(q("[data-wave]"), { scale: 0.4, autoAlpha: 0.7 }, { scale: 2.4, autoAlpha: 0, duration: 1.8, stagger: 0.3, ease: "expo.out" }, a + 0.35);
        hide(1, a + 1.15);
        snd("success", a + 0.3);
        caption(2, a + 0.7);
      }
      /* 3 · Prima lo disegniamo: la foto dello schizzo scorre dentro, le linee del progetto si tracciano sopra */
      a = 9.4;
      {
        const q = s$(3);
        show(3, a);
        tl.fromTo(S[3], { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power4.inOut" }, a)
          .to(S[2], { xPercent: -14, duration: 1.1, ease: "power4.inOut" }, a)
          .fromTo(q("img")[0], { scale: 1.3, xPercent: 6 }, { scale: 1.05, xPercent: 0, duration: 3.2, ease: "expo.out" }, a)
          .fromTo(q("[data-bp]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, stagger: 0.16, ease: "power2.inOut" }, a + 0.8);
        hide(2, a + 1.15);
        snd("whoosh", a, 1.1);
        for (let k = 0; k < 5; k++) snd("tick", a + 0.9 + k * 0.2, 1 + k * 0.06);
        caption(3, a + 0.6);
      }
      /* 4 · Poi lo costruiamo: una linea di luce scende e lascia il sito vero */
      a = 12.4;
      {
        const q = s$(4);
        show(4, a);
        tl.fromTo(S[4], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, a)
          .fromTo(q("[data-win]"), { clipPath: "inset(0% 0% 100% 0% round 24px)", y: 30 }, { clipPath: "inset(0% 0% 0% 0% round 24px)", y: 0, duration: 1.3, ease: "expo.inOut" }, a)
          .fromTo(q("[data-scan]"), { top: "0%", autoAlpha: 1 }, { top: "100%", duration: 1.3, ease: "expo.inOut" }, a)
          .to(q("[data-scan]"), { autoAlpha: 0, duration: 0.2, ease: "power1.out" }, a + 1.25)
          .fromTo(q("[data-simg]"), { scale: 1.3 }, { scale: 1.02, duration: 2.6, ease: "expo.out" }, a + 0.1)
          .fromTo(q("[data-nav]"), { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out" }, a + 0.6);
        hide(3, a + 1.35);
        snd("open", a + 0.2);
        caption(4, a + 0.9);
      }
      /* 5 · Perfetto su ogni schermo: lo stesso sito in tre schermi, ognuno si riordina da solo */
      a = 15.1;
      {
        const q = s$(5);
        show(5, a);
        tl.fromTo(S[5], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, a)
          .to(S[4], { scale: 0.86, autoAlpha: 0, duration: 0.7, ease: "power3.in" }, a)
          .fromTo(q("[data-dv]"), { autoAlpha: 0, y: 80, scale: 0.88 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, stagger: 0.16, ease: "expo.out" }, a + 0.3)
          .to(q("[data-dv]"), { y: (i: number) => (i % 2 ? -10 : 8), duration: 2, ease: "sine.inOut" }, a + 1.4);
        hide(4, a + 0.75);
        [0, 1, 2].forEach((k) => snd("toggle", a + 0.35 + k * 0.16, 0.9 + k * 0.12));
        caption(5, a + 0.6);
      }
      /* 6 · Arrivano i clienti: la scena sale, le notifiche cadono una sull'altra */
      a = 18.1;
      {
        const q = s$(6);
        show(6, a);
        tl.fromTo(S[6], { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power4.inOut" }, a)
          .fromTo(q("img")[0], { scale: 1.3 }, { scale: 1.05, duration: 3, ease: "expo.out" }, a);
        hide(5, a + 1.05);
        snd("whoosh", a);
        const ns = q("[data-n]");
        const step = () => (ns[0].offsetHeight + 10);
        ns.forEach((n, i) => {
          const at = a + 0.8 + i * 0.55;
          tl.fromTo(n, { autoAlpha: 0, y: -40, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.5)" }, at);
          for (let j = 0; j < i; j++) tl.to(ns[j], { y: () => step() * (i - j), scale: 1 - (i - j) * 0.04, duration: 0.6, ease: "expo.out" }, at);
          snd("notify", at, 1 + i * 0.08);
        });
        caption(6, a + 0.6);
      }
      /* 7 · Online, al sicuro: si apre un cerchio, la barra dell'indirizzo, il lucchetto che diventa scudo */
      a = 21.1;
      {
        const q = s$(7);
        show(7, a);
        tl.fromTo(S[7], { clipPath: "circle(0% at 50% 100%)" }, { clipPath: "circle(140% at 50% 100%)", duration: 1.2, ease: "expo.inOut" }, a)
          .fromTo(q("[data-win]"), { scale: 0.9, y: 40 }, { scale: 1, y: 0, duration: 1.4, ease: "expo.out" }, a)
          .fromTo(q("[data-ub]"), { autoAlpha: 0, y: 24, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "expo.out" }, a + 0.5);
        hide(6, a + 1.25);
        snd("whoosh", a, 0.9);
        const u = q("[data-url]")[0];
        const o = { n: 0 };
        const txt = c.find.me[1];
        tl.fromTo(o, { n: 0 }, { n: txt.length, duration: 0.9, ease: "sine.inOut", onUpdate: () => void (u.textContent = txt.slice(0, Math.round(o.n))) }, a + 0.9);
        for (let k = 0; k < 5; k++) snd("key", a + 0.95 + k * 0.17, 1 + (k % 2) * 0.1);
        tl.fromTo(q("[data-load2]"), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.inOut" }, a + 1.85)
          .to(q("[data-lock1]"), { autoAlpha: 0, scale: 0.5, duration: 0.2, ease: "power2.in" }, a + 2.4)
          .fromTo(q("[data-lock2]"), { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(2.4)" }, a + 2.45)
          .fromTo(q("[data-live]"), { autoAlpha: 0, x: 10, scale: 0.9 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.6, ease: "back.out(1.8)" }, a + 2.5);
        snd("success", a + 2.45);
        caption(7, a + 0.6);
      }
      /* 8 · Lo cambi tu: la camera scende sul titolo, si cancella e si riscrive */
      a = 24.2;
      {
        const q = s$(8);
        show(8, a);
        tl.fromTo(S[8], { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "power2.out" }, a);
        hide(7, a + 0.65);
        const site = q("[data-site]")[0];
        tl.fromTo(site, { scale: 1, transformOrigin: "14% 84%" }, { scale: 1.4, duration: 1.2, ease: "expo.inOut" }, a + 0.3)
          .fromTo(q("[data-focus]"), { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, a + 1.3)
          .fromTo(q("[data-sel]"), { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power3.inOut" }, a + 1.7)
          .set(q("[data-sel]"), { autoAlpha: 0 }, a + 2.25);
        snd("click", a + 1.3);
        const l2 = q("[data-l2]")[0];
        const oldT = c.site.title[1].replace(".", "");
        const newT = c.title[1];
        const o = { n: oldT.length };
        tl.fromTo(o, { n: oldT.length }, { n: 0, duration: 0.01 }, a + 2.25)
          .add(() => void 0, a + 2.25)
          .fromTo(o, { n: 0 }, { n: newT.length, duration: 1.1, ease: "sine.inOut", immediateRender: false, onUpdate: () => void (l2.textContent = newT.slice(0, Math.round(o.n))) }, a + 2.3)
          .set(l2, { textContent: "" }, a + 2.26)
          .fromTo(q("[data-caret]"), { autoAlpha: 1 }, { autoAlpha: 1, duration: 0.01 }, a + 2.25)
          .to(q("[data-caret]"), { autoAlpha: 0, duration: 0.2 }, a + 3.5)
          .to(q("[data-focus]"), { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, a + 3.5)
          .fromTo(q("[data-saved]"), { autoAlpha: 0, y: -16, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(2)" }, a + 3.55)
          .to(site, { scale: 1, duration: 1, ease: "expo.inOut" }, a + 3.7);
        for (let k = 0; k < 6; k++) snd("key", a + 2.35 + k * 0.18, 0.9 + (k % 3) * 0.08);
        snd("success", a + 3.55);
        caption(8, a + 0.6);
      }
      /* 9 · Tutto compreso: due righe di parole che scorrono in versi opposti */
      a = 29;
      {
        const q = s$(9);
        show(9, a);
        tl.fromTo(S[9], { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power4.inOut" }, a)
          .fromTo(q("[data-mq='0']"), { xPercent: 0 }, { xPercent: -30, duration: 3.6, ease: "sine.inOut" }, a)
          .fromTo(q("[data-mq='1']"), { xPercent: -30 }, { xPercent: 0, duration: 3.6, ease: "sine.inOut" }, a);
        hide(8, a + 1.05);
        snd("whoosh", a, 1.05);
        caption(9, a + 0.6);
      }
      /* 10 · Senza sorprese: la stretta di mano, le quattro garanzie una dopo l'altra */
      a = 32.3;
      {
        const q = s$(10);
        show(10, a);
        tl.fromTo(S[10], { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power4.inOut" }, a)
          .fromTo(q("img")[0], { scale: 1.3 }, { scale: 1.05, duration: 3.4, ease: "expo.out" }, a)
          .fromTo(q("[data-pr]"), { autoAlpha: 0, x: 40, scale: 0.94 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.8, stagger: 0.32, ease: "expo.out" }, a + 0.8);
        hide(9, a + 1.05);
        snd("whoosh", a);
        [0, 1, 2, 3].forEach((k) => snd("tick", a + 0.85 + k * 0.32, 1.1 + k * 0.08));
        caption(10, a + 0.6);
      }
      /* chiusura */
      a = 36;
      {
        const q = s$(11);
        show(11, a);
        tl.fromTo(S[11], { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(80% at 50% 50%)", duration: 1.2, ease: "expo.inOut" }, a);
        hide(10, a + 1.25);
        snd("success", a + 0.4);
        const p = q("[data-eh]")[0];
        SplitText.create(p, { type: "words", mask: "words", wordsClass: "cw", ignore: "[data-kw]" });
        p.querySelectorAll<HTMLElement>(".cw, [data-kw]").forEach((w, j) => {
          const kw = w.hasAttribute("data-kw");
          tl.fromTo(w, kw ? { y: "0.5em", autoAlpha: 0 } : { yPercent: 110 }, kw ? { y: 0, autoAlpha: 1, duration: 1, ease: "expo.out" } : { yPercent: 0, duration: 0.95, ease: "expo.out" }, a + 0.5 + j * 0.07);
        });
        tl.fromTo(q("[data-cta]"), { autoAlpha: 0, y: 20, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "expo.out" }, a + 1.3)
          .fromTo(q("[data-carr]"), { rotation: -45 }, { rotation: 0, duration: 0.9, ease: "back.out(2)" }, a + 1.5);
        tl.set({}, {}, a + 3);
      }

      /* il tempo del video lo muoviamo noi, con un passo massimo: se il telefono rallenta, il video rallenta con lui invece di saltare */
      const drive = (_t: number, dt: number) => {
        if (!flags.current.playing) return;
        const next = Math.min(tl.duration(), tl.time() + Math.min(dt, 34) / 1000);
        tl.time(next);
        if (next >= tl.duration()) {
          flags.current.ended = true;
          flags.current.playing = false;
          setEnded(true);
          setPlaying(false);
        }
      };
      gsap.ticker.add(drive);
      let ready = document.readyState === "complete";
      const go = () => {
        const f = flags.current;
        f.playing = ready && f.visible && f.lifted && !f.paused && !f.ended;
        setPlaying(f.playing);
      };
      const onReady = () => {
        ready = true;
        go();
      };
      if (!ready) window.addEventListener("load", onReady, { once: true });
      const io = new IntersectionObserver(
        ([en]) => {
          flags.current.visible = en.isIntersecting;
          go();
        },
        { threshold: 0.5 },
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
    tl.time(0);
  };
  const next = () => {
    const n = root.current?.nextElementSibling as HTMLElement | null;
    n?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scene = (i: number, children: ReactNode, bg = INK) => (
    <div data-s={i} className="absolute inset-0 overflow-hidden" style={{ ...HID, background: bg }}>
      {children}
    </div>
  );
  const pill = "flex items-center gap-[1.6cqmin] text-white";
  return (
    <section ref={root} className="cine-acr relative h-svh min-h-[560px]" aria-label={title} style={{ "--ft": "84px", "--fb": "16px" } as CSSProperties}>
      <h1 className="sr-only">{title}</h1>
      <div
        data-frame
        className="cine-film absolute overflow-hidden shadow-[0_40px_120px_-50px_rgba(0,0,0,.6)] max-md:left-2 max-md:right-2 md:left-4 md:right-4"
        style={{ top: "var(--ft)", bottom: "var(--fb)", borderRadius: 34, background: INK, containerType: "size", containerName: "film" } as CSSProperties}
      >
        {/* 0 · ricerca */}
        {scene(
          0,
          <>
            <Ph n="negozio" pos="50% 45%" />
            <div className="absolute inset-0" style={{ background: SHADE }} />
            <div className="absolute inset-x-0 top-[34%] flex justify-center px-[5cqw]">
              <Bead as="div" data-search radius={999} className="flex h-[max(52px,10cqmin)] w-[min(78cqw,860px)] items-center gap-[2cqmin] px-[max(18px,3.4cqmin)] text-[max(16px,3.4cqmin)] text-white">
                <Search className="h-[1.1em] w-[1.1em] shrink-0 text-white/70" strokeWidth={2} />
                <span data-typed className="tracking-[-0.015em]" />
                <span className="h-[1.1em] w-[2px] animate-pulse bg-white/80" />
              </Bead>
            </div>
            <Cap t={c.cap[0]} />
          </>,
        )}
        {/* 1 · lento */}
        {scene(
          1,
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(245,184,75,.14),transparent_60%)]" />
            <div className="absolute inset-x-0 top-[12%] flex justify-center">
              <span data-count className="font-mono font-medium tabular-nums tracking-[-0.06em]" style={{ fontSize: "min(24cqw, 34cqh)", lineHeight: 1, color: "transparent", WebkitTextStroke: "2px rgba(255,255,255,.9)" }}>
                0{comma}0 S
              </span>
            </div>
            <div className="absolute left-[6cqw] right-[6cqw] top-[56%] h-[3px] overflow-hidden rounded-full bg-white/15">
              <span data-line className="absolute inset-0 origin-left rounded-full bg-[#f5b84b]" style={{ transform: "scaleX(0)" }} />
            </div>
            <Cap t={c.cap[1]} />
          </>,
        )}
        {/* 2 · veloce */}
        {scene(
          2,
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(94,196,255,.28),rgba(11,14,18,0)_62%)]" />
            {[0, 1, 2].map((k) => (
              <span key={k} data-wave className="absolute left-1/2 top-[38%] block aspect-square w-[40cqmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8fd8ff]/50" />
            ))}
            <div data-big className="absolute inset-x-0 top-[38%] flex -translate-y-1/2 justify-center" style={{ ...DISP, fontSize: "min(26cqw, 36cqh)", lineHeight: 1 }}>
              <GradientText colors={BLUES} animationSpeed={8} variant="flow" glow={1}>
                0{comma}8 S
              </GradientText>
            </div>
            <Cap t={c.cap[2]} />
          </>,
        )}
        {/* 3 · disegno */}
        {scene(
          3,
          <>
            <Ph n="schizzo" pos="40% 50%" />
            <div className="absolute inset-0" style={{ background: SHADE }} />
            <svg viewBox="0 0 160 100" className="absolute left-1/2 top-[38%] w-[min(70cqw,104cqh)] -translate-x-1/2 -translate-y-1/2 overflow-visible" fill="none" stroke="#8fd8ff" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              {[
                "M6 2 H154 Q158 2 158 6 V94 Q158 98 154 98 H6 Q2 98 2 94 V6 Q2 2 6 2 Z",
                "M10 8 H150 Q152 8 152 10 V17 Q152 19 150 19 H10 Q8 19 8 17 V10 Q8 8 10 8 Z",
                "M128 30 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0",
                "M12 62 H86 M12 72 H104",
                "M10 86 H38 M44 86 H66",
              ].map((d) => (
                <path key={d} data-bp d={d} pathLength={1} strokeDasharray="1" strokeDashoffset="1" vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
            <Cap t={c.cap[3]} />
          </>,
        )}
        {/* 4 · costruito */}
        {scene(
          4,
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(94,196,255,.16),transparent_65%)]" />
            <div data-win className="absolute inset-x-0 top-[max(8%,70px)] bottom-[31%] mx-auto w-[min(90cqw,98cqh)] overflow-hidden rounded-[24px] shadow-[0_40px_100px_-30px_rgba(0,0,0,.8)] ring-1 ring-white/15">
              <MiniSite c={c} r={24} i={10} />
              <span data-scan className="pointer-events-none absolute inset-x-0 z-30 block h-[2px] bg-[#8fd8ff] shadow-[0_0_28px_6px_rgba(143,216,255,.6)]" style={HID} />
            </div>
            <Cap t={c.cap[4]} />
          </>,
        )}
        {/* 5 · schermi */}
        {scene(
          5,
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(94,196,255,.18),transparent_65%)]" />
            <div className="cine-devs absolute inset-x-0 top-[8%] px-[4cqw]">
              {[
                [26, 10],
                [22, 9],
                [26, 7],
              ].map(([r, i], k) => (
                <div key={k} data-dv={k} className="relative overflow-hidden bg-[#0d1115] shadow-[0_30px_80px_-30px_rgba(0,0,0,.8)] ring-1 ring-white/15" style={{ borderRadius: r }}>
                  <MiniSite c={c} r={r} i={i} />
                </div>
              ))}
            </div>
            <Cap t={c.cap[5]} />
          </>,
        )}
        {/* 6 · clienti */}
        {scene(
          6,
          <>
            <Ph n="banco" pos="50% 40%" />
            <div className="absolute inset-0" style={{ background: SHADE }} />
            <div className="absolute right-[6cqw] top-[max(8%,70px)] w-[min(46cqw,440px)] max-[700px]:left-[6cqw] max-[700px]:w-auto">
              {c.clients.items.map(([t, b]) => (
                <Bead as="div" key={b} data-n radius={24} className="absolute inset-x-0 top-0 flex items-center gap-3 p-[12px] text-white" style={HID}>
                  <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[12px] bg-[#5ec4ff] text-[#04121c]">
                    <Bell size={20} strokeWidth={2} />
                  </span>
                  <span className="block min-w-0 leading-tight">
                    <span className="block truncate text-[15px] font-semibold tracking-[-0.01em]">{t}</span>
                    <span className="block truncate text-[13px] text-white/70">{b}</span>
                  </span>
                </Bead>
              ))}
            </div>
            <Cap t={c.cap[6]} />
          </>,
        )}
        {/* 7 · online */}
        {scene(
          7,
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(94,196,255,.16),transparent_65%)]" />
            <div data-win className="absolute inset-x-0 top-[max(8%,70px)] bottom-[31%] mx-auto w-[min(90cqw,98cqh)] overflow-hidden rounded-[24px] shadow-[0_40px_100px_-30px_rgba(0,0,0,.8)] ring-1 ring-white/15">
              <MiniSite c={c} r={24} i={10} />
              <div className="absolute inset-0 bg-[rgba(8,12,16,.55)]" />
            </div>
            <div className="absolute inset-x-0 top-[34%] flex justify-center px-[5cqw]">
              <Bead as="div" data-ub radius={999} className="relative flex h-[max(56px,11cqmin)] w-[min(80cqw,780px)] items-center gap-[2cqmin] overflow-hidden pl-[max(18px,3.4cqmin)] pr-[8px] text-[max(16px,3.4cqmin)] text-white">
                <span className="relative block h-[1.1em] w-[1.1em] shrink-0">
                  <Lock data-lock1 className="absolute inset-0 h-full w-full text-white/70" strokeWidth={2} />
                  <ShieldCheck data-lock2 className="absolute inset-0 h-full w-full text-[#4ade80]" strokeWidth={2} style={HID} />
                </span>
                <span data-url className="tracking-[-0.015em]" />
                <span data-live className="ml-auto flex h-[calc(100%-16px)] items-center gap-2 rounded-full bg-[#4ade80]/15 px-[max(12px,2.4cqmin)] text-[0.62em] font-semibold text-[#4ade80]" style={HID}>
                  <span className="h-2 w-2 rounded-full bg-[#4ade80]" />
                  {c.online.live}
                </span>
                <span data-load2 className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-[#5ec4ff]" style={{ transform: "scaleX(0)" }} />
              </Bead>
            </div>
            <Cap t={c.cap[7]} />
          </>,
        )}
        {/* 8 · modifiche */}
        {scene(
          8,
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(94,196,255,.16),transparent_65%)]" />
            <div data-win className="absolute inset-x-0 top-[max(8%,70px)] bottom-[31%] mx-auto w-[min(90cqw,98cqh)] overflow-hidden rounded-[24px] shadow-[0_40px_100px_-30px_rgba(0,0,0,.8)] ring-1 ring-white/15">
              <MiniSite c={c} r={24} i={10} />
              <div className="absolute inset-x-0 top-[10px] z-20 flex justify-center">
                <Bead as="div" data-saved radius={999} className="flex h-10 items-center gap-2 px-5 text-[14px] font-semibold text-white" style={HID}>
                  <Check size={17} strokeWidth={2.6} className="text-[#4ade80]" />
                  {c.edit.saved}
                </Bead>
              </div>
            </div>
            <Cap t={c.cap[8]} />
          </>,
        )}
        {/* 9 · compreso */}
        {scene(
          9,
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(94,196,255,.14),transparent_65%)]" />
            {[0, 1].map((r) => (
              <div key={r} className="absolute left-0 w-full overflow-hidden whitespace-nowrap" style={{ top: r ? "34%" : "12%" }}>
                <span data-mq={r} className="inline-flex" style={{ ...DISP, fontSize: "min(13cqw, 18cqh)", lineHeight: 1.04, color: r ? "transparent" : "#fff", WebkitTextStroke: r ? "1.5px rgba(255,255,255,.85)" : undefined }}>
                  {[0, 1].map((k) => (
                    <span key={k} className="pr-[3cqw]">
                      {(r ? c.gets.items.slice(3) : c.gets.items.slice(0, 3)).map(([t]) => t.toUpperCase()).join(" · ")} ·
                    </span>
                  ))}
                </span>
              </div>
            ))}
            <Cap t={c.cap[9]} />
          </>,
        )}
        {/* 10 · garanzie */}
        {scene(
          10,
          <>
            <Ph n="intesa" pos="50% 35%" />
            <div className="absolute inset-0" style={{ background: SHADE }} />
            <div className="absolute right-[6cqw] top-[max(8%,70px)] flex flex-col items-end gap-[1.6cqmin] max-[700px]:left-[6cqw] max-[700px]:items-start">
              {c.promise.items.map(([t]) => (
                <Bead as="div" key={t} data-pr radius={999} className={`${pill} h-[max(44px,8cqmin)] px-[max(16px,3cqmin)] text-[max(15px,2.8cqmin)] font-medium tracking-[-0.015em]`} style={HID}>
                  <Check className="h-[1.1em] w-[1.1em] text-[#5ec4ff]" strokeWidth={2.4} />
                  {t}
                </Bead>
              ))}
            </div>
            <Cap t={c.cap[10]} />
          </>,
        )}
        {/* chiusura */}
        {scene(
          11,
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(94,196,255,.22),transparent_62%)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-[5cqmin] px-[6cqw]">
              <p data-eh className="text-center text-white" style={{ ...DISP, fontSize: "min(10cqw, 13cqh)", lineHeight: 1 }}>
                <Kw text={c.end.t.toUpperCase()} />
              </p>
              <button type="button" data-cta onClick={next} className="flex h-[max(52px,9cqmin)] items-center gap-[2.4cqmin] rounded-full bg-white pl-[max(20px,4cqmin)] pr-[6px] text-[max(15px,2.6cqmin)] font-semibold text-black">
                {c.end.cta}
                <span data-carr className="flex aspect-square h-[calc(100%-12px)] items-center justify-center rounded-full bg-black text-white">
                  <ArrowDown size={18} strokeWidth={2} />
                </span>
              </button>
            </div>
          </>,
        )}
        {!prefersReducedMotion() && (
          <div className="absolute right-[14px] top-[14px] z-40 flex gap-2 text-white">
            <Bead as="button" type="button" radius={22} onClick={ended ? replay : toggle} aria-label={ended ? c.ctl.replay : playing ? c.ctl.pause : c.ctl.play} className="relative flex h-11 w-11 items-center justify-center">
              <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden>
                <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="2" />
                <circle ref={ring} cx="22" cy="22" r="19" fill="none" stroke="#5ec4ff" strokeWidth="2" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
              </svg>
              {ended ? <RotateCcw size={16} strokeWidth={2} /> : playing ? <Pause size={16} strokeWidth={2} /> : <Play size={16} strokeWidth={2} />}
            </Bead>
            <Bead as="button" type="button" radius={22} onClick={() => setSound(!snd)} aria-label={snd ? c.ctl.on : c.ctl.off} className="flex h-11 w-11 items-center justify-center">
              {snd ? <Volume2 size={16} strokeWidth={2} /> : <VolumeX size={16} strokeWidth={2} />}
            </Bead>
          </div>
        )}
      </div>
    </section>
  );
}
