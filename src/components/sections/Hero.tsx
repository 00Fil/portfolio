"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useMessages, useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Drop } from "@/components/glass/Drop";
import { HeroSky } from "@/components/visual/HeroSky";
import { Cover } from "@/components/work/Covers";
import { Shape, type ShapeKind } from "@/components/visual/Shapes";
import { profile } from "@/content/profile";
import { prefersReducedMotion } from "@/lib/env";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const COVERS = ["creacloud", "relay", "unispace"];
const SHAPES: ShapeKind[] = ["star", "flower", "ring", "burst", "blob"];
const STEP = 2800;

type Kind = "word" | "cover" | "shape";

/**
 * Casella che cambia contenuto: l'uscente sale e si sfoca, l'entrante arriva dal basso a fuoco,
 * e la casella si allarga o si stringe sul nuovo contenuto, così la riga resta centrata senza scatti.
 */
function Cycler({ items, at, kind }: { items: ReactNode[]; at: number; kind: Kind }) {
  const box = useRef<HTMLSpanElement>(null);
  const prev = useRef(at);
  useLayoutEffect(() => {
    const el = box.current!;
    const kids = Array.from(el.children) as HTMLElement[];
    const w = kids[at].offsetWidth;
    if (prev.current === at || prefersReducedMotion()) {
      gsap.set(kids, { autoAlpha: (i: number) => (i === at ? 1 : 0) });
      gsap.set(el, { width: w });
      prev.current = at;
      return;
    }
    const out = kids[prev.current];
    const inn = kids[at];
    const from = kind === "shape" ? { scale: 0.2, rotate: -140 } : kind === "cover" ? { scale: 0.7, rotate: -6 } : { yPercent: 70 };
    const to = kind === "shape" ? { scale: 0.2, rotate: 140 } : kind === "cover" ? { scale: 0.7, rotate: 6 } : { yPercent: -70 };
    gsap.to(el, { width: w, duration: 0.9, ease: "expo.inOut" });
    gsap.to(out, { ...to, autoAlpha: 0, filter: "blur(10px)", duration: 0.5, ease: "power2.in" });
    gsap.fromTo(
      inn,
      { ...from, autoAlpha: 0, filter: "blur(10px)" },
      { yPercent: 0, scale: 1, rotate: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.9, delay: 0.3, ease: "expo.out", clearProps: "filter" },
    );
    prev.current = at;
  }, [at, kind]);
  return (
    <span ref={box} data-cycler={kind} className="relative mx-[0.14em] block h-[1.06em] self-stretch">
      {items.map((it, i) => (
        <span key={i} className="invisible absolute left-0 top-0 flex h-full items-center whitespace-nowrap">
          {it}
        </span>
      ))}
    </span>
  );
}

/**
 * Hero centrata: tre righe che restano dentro i margini del sito. Nella frase cambiano insieme,
 * a tempo, la copertina di un progetto, una forma e quello che realizzo.
 */
export function Hero() {
  const t = useTranslations("hero");
  const m = (useMessages() as unknown as { hero: { lines: string[][]; words: string[]; proof: [string, string][] } }).hero;
  const proof = m.proof;
  const root = useRef<HTMLElement>(null);
  const [at, setAt] = useState(0);

  // un passo ogni STEP ms, solo mentre la hero si vede
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let id = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(id);
      if (e.isIntersecting) id = window.setInterval(() => setAt((x) => x + 1), STEP);
    });
    io.observe(root.current!);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current!;
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from("[data-line]", { yPercent: 50, autoAlpha: 0, filter: "blur(12px)", duration: 1.4, stagger: 0.12, clearProps: "filter" })
        .from('[data-cycler="shape"]', { scale: 0, rotate: -160, duration: 1.3, ease: "back.out(1.6)" }, 0.45)
        .from("[data-hero-rest]", { y: 20, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.6);

      // uscendo, il titolo arretra e si spegne
      const out = { trigger: el, start: "top top", end: "bottom top", scrub: true };
      gsap.to("[data-title]", { scale: 0.92, y: -40, autoAlpha: 0.15, ease: "none", scrollTrigger: out });
      gsap.to("[data-hero-foot]", { y: -40, autoAlpha: 0, ease: "none", scrollTrigger: { ...out, end: "45% top" } });

      // la forma segue un poco il cursore
      if (window.matchMedia("(pointer: fine)").matches) {
        const s = el.querySelector('[data-cycler="shape"]');
        const x = gsap.quickTo(s, "x", { duration: 1.1, ease: "power3.out" });
        const y = gsap.quickTo(s, "y", { duration: 1.1, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          x((e.clientX / window.innerWidth - 0.5) * 24);
          y((e.clientY / window.innerHeight - 0.5) * 24);
        };
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
      }
    },
    { scope: root },
  );

  const slot = (tok: string, k: string) => {
    if (tok === "@")
      return (
        <Cycler
          key={k}
          kind="cover"
          at={at % COVERS.length}
          items={COVERS.map((c) => (
            <span key={c} className="relative block h-[0.8em] w-[1.3em] overflow-hidden rounded-[0.16em] shadow-[0_0_0_1px_rgba(255,255,255,.12),0_24px_50px_-20px_rgba(0,0,0,.95)]">
              <Cover slug={c} mini />
            </span>
          ))}
        />
      );
    if (tok === "#")
      return (
        <Cycler
          key={k}
          kind="shape"
          at={at % SHAPES.length}
          items={SHAPES.map((s) => (
            <span key={s} className="block h-[0.86em] w-[0.86em]">
              <Shape kind={s} id={`hero-${s}`} className="h-full w-full" />
            </span>
          ))}
        />
      );
    if (tok === "~")
      return (
        <Cycler
          key={k}
          kind="word"
          at={at % m.words.length}
          items={m.words.map((w) => (
            <span key={w} className="t-serif italic text-[var(--sky)]">
              {w}
            </span>
          ))}
        />
      );
    const em = tok.startsWith("*");
    return (
      <span key={k} className={`mx-[0.14em] ${em ? "t-serif italic text-[var(--sky)]" : ""}`}>
        {em ? tok.slice(1) : tok}
      </span>
    );
  };

  return (
    <section ref={root} id="home" className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pb-20 pt-32">
      <HeroSky />
      <h1 className="sr-only">{t("h1")}</h1>

      <div className="relative flex w-full max-w-[1200px] flex-col items-center px-5 sm:px-8">
        <p className="t-label mb-10 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-ink-2 backdrop-blur" data-hero-rest>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--sky)] shadow-[0_0_10px_var(--sky)]" aria-hidden />
          {t("status")}
        </p>

        <div data-title aria-hidden className="flex flex-col items-center text-center text-[clamp(38px,7vw,112px)] font-medium leading-[1.06] tracking-[-0.05em] text-ink">
          {m.lines.map((line, i) => (
            <div key={i} data-line className="flex flex-wrap items-center justify-center">
              {line.map((tok, j) => slot(tok, `${i}-${j}`))}
            </div>
          ))}
        </div>

        <div data-hero-foot className="flex flex-col items-center">
          <p className="mt-10 max-w-[56ch] text-center text-[15px] leading-[23px] text-ink-2 sm:text-[17px] sm:leading-[27px]" data-hero-rest>
            {t("lead", { name: profile.name })}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3" data-hero-rest>
            <Drop href="#contact" accent className="h-12 px-5 font-medium text-ink">
              {t("contact")}
              <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
            </Drop>
            <Drop href="#work" floating className="h-12 px-5 font-medium text-ink">
              {t("work")}
              <ArrowDown size={18} strokeWidth={1.6} aria-hidden />
            </Drop>
          </div>
          {/* prove subito sotto l'invito: numeri veri, niente loghi inventati */}
          <ul className="mt-12 grid w-full max-w-[760px] grid-cols-3 gap-4 border-t border-white/[0.08] pt-6" data-hero-rest>
            {proof.map(([v, l]) => (
              <li key={v} className="text-center">
                <p className="t-fig text-[clamp(22px,2.4vw,30px)] font-medium tracking-[-0.03em] text-ink">{v}</p>
                <p className="mt-1 text-[12px] leading-snug text-ink-3 sm:text-[13px]">{l}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
