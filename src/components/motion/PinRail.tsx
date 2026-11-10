"use client";

import { useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Quanto resta ferma ogni scheda al centro, in proporzione al tragitto tra due schede. */
const HOLD = 0.45;

/**
 * Su telefono: la sezione si ferma e lo scorrimento verticale fa scorrere le schede di lato.
 * Ogni scheda frena e si ferma al centro prima di lasciare il posto alla successiva.
 * Da tablet largo in su non fa nulla: le schede restano nella loro griglia.
 */
export function PinRail({ children, className = "", trackClass = "", dots = true }: { children: ReactNode; className?: string; trackClass?: string; dots?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const [n, setN] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const cards = Array.from(el.children) as HTMLElement[];
        setN(cards.length);
        // spostamento che porta la scheda i al centro dello schermo
        const pos = (i: number) => () => -(cards[i].offsetLeft + cards[i].offsetWidth / 2 - root.current!.clientWidth / 2);
        const step = 1 + HOLD;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "center 47%",
            end: () => `+=${(cards.length - 1) * window.innerHeight * 0.75}`,
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
            snap: { snapTo: "labels", duration: { min: 0.25, max: 0.7 }, delay: 0.04, ease: "power2.inOut" },
            onUpdate: () => setAt(Math.max(0, Math.min(cards.length - 1, Math.round((tl.time() - HOLD / 2) / step)))),
          },
        });
        tl.set(el, { x: pos(0) }, 0).addLabel("c0", HOLD / 2).to({}, { duration: HOLD });
        cards.forEach((c, i) => {
          if (!i) return;
          // la scheda arriva frenando (inOut) e resta ferma per un tratto
          tl.to(el, { x: pos(i), duration: 1, ease: "power2.inOut" })
            .fromTo(c, { scale: 0.92, opacity: 0.6 }, { scale: 1, opacity: 1, duration: 1, ease: "power2.inOut" }, "<")
            .to(cards[i - 1], { scale: 0.92, opacity: 0.6, duration: 1, ease: "power2.inOut" }, "<")
            .addLabel(`c${i}`, `+=${HOLD / 2}`)
            .to({}, { duration: HOLD });
        });
        cards.slice(1).forEach((c) => gsap.set(c, { scale: 0.92, opacity: 0.6 }));
        // i pin possono nascere dopo quelli delle sezioni successive: riordina e ricalcola tutto
        const raf = requestAnimationFrame(() => {
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
        });
        return () => {
          cancelAnimationFrame(raf);
          setAt(0);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={`relative overflow-hidden lg:overflow-visible ${className}`}>
      <div ref={track} className={`flex gap-3 motion-reduce:snap-x motion-reduce:overflow-x-auto ${trackClass}`}>
        {children}
      </div>
      {dots && n > 1 && (
        <div className="mt-5 flex items-center justify-center gap-1.5 lg:hidden" aria-hidden>
          {Array.from({ length: n }).map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === at ? "w-6 bg-[var(--label-primary)]" : "w-1.5 bg-[var(--hair-strong)]"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
