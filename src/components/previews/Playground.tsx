"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Check } from "lucide-react";
import { GlassSegmented } from "@/components/nav/GlassSegmented";
import { RollingNumber } from "@/components/motion/RollingNumber";
import { useDrop } from "@/components/glass/useDrop";
import { play } from "@/lib/sound";

/** Pezzi del design system di Relay, vivi: si toccano. */

export function SegmentedDemo() {
  const [sel, setSel] = useState(0);
  return (
    <div className="flex h-full w-full items-center justify-center p-5">
      <GlassSegmented id="lens-demo" options={["LAN", "Hub", "BT"].map((v) => ({ value: v, label: v, full: v }))} selected={sel} onSelect={setSel} label="Relay" />
    </div>
  );
}

export function RollingDemo() {
  const [v, setV] = useState(37);
  useEffect(() => {
    const id = window.setInterval(() => setV((x) => (x >= 100 ? 12 : Math.min(100, x + 17 + Math.round(Math.random() * 9)))), 1600);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="flex h-full w-full flex-col justify-center gap-4 p-6">
      <RollingNumber value={v} suffix="%" className="t-title1 t-fig text-ink" />
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#2c2c2e]">
        <div className="h-full rounded-full transition-[width] duration-[420ms] ease-[cubic-bezier(.25,.1,.25,1)]" style={{ width: `${v}%`, background: "var(--brand-gradient)" }} />
      </div>
    </div>
  );
}

export function CopyDemo({ label }: { label: string }) {
  const { ref } = useDrop<HTMLButtonElement>({ deform: [0, 0], bevel: false, sound: false });
  const body = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const run = () => {
    play("copy");
    const o = { p: 0 };
    const apply = () => {
      if (body.current) body.current.style.filter = o.p > 0.005 ? `blur(${o.p * 22}px)` : "";
      if (veil.current) {
        veil.current.style.opacity = String(Math.min(1, o.p * 1.6));
        veil.current.style.transform = `scale(${0.7 + 0.3 * o.p})`;
      }
    };
    gsap.timeline().to(o, { p: 1, duration: 0.32, ease: "power2.inOut", onUpdate: apply }).to(o, { p: 0, duration: 0.52, delay: 0.7, ease: "power2.inOut", onUpdate: apply });
  };
  return (
    <button ref={ref} type="button" onClick={run} className="press-glow relative flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit] p-5">
      <div ref={body} className="w-full space-y-2">
        <div className="h-2 w-[72%] rounded bg-[#3a3a3c]" />
        <div className="h-2 w-[90%] rounded bg-[#2c2c2e]" />
        <div className="h-2 w-[56%] rounded bg-[#2c2c2e]" />
      </div>
      <div ref={veil} className="drop pointer-events-none absolute flex items-center gap-2 py-1.5 pl-1.5 pr-3.5 opacity-0" style={{ ["--drop-tint" as string]: "rgba(28,28,30,0.6)" }}>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)]">
          <Check size={14} strokeWidth={2.4} className="text-white" />
        </span>
        <span className="font-medium text-ink">{label}</span>
      </div>
    </button>
  );
}

export function SlatsDemo() {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(true), []);
  return on ? <iframe src="/visual/slats.html?bg=1c1c1e" title="" tabIndex={-1} aria-hidden className="h-full w-full border-0" /> : null;
}
