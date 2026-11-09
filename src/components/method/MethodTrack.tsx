"use client";

import { useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArchitectureTile, CanaryTile, GitTile, MonitorTile, PipelineTile, ReleaseTile, RequirementsTile } from "@/components/previews/Workflow";
import { play } from "@/lib/sound";
import { scrollToY } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Phase = { name: string; title: string; body: string; practices: string[]; out: string };

const VISUALS: ReactNode[][] = [
  [<RequirementsTile key="r" />],
  [<ArchitectureTile key="a" />],
  [<GitTile key="g" />, <ReleaseTile key="v" />],
  [<PipelineTile key="p" />, <CanaryTile key="c" />],
  [<MonitorTile key="m" />],
];

const pad = (i: number) => String(i + 1).padStart(2, "0");

function Text({ p, i }: { p: Phase; i: number; output?: string }) {
  return (
    <div>
      <p data-pt className="t-label font-mono text-[var(--sky)]">
        {pad(i)} · {p.name}
      </p>
      <h3 data-pt className="mt-5 max-w-[14ch] text-[clamp(36px,4.4vw,64px)] font-medium leading-[1.02] tracking-[-0.045em] text-ink">
        {p.title}
      </h3>
    </div>
  );
}

/**
 * Le cinque fasi. Su desktop la sezione si ferma e lo scorrimento la attraversa in orizzontale:
 * la linea del tempo si traccia, ogni fase entra quando arriva al centro, le scene sono interattive.
 */
export function MethodTrack({ phases, output }: { phases: Phase[]; output: string }) {
  const root = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const st = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const cur = useRef(0);
  const n = phases.length;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        // corsa: l'ultima fase si ferma dove è partita la prima
        const dist = () => {
          const ps = track.current!.querySelectorAll<HTMLElement>("[data-panel]");
          return ps[ps.length - 1].offsetLeft - ps[0].offsetLeft;
        };
        const tween = gsap.to(track.current, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: pin.current,
            start: "top top",
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const i = Math.min(n - 1, Math.round(self.progress * (n - 1)));
              if (i !== cur.current) {
                cur.current = i;
                setActive(i);
                play("tick");
              }
              gsap.set("[data-line]", { scaleX: self.progress });
            },
          },
        });
        st.current = tween.scrollTrigger ?? null;
        // ogni fase: testo e scene entrano quando il pannello arriva nel campo
        gsap.utils.toArray<HTMLElement>("[data-panel]").forEach((panel, i) => {
          if (i === 0) return;
          gsap.from(panel.querySelectorAll("[data-pt]"), {
            x: 60,
            autoAlpha: 0,
            stagger: 0.05,
            ease: "power3.out",
            scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left 85%", end: "left 45%", scrub: true },
          });
          gsap.from(panel.querySelectorAll("[data-tile]"), {
            yPercent: 18,
            rotate: 4,
            scale: 0.9,
            autoAlpha: 0,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left 75%", end: "left 30%", scrub: true },
          });
        });
        return () => (st.current = null);
      });
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-mpanel]").forEach((panel) => {
          gsap.from(panel.querySelectorAll("[data-pt], [data-tile]"), {
            y: 28,
            autoAlpha: 0,
            stagger: 0.06,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: panel, start: "top 80%", once: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const jump = (i: number) => {
    const s = st.current;
    if (!s) return;
    scrollToY(s.start + ((s.end - s.start) * i) / (n - 1));
  };

  const tiles = (i: number, cls: string) =>
    VISUALS[i].map((v, k) => (
      <div key={k} data-tile className={`relative overflow-hidden rounded-[28px] bg-surface ${cls}`}>
        {v}
      </div>
    ));

  return (
    <div ref={root}>
      {/* desktop */}
      <div ref={pin} className="relative hidden h-[100svh] overflow-hidden lg:block">
        <nav aria-label="Fasi" className="absolute inset-x-0 top-24 z-10">
          <div className="mx-auto w-full max-w-[1280px] px-8">
            <ol className="grid grid-cols-5 gap-4">
              {phases.map((p, i) => (
                <li key={p.name}>
                  <button type="button" onClick={() => jump(i)} className={`t-foot flex items-center gap-2 transition-colors duration-300 ${active === i ? "text-ink" : "text-ink-3 hover:text-ink-2"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${i <= active ? "bg-[var(--sky)]" : "bg-white/20"}`} />
                    <span className="font-mono">{pad(i)}</span>
                    {p.name}
                  </button>
                </li>
              ))}
            </ol>
            <div className="relative mt-3 h-px w-full bg-white/10">
              <span data-line className="absolute inset-0 origin-left scale-x-0 bg-[var(--sky)]" />
            </div>
          </div>
        </nav>
        <div ref={track} className="flex h-full w-max items-center pl-[max(2rem,calc((100vw-1280px)/2+2rem))] pr-[4vw] pt-16">
          {phases.map((p, i) => (
            <section key={p.name} data-panel aria-label={p.name} className="mr-[8vw] grid w-[min(1180px,84vw)] shrink-0 grid-cols-12 items-center gap-10">
              <div className="col-span-5">
                <Text p={p} i={i} output={output} />
              </div>
              <div className="col-span-7 flex h-[min(56vh,480px)] justify-center gap-4">{tiles(i, "aspect-square h-full")}</div>
            </section>
          ))}
        </div>
      </div>

      {/* telefono e tablet */}
      <div className="mx-auto w-full max-w-[1280px] space-y-24 px-5 sm:px-8 lg:hidden">
        {phases.map((p, i) => (
          <section key={p.name} data-mpanel aria-label={p.name}>
            <Text p={p} i={i} output={output} />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">{tiles(i, "aspect-[4/3] sm:aspect-square")}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
