"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BRAND } from "@/content/brand-icons";
import { play } from "@/lib/sound";
import { prefersReducedMotion } from "@/lib/env";
import { Cover } from "./Covers";
import { useCoverTransition } from "./CoverTransition";

export type CardData = { slug: string; name: string; label: string; def: string; scroll: string; stack: { id: keyof typeof BRAND; name: string }[] };

/**
 * Scheda di un progetto: copertina che si inclina verso il cursore (i livelli si separano in profondità),
 * sotto il nome, cosa è stato fatto e lo stack. Al clic la copertina diventa la pagina del progetto.
 */
export function CoverCard({ p, open, big = false }: { p: CardData; open: string; big?: boolean }) {
  const frame = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const { go } = useCoverTransition();
  const href = `/lavori/${p.slug}`;

  useEffect(() => {
    const f = frame.current;
    const t = tilt.current;
    if (!f || !t || prefersReducedMotion()) return;
    const rx = gsap.quickTo(t, "rotateX", { duration: 0.8, ease: "power3.out" });
    const ry = gsap.quickTo(t, "rotateY", { duration: 0.8, ease: "power3.out" });
    const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", t).map((el) => ({
      d: Number(el.dataset.depth),
      x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
    }));
    const move = (e: PointerEvent) => {
      const r = f.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      ry(nx * 6);
      rx(-ny * 5);
      layers.forEach((l) => {
        l.x(-nx * 26 * l.d);
        l.y(-ny * 18 * l.d);
      });
    };
    const leave = () => {
      rx(0);
      ry(0);
      layers.forEach((l) => {
        l.x(0);
        l.y(0);
      });
    };
    f.addEventListener("pointermove", move);
    f.addEventListener("pointerleave", leave);
    return () => {
      f.removeEventListener("pointermove", move);
      f.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <article data-card className="group">
      <Link
        href={href}
        aria-label={`${p.name}: ${open}`}
        onPointerEnter={() => {
          setActive(true);
          play("tick");
        }}
        onPointerLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          play("open");
          gsap.set(tilt.current, { rotateX: 0, rotateY: 0 });
          go(p.slug, href, frame.current!, { def: p.def, label: p.label, scroll: p.scroll });
        }}
        className="block [perspective:1800px]"
      >
        <div
          ref={frame}
          data-cover
          className={`relative w-full overflow-hidden rounded-[28px] ${big ? "aspect-[4/3] sm:aspect-[16/9]" : "aspect-[4/3]"}`}
          style={{ boxShadow: "0 0 0 1px var(--hair)" }}
        >
          <div ref={tilt} className="absolute inset-0 [transform-style:preserve-3d]" style={{ transformOrigin: "50% 50%" }}>
            <Cover slug={p.slug} />
          </div>
          <span
            className="drop absolute bottom-4 left-4 flex h-11 items-center gap-2 px-4 text-[15px] font-medium text-ink transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-translate-y-0.5 sm:bottom-5 sm:left-5"
            style={{ ["--drop-tint" as string]: "rgba(10,10,12,.55)" }}
          >
            {open}
            <ArrowUpRight size={16} strokeWidth={1.9} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </span>
        </div>
      </Link>

      <div className={`mt-6 grid gap-4 ${big ? "lg:grid-cols-12 lg:gap-10" : ""}`}>
        <div className={big ? "lg:col-span-5" : ""}>
          <h3 className="text-[clamp(28px,3vw,40px)] font-medium leading-[1.05] tracking-[-0.04em] text-ink">{p.name}</h3>
          <p className="t-foot mt-2 text-ink-3">{p.label}</p>
        </div>
        <div className={big ? "lg:col-span-7" : ""}>
          <p className="max-w-[52ch] text-[17px] leading-[1.5] text-ink-2">{p.def}</p>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="Stack">
            {p.stack.map((s) => (
              <li key={s.id} className="flex items-center gap-1.5 text-[13px] text-ink-3">
                <svg viewBox="0 0 24 24" className="h-[15px] w-[15px] fill-current text-ink-2" aria-hidden>
                  <path d={BRAND[s.id].path} />
                </svg>
                {s.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
