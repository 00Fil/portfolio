"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { play } from "@/lib/sound";
import { prefersReducedMotion } from "@/lib/env";
import { CreaCloudScene, RelayScene, UniSpaceScene, creaCloudBuild, relayBuild, uniSpaceBuild, type Build } from "./Scenes";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type StoryItem = { slug: string; name: string; kicker: string; lines: [string, string, string] };

const SCENES: Record<string, { View: typeof RelayScene; build: Build; glow: string }> = {
  creacloud: { View: CreaCloudScene, build: creaCloudBuild, glow: "rgba(94,196,255,0.16)" },
  relay: { View: RelayScene, build: relayBuild, glow: "rgba(110,170,255,0.16)" },
  unispace: { View: UniSpaceScene, build: uniSpaceBuild, glow: "rgba(127,214,230,0.14)" },
};

/**
 * Un progetto come una storia in tre tempi: prima, ora, risultato.
 * La sezione si ferma e lo scorrimento manda avanti insieme la frase e la scena.
 */
function Story({ item, index, total, steps, cta }: { item: StoryItem; index: number; total: number; steps: [string, string, string]; cta: string }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const lang = useLocale() === "en" ? "en" : "it";
  const scene = SCENES[item.slug];

  useGSAP(
    () => {
      const el = root.current!;
      const q = (s: string) => gsap.utils.toArray<Element>(s, el);
      const reduced = prefersReducedMotion();

      // il nome entra lettera per lettera appena la sezione arriva
      gsap.fromTo(
        q("[data-ch]"),
        { yPercent: 105 },
        { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.035, scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play none none reverse" } },
      );
      gsap.fromTo(
        stage.current,
        { scale: 0.86, autoAlpha: 0, rotateX: 14 },
        { scale: 1, autoAlpha: 1, rotateX: 0, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%", end: "top top", scrub: 0.6 } },
      );

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: reduced
          ? undefined
          : {
              trigger: el,
              start: "top top",
              end: "+=260%",
              pin: true,
              scrub: 0.8,
              onUpdate: (self) => {
                const k = Math.min(2, Math.floor(self.progress * 3.2));
                if (k !== Number(el.dataset.step)) {
                  el.dataset.step = String(k);
                  play("tick");
                }
              },
            },
      });
      scene.build(tl, q);

      // le tre frasi si danno il cambio, la barra dei tempi si riempie
      const lines = q("[data-line]");
      tl.set(lines.slice(1), { autoAlpha: 0, y: 30, filter: "blur(8px)" }, 0);
      [1, 2].forEach((k) => {
        tl.to(lines[k - 1], { autoAlpha: 0, y: -30, filter: "blur(8px)", duration: 0.2, ease: "power2.in" }, k - 0.3)
          .to(lines[k], { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.3, ease: "power3.out" }, k - 0.1);
      });
      q("[data-seg]").forEach((s, k) => tl.fromTo(s, { scaleX: 0 }, { scaleX: 1, duration: 1 }, k));
      q("[data-steplabel]").forEach((s, k) => tl.fromTo(s, { color: "#85857f" }, { color: "#f2f2f0", duration: 0.1 }, k === 0 ? 0 : k - 0.1));
      tl.to({}, { duration: 0.25 });
      if (reduced) tl.progress(1);
    },
    { scope: root },
  );

  // profondità: il palco segue il cursore, i livelli in translateZ si separano
  useEffect(() => {
    const el = stage.current;
    const t = tilt.current;
    if (!el || !t || prefersReducedMotion()) return;
    const rx = gsap.quickTo(t, "rotateX", { duration: 0.9, ease: "power3.out" });
    const ry = gsap.quickTo(t, "rotateY", { duration: 0.9, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 14);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    window.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  const pad = (i: number) => String(i + 1).padStart(2, "0");
  const View = scene.View;

  return (
    <section ref={root} data-step="0" aria-labelledby={`s-${item.slug}`} className="relative flex h-[100svh] items-center overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute right-[-10%] top-1/2 h-[90vh] w-[70vw] -translate-y-1/2 rounded-full" style={{ background: `radial-gradient(closest-side, ${scene.glow}, transparent)` }} />
      <div className="relative mx-auto grid w-full max-w-[1280px] grid-rows-[auto_1fr] gap-6 px-5 pt-20 sm:px-8 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-10 lg:pt-10">
        <div className="lg:col-span-5">
          <p className="t-label font-mono text-ink-3">
            {pad(index)} / {pad(total - 1)} · {item.kicker}
          </p>
          <h3 id={`s-${item.slug}`} className="mt-3 overflow-hidden pb-[0.05em] whitespace-nowrap text-[clamp(44px,6.2vw,100px)] font-medium leading-[0.92] tracking-[-0.055em] text-ink" aria-label={item.name}>
            <span aria-hidden>
              {[...item.name].map((c, i) => (
                <span key={i} data-ch className="inline-block">
                  {c}
                </span>
              ))}
            </span>
          </h3>
          <div className="mt-5 grid min-h-[3.6em] text-[clamp(19px,1.9vw,26px)] leading-[1.3] tracking-[-0.015em] text-ink lg:mt-8 lg:min-h-[5.4em]">
            {item.lines.map((l, i) => (
              <p key={i} data-line className="max-w-[24ch] [grid-area:1/1]">
                {l}
              </p>
            ))}
          </div>
          <div className="mt-6 grid max-w-[360px] grid-cols-3 gap-2 lg:mt-10">
            {steps.map((s) => (
              <div key={s}>
                <div className="h-[2px] overflow-hidden rounded-full bg-white/10">
                  <span data-seg className="block h-full origin-left bg-[var(--sky)]" />
                </div>
                <p data-steplabel className="t-label mt-2 text-ink-3">
                  {s}
                </p>
              </div>
            ))}
          </div>
          <Link href={`/lavori/${item.slug}`} onClick={() => play("open")} className="drop float-glass mt-8 hidden h-12 items-center gap-2 px-5 font-medium text-ink lg:inline-flex">
            {cta}
            <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden />
          </Link>
        </div>
        <div ref={stage} className="relative self-start [perspective:1400px] lg:col-span-7 lg:self-center">
          <div ref={tilt} className="relative mx-auto aspect-[5/4] w-full max-w-[min(100%,58svh*1.25)] [container-type:inline-size] [transform-style:preserve-3d] lg:max-w-none">
            <View lang={lang} />
          </div>
          <Link href={`/lavori/${item.slug}`} onClick={() => play("open")} className="t-foot mt-4 inline-flex items-center gap-1 text-ink-2 lg:hidden">
            {cta}
            <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ProjectStory({ items, steps, cta }: { items: StoryItem[]; steps: [string, string, string]; cta: string }) {
  return (
    <div>
      {items.map((it, i) => (
        <Story key={it.slug} item={it} index={i} total={items.length} steps={steps} cta={cta} />
      ))}
    </div>
  );
}
