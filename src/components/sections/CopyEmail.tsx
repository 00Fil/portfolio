"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { Check, Copy } from "lucide-react";
import { useDrop } from "@/components/glass/useDrop";
import { play } from "@/lib/sound";

/**
 * "Copiato" di Relay (CopyFx): il contenuto si sfoca fino a 22 px in 320 ms, sale un velo di vetro con la spunta,
 * resta 700 ms, poi torna nitido in 520 ms.
 */
export function CopyEmail({ email, copy, copied }: { email: string; copy: string; copied: string }) {
  const { ref } = useDrop<HTMLButtonElement>({ deform: [0, 0], bevel: false, sound: false });
  const content = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const live = useRef<HTMLSpanElement>(null);

  const run = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      window.location.href = `mailto:${email}`;
      return;
    }
    play("copy");
    if (live.current) live.current.textContent = copied;
    tl.current?.kill();
    const o = { p: 0 };
    const apply = () => {
      const v = o.p;
      if (content.current) content.current.style.filter = v > 0.005 ? `blur(${v * 22}px)` : "";
      if (veil.current) {
        veil.current.style.opacity = String(Math.min(1, v * 1.6));
        veil.current.style.transform = `scale(${0.92 + 0.08 * v})`;
        veil.current.style.setProperty("--p", String(v * 0.8));
      }
      if (badge.current) {
        const s = 0.7 + 0.3 * v;
        badge.current.style.transform = `scale(${s})`;
        badge.current.style.opacity = String(Math.min(1, Math.max(0, (v - 0.3) / 0.5)));
      }
    };
    tl.current = gsap
      .timeline({ onUpdate: apply })
      .to(o, { p: 1, duration: 0.32, ease: "power2.inOut", onUpdate: apply })
      .to(o, { p: 0, duration: 0.52, ease: "power2.inOut", delay: 0.7, onUpdate: apply, onComplete: () => live.current && (live.current.textContent = "") });
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={run}
      className="plate press-glow group relative block w-full overflow-hidden px-6 py-8 text-left sm:px-8 sm:py-10"
      data-reveal
    >
      <div ref={content} className="flex flex-wrap items-center justify-between gap-4">
        <span className="t-title2 break-all text-ink sm:t-title1">{email}</span>
        <span className="t-foot inline-flex items-center gap-2 text-ink-2 transition-colors group-hover:text-ink">
          <Copy size={16} strokeWidth={1.6} aria-hidden />
          {copy}
        </span>
      </div>
      <div ref={veil} className="drop pointer-events-none absolute inset-0 flex items-center justify-center opacity-0" style={{ borderRadius: 28, ["--drop-tint" as string]: "rgba(28,28,30,0.84)" }} aria-hidden>
        <span className="drop-glow" />
        <div ref={badge} className="drop flex items-center gap-2 py-1.5 pl-1.5 pr-3.5" style={{ ["--drop-tint" as string]: "rgba(28,28,30,0.55)" }}>
          <span className="drop drop-accent flex h-6 w-6 items-center justify-center" style={{ ["--drop-tint" as string]: "var(--accent)" }}>
            <Check size={14} strokeWidth={2.2} className="text-white" />
          </span>
          <span className="font-medium text-ink">{copied}</span>
        </div>
      </div>
      <span ref={live} className="sr-only" aria-live="polite" />
    </button>
  );
}
