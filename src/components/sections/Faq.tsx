"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { Plus } from "lucide-react";
import { play } from "@/lib/sound";
import { prefersReducedMotion } from "@/lib/env";

/** Domande frequenti: una riga si apre con la molla di cambio pagina; il segno più ruota in una croce. */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const toggle = (i: number) => {
    const next = open === i ? null : i;
    const reduce = prefersReducedMotion();
    panels.current.forEach((p, j) => {
      if (!p) return;
      const show = j === next;
      gsap.to(p, { height: show ? "auto" : 0, opacity: show ? 1 : 0, duration: reduce ? 0 : show ? 0.45 : 0.3, ease: show ? "power3.out" : "power2.inOut" });
    });
    play(next === null ? "toggle" : "press");
    setOpen(next);
  };
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={it.q} className="rounded-[20px] bg-surface">
          <button
            type="button"
            aria-expanded={open === i}
            aria-controls={`faq-${i}`}
            onClick={() => toggle(i)}
            className="flex w-full items-center justify-between gap-4 rounded-[20px] px-5 py-4 text-left text-ink sm:px-6 sm:py-5"
          >
            <span className="font-medium">{it.q}</span>
            <Plus size={18} strokeWidth={1.6} aria-hidden className="shrink-0 text-ink-2 transition-transform duration-300 ease-[var(--ease-out)]" style={{ transform: open === i ? "rotate(45deg)" : undefined }} />
          </button>
          <div id={`faq-${i}`} ref={(el) => { panels.current[i] = el; }} className="h-0 overflow-hidden opacity-0" role="region">
            <p className="max-w-[60ch] px-5 pb-5 text-ink-2 sm:px-6 sm:pb-6">{it.a}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
