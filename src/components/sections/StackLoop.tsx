"use client";

import LogoLoop from "@/components/reactbits/LogoLoop";
import { LOGO_STRIP } from "@/content/skills";

/* Liste costruite una volta sola, fuori dal render: LogoLoop rimisura a ogni cambio di riferimento. */
const toLogo = (s: (typeof LOGO_STRIP)[number]) => ({
  title: s.name,
  node: (
    <span className="flex items-center gap-3 whitespace-nowrap text-[clamp(20px,2.2vw,28px)] font-medium tracking-[-0.03em] text-ink-2">
      <svg viewBox="0 0 24 24" className="h-[0.9em] w-[0.9em] fill-current text-ink-3" aria-hidden>
        <path d={s.path} />
      </svg>
      {s.name}
    </span>
  ),
});
const half = Math.ceil(LOGO_STRIP.length / 2);
const TOP = LOGO_STRIP.slice(0, half).map(toLogo);
const BOTTOM = LOGO_STRIP.slice(half).map(toLogo);

/** Due nastri di marchi che scorrono in direzioni opposte (LogoLoop di React Bits). */
export function StackLoop() {
  return (
    <div className="flex flex-col gap-6 py-4 sm:gap-8">
      <LogoLoop logos={TOP} speed={36} direction="left" logoHeight={36} gap={56} pauseOnHover fadeOut fadeOutColor="#000000" scaleOnHover ariaLabel="Stack" />
      <LogoLoop logos={BOTTOM} speed={36} direction="right" logoHeight={36} gap={56} pauseOnHover fadeOut fadeOutColor="#000000" scaleOnHover ariaLabel="Stack" />
    </div>
  );
}
