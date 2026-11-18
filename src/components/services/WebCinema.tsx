"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ArrowDown, Bell, Check, Pause, Play, RotateCcw, Volume2, VolumeX, FileText, Globe, Inbox, KeyRound, LifeBuoy, Lock, LockOpen, Menu, PencilLine, Search, ShieldCheck, UserRound } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { prefersReducedMotion } from "@/lib/env";
import { onIntroLift } from "@/lib/intro";
import { soundOn, onSound, setSound } from "@/lib/sound";
import { fx } from "@/lib/filmsound";
import { Bead } from "@/components/glass/Bead";
import { getCinema, type Cinema } from "@/content/cinema";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const ACC = "#8fd8ff";

const DISP = { fontFamily: "var(--font-anton), Impact, sans-serif", textTransform: "uppercase" as const };
const cin = (n: string) => `/visual/cinema/${n}.webp`;

/** Scrive un testo lettera per lettera; ogni due lettere suona una nota che sale nella scala. */
const typeTo = (tl: gsap.core.Timeline, el: Element, text: string, at: number, dur: number, deg = 0) => {
  const o = { n: 0 };
  tl.to(o, { n: text.length, duration: dur, ease: "none", onUpdate: () => void (el.textContent = text.slice(0, Math.round(o.n))) }, at);
  const steps = Math.max(1, Math.floor(text.length / 2));
  for (let k = 0; k < steps; k++) tl.call(() => fx.pluck(deg + (k % 7), 0.55, 0.22), undefined, at + (k / steps) * dur);
};
const num = (tl: gsap.core.Timeline, el: Element, from: number, to: number, at: number, dur: number, fmt: (n: number) => string) => {
  const o = { n: from };
  tl.to(o, { n: to, duration: dur, ease: "none", onUpdate: () => void (el.textContent = fmt(o.n)) }, at);
};

/* ───────────── Il sito che consegniamo, vero e adattabile: lo stesso disegno a ogni larghezza ───────────── */

function MiniSite({ c }: { c: Cinema }) {
  return (
    <div data-site className="@container relative h-full w-full overflow-hidden bg-[#0d1115] text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-simg src={cin("lavoro")} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 50%" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,12,16,.62) 0%, rgba(8,12,16,.12) 28%, rgba(8,12,16,.3) 48%, rgba(8,12,16,.9) 100%)" }} />
      <Bead as="div" tint="rgba(10,14,18,.62)" radius={999} className="absolute inset-x-[3cqw] top-[3cqw] flex h-[clamp(40px,8cqw,64px)] items-center justify-between pl-[clamp(14px,3cqw,26px)] pr-[clamp(6px,1.4cqw,12px)]">
        <span className="flex items-center gap-2 text-[clamp(14px,2.4cqw,20px)] font-semibold tracking-[-0.01em]">
          <span className="h-[7px] w-[7px] rounded-full" style={{ background: ACC }} />
          Marchio
        </span>
        <span className="flex items-center gap-[clamp(14px,3cqw,28px)] text-[clamp(12px,1.8cqw,16px)] text-white">
          <span className="hidden @min-[560px]:flex gap-[clamp(14px,3cqw,28px)]">
            {c.site.nav.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
          <span className="hidden @min-[560px]:flex h-[clamp(28px,5cqw,40px)] items-center rounded-full bg-white px-[clamp(14px,2.6cqw,22px)] font-semibold text-black">{c.site.book}</span>
          <span className="flex @min-[560px]:hidden h-8 w-8 items-center justify-center rounded-full bg-white text-black">
            <Menu size={16} strokeWidth={2} />
          </span>
        </span>
      </Bead>
      <div data-title className="absolute bottom-[clamp(54px,10cqw,96px)] left-[4cqw] text-white" style={{ ...DISP, fontSize: "clamp(34px,11.5cqw,128px)", lineHeight: 0.98 }}>
        <span data-focus className="pointer-events-none absolute -inset-x-[2.2cqw] -inset-y-[1cqw] rounded-[1.6cqw] border-2 border-[#8fd8ff] opacity-0" />
        <span data-sel className="pointer-events-none absolute -inset-x-[1.4cqw] bottom-[-.4cqw] top-[50%] origin-left rounded-[1cqw] bg-[#8fd8ff]/35 opacity-0" />
        <span className="relative block">{c.site.title[0]}</span>
        <span className="relative block">
          <span data-l2>{c.site.title[1].replace(".", "")}</span>
          <span style={{ color: ACC }}>.</span>
        </span>
      </div>
      <Bead as="div" tint="rgba(10,14,18,.6)" radius={999} className="absolute right-[4cqw] top-[clamp(64px,15cqw,120px)] hidden h-[clamp(64px,13cqw,120px)] w-[clamp(64px,13cqw,120px)] items-center justify-center @min-[440px]:flex">
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
      </Bead>
      <div className="absolute bottom-[3cqw] left-[4cqw] hidden gap-2 text-[clamp(11px,1.7cqw,15px)] @min-[480px]:flex">
        {[c.site.stars, c.site.since].map((s) => (
          <Bead key={s} as="div" tint="rgba(10,14,18,.62)" radius={999} className="flex h-[clamp(28px,5cqw,40px)] items-center px-[clamp(12px,2.4cqw,20px)]">
            {s}
          </Bead>
        ))}
      </div>
    </div>
  );
}

/** Lo stesso disegno, prima di essere finito: solo le forme, nelle stesse posizioni. */
function Wire() {
  return (
    <div data-wire className="@container absolute inset-0 overflow-hidden bg-[var(--bg-sunken)]">
      <div className="absolute inset-[3cqw] rounded-[2.4cqw] border border-dashed border-[color:color-mix(in_srgb,var(--accent)_45%,transparent)]" />
      <div className="absolute inset-x-[3cqw] top-[3cqw] h-[clamp(40px,8cqw,64px)] rounded-full cine-blk" />
      <div className="absolute left-[4cqw] top-[clamp(64px,15cqw,120px)] h-[clamp(64px,13cqw,120px)] w-[clamp(64px,13cqw,120px)] rounded-full cine-blk max-[440px]:hidden" style={{ left: "auto", right: "4cqw" }} />
      <div className="absolute bottom-[clamp(54px,10cqw,96px)] left-[4cqw] h-[11.5cqw] w-[58cqw] rounded-[1cqw] cine-blk" style={{ minHeight: 34 }} />
      <div className="absolute bottom-[calc(clamp(54px,10cqw,96px)+12cqw)] left-[4cqw] h-[11.5cqw] w-[44cqw] rounded-[1cqw] cine-blk" style={{ minHeight: 34 }} />
      <div className="absolute bottom-[3cqw] left-[4cqw] h-[clamp(28px,5cqw,40px)] w-[22cqw] rounded-full cine-blk" />
      <div className="absolute bottom-[3cqw] left-[calc(4cqw+24cqw)] h-[clamp(28px,5cqw,40px)] w-[20cqw] rounded-full cine-blk" />
    </div>
  );
}



/* ───────────── Il video ─────────────
   Un solo oggetto che si trasforma da un'inquadratura all'altra, sul ritmo della colonna sonora (112 battiti al minuto).
   Ogni cosa che si muove ha il suo suono; le didascalie sono brevi e cambiano sul tempo. */

type Q = (s: string) => HTMLElement[];
const B = 60 / 112;
const T = (n: number) => n * B;
const HID = { visibility: "hidden" as const, opacity: 0 };
const ICONS_GETS = [Globe, KeyRound, ShieldCheck, PencilLine, Inbox, LifeBuoy];
const CAP = "pointer-events-none absolute inset-x-0 top-[max(9svh,84px)] mx-auto md:top-[max(14svh,140px)] max-w-[19ch] px-6 text-center text-[clamp(32px,5.4vw,88px)] font-medium leading-[1.06] tracking-[-0.05em] cine-fg md:max-w-none";

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
    const off = onSound((on) => {
      setSnd(on);
      if (on && flags.current.playing) fx.padOn();
    });
    return () => void off();
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
      const world = one("[data-world]");
      const dev = one("[data-dev]");
      const wide = () => (innerWidth > 760 ? 1100 : 760);
      const mid = () => (innerWidth > 760 ? 640 : 520);
      const phone = () => 340;
      const fit = (w: () => number) => () => Math.min(1, (innerWidth * 0.92) / w(), (innerHeight * (innerWidth > 760 ? 0.6 : 0.5)) / 640);
      const devRect = () => dev.getBoundingClientRect();
      gsap.set($("[data-it]"), { xPercent: -50, yPercent: -50 });
      gsap.set(dev, { width: wide, scale: fit(wide), borderRadius: 28 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "none" },
        onUpdate: () => {
          if (bar.current) bar.current.style.transform = `scaleX(${tl.progress()})`;
        },
        onComplete: () => {
          flags.current.ended = true;
          flags.current.playing = false;
          setEnded(true);
          setPlaying(false);
        },
      });
      tlRef.current = tl;

      // didascalie: una per volta, ognuna esce con la parola che sale
      const caps = c.cap.map((_, i) => one(`[data-cap="${i}"]`));
      const splits = caps.map((e) => SplitText.create(e, { type: "words", mask: "words" }));
      const cap = (i: number, b0: number, b1: number) =>
        tl
          .set(caps[i], { autoAlpha: 1 }, T(b0))
          .from(splits[i].words, { yPercent: 115, duration: 0.5, stagger: 0.05, ease: "expo.out" }, T(b0))
          .to(splits[i].words, { yPercent: -115, duration: 0.3, stagger: 0.025, ease: "power2.in" }, T(b1) - 0.34)
          .set(caps[i], { autoAlpha: 0 }, T(b1));
      const punch = (b: number, k = 1.018) => tl.fromTo(world, { scale: k }, { scale: 1, duration: 0.5, ease: "expo.out" }, T(b));

      /* 0 · Un cliente ti cerca */
      const pill = one("[data-pill]");
      const r1 = one("[data-r1]");
      tl.call(() => fx.padOn(), undefined, 0)
        .call(() => (fx.kick(0.6), fx.whoosh(0.5, true, 0.7)), undefined, 0)
        .fromTo(pill, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" }, 0);
      cap(0, 0.5, 4.6);
      typeTo(tl, one("[data-typed]"), c.find.typed, T(1), T(2.4), 0);
      tl.fromTo(r1, { autoAlpha: 0, y: 95 }, { autoAlpha: 1, y: 55, duration: 0.45, ease: "expo.out" }, T(3.7))
        .call(() => fx.pluck(12, 0.8), undefined, T(3.7))
        .to(r1, { scale: 0.97, duration: 0.12 }, T(4.4))
        .to(r1, { scale: 1, duration: 0.18, ease: "back.out(3)" }, T(4.4) + 0.12)
        .call(() => fx.tick(1), undefined, T(4.4));

      /* 1 · Se è lento, se ne va */
      const load = one("[data-load]");
      const ring = one("[data-ring]");
      tl.to([pill, r1], { autoAlpha: 0, scale: 0.9, duration: 0.3, ease: "power2.in" }, T(4.75))
        .call(() => (fx.whoosh(0.45, false, 0.8), fx.riser(T(3.7))), undefined, T(4.8))
        .fromTo(load, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" }, T(4.8))
        .fromTo(ring, { strokeDashoffset: 100 }, { strokeDashoffset: 72, duration: T(3.6), ease: "power1.out" }, T(4.9));
      num(tl, one("[data-count]"), 0, 8.4, T(4.9), T(3.6), (n) => n.toFixed(1).replace(".", ",") + " s");
      for (let k = 0; k < 8; k++) tl.call(() => fx.tick(0.5 + k * 0.06), undefined, T(5 + k * 0.45));
      cap(1, 5, 8.8);

      /* 2 · Il tuo parte in 0,8 secondi */
      const fast = one("[data-fast]");
      tl.to(load, { autoAlpha: 0, scale: 1.2, duration: 0.2, ease: "power2.in" }, T(8.55))
        .call(() => (fx.chord([0, 2, 4, 5], 1), fx.whoosh(0.3, true, 0.5)), undefined, T(8.6))
        .fromTo(fast, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "expo.out" }, T(8.6))
        .fromTo(one("[data-fring]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.7, ease: "expo.out" }, T(8.6));
      punch(8.6, 1.025);
      cap(2, 8.8, 10.9);

      /* 3 · Prima lo disegniamo: l'anello diventa la pagina */
      const wire = one("[data-wire]");
      tl.call(() => fx.whoosh(0.6, true, 1), undefined, T(10.8))
        .to(fast, { autoAlpha: 0, scale: 2.6, duration: 0.55, ease: "power3.in" }, T(10.8))
        .fromTo(dev, { autoAlpha: 0, scale: () => Number(gsap.getProperty(dev, "scale")) * 0.55 }, { autoAlpha: 1, scale: fit(wide), duration: 0.75, ease: "expo.out" }, T(10.95))
        .fromTo($("[data-wire] > div"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, stagger: T(0.32) }, T(11.3));
      $("[data-wire] > div").forEach((_, i) => tl.call(() => fx.pluck(i * 2, 0.7, 0.3), undefined, T(11.3) + i * T(0.32)));
      cap(3, 10.9, 14.6);

      /* 4 · Poi lo costruiamo: la linea di luce lo trasforma in sito vero */
      tl.call(() => fx.riser(T(1.4)), undefined, T(13.1))
        .call(() => (fx.kick(1), fx.whoosh(0.9, true, 1)), undefined, T(14.5))
        .fromTo(wire, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(100% 0% 0% 0%)", duration: T(2), ease: "power2.inOut" }, T(14.5))
        .fromTo($("[data-scan]"), { top: "0%", autoAlpha: 1 }, { top: "100%", duration: T(2), ease: "power2.inOut" }, T(14.5))
        .to($("[data-scan]"), { autoAlpha: 0, duration: 0.15 }, T(16.5))
        .fromTo($("[data-simg]"), { scale: 1.22 }, { scale: 1, duration: T(3), ease: "power2.out" }, T(14.5))
        .call(() => fx.chord([2, 4, 7], 0.8), undefined, T(16.5));
      punch(14.5);
      cap(4, 14.6, 16.9);

      /* 5 · Su ogni schermo: la stessa pagina si riordina */
      tl.call(() => (fx.whoosh(0.55, false, 0.9), fx.tick(1)), undefined, T(16.8))
        .to(dev, { width: mid, scale: fit(mid), borderRadius: 38, duration: T(1.3), ease: "power3.inOut" }, T(16.8))
        .call(() => (fx.whoosh(0.55, false, 0.9), fx.tick(1.2)), undefined, T(18.6))
        .to(dev, { width: phone, scale: fit(phone), borderRadius: 52, duration: T(1.3), ease: "power3.inOut" }, T(18.6))
        .call(() => fx.pluck(9, 0.9, 0.6), undefined, T(19.9));
      cap(5, 16.9, 20.7);

      /* 6 · Arrivano i clienti: le notifiche cadono sul telefono */
      const ns = $("[data-n]");
      const slots = [-170, -74, 22];
      ns.forEach((n, i) => {
        const at = T(20.7 + i * 1.15);
        tl.fromTo(n, { autoAlpha: 0, y: slots[i] - 90, scale: 0.92 }, { autoAlpha: 1, y: slots[i], scale: 1, duration: 0.55, ease: "expo.out" }, at).call(() => fx.bell(7 + i * 2, 1), undefined, at);
      });
      punch(23.1, 1.012);
      cap(6, 20.7, 24.6);

      /* 7 · Online, al sicuro: la barra dell'indirizzo, il lucchetto */
      const urlBar = one("[data-bar2]");
      const insidePhone = () => -devRect().height / 2 + 46;
      tl.to(ns, { autoAlpha: 0, y: "-=50", duration: 0.35, stagger: 0.06, ease: "power2.in" }, T(24.4))
        .call(() => fx.whoosh(0.4, true, 0.7), undefined, T(24.5))
        .fromTo(urlBar, { autoAlpha: 0, y: () => insidePhone() - 40, width: () => devRect().width * 0.93 }, { autoAlpha: 1, y: insidePhone, duration: 0.45, ease: "expo.out" }, T(24.55));
      typeTo(tl, one("[data-url]"), "latuaattivita.it", T(24.9), T(1.7), 3);
      tl.fromTo(one("[data-load2]"), { scaleX: 0 }, { scaleX: 1, duration: T(0.9), ease: "power1.inOut" }, T(26.7))
        .to(one("[data-lock1]"), { autoAlpha: 0, duration: 0.1 }, T(27.7))
        .fromTo(one("[data-lock2]"), { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2.4)" }, T(27.7))
        .call(() => fx.chord([0, 2, 4, 5], 1), undefined, T(27.7))
        .fromTo(one("[data-live]"), { autoAlpha: 0, x: 10 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: "expo.out" }, T(27.8))
        .fromTo(dev, { boxShadow: "0 0 0 0 rgba(143,216,255,0)" }, { boxShadow: "0 0 0 14px rgba(143,216,255,0.28)", duration: 0.35, ease: "expo.out", yoyo: true, repeat: 1 }, T(27.7));
      punch(27.7, 1.02);
      cap(7, 24.6, 28.5);

      /* 8 · Lo cambi tu: il titolo si riscrive sul posto */
      const l2 = one("[data-l2]");
      const saved = one("[data-saved]");
      tl.to(urlBar, { autoAlpha: 0, y: "-=20", duration: 0.3, ease: "power2.in" }, T(28.4))
        .call(() => fx.whoosh(0.55, true, 0.8), undefined, T(28.5))
        .to(dev, { width: mid, scale: fit(mid), borderRadius: 38, duration: T(1.3), ease: "power3.inOut" }, T(28.5))
        .fromTo($("[data-focus]"), { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "expo.out" }, T(30))
        .call(() => fx.tick(1.3), undefined, T(30))
        .fromTo($("[data-sel]"), { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: T(0.9), ease: "power2.inOut" }, T(30.5))
        .call(() => fx.whoosh(0.4, true, 0.5), undefined, T(30.5))
        .set(l2, { textContent: "" }, T(31.5))
        .set($("[data-sel]"), { autoAlpha: 0 }, T(31.5));
      typeTo(tl, l2, c.title[1].toUpperCase(), T(31.6), T(1.8), 0);
      tl.to($("[data-focus]"), { autoAlpha: 0, duration: 0.25 }, T(33.5))
        .fromTo(saved, { autoAlpha: 0, y: () => insidePhone() - 20, scale: 0.8 }, { autoAlpha: 1, y: insidePhone, scale: 1, duration: 0.45, ease: "back.out(2.4)" }, T(33.6))
        .call(() => fx.chord([0, 2, 4, 5], 1), undefined, T(33.6))
        .to(saved, { autoAlpha: 0, duration: 0.3 }, T(34.6));
      cap(8, 28.5, 34.7);

      /* 9 · Tutto compreso: il sito si rimpicciolisce e arrivano le sei cose che ricevi */
      const gs = $("[data-g]");
      tl.call(() => (fx.kick(1), fx.whoosh(0.7, false, 1)), undefined, T(34.7))
        .to(dev, { scale: () => Number(gsap.getProperty(dev, "scale")) * 0.5, autoAlpha: 0, duration: 0.7, ease: "power3.in" }, T(34.7))
        .fromTo(gs, { autoAlpha: 0, scale: 0.6, y: 36 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.8)", stagger: T(0.5) }, T(35.2));
      gs.forEach((_, i) => tl.call(() => fx.pluck(i + 2, 0.9, 0.4), undefined, T(35.2) + i * T(0.5)));
      tl.call(() => fx.chord([0, 2, 4, 5], 1), undefined, T(38.4));
      punch(38.4, 1.015);
      cap(9, 34.8, 40.7);

      /* 10 · Senza sorprese: le quattro garanzie */
      const ps = $("[data-pr]");
      tl.to(gs, { autoAlpha: 0, y: -30, scale: 0.9, duration: 0.3, stagger: 0.03, ease: "power2.in" }, T(40.3))
        .call(() => fx.whoosh(0.45, true, 0.7), undefined, T(40.4))
        .fromTo(ps, { autoAlpha: 0, scale: 0.6, y: 36 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.8)", stagger: T(0.75) }, T(40.9));
      ps.forEach((_, i) => tl.call(() => fx.bell(7 + i * 2, 0.9), undefined, T(40.9) + i * T(0.75)));
      cap(10, 40.8, 45.8);

      /* chiusura */
      const es = gsap.utils.selector(endCard) as Q;
      const eh = SplitText.create(es("[data-eh]")[0], { type: "words", mask: "words" });
      tl.to(ps, { autoAlpha: 0, y: -30, scale: 0.9, duration: 0.3, stagger: 0.03, ease: "power2.in" }, T(45.4))
        .call(() => (fx.kick(1.2), fx.whoosh(0.8, true, 1)), undefined, T(45.9))
        .set(endCard, { autoAlpha: 1 }, T(45.9))
        .from(eh.words, { yPercent: 115, duration: 0.8, stagger: 0.07, ease: "expo.out" }, T(45.9))
        .call(() => (fx.chord([0, 2, 4, 7], 1.2), fx.padOff(3)), undefined, T(46))
        .from(es("[data-more]"), { autoAlpha: 0, y: 14, duration: 0.7, ease: "power2.out" }, T(47));
      punch(45.9, 1.03);
      tl.set({}, {}, T(49));

      const go = () => {
        const f = flags.current;
        const run = f.visible && f.lifted && !f.paused && !f.ended;
        f.playing = run;
        if (run) {
          tl.play();
          fx.duck(false);
        } else {
          tl.pause();
          fx.duck(true);
        }
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
        fx.padOff(0.2);
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
    tl.restart();
  };

  const pillCls = "cine-fg absolute left-1/2 top-0 flex items-center gap-3";
  return (
    <section ref={root} className="cine-acr relative h-svh min-h-[560px] overflow-hidden" aria-label={title}>
      <h1 className="sr-only">{title}</h1>
      <div data-world className="absolute inset-x-0 top-0 bottom-0 max-md:bottom-[22svh]">
        {c.cap.map((t, i) => (
          <p key={t} data-cap={i} className={CAP} style={HID}>
            {t}
          </p>
        ))}
        <div className="absolute inset-x-0 top-[57%] h-0">
          {/* ricerca */}
          <Bead as="div" data-it data-pill radius={999} className={`${pillCls} h-[clamp(56px,9svh,76px)] w-[min(680px,88vw)] px-7 text-[clamp(18px,2.4vw,26px)]`} style={{ ...HID, marginTop: -60 }}>
            <Search size={22} strokeWidth={1.8} className="cine-fg2 shrink-0" />
            <span data-typed />
            <span className="h-[1.1em] w-[2px] animate-pulse bg-[var(--label-primary)]" />
          </Bead>
          <Bead as="div" data-it data-r1 radius={34} className={`${pillCls} block w-[min(680px,88vw)] px-8 py-6`} style={HID}>
            <span className="block text-[clamp(20px,2.6vw,30px)] font-medium tracking-[-0.02em]">La tua attività</span>
            <span className="cine-fg2 mt-1 block text-[clamp(14px,1.6vw,18px)]">latuaattivita.it</span>
          </Bead>
          {/* caricamento lento, poi veloce */}
          <div data-it data-load className="cine-fg absolute left-1/2 top-0 flex flex-col items-center gap-5" style={HID}>
            <span className="relative block h-[clamp(130px,24svh,210px)] w-[clamp(130px,24svh,210px)]">
              <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
                <circle cx="20" cy="20" r="17" fill="none" stroke="var(--hair-strong)" strokeWidth="1.6" />
                <circle data-ring cx="20" cy="20" r="17" fill="none" stroke="#f5c46b" strokeWidth="1.6" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
              </svg>
              <span data-count className="absolute inset-0 flex items-center justify-center font-mono text-[clamp(26px,4.6svh,42px)] tabular-nums">
                0,0 s
              </span>
            </span>
            <span className="cine-fg2 text-[clamp(15px,1.8vw,21px)]">{c.find.loading}</span>
          </div>
          <div data-it data-fast className="absolute left-1/2 top-0" style={HID}>
            <span className="relative block h-[clamp(130px,24svh,210px)] w-[clamp(130px,24svh,210px)]">
              <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
                <circle data-fring cx="20" cy="20" r="17" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[clamp(34px,6svh,56px)] font-medium tracking-[-0.04em]" style={{ color: "var(--accent)" }}>
                0,8 s
              </span>
            </span>
          </div>
          {/* il sito */}
          <div data-it data-dev className="absolute left-1/2 top-0 overflow-hidden bg-[#0d1115] shadow-[0_40px_120px_-40px_rgba(0,0,0,.55)] ring-1 ring-[color:var(--hair-strong)]" style={{ ...HID, width: 1100, height: 640 }}>
            <MiniSite c={c} />
            <Wire />
            <span data-scan className="pointer-events-none absolute inset-x-0 z-10 block h-[2px] bg-[#8fd8ff] opacity-0 shadow-[0_0_24px_4px_rgba(143,216,255,.55)]" />
          </div>
          {/* notifiche */}
          {c.clients.items.map(([t, b]) => (
            <Bead as="div" key={b} data-it data-n radius={34} className="cine-fg absolute left-1/2 top-0 flex w-[min(440px,86vw)] items-center gap-4 px-5 py-4" style={HID}>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--bg-canvas)]">
                <Bell size={22} strokeWidth={1.8} />
              </span>
              <span className="block leading-tight">
                <span className="block text-[clamp(16px,1.9vw,21px)] font-semibold tracking-[-0.015em]">{t}</span>
                <span className="cine-fg2 mt-0.5 block text-[clamp(14px,1.6vw,18px)]">{b}</span>
              </span>
            </Bead>
          ))}
          {/* indirizzo */}
          <Bead as="div" data-it data-bar2 radius={999} className="cine-fg absolute left-1/2 top-0 z-20 flex h-12 items-center gap-3 overflow-hidden px-4 text-[15px]" style={{ ...HID, width: 300 }}>
            <span className="relative block h-5 w-5 shrink-0">
              <Lock data-lock1 size={18} strokeWidth={1.8} className="cine-fg2 absolute inset-0" />
              <ShieldCheck data-lock2 size={20} strokeWidth={1.8} className="absolute inset-0 text-[#1fa35b] opacity-0" />
            </span>
            <span data-url className="tracking-[-0.01em]" />
            <span data-live className="ml-auto flex items-center gap-1.5 text-[12px] opacity-0">
              <span className="h-2 w-2 rounded-full bg-[#30d158] shadow-[0_0_0_3px_rgba(48,209,88,.25)]" />
              {c.online.live}
            </span>
            <span data-load2 className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-[var(--accent)]" style={{ transform: "scaleX(0)" }} />
          </Bead>
          <Bead as="div" data-it data-saved radius={999} className="cine-fg absolute left-1/2 top-0 z-20 flex h-11 items-center gap-2 px-5 text-[15px] font-semibold" style={HID}>
            <Check size={18} strokeWidth={2.4} style={{ color: "#1fa35b" }} />
            {c.edit.saved}
          </Bead>
          {/* cosa ricevi e cosa garantisci */}
          <div className="absolute left-1/2 top-0 flex w-[min(880px,92vw)] -translate-x-1/2 -translate-y-1/2 flex-wrap justify-center gap-3">
            {c.gets.items.map(([t], i) => {
              const Icon = ICONS_GETS[i];
              return (
                <Bead as="div" key={t} data-g radius={999} className="cine-fg flex h-14 items-center gap-3 px-6 text-[clamp(16px,2vw,22px)] font-medium" style={HID}>
                  <Icon size={22} strokeWidth={1.7} style={{ color: "var(--accent)" }} />
                  {t}
                </Bead>
              );
            })}
          </div>
          <div className="absolute left-1/2 top-0 flex w-[min(880px,92vw)] -translate-x-1/2 -translate-y-1/2 flex-wrap justify-center gap-3">
            {c.promise.items.map(([t]) => (
              <Bead as="div" key={t} data-pr radius={999} className="cine-fg flex h-14 items-center gap-3 px-6 text-[clamp(16px,2vw,22px)] font-medium" style={HID}>
                <Check size={20} strokeWidth={2.2} style={{ color: "var(--accent)" }} />
                {t}
              </Bead>
            ))}
          </div>
        </div>
      </div>
      <div data-end className="absolute inset-0 flex flex-col items-center justify-center" style={HID}>
        <p data-eh className="mx-auto max-w-[14ch] px-6 text-center text-[clamp(44px,8.4vw,140px)] font-medium leading-[1.02] tracking-[-0.055em] cine-fg">
          {c.end.t}
        </p>
        <span data-more className="cine-fg2 absolute bottom-[clamp(150px,22svh,200px)] flex flex-col items-center gap-2 text-[13px] uppercase tracking-[0.18em] md:bottom-24">
          {c.end.more}
          <ArrowDown size={16} strokeWidth={1.8} className="animate-bounce" />
        </span>
      </div>
      {!prefersReducedMotion() && (
        <div className="absolute inset-x-0 bottom-[clamp(158px,24svh,210px)] z-10 flex justify-center px-5 md:bottom-7">
          <Bead as="div" radius={999} className="cine-fg relative flex h-12 items-center gap-1 overflow-hidden pl-2 pr-2">
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
    </section>
  );
}
