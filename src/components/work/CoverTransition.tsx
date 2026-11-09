"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { useRouter } from "@/i18n/navigation";
import { getLenis } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/env";
import { Cover } from "./Covers";

/**
 * Passaggio dalla copertina alla pagina del progetto: la copertina si stacca dalla scheda,
 * si allarga a tutto schermo e diventa l'apertura della pagina, che ha la stessa copertina.
 */
type Ctx = { go: (slug: string, href: string, from: HTMLElement) => void; arrived: () => void };
const C = createContext<Ctx>({ go: () => {}, arrived: () => {} });
export const useCoverTransition = () => useContext(C);

export function CoverTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [slug, setSlug] = useState<string | null>(null);
  const [hero, setHero] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const from = useRef<{ rect: DOMRect; radius: string } | null>(null);
  const done = useRef(false);
  const ready = useRef(false);

  const leave = useCallback(() => {
    const el = box.current;
    if (!el) return setSlug(null);
    gsap.to(el, { opacity: 0, duration: 0.45, ease: "power2.out", onComplete: () => setSlug(null) });
  }, []);

  const go = useCallback(
    (s: string, href: string, el: HTMLElement) => {
      if (prefersReducedMotion()) return router.push(href);
      from.current = { rect: el.getBoundingClientRect(), radius: getComputedStyle(el).borderRadius };
      done.current = false;
      ready.current = false;
      setHero(false);
      setSlug(s);
      requestAnimationFrame(() => requestAnimationFrame(() => setHero(true)));
      // la pagina si carica mentre la copertina si allarga
      router.prefetch(href);
      window.setTimeout(() => {
        getLenis()?.stop();
        router.push(href, { scroll: false });
      }, 820);
    },
    [router],
  );

  useEffect(() => {
    const el = box.current;
    const f = from.current;
    if (!slug || !el || !f) return;
    const { rect, radius } = f;
    gsap.fromTo(
      el,
      { left: rect.left, top: rect.top, width: rect.width, height: rect.height, borderRadius: radius, opacity: 1 },
      {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
        duration: 0.9,
        ease: "expo.inOut",
        onComplete: () => {
          ready.current = true;
          if (done.current) leave();
        },
      },
    );
  }, [slug, leave]);

  const arrived = useCallback(() => {
    window.scrollTo(0, 0);
    const l = getLenis();
    l?.scrollTo(0, { immediate: true });
    l?.start();
    done.current = true;
    if (ready.current) window.setTimeout(leave, 120);
  }, [leave]);

  return (
    <C.Provider value={{ go, arrived }}>
      {children}
      {slug && (
        <div ref={box} aria-hidden className="pointer-events-none fixed z-[45] overflow-hidden" style={{ willChange: "left, top, width, height" }}>
          <Cover slug={slug} active hero={hero} />
        </div>
      )}
    </C.Provider>
  );
}

/** Da mettere nella pagina del progetto: avvisa che l'apertura è pronta sotto la copertina in volo. */
export function CoverArrived() {
  const { arrived } = useCoverTransition();
  useEffect(() => {
    const id = requestAnimationFrame(() => arrived());
    return () => cancelAnimationFrame(id);
  }, [arrived]);
  return null;
}
