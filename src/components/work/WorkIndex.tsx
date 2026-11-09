"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { play } from "@/lib/sound";
import { prefersReducedMotion } from "@/lib/env";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ParticleObject = dynamic(() => import("@/components/canvasui/ParticleObject"), { ssr: false });


export type IndexItem = {
  slug: string;
  name: string;
  headline: string;
  role: string;
  platforms: string;
  year: string;
  problem: string;
  built: string[];
  figures: { value: string; label: string }[];
};

type Labels = { title: string; lead: string; project: string; role: string; platforms: string; year: string; problem: string; built: string; open: string };

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Pagina dei lavori. In alto l'indice: passando su una riga il marchio di particelle (Canvas UI) si ricompone
 * nella forma del progetto.
 */
export function WorkIndex({ items, l }: { items: IndexItem[]; l: Labels }) {
  const root = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (prefersReducedMotion()) return;
    // senza cursore il marchio cambia da solo finché non si tocca l'indice
    const id = window.setInterval(() => {
      if (!root.current?.matches(":hover")) setHot((h) => (h + 1) % items.length);
    }, 3800);
    return () => window.clearInterval(id);
  }, [items.length]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo("[data-hch]", { yPercent: 110 }, { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.04, delay: 0.25 });
        gsap.fromTo("[data-hl]", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.08, delay: 0.6 });
        gsap.fromTo("[data-row]", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.08, delay: 0.8 });
        gsap.fromTo("[data-rule]", { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "expo.out", stagger: 0.08, delay: 0.7 });

      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const enter = (i: number) => {
    if (i === hot) return;
    setHot(i);
    play("tick");
  };

  return (
    <div ref={root}>
      {/* indice */}
      <section className="mx-auto grid min-h-[100svh] w-full max-w-[1280px] items-center gap-10 px-5 pb-16 pt-32 sm:px-8 lg:grid-cols-12 lg:pt-28">
        <div className="lg:col-span-7">
          <h1 className="overflow-hidden pb-[0.04em] text-[clamp(64px,11vw,168px)] font-medium leading-[0.9] tracking-[-0.06em] text-ink" aria-label={l.title}>
            <span aria-hidden>
              {[...l.title].map((c, i) => (
                <span key={i} data-hch className="inline-block">
                  {c}
                </span>
              ))}
            </span>
          </h1>
          <p data-hl className="t-callout mt-6 max-w-[44ch] text-ink-2">
            {l.lead}
          </p>

          <div className="mt-14">
            <div data-hl className="t-label grid grid-cols-[48px_1fr_auto] gap-4 pb-3 text-ink-3 sm:grid-cols-[48px_1.4fr_1fr_1fr_64px]">
              <span>#</span>
              <span>{l.project}</span>
              <span className="hidden sm:block">{l.role}</span>
              <span className="hidden sm:block">{l.platforms}</span>
              <span className="text-right">{l.year}</span>
            </div>
            <ul>
              {items.map((p, i) => (
                <li key={p.slug} data-row className="relative">
                  <span data-rule aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-white/10" />
                  <Link
                    href={`/lavori/${p.slug}`}
                    onPointerEnter={() => enter(i)}
                    onFocus={() => enter(i)}
                    onClick={() => play("open")}
                    className="group relative grid grid-cols-[48px_1fr_auto] items-center gap-4 py-6 sm:grid-cols-[48px_1.4fr_1fr_1fr_64px]"
                  >
                    <span
                      aria-hidden
                      className={`absolute bottom-0 left-0 h-px w-full origin-left bg-[var(--sky)] transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${hot === i ? "scale-x-100" : "scale-x-0"}`}
                    />
                    <span className={`font-mono text-[13px] transition-colors duration-300 ${hot === i ? "text-[var(--sky)]" : "text-ink-3"}`}>{pad(i)}</span>
                    <span className="flex items-center gap-3">
                      <span className={`text-[clamp(26px,3vw,40px)] font-medium tracking-[-0.04em] transition-[color,transform] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${hot === i ? "translate-x-2 text-ink" : "text-ink-2"}`}>{p.name}</span>
                      <ArrowUpRight
                        size={22}
                        strokeWidth={1.6}
                        aria-hidden
                        className={`transition-[opacity,transform] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${hot === i ? "translate-x-2 opacity-100 text-[var(--sky)]" : "-translate-x-1 opacity-0"}`}
                      />
                    </span>
                    <span className="hidden text-ink-2 sm:block">{p.role}</span>
                    <span className="hidden text-ink-2 sm:block">{p.platforms}</span>
                    <span className="t-fig text-right font-mono text-[13px] text-ink-3">{p.year}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div aria-hidden className="relative hidden aspect-square w-full lg:col-span-5 lg:block">
          <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgba(94,196,255,0.10),transparent)]" />
          {mounted && (
            <ParticleObject
              className="h-full w-full"
              src={`/marks/${items[hot].slug}.svg`}
              color="#5ec4ff"
              count={9000}
              size={2}
              sizeVariance={0.5}
              radius={120}
              strength={1.2}
              swirl={0.8}
              drift={0.5}
              scale={2.6}
              floatIntensity={0.8}
              rotationIntensity={0.7}
              floatSpeed={1.2}
              orbit={false}
            />
          )}
          <p className="t-label absolute inset-x-0 bottom-0 text-center font-mono text-ink-3">{items[hot].headline}</p>
        </div>
      </section>

    </div>
  );
}
