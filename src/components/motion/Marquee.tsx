"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Nastro continuo: accelera con la velocità dello scroll e cambia verso con lui, poi torna alla sua andatura. */
export function Marquee({ children, direction = -1, speed = 40 }: { children: ReactNode; direction?: 1 | -1; speed?: number }) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const first = el.firstElementChild as HTMLElement;
    let w = first.offsetWidth;
    let x = direction < 0 ? 0 : -w;
    let boost = 0;
    const ro = new ResizeObserver(() => (w = first.offsetWidth));
    ro.observe(first);
    const st = ScrollTrigger.create({
      onUpdate: (s) => {
        boost = gsap.utils.clamp(-8, 8, s.getVelocity() / 300);
      },
    });
    let paused = false;
    const tick = (_t: number, dt: number) => {
      boost *= 0.92;
      const v = (paused ? 0.15 : 1) * speed * (1 + Math.abs(boost)) * direction * Math.sign(boost < -0.5 ? -1 : 1);
      x += (v * dt) / 1000;
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    const enter = () => (paused = true);
    const leave = () => (paused = false);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      ro.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [direction, speed]);
  return (
    <div className="overflow-hidden py-2">
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex">{children}</div>
        <div className="flex" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
