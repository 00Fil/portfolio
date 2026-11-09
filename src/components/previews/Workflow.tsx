"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Check, Minus, RotateCcw, X } from "lucide-react";
import { RollingNumber } from "@/components/motion/RollingNumber";
import { useLocale } from "next-intl";
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

const L = {
  it: {
    ci: "Controlli automatici", stages: ["Ordine", "Prove", "Preparazione", "Pubblicazione"], stopped: "fermato",
    git: "Storia delle modifiche", main: "principale", feat: "novità",
    commits: ["Aggiornamenti di routine", "Corretto un errore di rete", "Nuova funzione", "Prove della funzione", "Unita alla versione principale"],
    ver: "Numero di versione", kinds: ["Svolta", "Novità", "Correzione"], notes: ["cambia il modo d’uso", "aggiunge qualcosa", "corregge un errore"],
    canary: "Rilascio graduale", users: "degli utenti", errors: "errori", back: "torna indietro", cur: "versione attuale", next: "nuova versione",
    pri: "Priorità", levels: ["essenziale", "importante", "utile", "escluso"],
    reqs: { auth: "Accesso", booking: "Prenotazioni", notifications: "Notifiche", "export.csv": "Esportazione", "dark-mode": "Tema scuro" } as Record<string, string>,
    arch: "Come è fatto", nodes: { app: "App", api: "Server", auth: "Accesso", db: "Dati", queue: "Attività" } as Record<string, string>, decided: "Decisione scritta",
    mon: "Tempi di risposta", alert: "avviso", ok: "tutto ok", up: "online 99,95%", limit: "soglia", last: "ultimi 10 s",
  },
  en: {
    ci: "Automatic checks", stages: ["Tidy-up", "Tests", "Build", "Publish"], stopped: "stopped",
    git: "Change history", main: "main line", feat: "new feature",
    commits: ["Routine updates", "Fixed a network error", "New feature", "Tests for the feature", "Merged into the main line"],
    ver: "Version number", kinds: ["Major", "Feature", "Fix"], notes: ["changes how it is used", "adds something", "fixes an error"],
    canary: "Gradual rollout", users: "of users", errors: "errors", back: "rolled back", cur: "current version", next: "new version",
    pri: "Priorities", levels: ["essential", "important", "nice to have", "out"],
    reqs: { auth: "Sign-in", booking: "Bookings", notifications: "Notifications", "export.csv": "Export", "dark-mode": "Dark mode" } as Record<string, string>,
    arch: "How it fits", nodes: { app: "App", api: "Server", auth: "Sign-in", db: "Data", queue: "Jobs" } as Record<string, string>, decided: "Decision recorded",
    mon: "Response time", alert: "alert", ok: "all good", up: "online 99.95%", limit: "limit", last: "last 10 s",
  },
};
const useL = () => L[useLocale() === "en" ? "en" : "it"];

const Tag = ({ children }: { children: string }) => <span className="t-foot absolute left-5 top-4 text-ink-3">{children}</span>;

/* ───────── CI: i controlli si susseguono, un test rosso blocca il rilascio ───────── */

type St = "idle" | "run" | "ok" | "fail" | "skip";
const STAGES = ["lint", "test", "build", "deploy"] as const;
const MS = [520, 900, 760, 640];

export function PipelineTile() {
  const l = useL();
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
      <Tag>{l.ci}</Tag>
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
          <span className={`relative text-[14px] ${st[i] === "skip" ? "text-ink-3" : "text-ink"}`}>{l.stages[i] ?? name}</span>
          <span className="t-fig relative ml-auto font-mono text-[12px] text-ink-3">{st[i] === "ok" ? `${(MS[i] / 1000).toFixed(1)}s` : st[i] === "fail" ? l.stopped : ""}</span>
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
  const l = useL();
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

  return (
    <div ref={ref} className="relative h-full w-full">
      <Tag>{l.git}</Tag>
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
        <text x="78" y="52" fontSize="10" fill="#85857f" fontFamily="var(--font-geist-mono)">{l.main}</text>
        <text x="162" y="146" fontSize="10" fill="#85857f" fontFamily="var(--font-geist-mono)">{l.feat}</text>
      </svg>
      <div className="absolute inset-x-5 bottom-4 text-[13px]">
        <span className="truncate text-ink">{l.commits[cur]}</span>
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
  const l = useL();
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
      <Tag>{l.ver}</Tag>
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
            className={`flex-1 rounded-[10px] py-2 text-[13px] transition-[background-color,color,transform] duration-200 active:scale-[0.94] ${last === i ? "bg-accent-subtle text-accent-on-subtle" : "bg-sunken text-ink-2 hover:text-ink"}`}
          >
            {l.kinds[i]}
          </button>
        ))}
      </div>
      <span className="t-foot text-ink-3">{l.notes[last]}</span>
    </div>
  );
}

/* ───────── Rilascio graduale: se l'errore supera la soglia, torna indietro da solo ───────── */

const LIMIT = 1;
const errOf = (s: number) => 0.12 + (s > 70 ? (s - 70) * 0.09 : 0);

export function CanaryTile() {
  const l = useL();
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
      <Tag>{l.canary}</Tag>
      <div className="flex items-end justify-between">
        <div className="t-fig flex items-baseline gap-0.5 font-mono text-[40px] leading-none text-ink">
          <RollingNumber value={split} />
          <span className="text-[20px] text-ink-3">%</span>
          <span className="ml-2 font-sans text-[13px] text-ink-3">{l.users}</span>
        </div>
        <span className={`text-[13px] transition-colors duration-300 ${bad ? "text-[var(--negative)]" : "text-ink-3"}`}>{rolled ? l.back : `${l.errors} ${err.toFixed(2)}%`}</span>
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
      <div className="flex justify-between text-[12px] text-ink-3">
        <span>{l.cur}</span>
        <span>{l.next}</span>
      </div>
    </div>
  );
}

/* ───────── Requisiti: le priorità decidono l'ordine, la lista si riordina ───────── */

const PRI = ["must", "should", "could", "won't"] as const;
const REQS = [
  { id: "auth", p: 0 },
  { id: "booking", p: 0 },
  { id: "notifications", p: 1 },
  { id: "export.csv", p: 2 },
  { id: "dark-mode", p: 3 },
];

export function RequirementsTile() {
  const l = useL();
  const [ref, vis] = useVisible<HTMLDivElement>();
  const list = useRef<HTMLUListElement>(null);
  const [rows, setRows] = useState(REQS);
  const touched = useRef(false);
  const flip = useRef<unknown>(null);

  const change = useCallback(async (id: string, user = false) => {
    if (user) {
      touched.current = true;
      play("toggle");
    }
    const { Flip } = await import("gsap/Flip");
    gsap.registerPlugin(Flip);
    flip.current = Flip.getState(list.current!.children);
    setRows((r) => r.map((x) => (x.id === id ? { ...x, p: (x.p + (user ? 1 : 3)) % 4 } : x)));
  }, []);

  useEffect(() => {
    if (!flip.current) return;
    void import("gsap/Flip").then(({ Flip }) => {
      Flip.from(flip.current as ReturnType<typeof Flip.getState>, { duration: 0.6, ease: "power3.inOut", absolute: false });
      flip.current = null;
    });
  }, [rows]);

  useEffect(() => {
    if (!vis || prefersReducedMotion()) return;
    let n = 0;
    const order = ["notifications", "export.csv", "booking", "dark-mode", "export.csv"];
    const id = window.setInterval(() => !touched.current && change(order[n++ % order.length]), 2300);
    return () => window.clearInterval(id);
  }, [vis, change]);

  const sorted = [...rows].sort((a, b) => a.p - b.p || REQS.findIndex((x) => x.id === a.id) - REQS.findIndex((x) => x.id === b.id));
  return (
    <div ref={ref} className="relative flex h-full w-full flex-col justify-center px-5 pb-5 pt-12">
      <Tag>{l.pri}</Tag>
      <ul ref={list} className="space-y-1.5">
        {sorted.map((r) => (
          <li key={r.id} data-flip-id={r.id} className={`flex h-10 items-center gap-3 rounded-[10px] bg-sunken pl-3 pr-1.5 transition-opacity duration-300 ${r.p === 3 ? "opacity-40" : ""}`}>
            <span className={`text-[14px] ${r.p === 3 ? "text-ink-3 line-through" : "text-ink"}`}>{l.reqs[r.id]}</span>
            <button
              type="button"
              onClick={() => change(r.id, true)}
              className={`ml-auto w-[96px] rounded-[7px] py-1 text-[12px] transition-colors duration-300 active:scale-95 ${r.p === 0 ? "bg-accent-subtle text-accent-on-subtle" : "bg-white/[0.04] text-ink-2 hover:text-ink"}`}
            >
              {l.levels[r.p]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────── Architettura: una richiesta attraversa il sistema; i collegamenti si leggono passando sopra ───────── */

const NODES = [
  { id: "app", x: 40, y: 120 },
  { id: "api", x: 130, y: 120 },
  { id: "auth", x: 130, y: 44 },
  { id: "db", x: 214, y: 82 },
  { id: "queue", x: 214, y: 158 },
] as const;
const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [1, 3],
  [1, 4],
];

export function ArchitectureTile() {
  const l = useL();
  const [ref, vis] = useVisible<HTMLDivElement>();
  const svg = useRef<SVGSVGElement>(null);
  const [hot, setHot] = useState<number | null>(null);

  useEffect(() => {
    const root = svg.current;
    if (!root || !vis || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray<SVGLineElement>("[data-e]");
      lines.forEach((l) => {
        const len = Math.hypot(+l.getAttribute("x2")! - +l.getAttribute("x1")!, +l.getAttribute("y2")! - +l.getAttribute("y1")!);
        gsap.set(l, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set("[data-n]", { scale: 0, transformOrigin: "50% 50%" });
      gsap.set("[data-adr]", { autoAlpha: 0, scale: 1.4 });
      const intro = gsap.timeline();
      intro.to("[data-n]", { scale: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.08 }).to(lines, { strokeDashoffset: 0, duration: 0.5, ease: "power2.inOut", stagger: 0.12 }, "-=0.2").to("[data-adr]", { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(3)" });
      // il pacchetto: app → api → (auth, db, queue) e ritorno
      const dot = root.querySelector("[data-dot]");
      const hop = (a: number, b: number) => [
        { x: NODES[a].x, y: NODES[a].y },
        { x: NODES[b].x, y: NODES[b].y },
      ];
      const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.8, delay: intro.duration() });
      loop.set(dot, { autoAlpha: 1, attr: { cx: NODES[0].x, cy: NODES[0].y } });
      [
        [0, 1],
        [1, 2],
        [2, 1],
        [1, 3],
        [3, 1],
        [1, 4],
        [4, 1],
        [1, 0],
      ].forEach(([a, b]) => {
        const [, to] = hop(a, b);
        loop.to(dot, { attr: { cx: to.x, cy: to.y }, duration: 0.42, ease: "power1.inOut" });
      });
      loop.set(dot, { autoAlpha: 0 });
    }, root);
    return () => ctx.revert();
  }, [vis]);

  const linked = (e: [number, number]) => hot !== null && (e[0] === hot || e[1] === hot);
  return (
    <div ref={ref} className="relative h-full w-full">
      <Tag>{l.arch}</Tag>
      <svg ref={svg} viewBox="0 0 254 210" className="absolute inset-x-0 top-8 bottom-10 h-[calc(100%-4.5rem)] w-full" fill="none">
        {EDGES.map((e, i) => (
          <line
            key={i}
            data-e
            x1={NODES[e[0]].x}
            y1={NODES[e[0]].y}
            x2={NODES[e[1]].x}
            y2={NODES[e[1]].y}
            stroke={linked(e) ? "#5ec4ff" : "#3a3a3c"}
            strokeWidth={linked(e) ? 2 : 1.5}
            style={{ transition: "stroke .25s, stroke-width .25s" }}
          />
        ))}
        <circle data-dot r="4" fill="#5ec4ff" opacity="0" />
        {NODES.map((n, i) => (
          <g key={n.id} data-n onPointerEnter={() => { setHot(i); play("tick"); }} onPointerLeave={() => setHot(null)}>
            <rect x={n.x - 30} y={n.y - 14} width="60" height="28" rx="9" fill={hot === i ? "#11244f" : "#2c2c2e"} style={{ transition: "fill .25s" }} />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11" fill={hot === i ? "#b4d2ff" : "#f2f2f0"} fontFamily="var(--font-geist-sans)">
              {l.nodes[n.id]}
            </text>
          </g>
        ))}
      </svg>
      <div data-adr className="absolute bottom-4 left-5 inline-flex items-center gap-2 rounded-full border border-[var(--positive)]/40 px-2.5 py-0.5 text-[12px] text-[var(--positive)]">
        {l.decided}
      </div>
    </div>
  );
}

/* ───────── Esercizio: latenza contro l'obiettivo di servizio, un picco genera un avviso ───────── */

const SLO = 300;
const W = 240;
const H = 120;
const POINTS = 40;

export function MonitorTile() {
  const l = useL();
  const [ref, vis] = useVisible<HTMLDivElement>();
  const [data, setData] = useState<number[]>(() => Array.from({ length: POINTS }, (_, i) => 150 + Math.sin(i / 3) * 25));
  const [hover, setHover] = useState<number | null>(null);
  const tick = useRef(0);

  useEffect(() => {
    if (!vis || prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      tick.current++;
      const t = tick.current % 46;
      const spike = t >= 30 && t < 35 ? 220 * Math.sin(((t - 30) / 5) * Math.PI) : 0;
      setData((d) => [...d.slice(1), Math.max(80, 150 + Math.sin(tick.current / 3) * 25 + (Math.random() - 0.5) * 40 + spike)]);
    }, 260);
    return () => window.clearInterval(id);
  }, [vis]);

  const y = (v: number) => H - (Math.min(v, 520) / 520) * H;
  const x = (i: number) => (i / (POINTS - 1)) * W;
  const d = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const last = data[data.length - 1];
  const shown = hover !== null ? data[hover] : last;
  const alert = last > SLO;

  return (
    <div ref={ref} className="relative flex h-full w-full flex-col justify-end gap-3 px-5 pb-5 pt-12">
      <Tag>{l.mon}</Tag>
      <span
        className={`absolute right-5 top-3.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] transition-colors duration-300 ${alert ? "bg-[var(--negative)]/15 text-[var(--negative)]" : "bg-white/[0.04] text-[var(--positive)]"}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${alert ? "animate-pulse bg-[var(--negative)]" : "bg-[var(--positive)]"}`} />
        {alert ? l.alert : l.ok}
      </span>
      <div className="flex items-baseline gap-1 font-mono">
        <span className="t-fig text-[40px] leading-none text-ink">
          <RollingNumber value={Math.round(shown)} />
        </span>
        <span className="text-[14px] text-ink-3">ms</span>
        <span className="ml-auto font-sans text-[12px] text-ink-3">{l.up}</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-[46%] w-full overflow-visible"
        preserveAspectRatio="none"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover(Math.max(0, Math.min(POINTS - 1, Math.round(((e.clientX - r.left) / r.width) * (POINTS - 1)))));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <line x1="0" x2={W} y1={y(SLO)} y2={y(SLO)} stroke="#ff5a52" strokeOpacity="0.5" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
        <path d={d} stroke={alert ? "#ff5a52" : "#5ec4ff"} strokeWidth="1.8" fill="none" vectorEffect="non-scaling-stroke" style={{ transition: "stroke .3s" }} />
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="#f2f2f0" strokeOpacity="0.35" vectorEffect="non-scaling-stroke" />}
      </svg>
      <div className="flex justify-between text-[12px] text-ink-3">
        <span>{l.limit} {SLO} ms</span>
        <span>{l.last}</span>
      </div>
    </div>
  );
}
