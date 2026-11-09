"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Check, Minus, RotateCcw, X } from "lucide-react";
import { RollingNumber } from "@/components/motion/RollingNumber";
import { prefersReducedMotion } from "@/lib/env";
import { play } from "@/lib/sound";

/** Micro-interazioni del lavoro di ingegneria: CI, git, release, rilascio graduale. */

function useVisible<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, vis] as const;
}

const Tag = ({ children }: { children: string }) => <span className="t-label absolute left-5 top-4 font-mono text-ink-3">{children}</span>;

/* ───────── CI: i controlli si susseguono, un test rosso blocca il rilascio ───────── */

type St = "idle" | "run" | "ok" | "fail" | "skip";
const STAGES = ["lint", "test", "build", "deploy"] as const;
const MS = [520, 900, 760, 640];

export function PipelineTile() {
  const [ref, vis] = useVisible<HTMLDivElement>();
  const [st, setSt] = useState<St[]>(["idle", "idle", "idle", "idle"]);
  const [run, setRun] = useState(0);
  const timers = useRef<number[]>([]);
  const failNext = useRef(true);
  const reduced = useRef(false);

  const go = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const fail = failNext.current;
    failNext.current = !fail;
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    const set = (i: number, v: St) => setSt((s) => s.map((x, j) => (j === i ? v : x)));
    setSt(["idle", "idle", "idle", "idle"]);
    let t = 250;
    for (let i = 0; i < 4; i++) {
      const bad = fail && i === 1;
      at(t, () => set(i, "run"));
      t += MS[i];
      at(t, () => {
        set(i, bad ? "fail" : "ok");
        play(bad ? "press" : "tick");
        if (bad) setSt((s) => s.map((x, j) => (j > i ? "skip" : x)));
      });
      if (bad) break;
    }
    at(t + 2200, () => setRun((r) => r + 1));
  }, []);

  useEffect(() => {
    reduced.current = prefersReducedMotion();
    if (!vis) return;
    if (reduced.current) {
      setSt(["ok", "ok", "ok", "ok"]);
      return;
    }
    go();
    return () => timers.current.forEach(clearTimeout);
  }, [vis, run, go]);

  return (
    <div ref={ref} className="relative flex h-full w-full flex-col justify-center gap-2 px-5 pb-5 pt-12">
      <Tag>ci / main</Tag>
      {STAGES.map((name, i) => (
        <div key={name} className="relative flex h-11 items-center gap-3 overflow-hidden rounded-[10px] bg-sunken px-3">
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 bg-accent-subtle"
            style={{ width: st[i] === "idle" || st[i] === "skip" ? "0%" : st[i] === "run" ? "92%" : "100%", opacity: st[i] === "run" ? 1 : 0, transition: st[i] === "run" ? `width ${MS[i]}ms linear` : "opacity .3s" }}
          />
          <span className="relative flex h-5 w-5 items-center justify-center">
            {st[i] === "ok" && <Check size={16} strokeWidth={2.2} className="text-[var(--positive)]" />}
            {st[i] === "fail" && <X size={16} strokeWidth={2.2} className="text-[var(--negative)]" />}
            {st[i] === "skip" && <Minus size={16} strokeWidth={2} className="text-ink-3" />}
            {st[i] === "run" && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />}
            {st[i] === "idle" && <span className="h-1.5 w-1.5 rounded-full bg-ink-3" />}
          </span>
          <span className={`relative font-mono text-[13px] ${st[i] === "skip" ? "text-ink-3" : "text-ink"}`}>{name}</span>
          <span className="t-fig relative ml-auto font-mono text-[12px] text-ink-3">{st[i] === "ok" ? `${(MS[i] / 1000).toFixed(1)}s` : st[i] === "fail" ? "exit 1" : ""}</span>
        </div>
      ))}
      <button type="button" aria-label="Rerun" onClick={() => setRun((r) => r + 1)} className="absolute right-4 top-3 flex h-7 w-7 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-sunken hover:text-ink active:scale-90">
        <RotateCcw size={14} strokeWidth={1.8} />
      </button>
    </div>
  );
}

/* ───────── Git: un ramo nasce, accumula commit e rientra in main ───────── */

const COMMITS = [
  { x: 64, y: 70, m: "chore: bump deps", h: "a41c9e0" },
  { x: 64, y: 118, m: "fix: retry su timeout", h: "7be02d1" },
  { x: 148, y: 150, m: "feat: dedupe per hash", h: "c3d58a7" },
  { x: 148, y: 198, m: "test: casi di rete", h: "0f9b6e2" },
  { x: 64, y: 232, m: "merge: feat/sync", h: "e82a14c" },
];

export function GitTile() {
  const [ref, vis] = useVisible<HTMLDivElement>();
  const svg = useRef<SVGSVGElement>(null);
  const [cur, setCur] = useState(4);
  const hover = useRef(false);

  useEffect(() => {
    const root = svg.current;
    if (!root || !vis) return;
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const dots = gsap.utils.toArray<SVGElement>("[data-c]");
      const paths = gsap.utils.toArray<SVGPathElement>("[data-p]");
      paths.forEach((p) => {
        const l = p.getTotalLength();
        gsap.set(p, { strokeDasharray: l, strokeDashoffset: l });
      });
      gsap.set(dots, { scale: 0, transformOrigin: "50% 50%" });
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.4 });
      const step = (i: number, at: string | number) => tl.to(dots[i], { scale: 1, duration: 0.5, ease: "back.out(2.4)", onStart: () => !hover.current && setCur(i) }, at);
      tl.to(paths[0], { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }, 0.1);
      step(0, 0.1);
      step(1, 0.55);
      tl.to(paths[1], { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, 1.0);
      step(2, 1.45);
      step(3, 1.9);
      tl.to(paths[2], { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" }, 2.3);
      step(4, 2.8);
      tl.to(dots, { scale: 0, duration: 0.3, stagger: 0.04, ease: "power2.in" }, "+=2.2");
      tl.to(paths, { strokeDashoffset: (_i, el: SVGPathElement) => el.getTotalLength(), duration: 0.4, ease: "power2.in" }, "<");
    }, root);
    return () => ctx.revert();
  }, [vis]);

  const c = COMMITS[cur];
  return (
    <div ref={ref} className="relative h-full w-full">
      <Tag>git / graph</Tag>
      <svg ref={svg} viewBox="0 0 240 260" className="absolute inset-x-0 top-6 bottom-12 h-[calc(100%-4.5rem)] w-full" fill="none" aria-hidden>
        <path d="M64 56V250" stroke="#2c2c2e" strokeWidth="2" />
        <path data-p d="M64 56V118" stroke="#85857f" strokeWidth="2" strokeLinecap="round" />
        <path data-p d="M64 118C64 140 148 128 148 150V198" stroke="#2f5fff" strokeWidth="2" strokeLinecap="round" />
        <path data-p d="M148 198C148 222 64 212 64 232" stroke="#2f5fff" strokeWidth="2" strokeLinecap="round" />
        {COMMITS.map((k, i) => (
          <g key={k.h} data-c onPointerEnter={() => { hover.current = true; setCur(i); play("tick"); }} onPointerLeave={() => (hover.current = false)} style={{ cursor: "default" }}>
            <circle cx={k.x} cy={k.y} r="12" fill="transparent" />
            <circle cx={k.x} cy={k.y} r={cur === i ? 7 : 5} fill={i === 2 || i === 3 ? "#2f5fff" : "#f2f2f0"} style={{ transition: "r .2s" }} />
          </g>
        ))}
        <text x="78" y="52" fontSize="10" fill="#85857f" fontFamily="var(--font-geist-mono)">main</text>
        <text x="162" y="146" fontSize="10" fill="#85857f" fontFamily="var(--font-geist-mono)">feat/sync</text>
      </svg>
      <div className="absolute inset-x-5 bottom-4 flex items-baseline justify-between gap-3 font-mono text-[12px]">
        <span className="truncate text-ink">{c.m}</span>
        <span className="text-ink-3">{c.h}</span>
      </div>
    </div>
  );
}

/* ───────── Release: il tipo di modifica decide quale numero cresce ───────── */

const KINDS = [
  { k: "major", note: "BREAKING" },
  { k: "minor", note: "feat" },
  { k: "patch", note: "fix" },
] as const;

export function ReleaseTile() {
  const [ref, vis] = useVisible<HTMLDivElement>();
  const [v, setV] = useState<[number, number, number]>([1, 4, 2]);
  const [last, setLast] = useState<number>(2);
  const touched = useRef(false);

  const bump = useCallback((i: number, user = false) => {
    if (user) {
      touched.current = true;
      play("toggle");
    }
    setLast(i);
    setV(([a, b, c]) => (i === 0 ? [a + 1, 0, 0] : i === 1 ? [a, b + 1, 0] : [a, b, c + 1]));
  }, []);

  useEffect(() => {
    if (!vis || prefersReducedMotion()) return;
    let n = 0;
    const id = window.setInterval(() => {
      if (touched.current) return;
      bump([2, 2, 1, 2, 0][n++ % 5]);
    }, 1900);
    return () => window.clearInterval(id);
  }, [vis, bump]);

  return (
    <div ref={ref} className="relative flex h-full w-full flex-col items-center justify-center gap-6 px-5 pt-6">
      <Tag>release / semver</Tag>
      <div className="t-fig flex items-baseline font-mono text-[40px] leading-none text-ink">
        <span className="text-ink-3">v</span>
        {v.map((n, i) => (
          <span key={i} className="flex items-baseline">
            <span className={`transition-colors duration-500 ${last === i ? "text-ink" : "text-ink-2"}`}>
              <RollingNumber value={n} />
            </span>
            {i < 2 && <span className="text-ink-3">.</span>}
          </span>
        ))}
      </div>
      <div className="flex w-full gap-1.5">
        {KINDS.map((o, i) => (
          <button
            key={o.k}
            type="button"
            onClick={() => bump(i, true)}
            className={`flex-1 rounded-[10px] py-2 font-mono text-[12px] transition-[background-color,color,transform] duration-200 active:scale-[0.94] ${last === i ? "bg-accent-subtle text-accent-on-subtle" : "bg-sunken text-ink-2 hover:text-ink"}`}
          >
            {o.k}
          </button>
        ))}
      </div>
      <span className="t-label font-mono text-ink-3">{KINDS[last].note}</span>
    </div>
  );
}

/* ───────── Rilascio graduale: se l'errore supera la soglia, torna indietro da solo ───────── */

const LIMIT = 1;
const errOf = (s: number) => 0.12 + (s > 70 ? (s - 70) * 0.09 : 0);

export function CanaryTile() {
  const [ref, vis] = useVisible<HTMLDivElement>();
  const [split, setSplit] = useState(5);
  const [rolled, setRolled] = useState(false);
  const proxy = useRef({ s: 5 });
  const tl = useRef<gsap.core.Timeline | null>(null);
  const idle = useRef<number | undefined>(undefined);

  const apply = useCallback(() => setSplit(Math.round(proxy.current.s)), []);

  const rollback = useCallback(() => {
    setRolled(true);
    play("press");
    gsap.to(proxy.current, { s: 0, duration: 0.9, ease: "power3.out", onUpdate: apply, onComplete: () => window.setTimeout(() => setRolled(false), 1400) });
  }, [apply]);

  const loop = useCallback(() => {
    tl.current?.kill();
    const t = gsap.timeline({ repeat: -1 });
    const to = (s: number, d: number) => t.to(proxy.current, { s, duration: d, ease: "power2.inOut", onUpdate: apply });
    t.call(() => setRolled(false)).set(proxy.current, { s: 5 });
    to(5, 0.01).to({}, { duration: 0.9 });
    to(25, 0.7).to({}, { duration: 0.9 });
    to(50, 0.7).to({}, { duration: 0.9 });
    to(86, 0.9).call(rollback).to({}, { duration: 3.2 });
    tl.current = t;
  }, [apply, rollback]);

  useEffect(() => {
    if (!vis) {
      tl.current?.kill();
      return;
    }
    if (prefersReducedMotion()) {
      setSplit(50);
      return;
    }
    loop();
    return () => {
      tl.current?.kill();
    };
  }, [vis, loop]);

  const drag = (v: number) => {
    tl.current?.kill();
    gsap.killTweensOf(proxy.current);
    window.clearTimeout(idle.current);
    proxy.current.s = v;
    setSplit(v);
    if (errOf(v) > LIMIT) rollback();
    else setRolled(false);
    idle.current = window.setTimeout(loop, 6000);
  };

  const err = errOf(split);
  const bad = err > LIMIT || rolled;
  return (
    <div ref={ref} className="relative flex h-full w-full flex-col justify-center gap-5 px-5 pt-6">
      <Tag>release / canary</Tag>
      <div className="flex items-end justify-between">
        <div className="t-fig flex items-baseline gap-0.5 font-mono text-[40px] leading-none text-ink">
          <RollingNumber value={split} />
          <span className="text-[20px] text-ink-3">%</span>
        </div>
        <span className={`font-mono text-[12px] transition-colors duration-300 ${bad ? "text-[var(--negative)]" : "text-ink-3"}`}>{rolled ? "rollback" : `err ${err.toFixed(2)}%`}</span>
      </div>
      <div className="relative">
        <div className="h-[6px] w-full overflow-hidden rounded-full bg-sunken">
          <div className="h-full rounded-full transition-colors duration-300" style={{ width: `${split}%`, background: bad ? "var(--negative)" : "var(--accent)" }} />
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={split}
          aria-label="Traffic"
          onChange={(e) => drag(Number(e.target.value))}
          className="absolute -top-2 left-0 h-5 w-full cursor-pointer opacity-0"
        />
        <span aria-hidden className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink shadow-[0_0_0_3px_#000]" style={{ left: `${split}%` }} />
      </div>
      <div className="flex justify-between font-mono text-[11px] text-ink-3">
        <span>v1.4.2</span>
        <span>v1.5.0</span>
      </div>
    </div>
  );
}
