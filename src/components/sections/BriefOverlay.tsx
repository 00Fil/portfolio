"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMessages } from "next-intl";
import { gsap } from "gsap";
import { getLenis } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/env";
import { Brief } from "./Brief";

/**
 * La prenotazione a schermo intero, nei colori del tema. Si apre dai tasti che puntano a "#brief"
 * (o "#brief-web", "#brief-ops"…, con il percorso già scelto); si chiude con Esc o con la croce.
 * Entra come un cerchio che si allarga dal punto del clic.
 */
export function BriefOverlay() {
  const close = (useMessages() as unknown as { brief: { close: string } }).brief.close;
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<string | undefined>();
  const [n, setN] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const from = useRef({ x: 50, y: 50 });
  const back = useRef<HTMLElement | null>(null);

  const show = useCallback((p: string | undefined, x: number, y: number) => {
    back.current = document.activeElement as HTMLElement | null;
    from.current = { x: (x / window.innerWidth) * 100, y: (y / window.innerHeight) * 100 };
    setPreset(p);
    setN((v) => v + 1);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    const el = root.current;
    const done = () => {
      setOpen(false);
      getLenis()?.start();
      document.documentElement.style.overflow = "";
      back.current?.focus?.({ preventScroll: true });
    };
    if (!el || prefersReducedMotion()) return done();
    const { x, y } = from.current;
    gsap.to(el, { clipPath: `circle(0% at ${x}% ${y}%)`, duration: 0.7, ease: "expo.inOut", onComplete: done });
  }, []);

  // ogni tasto o link verso #brief apre il modulo invece di scorrere
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const m = a.getAttribute("href")!.match(/#brief(?:-([a-z]+))?$/);
      if (!m) return;
      e.preventDefault();
      e.stopPropagation();
      show(m[1], e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
    };
    window.addEventListener("click", onClick, true);
    const m = window.location.hash.match(/^#brief(?:-([a-z]+))?$/);
    if (m) show(m[1], window.innerWidth / 2, window.innerHeight / 2);
    return () => window.removeEventListener("click", onClick, true);
  }, [show]);

  useEffect(() => {
    if (!open) return;
    getLenis()?.stop();
    document.documentElement.style.overflow = "hidden";
    const el = root.current!;
    if (!prefersReducedMotion()) {
      const { x, y } = from.current;
      gsap.fromTo(el, { clipPath: `circle(0% at ${x}% ${y}%)` }, { clipPath: `circle(150% at ${x}% ${y}%)`, duration: 0.9, ease: "expo.inOut" });
      gsap.from(el.querySelector("[data-panel]"), { y: 40, autoAlpha: 0, duration: 0.9, delay: 0.35, ease: "expo.out", clearProps: "transform" });
    }
    window.setTimeout(() => el.querySelector<HTMLElement>("[data-close]")?.focus({ preventScroll: true }), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && hide();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hide]);

  if (!open) return null;
  return (
    <div ref={root} role="dialog" aria-modal="true" className="fixed inset-0 z-[80] overflow-y-auto bg-[var(--bg-canvas)]" data-lenis-prevent>
      <button
        type="button"
        data-close
        onClick={hide}
        aria-label={close}
        className="fixed right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--card)] text-ink shadow-[inset_0_0_0_1px_var(--hair-strong)] transition-colors hover:bg-[var(--hover)] sm:right-8 sm:top-8"
      >
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" aria-hidden>
          <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <div data-panel className="relative mx-auto w-full max-w-[1120px] px-6 pb-24 pt-24 sm:px-10 lg:pt-[14vh]">
        <Brief key={n} preset={preset} onClose={hide} />
      </div>
    </div>
  );
}
