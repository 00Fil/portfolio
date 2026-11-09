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
import { DARK, THEMES, type Theme } from "@/content/themes";
import { CreaCloudScene, RelayScene, UniSpaceScene, creaCloudBuild, relayBuild, uniSpaceBuild, type Build } from "./Scenes";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type StoryItem = { slug: string; name: string; beats: [string, string, string] };

const SCENES: Record<string, { View: typeof RelayScene; build: Build }> = {
  creacloud: { View: CreaCloudScene, build: creaCloudBuild },
  relay: { View: RelayScene, build: relayBuild },
  unispace: { View: UniSpaceScene, build: uniSpaceBuild },
};

const vars = (t: Theme) => ({ "--bg": t.bg, "--fg": t.fg, "--fg2": t.fg2, "--acc": t.acc, "--on-acc": t.onAcc });

/**
 * Un progetto raccontato dallo scorrimento: il nome riempie lo schermo e si apre sulla scena,
 * poi tre battute brevi accompagnano la scena dal problema al risultato.
 */
function Story({ item, cta, onActive }: { item: StoryItem; cta: string; onActive: (slug: string, on: boolean) => void }) {
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

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: reduced ? undefined : { trigger: el, start: "top top", end: "+=360%", pin: true, scrub: 0.9 },
      });

      // 0 → 1: il nome enorme si allarga e svanisce, la scena sale al centro
      tl.fromTo(q("[data-big]"), { scale: 1, autoAlpha: 1 }, { scale: 1.35, autoAlpha: 0, filter: "blur(14px)", duration: 0.8, ease: "power2.in" }, 0.15)
        .fromTo(stage.current, { yPercent: 45, scale: 0.7, autoAlpha: 0, rotateX: 22 }, { yPercent: 0, scale: 1, autoAlpha: 1, rotateX: 0, duration: 0.85, ease: "power3.out" }, 0.45)
        .fromTo(q("[data-top]"), { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.7);

      // la scena, spostata di un tempo
      // gli stati iniziali (set a 0) vanno applicati subito e fuori dalla timeline,
      // così tornando indietro non si annullano e la scena resta al punto di partenza
      const sub = gsap.timeline({ defaults: { ease: "none" } });
      const set = sub.set.bind(sub);
      sub.set = ((t: gsap.TweenTarget, v: gsap.TweenVars, p?: gsap.Position) => (p === 0 ? (gsap.set(t, v), sub) : set(t, v, p))) as typeof sub.set;
      scene.build(sub, q);
      tl.add(sub, 1);

      // tre battute
      const beats = q("[data-beat]");
      gsap.set(beats, { autoAlpha: 0, yPercent: 40 });
      beats.forEach((b, k) => {
        const at = 0.95 + k;
        tl.to(b, { autoAlpha: 1, yPercent: 0, duration: 0.3, ease: "power3.out" }, at);
        if (k < 2) tl.to(b, { autoAlpha: 0, yPercent: -40, duration: 0.25, ease: "power2.in" }, at + 0.7);
      });
      tl.fromTo(q("[data-bar]"), { scaleX: 0 }, { scaleX: 1, duration: tl.duration() }, 0).to({}, { duration: 0.4 });

      // tema del progetto finché la sua storia è in vista
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: () => `+=${window.innerHeight * (reduced ? 1.4 : 4.1)}`,
        onToggle: (self) => onActive(item.slug, self.isActive),
      });

      if (reduced) {
        tl.progress(1);
        return;
      }
      // le parole del nome entrano quando la sezione arriva
      gsap.fromTo(q("[data-ch]"), { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.04, scrollTrigger: { trigger: el, start: "top 70%", toggleActions: "play none none reverse" } });
    },
    { scope: root },
  );

  // profondità: la scena segue il cursore
  useEffect(() => {
    const el = root.current;
    const t = tilt.current;
    if (!el || !t || prefersReducedMotion()) return;
    const rx = gsap.quickTo(t, "rotateX", { duration: 1, ease: "power3.out" });
    const ry = gsap.quickTo(t, "rotateY", { duration: 1, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      ry((e.clientX / window.innerWidth - 0.5) * 12);
      rx(-(e.clientY / window.innerHeight - 0.5) * 8);
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, []);

  const View = scene.View;
  return (
    <section ref={root} data-story={item.slug} aria-label={item.name} className="relative h-[100svh] overflow-hidden">
      {/* nome a tutto schermo */}
      <div data-big aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="block overflow-hidden whitespace-nowrap pb-[0.06em] text-[clamp(72px,19vw,320px)] font-medium leading-[0.9] tracking-[-0.065em] text-[var(--acc)]">
          {[...item.name].map((c, i) => (
            <span key={i} data-ch className="inline-block">
              {c}
            </span>
          ))}
        </span>
      </div>

      {/* riga in alto: nome e accesso al progetto, sempre visibili */}
      <div data-top className="absolute inset-x-0 top-20 z-10 lg:top-24">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8">
          <h3 className="flex items-center gap-3 text-[22px] font-medium tracking-[-0.03em] text-[var(--fg)] sm:text-[28px]">
            <span className="h-3 w-3 rounded-full bg-[var(--acc)]" aria-hidden />
            {item.name}
          </h3>
          <Link
            href={`/lavori/${item.slug}`}
            onClick={() => play("open")}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--fg)] px-4 text-[15px] font-medium text-[var(--bg)] transition-transform duration-300 hover:scale-[1.04] active:scale-95"
          >
            {cta}
            <ArrowUpRight size={16} strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </div>

      {/* scena e battute */}
      <div className="absolute inset-0 mx-auto flex w-full max-w-[1280px] flex-col justify-center gap-6 px-5 pt-24 sm:px-8 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:pt-16">
        <div className="relative grid min-h-[2.3em] text-[clamp(30px,4.6vw,68px)] font-medium leading-[1.02] tracking-[-0.045em] text-[var(--fg)] lg:col-span-4">
          {item.beats.map((b) => (
            <p key={b} data-beat className="[grid-area:1/1]">
              {b}
            </p>
          ))}
        </div>
        <div ref={stage} className="relative [perspective:1600px] lg:col-span-8">
          <div ref={tilt} className="relative mx-auto aspect-[5/4] w-full max-w-[min(100%,calc(60svh*1.25))] [container-type:inline-size] [transform-style:preserve-3d] lg:max-w-none">
            <View lang={lang} />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[color-mix(in_srgb,var(--fg)_10%,transparent)]">
        <span data-bar className="block h-full origin-left bg-[var(--acc)]" />
      </div>
    </section>
  );
}

/** Le storie in fila; il contenitore cambia tema a seconda del progetto in vista. */
export function ProjectStory({ items, cta, children }: { items: StoryItem[]; cta: string; children?: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);

  const active = useRef<string[]>([]);
  const onActive = (slug: string, on: boolean) => {
    const w = wrap.current;
    if (!w) return;
    active.current = on ? [...active.current.filter((x) => x !== slug), slug] : active.current.filter((x) => x !== slug);
    const cur = active.current[active.current.length - 1];
    gsap.to(w, { ...vars(cur ? THEMES[cur] : DARK), duration: 0.7, ease: "power2.out", overwrite: true });
  };

  return (
    <div ref={wrap} className="bg-[var(--bg)] text-[var(--fg)]" style={vars(DARK) as React.CSSProperties}>
      {children}
      {items.map((it) => (
        <Story key={it.slug} item={it} cta={cta} onActive={onActive} />
      ))}
    </div>
  );
}
