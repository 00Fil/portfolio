"use client";

import { useRef } from "react";
import { useMessages, useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "lucide-react";
import { Drop } from "@/components/glass/Drop";
import { HeroSky } from "@/components/visual/HeroSky";
import { profile } from "@/content/profile";
import { prefersReducedMotion } from "@/lib/env";
import { Piece } from "./RibbonPiece";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Hero fatta di nastri: tre righe enormi che scorrono in versi alterni, con le copertine dei progetti
 * e forme in mezzo. Entrano dai lati, accelerano con lo scorrimento, si aprono quando si lascia la pagina;
 * le forme girano e seguono un poco il cursore.
 */
export function Hero() {
  const t = useTranslations("hero");
  const rows = (useMessages() as unknown as { hero: { rows: string[][] } }).hero.rows;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current!;
      const lines = gsap.utils.toArray<HTMLElement>("[data-line]", el);
      const shapes = gsap.utils.toArray<HTMLElement>("[data-shape]", el);

      // scorrimento continuo di ogni riga (sulla traccia interna)
      const loops = gsap.utils.toArray<HTMLElement>("[data-row]", el).map((row, i) => {
        const left = i % 2 === 0;
        return gsap.fromTo(row, { xPercent: left ? 0 : -50 }, { xPercent: left ? -50 : 0, duration: 46 + i * 8, ease: "none", repeat: -1 });
      });

      // entrata: le righe arrivano dai lati, le forme sbocciano, poi il resto
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
      intro
        .from(lines, { xPercent: (i) => (i % 2 ? 14 : -14), autoAlpha: 0, duration: 1.6, stagger: 0.12 })
        .from("[data-shape-in]", { scale: 0, rotate: -120, duration: 1.2, stagger: 0.03, ease: "back.out(1.8)" }, 0.35)
        .from("[data-cov]", { scale: 0.6, autoAlpha: 0, duration: 1, stagger: 0.06 }, 0.4)
        .from("[data-hero-rest]", { y: 24, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.7);

      // le forme girano e ondeggiano per conto loro
      shapes.forEach((s, i) => {
        gsap.to(s, { rotate: i % 2 ? -360 : 360, duration: 16 + (i % 4) * 3, ease: "none", repeat: -1 });
      });

      // più si scorre veloce, più corrono i nastri
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          const boost = 1 + Math.min(6, Math.abs(self.getVelocity()) / 300);
          loops.forEach((l) => gsap.to(l, { timeScale: boost, duration: 0.2, overwrite: true, onComplete: () => void gsap.to(l, { timeScale: 1, duration: 1.4, ease: "power2.out" }) }));
        },
      });

      // uscendo, le righe si aprono verso i lati e il resto sale
      const out = { trigger: el, start: "top top", end: "bottom top", scrub: true };
      lines.forEach((l, i) => gsap.to(l, { x: () => (i % 2 ? 1 : -1) * window.innerWidth * 0.18, ease: "none", scrollTrigger: out }));
      gsap.to("[data-hero-foot]", { y: -60, autoAlpha: 0, ease: "none", scrollTrigger: { ...out, end: "45% top" } });

      // le forme seguono un poco il cursore, ognuna con la sua profondità
      if (window.matchMedia("(pointer: fine)").matches) {
        const qs = shapes.map((s, i) => ({ d: 6 + (i % 3) * 6, x: gsap.quickTo(s, "x", { duration: 1, ease: "power3.out" }), y: gsap.quickTo(s, "y", { duration: 1, ease: "power3.out" }) }));
        const move = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          qs.forEach((q) => {
            q.x(nx * q.d * 2);
            q.y(ny * q.d * 2);
          });
        };
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
      }
    },
    { scope: root },
  );

  return (
    <section ref={root} id="home" className="relative flex min-h-[100svh] flex-col overflow-hidden pb-10 pt-[calc(var(--bar-h)+44px)] sm:pb-14">
      <HeroSky />
      <h1 className="sr-only">{t("h1")}</h1>

      <div className="relative mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 sm:px-8" data-hero-rest>
        <p className="t-label inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-ink-2 backdrop-blur">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--sky)] shadow-[0_0_10px_var(--sky)]" aria-hidden />
          {t("status")}
        </p>
        <p className="t-label hidden text-ink-3 sm:block">{t("where")}</p>
      </div>

      {/* i nastri */}
      <div aria-hidden className="relative my-auto flex flex-col py-8 text-[clamp(60px,11vw,180px)] font-medium leading-[1.02] tracking-[-0.055em] text-ink">
        {rows.map((r, i) => (
          <div key={i} data-line className="will-change-transform">
            <div data-row className="flex w-max">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex items-center pr-[0.25em]">
                  {r.map((tok, j) => (
                    <Piece key={j} tok={tok} k={`h${i}-${copy}-${j}`} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div data-hero-foot className="relative mx-auto grid w-full max-w-[1280px] items-end gap-8 px-5 sm:px-8 lg:grid-cols-12">
        <p className="max-w-[52ch] text-[15px] leading-[23px] text-ink-2 sm:text-[17px] sm:leading-[27px] lg:col-span-6" data-hero-rest>
          {t("lead", { name: profile.name })}
        </p>
        <div className="flex flex-wrap gap-3 lg:col-span-6 lg:justify-end" data-hero-rest>
          <Drop href="#work" accent className="h-12 px-5 font-medium text-ink">
            {t("work")}
            <ArrowDown size={18} strokeWidth={1.6} aria-hidden />
          </Drop>
          <Drop href="#contact" floating className="h-12 px-5 font-medium text-ink">
            {t("contact")}
          </Drop>
        </div>
      </div>
    </section>
  );
}
