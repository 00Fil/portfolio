"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocale } from "next-intl";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { prefersReducedMotion } from "@/lib/env";
import { onIntroLift } from "@/lib/intro";
import { Bead } from "@/components/glass/Bead";
import { GradientText } from "@/components/ui/GradientText";
import { getSeoFilm } from "@/content/cinema-seo";
import { Kw, CAP } from "./WebCinema";

gsap.registerPlugin(useGSAP);

const HID = { visibility: "hidden" as const, opacity: 0 };
const RED = "#ff6b5e";
const GREEN = "#30d158";
const LEN = 14.5;

/** Estrae i numeri di "4,8 s" / "480 ms" / "0,31" per farli scorrere. */
const parse = (v: string) => {
  const m = /^([\d.,]+)\s*(.*)$/.exec(v)!;
  const n = parseFloat(m[1].replace(",", "."));
  return { n, dec: (m[1].split(/[.,]/)[1] ?? "").length, comma: m[1].includes(","), unit: m[2] };
};

export function SeoCinema({ title, embed = false, play = true }: { title: string; embed?: boolean; play?: boolean }) {
  const locale = useLocale() as Locale;
  const c = getSeoFilm(locale);
  const root = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const flags = useRef({ visible: false, paused: embed, ended: false, lifted: embed, playing: false });
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);

  const rows = [...c.others.slice(0, 3), c.me, ...c.others.slice(3)].length; // 8 righe
  const order = [...c.others.slice(0, 7)];
  order.splice(7, 0, c.me); // il tuo sito parte ultimo

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const one = (s: string) => q(s)[0] as HTMLElement;
      if (prefersReducedMotion()) {
        gsap.set(one("[data-end]"), { autoAlpha: 1 });
        return;
      }
      const stage = one("[data-stage]");
      const rowEls = q("[data-row]") as HTMLElement[];
      const me = rowEls[7];
      const rh = () => rowEls[0].offsetHeight + 6;
      const tl = gsap.timeline({ paused: true });
      tlRef.current = tl;
      const caps = q("[data-cap]") as HTMLElement[];
      const cap = (i: number, at: number, len: number) =>
        tl
          .fromTo(caps[i], { autoAlpha: 0, y: 24, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out" }, at)
          .to(caps[i], { autoAlpha: 0, y: -18, filter: "blur(8px)", duration: 0.45, ease: "power2.in" }, at + len);

      gsap.set(rowEls, { y: (i: number) => i * rh() });
      tl.fromTo(rowEls, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "power3.out", stagger: 0.07 }, 0.2);
      tl.to(me, { opacity: 0.5, duration: 0.4 }, 1.4);
      cap(0, 0.5, 2.6);

      // i tre indicatori compaiono rossi
      const vit = q("[data-vit]") as HTMLElement[];
      tl.fromTo(vit, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12 }, 3.7);
      cap(1, 3.6, 2.4);

      // poi diventano verdi, e i numeri scorrono
      c.vitals.forEach(([, a, b], i) => {
        const A = parse(a);
        const Bv = parse(b);
        const o = { v: A.n };
        const num = vit[i].querySelector<HTMLElement>("[data-num]")!;
        const dot = vit[i].querySelector<HTMLElement>("[data-dot]")!;
        const fill = vit[i].querySelector<HTMLElement>("[data-fill]")!;
        const show = () => {
          const s = o.v.toFixed(Bv.dec);
          num.textContent = (A.comma ? s.replace(".", ",") : s) + (Bv.unit ? " " + Bv.unit : "");
        };
        tl.to(o, { v: Bv.n, duration: 2.2, ease: "power2.inOut", onUpdate: show }, 6.3 + i * 0.25);
        tl.to(dot, { backgroundColor: GREEN, duration: 1.2, ease: "none" }, 6.8 + i * 0.25);
        tl.to(fill, { scaleX: 1, backgroundColor: GREEN, duration: 2.2, ease: "power2.inOut" }, 6.3 + i * 0.25);
      });
      cap(2, 6.2, 2.4);

      // il tuo sito sale in cima, gli altri scivolano giù di un posto
      const rank = one("[data-rank]");
      const r = { v: 8 };
      tl.to(me, { opacity: 1, duration: 0.5 }, 9.0);
      cap(3, 9.0, 3.3);
      const climb = 9.3;
      rowEls.slice(0, 7).forEach((e, i) => tl.to(e, { y: (i + 1) * rh(), duration: 1.5, ease: "power3.inOut" }, climb + 0.05 * (6 - i)));
      tl.to(me, { y: 0, duration: 1.5, ease: "power3.inOut" }, climb);
      tl.to(r, { v: 1, duration: 1.5, ease: "power3.inOut", onUpdate: () => (rank.textContent = String(Math.max(1, Math.round(r.v)))) }, climb);
      tl.fromTo(me, { boxShadow: "0 0 0 0 rgba(94,196,255,0)" }, { boxShadow: "0 0 70px 6px rgba(94,196,255,.55)", duration: 0.9, ease: "power2.out" }, climb + 1.4);

      // chiusura
      tl.to([stage, ...vit], { autoAlpha: 0, y: -20, filter: "blur(10px)", duration: 0.6, ease: "power2.in" }, 12.6);
      tl.fromTo(one("[data-end]"), { autoAlpha: 0, y: 40, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "expo.out" }, 13.0);
      tl.set({}, {}, LEN);

      const drive = (_t: number, dt: number) => {
        if (!flags.current.playing) return;
        const next = Math.min(tl.duration(), tl.time() + Math.min(dt, 34) / 1000);
        tl.time(next);
        if (bar.current) bar.current.style.transform = `scaleX(${next / tl.duration()})`;
        if (next >= tl.duration()) {
          flags.current.ended = true;
          flags.current.playing = false;
          setEnded(true);
          setPlaying(false);
        }
      };
      gsap.ticker.add(drive);
      const go = () => {
        const f = flags.current;
        const run = f.visible && f.lifted && !f.paused && !f.ended;
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
      if (!embed) onIntroLift(() => ((flags.current.lifted = true), go()));
      (el as unknown as { __go: () => void }).__go = go;
      return () => {
        io.disconnect();
        gsap.ticker.remove(drive);
      };
    },
    { scope: root, dependencies: [locale] },
  );

  const go = () => (root.current as unknown as { __go?: () => void } | null)?.__go?.();
  const replay = () => {
    const tl = tlRef.current;
    if (!tl) return;
    flags.current = { ...flags.current, ended: false, paused: false, playing: true };
    setEnded(false);
    setPlaying(true);
    tl.time(0);
  };
  useEffect(() => {
    if (!embed) return;
    flags.current.paused = !play;
    go();
  }, [embed, play]);
  useEffect(() => {
    if (!embed || !ended) return;
    const t = window.setTimeout(() => !flags.current.paused && replay(), 2200);
    return () => window.clearTimeout(t);
  }, [embed, ended]);
  const toggle = () => {
    if (flags.current.ended) return;
    flags.current.paused = flags.current.playing;
    go();
  };

  return (
    <section ref={root} className={embed ? "relative h-full w-full [container-type:size]" : "relative h-svh min-h-[560px] [container-type:size]"} aria-label={title} style={{ "--ft": "84px", "--fb": "16px" } as CSSProperties}>
      {!embed && <h1 className="sr-only">{title}</h1>}
      <div
        className={embed ? "cine-film cine-acr absolute inset-0 overflow-hidden" : "cine-film cine-acr absolute overflow-hidden rounded-[34px] shadow-[inset_0_0_0_1px_var(--hair-strong)] max-md:left-2 max-md:right-2 md:left-4 md:right-4"}
        style={embed ? undefined : { top: "var(--ft)", bottom: "var(--fb)" }}
      >
        {c.cap.map((t, i) => (
          <p key={t} data-cap={i} className={CAP} style={HID}>
            <Kw text={t} />
          </p>
        ))}
        <div data-stage className="absolute left-1/2 top-[22%] w-[min(620px,86cqw)] -translate-x-1/2" style={{ height: `calc(${rows} * (clamp(32px,5cqh,46px) + 6px))` }}>
          {order.map((t, i) => (
            <Bead key={t} as="div" data-row radius={22} className="cine-fg absolute inset-x-0 top-0 flex h-[clamp(32px,5cqh,46px)] items-center justify-between px-5 text-[clamp(14px,2cqw,19px)]" style={HID}>
              <span className={i === 7 ? "font-semibold" : "cine-fg2"}>{t}</span>
              {i === 7 && (
                <span className="flex items-center gap-2 font-mono text-[0.8em]">
                  <span className="cine-fg2">{c.rank}</span>
                  <span data-rank className="tabular-nums">8</span>
                </span>
              )}
            </Bead>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-[11%] mx-auto flex w-[min(620px,86cqw)] gap-3">
          {c.vitals.map(([l, a]) => (
            <Bead key={l} as="div" data-vit radius={22} className="cine-fg flex min-w-0 flex-1 flex-col gap-2 px-4 py-3" style={HID}>
              <span className="flex items-center gap-2 text-[clamp(11px,1.5cqw,14px)]">
                <span data-dot className="h-2 w-2 rounded-full" style={{ background: RED }} />
                <span className="cine-fg2 truncate">{l}</span>
              </span>
              <span data-num className="text-[clamp(16px,2.6cqw,26px)] font-semibold tabular-nums tracking-[-0.03em]">{a}</span>
              <span className="relative h-[3px] overflow-hidden rounded-full bg-[var(--hair-strong)]">
                <span data-fill className="absolute inset-0 origin-left" style={{ transform: "scaleX(.18)", background: RED }} />
              </span>
            </Bead>
          ))}
        </div>
        <div data-end className="absolute inset-0 flex items-center justify-center" style={HID}>
          <p className="max-w-[12ch] px-6 text-center text-[clamp(40px,8cqw,120px)] font-medium leading-[1.02] tracking-[-0.05em] cine-fg">
            <Kw text={c.end} />
          </p>
        </div>
        {!embed && !prefersReducedMotion() && (
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center px-5">
            <Bead as="div" radius={24} className="cine-fg flex h-12 items-center gap-1 px-1.5">
              <button type="button" onClick={ended ? replay : toggle} aria-label={ended ? c.ctl.replay : playing ? c.ctl.pause : c.ctl.play} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--hover)]">
                {ended ? <RotateCcw size={18} strokeWidth={1.9} /> : playing ? <Pause size={18} strokeWidth={1.9} /> : <Play size={18} strokeWidth={1.9} />}
              </button>
              <span className="relative mx-1 block h-[3px] w-[clamp(96px,22vw,200px)] overflow-hidden rounded-full bg-[var(--hair-strong)]">
                <span ref={bar} className="absolute inset-0 origin-left bg-[var(--accent)]" style={{ transform: "scaleX(0)" }} />
              </span>
            </Bead>
          </div>
        )}
      </div>
    </section>
  );
}
