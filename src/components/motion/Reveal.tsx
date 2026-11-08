"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/**
 * Entrate dei contenuti dentro [scope]:
 *  - [data-split]: titolo diviso per parole, 24 px verso l'alto, 0,7 s, power3.out, scarto 0,04 s
 *  - [data-reveal]: 16 px, 0,6 s, power2.out, da "top 85%"
 *  - [data-stagger] > *: come data-reveal, figli scaglionati di 0,06 s
 * Una volta sola. Con reduced motion tutto è subito visibile.
 */
export function Reveal({ children, className, as: Tag = "div", id }: { children: ReactNode; className?: string; as?: "div" | "section" | "header" | "article"; id?: string }) {
  const scope = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        root.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
          const split = SplitText.create(el, { type: "words", mask: "words" });
          gsap.set(el, { visibility: "visible" });
          gsap.from(split.words, {
            yPercent: 100,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.04,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
        root.querySelectorAll<HTMLElement>("[data-reveal]:not([data-split])").forEach((el) => {
          gsap.set(el, { visibility: "visible" });
          gsap.fromTo(el, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", clearProps: "opacity,transform", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
        });
        root.querySelectorAll<HTMLElement>("[data-stagger]").forEach((el) => {
          gsap.fromTo(el.children, { y: 16, opacity: 0 }, {
            y: 0,
            opacity: 1,
            clearProps: "opacity,transform",
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.06,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        root.querySelectorAll<HTMLElement>("[data-reveal], [data-split]").forEach((el) => (el.style.visibility = "visible"));
      });
    },
    { scope },
  );
  return (
    <Tag ref={scope as never} className={className} id={id}>
      {children}
    </Tag>
  );
}
