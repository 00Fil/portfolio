"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Briefcase, GraduationCap, Landmark, Sparkles } from "lucide-react";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import BlurText from "@/components/reactbits/BlurText";
import CountUp from "@/components/reactbits/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHead } from "./SectionHead";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Milestone = { tag: string; title: string; body: string; value: number; unit: string };
const ICONS = [GraduationCap, Landmark, Briefcase, Sparkles];

/**
 * Percorso come linea del tempo: la linea si riempie mentre scorri, ogni tappa si accende quando la linea la raggiunge.
 * Su desktop le schede si alternano ai due lati, su telefono stanno tutte a destra della linea.
 * Schede, titoli e numeri sono componenti di React Bits (SpotlightCard, BlurText, CountUp).
 */
export function Timeline({ title, lead, items }: { title: string; lead: string; items: Milestone[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo("[data-fill]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-track]", start: "top 60%", end: "bottom 60%", scrub: 0.4 } });
        gsap.utils.toArray<HTMLElement>("[data-item]", el).forEach((it) => {
          const side = Number(it.dataset.side);
          const dot = it.querySelector("[data-dot]");
          ScrollTrigger.create({
            trigger: it,
            start: "top 60%",
            onEnter: () => dot?.classList.add("is-on"),
            onLeaveBack: () => dot?.classList.remove("is-on"),
          });
          gsap.fromTo(
            it.querySelector("[data-card]"),
            { autoAlpha: 0, x: window.innerWidth >= 1024 ? side * 48 : 24, rotateY: side * -8 },
            { autoAlpha: 1, x: 0, rotateY: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: it, start: "top 78%", toggleActions: "play none none reverse" } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="path" className="relative mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-36">
      <Reveal>
        <SectionHead index="04" title={title} lead={lead} />
      </Reveal>

      <ol data-track className="relative mt-6 [perspective:1400px]">
        {/* la linea: grigia, poi azzurra man mano che si scorre */}
        <span aria-hidden className="absolute bottom-0 left-[19px] top-0 w-px bg-white/10 lg:left-1/2">
          <span data-fill className="block h-full w-full origin-top bg-[var(--sky)] shadow-[0_0_12px_var(--sky)]" />
        </span>

        {items.map((m, i) => {
          const I = ICONS[i % ICONS.length];
          const right = i % 2 === 1;
          return (
            <li key={m.title} data-item data-side={right ? 1 : -1} className="relative grid py-8 pl-14 lg:grid-cols-2 lg:gap-24 lg:pl-0">
              {/* nodo sulla linea */}
              <span
                data-dot
                aria-hidden
                className="tl-dot absolute left-0 top-12 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black text-ink-3 lg:left-1/2 lg:-translate-x-1/2"
              >
                <I size={17} strokeWidth={1.7} />
              </span>
              <div data-card className={right ? "lg:col-start-2" : "lg:col-start-1 lg:row-start-1"}>
                <SpotlightCard className="rounded-[28px] border border-white/[0.07] bg-[#111214] p-7" spotlightColor="rgba(94, 196, 255, 0.14)">
                  <div className="flex items-center justify-between gap-4">
                    <span className="rounded-full bg-[var(--accent-subtle)] px-3 py-1 font-mono text-[12px] text-accent-on-subtle">{m.tag}</span>
                    <span className="font-mono text-[12px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <BlurText text={m.title} animateBy="words" direction="bottom" delay={60} className="mt-6 text-[clamp(26px,2.6vw,36px)] font-medium leading-[1.08] tracking-[-0.035em] text-ink" />
                  <p className="mt-3 text-[16px] leading-[1.55] text-ink-2">{m.body}</p>
                  <div className="mt-6 flex items-baseline gap-3 border-t border-white/[0.07] pt-5">
                    <CountUp to={m.value} duration={1.6} separator="" className="t-fig text-[40px] font-medium leading-none tracking-[-0.04em] text-ink" />
                    <span className="text-[14px] text-ink-3">{m.unit}</span>
                  </div>
                </SpotlightCard>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
