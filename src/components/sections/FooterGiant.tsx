"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Drop } from "@/components/glass/Drop";
import { prefersReducedMotion } from "@/lib/env";
import { scrollToY } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Grainient = dynamic(() => import("@/components/reactbits/Grainient"), { ssr: false });

/** Invito finale: la domanda enorme, la risposta in corsivo e un tasto che segue il cursore. */
export function FooterCta({ q, a, cta, href }: { q: string; a: string; cta: string; href: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-cl]", {
        yPercent: 105,
        duration: 1.2,
        stagger: 0.1,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 85%" },
      });
      if (!window.matchMedia("(pointer: fine)").matches) return;
      const btn = root.current!.querySelector<HTMLElement>("[data-mag]")!;
      const x = gsap.quickTo(btn, "x", { duration: 0.8, ease: "elastic.out(1, 0.5)" });
      const y = gsap.quickTo(btn, "y", { duration: 0.8, ease: "elastic.out(1, 0.5)" });
      const move = (e: PointerEvent) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const near = Math.hypot(dx, dy) < 180;
        x(near ? dx * 0.35 : 0);
        y(near ? dy * 0.35 : 0);
      };
      window.addEventListener("pointermove", move);
      return () => window.removeEventListener("pointermove", move);
    },
    { scope: root },
  );
  return (
    <div ref={root} className="text-[clamp(40px,6.6vw,108px)] font-medium leading-[0.98] tracking-[-0.055em] text-ink">
      <p className="overflow-hidden pb-[0.06em]">
        <span data-cl className="block">
          {q}
        </span>
      </p>
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
        <p className="overflow-hidden pb-[0.12em]">
          <span data-cl className="t-serif block text-[var(--sky)]">
            {a}
          </span>
        </p>
        <span data-mag className="mb-[0.3em] inline-block tracking-normal">
          <Drop href={href} accent className="h-16 whitespace-nowrap px-8 text-[17px] font-medium text-ink">
            {cta}
            <span aria-hidden className="text-[20px] leading-none">
              →
            </span>
          </Drop>
        </span>
      </div>
    </div>
  );
}

/**
 * Il nome a tutta larghezza in fondo al sito. Le lettere sono finestre su un gradiente azzurro (Grainient di React Bits)
 * che scorre da solo e si mescola sotto il cursore: sopra c'è un velo nero con il testo bianco in "multiply".
 */
export function FooterGiant({ first, last }: { first: string; last: string }) {
  const band = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLParagraphElement>(null);
  const [on, setOn] = useState(false);
  const [still, setStill] = useState(false);

  // il nome riempie sempre la larghezza
  useEffect(() => {
    const el = text.current!;
    const fit = () => {
      el.style.fontSize = "100px";
      const w = el.scrollWidth;
      el.style.fontSize = `${(100 * band.current!.clientWidth * 0.94) / w}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(band.current!);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setStill(prefersReducedMotion());
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "200px" });
    io.observe(band.current!);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-ch]", {
        yPercent: 100,
        rotate: 6,
        ease: "power3.out",
        stagger: 0.04,
        scrollTrigger: { trigger: band.current, start: "top bottom", end: "bottom bottom", scrub: 0.8 },
      });
    },
    { scope: band },
  );

  const chars = (s: string, serif = false) =>
    Array.from(s).map((c, i) => (
      <span key={i} data-ch className={`inline-block ${serif ? "t-serif" : ""}`}>
        {c === " " ? " " : c}
      </span>
    ));

  return (
    <div ref={band} className="relative isolate overflow-hidden" aria-label={`${first} ${last}`} role="img">
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(90% 140% at 50% 110%, #5ec4ff, #1f7fb8 45%, #0b2f45 85%)" }}>
        {on && !still && (
          <Grainient colors={["#061722", "#0b3550", "#1f7fb8", "#5ec4ff", "#d9f2ff"]} angle={20} speed={0.6} flow={0.7} silk={0.4} grainAmount={0.04} stir={1.4} intro={false} dpr={1} />
        )}
      </div>
      <div aria-hidden className="pointer-events-none relative flex justify-center bg-black text-white mix-blend-multiply">
        <p ref={text} className="whitespace-nowrap py-[0.02em] text-[100px] font-medium leading-[0.86] tracking-[-0.06em]">
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            {chars(first)}
            {" "}
            {chars(last, true)}
          </span>
        </p>
      </div>
    </div>
  );
}

export function ToTop({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => scrollToY(0)} className="group inline-flex items-center gap-2 text-ink-2 transition-colors hover:text-ink">
      {label}
      <span aria-hidden className="inline-block transition-transform duration-500 group-hover:-translate-y-1">
        ↑
      </span>
    </button>
  );
}
