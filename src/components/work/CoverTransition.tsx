"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { useRouter } from "@/i18n/navigation";
import { getLenis } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/env";
import { HeroArt, type HeroText } from "./Covers";

/**
 * Dalla copertina alla pagina del progetto, come un elemento condiviso.
 * In volo c'è già l'apertura della pagina, a schermo intero e con il layout finale:
 * lo sfondo parte ritagliato sulla scheda e si apre, icona e nome partono dalla loro posizione nella scheda
 * e scivolano al loro posto. Solo trasformazioni e ritaglio: niente layout ricalcolato, niente React a ogni fotogramma.
 * La pagina vera si apre sotto, a volo finito, con le stesse posizioni; poi il volo si dissolve.
 */
type Ctx = { go: (slug: string, href: string, card: HTMLElement, text: HeroText) => void; arrived: () => void; flying: () => boolean };
const C = createContext<Ctx>({ go: () => {}, arrived: () => {}, flying: () => false });
export const useCoverTransition = () => useContext(C);

export function CoverTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [slug, setSlug] = useState<string | null>(null);
  const [text, setText] = useState<HeroText>({ def: "", label: "", scroll: "" });
  const root = useRef<HTMLDivElement>(null);
  const plan = useRef<{ card: HTMLElement; href: string } | null>(null);
  const st = useRef({ active: false, flown: false, arrived: false });

  const leave = useCallback(() => {
    const el = root.current;
    const end = () => {
      st.current.active = false;
      setSlug(null);
    };
    if (!el) return end();
    gsap.to(el, { opacity: 0, duration: 0.35, ease: "power1.out", onComplete: end });
  }, []);

  const go = useCallback(
    (s: string, href: string, card: HTMLElement, t: HeroText) => {
      if (prefersReducedMotion()) return router.push(href);
      plan.current = { card, href };
      st.current = { active: true, flown: false, arrived: false };
      router.prefetch(href);
      getLenis()?.stop();
      setText(t);
      setSlug(s);
    },
    [router],
  );

  useEffect(() => {
    const el = root.current;
    const p = plan.current;
    if (!slug || !el || !p) return;
    const bg = el.querySelector<HTMLElement>("[data-bg]")!;
    const r = p.card.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const radius = parseFloat(getComputedStyle(p.card).borderRadius) || 28;

    // icona e nome: dalla posizione nella scheda a quella finale
    const pairs = (["icon", "name"] as const).map((k) => {
      const from = p.card.querySelector<HTMLElement>(`[data-flip="${k}"]`)!.getBoundingClientRect();
      const node = el.querySelector<HTMLElement>(`[data-flip="${k}"]`)!;
      const to = node.getBoundingClientRect();
      const s = from.height / to.height;
      return { node, x: from.left - to.left, y: from.top - to.top, s };
    });
    pairs.forEach((q) => gsap.set(q.node, { x: q.x, y: q.y, scale: q.s, transformOrigin: "0 0" }));
    const rest = el.querySelectorAll("[data-hero-shade], [data-hero-rest]");
    gsap.set(rest, { opacity: 0 });

    const clip = { t: r.top, rr: vw - r.right, b: vh - r.bottom, l: r.left, rad: radius };
    const paint = () => (bg.style.clipPath = `inset(${clip.t}px ${clip.rr}px ${clip.b}px ${clip.l}px round ${clip.rad}px)`);
    paint();
    // la scheda resta sotto: nascondo la sua copertina perché icona e nome non compaiano doppi
    gsap.set(p.card, { opacity: 0 });

    const tl = gsap.timeline({
      defaults: { duration: 1, ease: "expo.inOut" },
      onComplete: () => {
        st.current.flown = true;
        gsap.set(p.card, { opacity: 1 });
        router.push(p.href, { scroll: false });
      },
    });
    tl.to(clip, { t: 0, rr: 0, b: 0, l: 0, rad: 0, onUpdate: paint }, 0)
      .to(
        pairs.map((q) => q.node),
        { x: 0, y: 0, scale: 1, stagger: 0.04 },
        0,
      )
      .to(rest, { opacity: 1, duration: 0.5, ease: "power1.out" }, 0.6);
    return () => {
      tl.kill();
    };
  }, [slug, router]);

  const arrived = useCallback(() => {
    if (!st.current.active || st.current.arrived) return;
    st.current.arrived = true;
    window.scrollTo(0, 0);
    const l = getLenis();
    l?.scrollTo(0, { immediate: true });
    l?.start();
    window.setTimeout(leave, 200);
  }, [leave]);

  const flying = useCallback(() => st.current.active, []);

  return (
    <C.Provider value={{ go, arrived, flying }}>
      {children}
      {slug && (
        <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-[45]">
          <div data-bg className="absolute inset-0" style={{ willChange: "clip-path" }}>
            <HeroArt slug={slug} text={text} />
          </div>
        </div>
      )}
    </C.Provider>
  );
}

/** Nella pagina del progetto: avvisa che l'apertura vera è pronta sotto quella in volo. */
export function CoverArrived() {
  const { arrived } = useCoverTransition();
  useEffect(() => {
    const id = requestAnimationFrame(() => arrived());
    return () => cancelAnimationFrame(id);
  }, [arrived]);
  return null;
}
