"use client";

import LogoLoop from "@/components/reactbits/LogoLoop";
import { LOGO_STRIP } from "@/content/skills";

/* Lista costruita una volta sola, fuori dal render: LogoLoop rimisura a ogni cambio di riferimento. */
const LOGOS = LOGO_STRIP.map((s) => ({
  title: s.name,
  node: (
    <span className="flex items-center gap-3 whitespace-nowrap text-[26px] font-medium tracking-[-0.03em] text-ink-2">
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current text-ink-3" aria-hidden>
        <path d={s.path} />
      </svg>
      {s.name}
    </span>
  ),
}));

export function StackLoop() {
  return (
    <div className="py-4">
      <LogoLoop logos={LOGOS} speed={40} direction="left" logoHeight={36} gap={56} pauseOnHover fadeOut fadeOutColor="#000000" scaleOnHover ariaLabel="Stack" />
    </div>
  );
}
