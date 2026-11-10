"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Stop = { x: number; y: number; s: number; title: string; body: string };

/**
 * Giro sulla schermata vera: la sezione si ferma e una "camera" scorre sull'interfaccia,
 * inquadrando una funzione alla volta mentre la didascalia accanto cambia.
 */
export function Tour({ src, w, h, stops, kicker, url, light }: { src: string; w: number; h: number; stops: Stop[]; kicker: string; url: string; light: boolean }) {
  const root = useRef<HTMLElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const v = view.current!;
      const im = img.current!;
      const caps = gsap.utils.toArray<HTMLElement>("[data-cap]", el);
      const dots = gsap.utils.toArray<HTMLElement>("[data-dot]", el);

      // posizione della camera per inquadrare (x, y) con ingrandimento s, senza uscire dall'immagine
      const cam = (x: number, y: number, s: number) => {
        const vw = v.clientWidth;
        const vh = v.clientHeight;
        const iw = vw * s;
        const ih = (vw * h * s) / w;
        const tx = gsap.utils.clamp(Math.min(0, vw - iw), 0, vw / 2 - x * iw);
        const ty = gsap.utils.clamp(Math.min(0, vh - ih), 0, vh / 2 - y * ih);
        return { x: tx, y: ty, scale: s };
      };
      const overview = () => cam(0.5, 0.0, 1);

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(im, { transformOrigin: "0 0", ...overview() });
        gsap.set(caps, { autoAlpha: 0, y: 24 });
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: { trigger: el, start: "top top", end: `+=${stops.length * 90}%`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
        });
        stops.forEach((s, i) => {
          tl.to(im, { ...cam(s.x, s.y, s.s), duration: 1 }, i * 1.4)
            .to(caps[i], { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" }, i * 1.4 + 0.5)
            .to(dots[i], { scaleX: 1, duration: 1.4, ease: "none" }, i * 1.4);
          if (i > 0) tl.to(caps[i - 1], { autoAlpha: 0, y: -24, duration: 0.3, ease: "power2.in" }, i * 1.4 + 0.1);
        });
        tl.to({}, { duration: 0.6 });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(caps, { autoAlpha: 1, position: "relative" });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative flex min-h-[100svh] items-start overflow-hidden pb-16 pt-24 sm:items-center sm:py-20">
      <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-5 sm:gap-8 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-4">
          <p className="t-label text-[var(--accent)]">{kicker}</p>
          <div className="relative mt-4 grid min-h-[132px] sm:min-h-[150px] lg:mt-5 lg:min-h-[220px]">
            {stops.map((s) => (
              <div key={s.title} data-cap className="[grid-area:1/1]">
                <h3 className="text-[clamp(24px,3vw,42px)] font-medium leading-[1.05] tracking-[-0.04em] text-ink">{s.title}</h3>
                <p className="mt-3 max-w-[36ch] text-[15.5px] leading-[1.5] text-ink-2 sm:mt-4 sm:text-[17px]">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-2 sm:mt-8" aria-hidden>
            {stops.map((s) => (
              <span key={s.title} className="h-[3px] w-10 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--label-primary)_14%,transparent)]">
                <span data-dot className="block h-full origin-left scale-x-0 bg-[var(--accent)]" />
              </span>
            ))}
          </div>
        </div>
        <div className="lg:col-span-8">
          <div
            className="overflow-hidden rounded-[18px]"
            style={{
              background: light ? "#fff" : "#16171a",
              boxShadow: light ? "0 50px 100px -40px rgba(60,50,40,.35), 0 0 0 1px rgba(41,37,36,.08)" : "0 50px 100px -30px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.08)",
            }}
          >
            <div className="flex h-9 items-center gap-2 px-4" style={{ background: light ? "#f6f4f0" : "#1d1e22" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: light ? "rgba(41,37,36,.14)" : "rgba(255,255,255,.14)" }} />
              ))}
              <span className="mx-auto rounded-full px-3 py-0.5 text-[12px]" style={{ color: light ? "rgba(41,37,36,.5)" : "rgba(255,255,255,.5)", background: light ? "rgba(41,37,36,.05)" : "rgba(255,255,255,.06)" }}>
                {url}
              </span>
              <span className="w-10" />
            </div>
            <div ref={view} className="relative aspect-[16/10] overflow-hidden">
              <img ref={img} src={src} alt="" className="absolute left-0 top-0 w-full max-w-none will-change-transform" draggable={false} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
