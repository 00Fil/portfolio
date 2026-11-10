"use client";

import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { useId, useRef } from "react";
import { Drop } from "@/components/glass/Drop";
import { setTheme, useTheme } from "@/lib/theme";
import { play } from "@/lib/sound";

/** Sole e luna disegnati: il disco resta, i raggi entrano o escono e la luna lo morde. */
export function ThemeToggle({ className = "h-[42px] w-[42px]" }: { className?: string }) {
  const t = useTranslations("nav");
  const theme = useTheme();
  const svg = useRef<SVGSVGElement>(null);
  const mid = `moon-${useId().replace(/:/g, "")}`;
  const light = theme === "light";
  const flip = () => {
    const next = light ? "dark" : "light";
    if (svg.current) gsap.fromTo(svg.current, { rotate: -90, scale: 0.6 }, { rotate: 0, scale: 1, duration: 0.7, ease: "back.out(2)" });
    setTheme(next);
    play("toggle");
  };
  return (
    <Drop className={className} label={light ? t("toDark") : t("toLight")} onClick={flip}>
      <svg ref={svg} viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
        <mask id={mid}>
          <rect width="24" height="24" fill="#fff" />
          <circle cx={light ? 30 : 16.5} cy={light ? -6 : 7.5} r="6.5" fill="#000" style={{ transition: "cx .5s, cy .5s" }} />
        </mask>
        <circle cx="12" cy="12" r={light ? 4.6 : 7} fill="currentColor" mask={`url(#${mid})`} style={{ transition: "r .5s" }} />
        <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ opacity: light ? 1 : 0, transition: "opacity .4s" }}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="2.2" x2="12" y2="4.2" transform={`rotate(${a} 12 12)`} />
          ))}
        </g>
      </svg>
    </Drop>
  );
}
