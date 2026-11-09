"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { useRouter } from "@/i18n/navigation";
import { getLenis } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/env";
import { Cover } from "./Covers";

/**
 * Passaggio dalla copertina alla pagina del progetto.
 * La copertina in volo è già grande quanto lo schermo: parte rimpicciolita e ritagliata sulla scheda,
 * poi si allarga con sole trasformazioni e ritaglio (niente ricalcolo del layout, niente scatti).
 * La pagina si apre solo a volo finito, sotto la copertina, che poi si dissolve.
 */
type Ctx = { go: (slug: string, href: string, from: HTMLElement) => void; arrived: () => void };
const C = createContext<Ctx>({ go: () => {}, arrived: () => {} });
export const useCoverTransition = () => useContext(C);

export function CoverTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [slug, setSlug] = useState<string | null>(null);
  const [hero, setHero] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const plan = useRef<{ rect: DOMRect; radius: number; href: string } | null>(null);
  const state = useRef({ flown: false, arrived: false });

  const leave = useCallback(() => {
    const el = box.current;
    if (!el) return setSlug(null);
    gsap.to(el, { opacity: 0, duration: 0.5, ease: "power2.out", onComplete: () => setSlug(null) });
  }, []);

  const go = useCallback(
    (s: string, href: string, el: HTMLElement) => {
      if (prefersReducedMotion()) return router.push(href);
      plan.current = { rect: el.getBoundingClientRect(), radius: parseFloat(getComputedStyle(el).borderRadius) || 28, href };
      state.current = { flown: false, arrived: false };
      router.prefetch(href);
      getLenis()?.stop();
      setHero(false);
      setSlug(s);
    },
    [router],
  );

  useEffect(() => {
    const el = box.current;
    const inn = inner.current;
    const p = plan.current;
    if (!slug || !el || !inn || !p) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { rect: r, radius } = p;
    // la copertina a schermo intero, ridotta per coprire la scheda e centrata su di lei
    const k = Math.max(r.width / vw, r.height / vh);
    const from = { x: r.left + r.width / 2 - (vw * k) / 2, y: r.top + r.height / 2 - (vh * k) / 2, k, t: r.top, rr: vw - r.right, b: vh - r.bottom, l: r.left, rad: radius };
    const o = { ...from };
    const paint = () => {
      inn.style.transform = `translate3d(${o.x}px, ${o.y}px, 0) scale(${o.k})`;
      el.style.clipPath = `inset(${o.t}px ${o.rr}px ${o.b}px ${o.l}px round ${o.rad}px)`;
    };
    paint();
    // il passaggio a "apertura" parte insieme al volo
    const raf = window.setTimeout(() => setHero(true), 380);
    const tw = gsap.to(o, {
      x: 0,
      y: 0,
      k: 1,
      t: 0,
      rr: 0,
      b: 0,
      l: 0,
      rad: 0,
      duration: 1,
      ease: "expo.inOut",
      onUpdate: paint,
      onComplete: () => {
        state.current.flown = true;
        router.push(p.href, { scroll: false });
      },
    });
    return () => {
      window.clearTimeout(raf);
      tw.kill();
    };
  }, [slug, router]);

  const arrived = useCallback(() => {
    if (!slug || state.current.arrived) return;
    state.current.arrived = true;
    window.scrollTo(0, 0);
    const l = getLenis();
    l?.scrollTo(0, { immediate: true });
    l?.start();
    // un attimo perché la pagina sotto disegni la sua apertura, poi la copertina in volo sparisce
    window.setTimeout(leave, 250);
  }, [slug, leave]);

  return (
    <C.Provider value={{ go, arrived }}>
      {children}
      {slug && (
        <div ref={box} aria-hidden className="pointer-events-none fixed inset-0 z-[45]" style={{ willChange: "clip-path, opacity" }}>
          <div ref={inner} className="absolute left-0 top-0 h-[100vh] w-[100vw] origin-top-left" style={{ willChange: "transform" }}>
            <Cover slug={slug} hero={hero} />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(to_top,rgba(0,0,0,.62),transparent)] transition-opacity duration-700" style={{ opacity: hero ? 1 : 0 }} />
          </div>
        </div>
      )}
    </C.Provider>
  );
}

/** Nella pagina del progetto: avvisa che l'apertura è pronta sotto la copertina in volo. */
export function CoverArrived() {
  const { arrived } = useCoverTransition();
  useEffect(() => {
    const id = requestAnimationFrame(() => arrived());
    return () => cancelAnimationFrame(id);
  }, [arrived]);
  return null;
}
