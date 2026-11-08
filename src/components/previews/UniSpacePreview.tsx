"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { useLoop } from "./useLoop";

/** uniSpace / StudyCut: i silenzi della lezione si chiudono, la velocità sale a 3×, la formula detta diventa LaTeX. */
export function UniSpacePreview() {
  const locale = useLocale();
  const bars = useMemo(() => {
    const out: { h: number; silent: boolean }[] = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 64; i++) {
      const silent = (i > 9 && i < 15) || (i > 30 && i < 37) || (i > 50 && i < 55);
      out.push({ h: silent ? 0.06 + rnd() * 0.05 : 0.25 + rnd() * 0.75, silent });
    }
    return out;
  }, []);

  const ref = useLoop<HTMLDivElement>((root, tl) => {
    const silent = root.querySelectorAll("[data-silent]");
    const speeds = root.querySelectorAll("[data-speed]");
    tl.set(silent, { width: 4, marginRight: 3, opacity: 1 })
      .set(speeds, { yPercent: 0 })
      .set(root.querySelector("[data-tex]"), { opacity: 0, filter: "blur(6px)" })
      .set(root.querySelector("[data-raw]"), { opacity: 1 })
      .to(silent, { backgroundColor: "rgba(255,122,115,0.55)", duration: 0.3, stagger: 0.02 }, 0.6)
      .to(silent, { width: 0, marginRight: 0, opacity: 0, duration: 0.6, ease: "power3.inOut" }, 1.5)
      .to(speeds, { yPercent: -100, duration: 0.38, ease: "power2.out" }, 1.9)
      .to(speeds, { yPercent: -200, duration: 0.38, ease: "power2.out" }, 2.5)
      .to(root.querySelector("[data-raw]"), { opacity: 0, duration: 0.3 }, 3.2)
      .to(root.querySelector("[data-tex]"), { opacity: 1, filter: "blur(0px)", duration: 0.5 }, 3.4)
      .to({}, { duration: 1.8 });
  });

  return (
    <div ref={ref} className="flex h-full w-full flex-col justify-center gap-6 p-[7%]">
      <div className="flex items-center justify-between">
        <span className="t-label text-[10px] text-ink-3">StudyCut</span>
        <span className="t-fig relative inline-flex h-5 overflow-hidden rounded-full bg-[#1c1c1e] px-2 text-[11px] leading-5 text-ink">
          <span className="flex flex-col">
            {["1×", "2×", "3×"].map((s) => (
              <span key={s} data-speed className="block h-5">
                {s}
              </span>
            ))}
          </span>
        </span>
      </div>
      <div className="flex h-[38%] items-center">
        {bars.map((b, i) => (
          <span
            key={i}
            {...(b.silent ? { "data-silent": "" } : {})}
            className="block shrink-0 rounded-full"
            style={{ width: 4, marginRight: 3, height: `${b.h * 100}%`, background: b.silent ? "#3a3a3c" : "var(--accent-on-subtle)" }}
          />
        ))}
      </div>
      <div className="relative h-8 rounded-[10px] bg-[#0b0b0c] px-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
        <span data-raw className="absolute inset-x-3 top-1/2 -translate-y-1/2 truncate text-[12px] text-ink-2">
          {locale === "it" ? "…la derivata di x al quadrato è due x" : "…the derivative of x squared is two x"}
        </span>
        <span data-tex className="t-serif absolute inset-x-3 top-1/2 -translate-y-1/2 text-[17px] text-ink not-italic">
          <i>d</i>/<i>dx</i> <i>x</i>
          <sup>2</sup> = 2<i>x</i>
        </span>
      </div>
    </div>
  );
}
