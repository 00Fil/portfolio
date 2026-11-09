"use client";

import { Marquee } from "@/components/motion/Marquee";

type Item = { id: string; name: string; path: string };

/** Una fascia di marchi: scorre da sola, rallenta sotto il cursore, accelera con lo scroll. */
export function StackLoop({ items, label, reverse }: { items: Item[]; label: string; reverse?: boolean }) {
  return (
    <div role="list" aria-label={label} className="relative overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <Marquee direction={reverse ? 1 : -1} speed={reverse ? 30 : 38}>
        {items.map((it) => (
          <span key={it.id} role="listitem" className="group mr-14 inline-flex items-center gap-3 whitespace-nowrap text-[clamp(22px,2.6vw,36px)] font-medium tracking-[-0.03em] text-ink-2 transition-colors duration-300 hover:text-ink">
            <svg viewBox="0 0 24 24" className="h-[0.9em] w-[0.9em] fill-current text-ink-3 transition-[color,transform] duration-300 group-hover:scale-110 group-hover:text-[var(--sky)]" aria-hidden>
              <path d={it.path} />
            </svg>
            {it.name}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
