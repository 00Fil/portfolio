"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { BRAND } from "@/content/brand-icons";
import { projects } from "@/content/projects";
import { prefersReducedMotion } from "@/lib/env";

export type HeroLines = { a: string; em: string; b: string; c: string };

const Logo = ({ id }: { id: string }) => (
  <svg viewBox="0 0 24 24" className="h-[0.42em] w-[0.42em]" fill="currentColor" aria-hidden>
    <path d={BRAND[id].path} />
  </svg>
);

const STACK = ["kotlin", "compose", "dotnet", "typescript", "react", "nextjs"].map((id) => <Logo key={id} id={id} />);
const INFRA = ["node", "python", "fastapi", "supabase", "docker", "githubactions"].map((id) => <Logo key={id} id={id} />);
const WORK = projects.map((p) => (
  <span key={p.slug} className="flex items-center gap-[0.32em] whitespace-nowrap font-sans text-[0.25em] font-medium tracking-[-0.01em] text-ink">
    <span className="h-[0.42em] w-[0.42em] rounded-full bg-[var(--sky)]" />
    {p.name}
  </span>
));

/** Tassello che ruota il contenuto: l'uscente sale e si sfoca, l'entrante arriva dal basso. */
function Chip({ items, delay, width }: { items: ReactNode[]; delay: number; width: string }) {
  const [i, setI] = useState(0);
  const box = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let id: number;
    const t = window.setTimeout(() => {
      setI((x) => (x + 1) % items.length);
      id = window.setInterval(() => setI((x) => (x + 1) % items.length), 2600);
    }, delay);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(id);
    };
  }, [items.length, delay]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (first.current) {
      first.current = false;
      return;
    }
    const [out, inn] = [el.querySelector("[data-out]"), el.querySelector("[data-in]")];
    gsap.fromTo(out, { yPercent: 0, opacity: 1, filter: "blur(0px)" }, { yPercent: -70, opacity: 0, filter: "blur(6px)", duration: 0.45, ease: "power2.in" });
    gsap.fromTo(inn, { yPercent: 70, opacity: 0, filter: "blur(6px)" }, { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.6, delay: 0.12, ease: "power3.out", clearProps: "filter" });
    gsap.fromTo(el, { scale: 0.94 }, { scale: 1, duration: 0.8, ease: "elastic.out(1, 0.6)" });
  }, [i]);

  const prev = (i - 1 + items.length) % items.length;
  return (
    <span
      ref={box}
      aria-hidden
      data-w
      className="relative mx-[0.12em] inline-flex h-[0.8em] -translate-y-[0.06em] items-center justify-center overflow-hidden rounded-[0.2em] bg-surface align-middle text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_0.08em_0.3em_rgba(0,0,0,0.5)]"
      style={{ width }}
    >
      <span key={`o${prev}-${i}`} data-out className="absolute inset-0 flex items-center justify-center opacity-0">
        {items[prev]}
      </span>
      <span key={`i${i}`} data-in className="absolute inset-0 flex items-center justify-center">
        {items[i]}
      </span>
    </span>
  );
}

/**
 * "Sviluppo *software* [stack] / su misura, dall'idea [progetti] / al rilascio [infrastruttura]".
 * Sans per il testo, corsivo solo sulla parola che regge la frase.
 */
export function HeroTitle({ lines }: { lines: HeroLines }) {
  const root = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    gsap.fromTo(
      el.querySelectorAll("[data-w]"),
      { opacity: 0, filter: "blur(10px)", yPercent: 18 },
      { opacity: 1, filter: "blur(0px)", yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.06, delay: 0.15, clearProps: "filter,transform" },
    );
  }, []);

  const w = (text: string) =>
    text.split(" ").map((x, k) => (
      <span key={k} data-w className="inline-block whitespace-pre">
        {x}{" "}
      </span>
    ));

  return (
    <h1
      ref={root}
      aria-label={`${lines.a} ${lines.em} ${lines.b} ${lines.c}`}
      className="text-center font-sans text-[clamp(34px,7.4vw,92px)] font-medium leading-[1.04] tracking-[-0.045em] text-ink"
    >
      <span aria-hidden className="block">
        {w(lines.a)}
        <span data-w className="t-serif inline-block pr-[0.04em] text-[1.12em] tracking-[-0.01em]">
          {lines.em}
        </span>
        <Chip items={STACK} delay={400} width="1.15em" />
      </span>
      <span aria-hidden className="block">
        {w(lines.b)}
        <Chip items={WORK} delay={1300} width="2.9em" />
      </span>
      <span aria-hidden className="block">
        {w(lines.c)}
        <Chip items={INFRA} delay={2100} width="1.15em" />
      </span>
    </h1>
  );
}
