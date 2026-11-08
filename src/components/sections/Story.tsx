"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Counter from "@/components/reactbits/Counter";
import DitherVeil from "@/components/reactbits/DitherVeil";
import Dither from "@/components/reactbits/Dither";
import { play } from "@/lib/sound";
import { prefersReducedMotion } from "@/lib/env";

gsap.registerPlugin(ScrollTrigger);

type Chapter = { tag: string; title: string; body: string; value: number; unit: string };

/**
 * Il percorso raccontato a capitoli. A sinistra resta fermo un pannello: il numero del capitolo rotola
 * (Counter di React Bits), sotto la foto retinata e una barra a blocchi che si riempie. A destra scorrono i capitoli;
 * quello attivo è a fuoco, gli altri si attenuano. I blocchi della barra si possono toccare per saltare.
 */
export function Story({ chapters, title, lead, locale, photo }: { chapters: Chapter[]; title: string; lead: string; locale: string; photo?: string }) {
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLElement | null)[]>([]);
  const fill = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const triggers = items.current.map((el, i) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (s) => {
          if (s.isActive) {
            setActive(i);
            play("tick");
          }
        },
      }),
    );
    const prog = ScrollTrigger.create({
      trigger: section.current,
      start: "top 40%",
      end: "bottom 70%",
      onUpdate: (s) => {
        if (fill.current) fill.current.style.transform = `scaleX(${s.progress})`;
      },
    });
    return () => {
      triggers.forEach((t) => t.kill());
      prog.kill();
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    items.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, { opacity: i === active ? 1 : 0.28, filter: i === active ? "blur(0px)" : "blur(1.5px)", duration: 0.5, ease: "power2.out" });
    });
  }, [active]);

  const jump = (i: number) => {
    const el = items.current[i];
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.4;
    import("@/lib/scroll").then((m) => m.scrollToY(y));
  };

  const c = chapters[active];
  return (
    <section ref={section} id="path" className="mx-auto w-full max-w-[1280px] px-5 py-24 sm:px-8 sm:py-32">
      <div className="mb-14 max-w-[60ch]">
        <p className="t-label t-fig mb-3 text-ink-3">03</p>
        <h2 className="t-title1 text-ink sm:text-[56px] sm:leading-[60px]">{title}</h2>
        <p className="mt-4 text-ink-2">{lead}</p>
      </div>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        {/* pannello fermo */}
        <div className="lg:sticky lg:top-28 lg:h-[calc(100svh-14rem)] lg:self-start">
          <div className="flex h-full flex-col">
            <div className="flex items-end gap-4">
              <Counter
                value={c.value}
                locale={locale}
                fontSize="clamp(72px, 9vw, 136px)"
                fontWeight={500}
                textColor="var(--label-primary)"
                tabular
                motionBlur
                direction="shortest"
                className="t-fig leading-none tracking-[-0.04em]"
              />
            </div>
            <p className="mt-3 text-ink-2">{c.unit}</p>
            <div className="relative mt-8 hidden aspect-[4/3] w-full overflow-hidden rounded-[28px] bg-surface lg:block lg:flex-1">
              {photo ? (
                <DitherVeil src={photo} className="absolute inset-0" pixelSize={4} inkColor="#F2F2F0" paperColor="#000000" wander />
              ) : (
                <Dither
                  className="absolute inset-0"
                  palette={["#000000", "#11244F", "#1F44CC", "#2F5FFF", "#5C9DFF"]}
                  ditherMode="bayer4"
                  pixelSize={6}
                  waveSpeed={0.04 + active * 0.015}
                  waveFrequency={2 + active}
                  enableMouseInteraction
                  mouseEffect="ripple"
                />
              )}
              <span className="t-label absolute left-4 top-4 rounded-full bg-black/70 px-2.5 py-1 text-ink">{c.tag}</span>
            </div>
            <div className="mt-6 flex items-center gap-1.5" role="tablist">
              {chapters.map((ch, i) => (
                <button
                  key={ch.title}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={ch.title}
                  onClick={() => jump(i)}
                  className="group h-6 flex-1"
                >
                  <span className={`block h-1.5 rounded-[2px] transition-colors duration-300 ${i <= active ? "bg-[var(--accent)]" : "bg-sunken group-hover:bg-line-strong"}`} />
                </button>
              ))}
            </div>
            <div className="mt-2 h-px w-full overflow-hidden bg-transparent">
              <div ref={fill} className="h-full w-full origin-left scale-x-0 bg-[var(--accent-on-subtle)]" />
            </div>
          </div>
        </div>
        {/* capitoli */}
        <ol className="lg:py-[18vh]">
          {chapters.map((ch, i) => (
            <li
              key={ch.title}
              ref={(el) => {
                items.current[i] = el;
              }}
              className="min-h-[46vh] py-8 lg:min-h-[62vh]"
            >
              <p className="t-label t-fig text-accent-on-subtle">
                {String(i + 1).padStart(2, "0")} · {ch.tag}
              </p>
              <h3 className="t-serif mt-4 text-[44px] leading-[1] text-ink sm:text-[64px]">{ch.title}</h3>
              <p className="mt-6 max-w-[46ch] text-[17px] leading-[27px] text-ink-2">{ch.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
