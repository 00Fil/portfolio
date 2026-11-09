"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import CountUp from "@/components/reactbits/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHead } from "./SectionHead";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Milestone = { tag: string; big: string; title: string; body: string; value: number; suffix?: string; unit: string };

/**
 * Percorso come viaggio orizzontale: su desktop la sezione si ferma e le tappe scorrono di lato,
 * lungo una linea che si riempie d'azzurro; la tappa raggiunta si accende, le altre restano in penombra.
 * Su telefono le stesse tappe scendono in verticale lungo la linea.
 */
export function Timeline({ title, lead, items }: { title: string; lead: string; items: Milestone[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]", el);
      const mm = gsap.matchMedia();

      const light = (i: number) =>
        steps.forEach((s, k) => {
          s.classList.toggle("is-on", k <= i);
          s.classList.toggle("is-now", k === i);
        });

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const track = el.querySelector<HTMLElement>("[data-track]")!;
        const dist = () => track.scrollWidth - window.innerWidth + 64;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el.querySelector("[data-pin]"),
            pin: true,
            start: "top top",
            end: () => `+=${dist() * 1.1}`,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => light(Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999 + 0.25))),
          },
        });
        tl.to(track, { x: () => -dist(), ease: "none" }, 0)
          .fromTo("[data-fill]", { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0)
          .to("[data-bg]", { xPercent: -12, ease: "none" }, 0);
        light(0);
      });

      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        steps.forEach((s, i) =>
          ScrollTrigger.create({ trigger: s, start: "top 65%", onEnter: () => light(i), onLeaveBack: () => light(i - 1) }),
        );
        gsap.fromTo("[data-vfill]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-track]", start: "top 65%", end: "bottom 65%", scrub: 0.4 } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="path" className="relative pt-24 sm:pt-36">
      <div data-pin className="relative overflow-hidden lg:flex lg:h-[100svh] lg:flex-col lg:justify-center">
        {/* fondo di fibre azzurre che scorre più lento delle tappe; sfuma nel nero su tutti i lati */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block [mask-image:radial-gradient(75%_42%_at_50%_55%,#000_25%,transparent_100%)]">
          <img data-bg src="/visual/fibers-sky.webp" alt="" className="absolute inset-y-0 left-0 h-full w-[130%] max-w-none object-cover opacity-40 light-invert" />
        </div>

        <div className="relative mx-auto w-full max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <SectionHead index="04" title={title} lead={lead} />
          </Reveal>
        </div>

        <div className="relative">
          {/* linea orizzontale (desktop) */}
          <span aria-hidden className="absolute left-0 right-0 top-[clamp(118px,13vw,190px)] hidden h-px bg-[var(--hair-strong)] lg:block">
            <span data-fill className="block h-full w-full origin-left bg-[var(--sky)] shadow-[0_0_14px_var(--sky)]" />
          </span>

          <ol data-track className="relative flex flex-col gap-14 px-5 pl-12 sm:px-8 sm:pl-16 lg:w-max lg:flex-row lg:gap-0 lg:pl-[max(32px,calc((100vw-1280px)/2+32px))] lg:pr-[20vw]">
            {/* linea verticale (telefono) */}
            <span aria-hidden className="absolute bottom-0 left-[22px] top-2 w-px bg-[var(--hair-strong)] sm:left-[30px] lg:hidden">
              <span data-vfill className="block h-full w-full origin-top bg-[var(--sky)] shadow-[0_0_12px_var(--sky)]" />
            </span>

            {items.map((m, i) => (
              <li key={m.title} data-step className="tl-step relative lg:w-[min(560px,44vw)] lg:pr-16">
                <p className="t-serif text-[clamp(64px,9.5vw,150px)] italic leading-[0.9] tracking-[-0.03em] text-[var(--sky)] lg:h-[clamp(118px,13vw,190px)] lg:pb-6">
                  {m.big}
                </p>
                {/* nodo sulla linea */}
                <span aria-hidden className="tl-node absolute -left-[31px] top-[0.55em] block h-3.5 w-3.5 rounded-full sm:-left-[39px] lg:left-0 lg:top-[clamp(118px,13vw,190px)] lg:-translate-y-1/2" />
                <div className="mt-6 lg:mt-10">
                  <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-3">{m.tag}</p>
                  <h3 className="mt-3 text-[clamp(28px,2.8vw,40px)] font-medium leading-[1.06] tracking-[-0.035em] text-ink">{m.title}</h3>
                  <p className="mt-4 max-w-[42ch] text-[16px] leading-[1.55] text-ink-2">{m.body}</p>
                  <p className="mt-7 flex items-baseline gap-3">
                    <span className="t-fig text-[clamp(40px,4vw,56px)] font-medium leading-none tracking-[-0.045em] text-ink">
                      <CountUp to={m.value} duration={1.6} separator="" />
                      {m.suffix && <span className="text-[var(--sky)]">{m.suffix}</span>}
                    </span>
                    <span className="max-w-[24ch] text-[14px] leading-snug text-ink-3">{m.unit}</span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
