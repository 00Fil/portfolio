"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Briefcase, GraduationCap, Landmark, Sparkles } from "lucide-react";
import BlurText from "@/components/reactbits/BlurText";
import CountUp from "@/components/reactbits/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHead } from "./SectionHead";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Milestone = { tag: string; title: string; body: string; value: number; suffix?: string; unit: string };
const ICONS = [GraduationCap, Landmark, Briefcase, Sparkles];

/**
 * Percorso come pila di schede: ognuna si ferma in alto e la successiva le scorre sopra,
 * mentre quella sotto arretra e si spegne. Un solo colore, l'azzurro cielo, solo come dettaglio.
 */
export function Timeline({ title, lead, items }: { title: string; lead: string; items: Milestone[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]");
        const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bar-h")) || 66;
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          gsap.to(card.querySelector("[data-stack-face]"), {
            scale: 0.9 + i * 0.015,
            filter: "brightness(0.45)",
            ease: "none",
            scrollTrigger: { trigger: next, start: "top 55%", end: () => `top ${bar + 28 + (i + 1) * 14}px`, scrub: true },
          });
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

      <div data-stack className="relative mt-12 sm:mt-16">
        <ol className="relative">
          {items.map((m, i) => {
            const I = ICONS[i % ICONS.length];
            return (
              <li
                key={m.title}
                data-stack-card
                className="sticky pb-6 sm:pb-10"
                style={{ top: `calc(var(--bar-h) + 28px + ${i * 14}px)` }}
              >
                <article
                  data-stack-face
                  className="relative origin-top overflow-hidden rounded-[32px] bg-[#0d0e10] shadow-[inset_0_0_0_1px_rgba(255,255,255,.07),0_-24px_60px_-20px_rgba(0,0,0,.9)] will-change-transform"
                >
                  {/* luce azzurra in un angolo e marchio della tappa in filigrana */}
                  <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--sky)] opacity-[0.10] blur-[70px]" />
                  <I aria-hidden strokeWidth={0.6} className="pointer-events-none absolute -bottom-10 right-6 h-56 w-56 text-white/[0.025] sm:h-72 sm:w-72" />

                  <div className="relative grid gap-8 p-7 sm:p-10 lg:min-h-[400px] lg:grid-cols-12 lg:gap-10 lg:p-14">
                    <div className="flex flex-col justify-between gap-8 lg:col-span-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.05] text-[var(--sky)] shadow-[inset_0_0_0_1px_rgba(94,196,255,.25)]">
                          <I size={19} strokeWidth={1.7} aria-hidden />
                        </span>
                        <span className="font-mono text-[13px] tracking-[0.04em] text-[var(--sky)]">{m.tag}</span>
                      </div>
                      <p className="t-fig hidden font-mono text-[clamp(64px,9vw,128px)] lg:block leading-[0.85] tracking-[-0.06em] text-white/[0.09]" aria-hidden>
                        {String(i + 1).padStart(2, "0")}
                      </p>
                    </div>

                    <div className="flex flex-col justify-between gap-8 lg:col-span-7">
                      <div>
                        <BlurText
                          text={m.title}
                          animateBy="words"
                          direction="bottom"
                          delay={60}
                          className="text-[clamp(30px,3.6vw,52px)] font-medium leading-[1.04] tracking-[-0.04em] text-ink"
                        />
                        <p className="mt-4 max-w-[46ch] text-[17px] leading-[1.55] text-ink-2">{m.body}</p>
                      </div>
                      <div className="flex items-baseline gap-3 border-t border-white/[0.07] pt-6">
                        <span className="t-fig text-[clamp(44px,5vw,64px)] font-medium leading-none tracking-[-0.045em] text-ink">
                          <CountUp to={m.value} duration={1.6} separator="" />
                          {m.suffix && <span className="text-[var(--sky)]">{m.suffix}</span>}
                        </span>
                        <span className="text-[15px] leading-snug text-ink-3">{m.unit}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
