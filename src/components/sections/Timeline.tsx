"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import CountUp from "@/components/reactbits/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHead } from "./SectionHead";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Milestone = { tag: string; big: string; title: string; body: string; value: number; suffix?: string; unit: string; project?: string };

/** I progetti nel percorso: il loro logo davanti al nome e il nome nei loro colori. */
const PROJECT: Record<string, { icon: string; grad: string }> = {
  creacloud: { icon: "/work/creacloud/icon.svg", grad: "linear-gradient(100deg, #5F6BA3 10%, #8C78A8 50%, #D98A6C 95%)" },
  relay: { icon: "/work/relay/icon.webp", grad: "linear-gradient(100deg, #18348f 0%, #2F5FFF 45%, #6f9bff 100%)" },
};

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
    <section ref={root} id="path" className="relative pt-20 sm:pt-36">
      <div data-pin className="relative overflow-hidden lg:flex lg:h-[100svh] lg:flex-col lg:justify-center">
        {/* fondo: una griglia di punti che scorre più lenta delle tappe e un alone azzurro lungo la linea */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block [mask-image:radial-gradient(70%_46%_at_50%_55%,#000_20%,transparent_100%)]">
          <div data-bg className="absolute inset-y-0 left-0 w-[130%] [background-image:radial-gradient(circle,var(--hair-strong)_1.1px,transparent_1.6px)] [background-size:26px_26px]" />
          <div className="absolute inset-x-0 top-[calc(50%-40px)] h-[44%] bg-[radial-gradient(50%_50%_at_50%_30%,color-mix(in_srgb,var(--sky)_16%,transparent),transparent_70%)]" />
        </div>

        <div className="relative mx-auto w-full max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <SectionHead index="03" title={title} lead={lead} />
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
              <li key={m.title} data-step className="tl-step relative lg:w-max lg:min-w-[min(520px,40vw)] lg:pr-[clamp(64px,7vw,120px)]">
                <p className="flex items-center gap-[0.18em] whitespace-nowrap text-[clamp(52px,7.4vw,118px)] font-medium leading-[0.9] tracking-[-0.06em] text-ink lg:h-[clamp(118px,13vw,190px)] lg:items-end lg:pb-8">
                  {m.project && PROJECT[m.project] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={PROJECT[m.project].icon} alt="" className="h-[0.78em] w-[0.78em] shrink-0 rounded-[22%] object-cover shadow-[0_10px_30px_-12px_rgba(0,0,0,.45)] lg:mb-[0.04em]" />
                  )}
                  {m.project && PROJECT[m.project] ? (
                    <span className="bg-clip-text pb-[0.06em] text-transparent" style={{ backgroundImage: PROJECT[m.project].grad }}>
                      {m.big}
                    </span>
                  ) : (
                    m.big
                  )}
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
