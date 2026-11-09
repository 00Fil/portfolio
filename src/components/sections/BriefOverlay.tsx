"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMessages } from "next-intl";
import { gsap } from "gsap";
import { getLenis } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/env";
import { Brief } from "./Brief";

const Grainient = dynamic(() => import("@/components/reactbits/Grainient"), { ssr: false });

/**
 * Il modulo di richiesta a schermo intero. Si apre solo dai tasti che puntano a "#brief"
 * (o "#brief-N", con il servizio N già scelto); si chiude con Esc o con la croce.
 * Entra come un cerchio che si allarga dal punto del clic.
 */
export function BriefOverlay() {
  const close = (useMessages() as unknown as { brief: { close: string } }).brief.close;
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<number | undefined>();
  const [n, setN] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const from = useRef({ x: 50, y: 50 });
  const back = useRef<HTMLElement | null>(null);

  const show = useCallback((p: number | undefined, x: number, y: number) => {
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
      const m = a.getAttribute("href")!.match(/#brief(?:-(\d+))?$/);
      if (!m) return;
      e.preventDefault();
      e.stopPropagation();
      show(m[1] ? Number(m[1]) : undefined, e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
    };
    window.addEventListener("click", onClick, true);
    const m = window.location.hash.match(/^#brief(?:-(\d+))?$/);
    if (m) show(m[1] ? Number(m[1]) : undefined, window.innerWidth / 2, window.innerHeight / 2);
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
    <div ref={root} role="dialog" aria-modal="true" className="theme-dark fixed inset-0 z-[80] overflow-y-auto bg-[#050608]" data-lenis-prevent>
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <Grainient colors={["#040a10", "#0a2a40", "#1f6f9e", "#5ec4ff", "#cfeeff"]} angle={30} speed={0.5} flow={0.6} silk={0.35} grainAmount={0.05} interactive={false} clickSwirl={false} intro={false} dpr={1} />
        <div className="absolute inset-0 bg-black/45" />
      </div>
      <button
        type="button"
        data-close
        onClick={hide}
        aria-label={close}
        className="drop fixed right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full text-ink sm:right-8 sm:top-8"
        style={{ ["--drop-tint" as string]: "rgba(20,22,26,.7)" }}
      >
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" aria-hidden>
          <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <div data-panel className="relative mx-auto flex min-h-full w-full max-w-[860px] flex-col justify-center px-5 py-24 sm:px-8">
        <Brief key={n} preset={preset} full />
      </div>
    </div>
  );
}
