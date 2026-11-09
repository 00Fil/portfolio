"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { MousePointer2 } from "lucide-react";
import { SectionHead } from "./SectionHead";
import { Reveal } from "@/components/motion/Reveal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Step = { name: string; you: string; get: string; chips: string[] };

/* Sagome dell'interfaccia vera (StudyKit), in percentuale della finestra: la stessa pagina passa da schizzo a prodotto. */
const BOXES = [
  { k: "logo", x: 10, y: 2, w: 4.3, h: 5.2, r: 1 },
  { k: "kick", x: 10, y: 21, w: 10.5, h: 1.6, r: 0.6 },
  { k: "h1", x: 10, y: 24.5, w: 32, h: 11, r: 0.6 },
  { k: "h2", x: 10, y: 37, w: 18, h: 11, r: 0.6 },
  { k: "h3", x: 10, y: 50, w: 28.5, h: 9, r: 0.6 },
  { k: "lead", x: 10, y: 63.5, w: 18.5, h: 2, r: 0.6 },
  { k: "search", x: 10, y: 70, w: 38.8, h: 6.6, r: 3.3, main: true },
  { k: "chips", x: 10, y: 79, w: 29, h: 1.6, r: 0.6 },
  { k: "mascot", x: 60, y: 34, w: 26, h: 36, r: 6 },
];

export function Process() {
  const t = useTranslations("process");
  const steps = t.raw("steps") as Step[];
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = (s: string) => gsap.utils.toArray<HTMLElement>(s, el);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const texts = q("[data-step]");
        gsap.set(texts.slice(1), { autoAlpha: 0, y: 30 });
        gsap.set(q("[data-proto]"), { opacity: 0 });
        gsap.set(q("[data-cursor]"), { autoAlpha: 0, left: "70%", top: "90%" });
        gsap.set(q("[data-product]"), { clipPath: "inset(0 100% 0 0)" });
        gsap.set(q("[data-live]"), { autoAlpha: 0, y: 12 });
        q("[data-line]").forEach((l) => {
          const len = (l as unknown as SVGGeometryElement).getTotalLength?.() ?? 400;
          gsap.set(l, { strokeDasharray: len, strokeDashoffset: len });
        });

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: { trigger: el.querySelector("[data-pin]"), start: "top top", end: "+=320%", pin: true, scrub: 0.8 },
        });
        // 1 · ci sentiamo: la pagina prende forma come schizzo
        tl.to(q("[data-line]"), { strokeDashoffset: 0, duration: 0.8, stagger: 0.05 }, 0.1);
        // 2 · ti mostro: lo schizzo diventa un prototipo cliccabile
        const step = (i: number, at: number) => {
          tl.to(texts[i - 1], { autoAlpha: 0, y: -30, duration: 0.3, ease: "power2.in" }, at)
            .to(texts[i], { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" }, at + 0.2)
            .to(q("[data-bar]")[i], { scaleX: 1, duration: 0.5 }, at);
        };
        step(1, 1.2);
        tl.to(q("[data-proto]"), { opacity: 1, duration: 0.5, stagger: 0.04 }, 1.3)
          .to(q("[data-cursor]"), { autoAlpha: 1, duration: 0.15 }, 1.5)
          .to(q("[data-cursor]"), { left: "30%", top: "74%", duration: 0.5, ease: "power3.inOut" }, 1.55)
          .fromTo(q("[data-click]"), { scale: 0.4, opacity: 0.9 }, { scale: 2.4, opacity: 0, duration: 0.35, ease: "power2.out" }, 2.05)
          .to(q("[data-main]"), { backgroundColor: "#3F9C97", duration: 0.2 }, 2.05);
        // 3 · costruisco: l'interfaccia vera si sostituisce al prototipo
        step(2, 2.5);
        tl.to(q("[data-cursor]"), { autoAlpha: 0, duration: 0.15 }, 2.5).to(q("[data-product]"), { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power3.inOut" }, 2.6);
        // 4 · consegno e resto: online, con chi lo segue
        step(3, 3.8);
        tl.to(q("[data-url-a]"), { autoAlpha: 0, duration: 0.2 }, 3.9)
          .to(q("[data-url-b]"), { autoAlpha: 1, duration: 0.2 }, 4.0)
          .to(q("[data-live]"), { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.08, ease: "back.out(2)" }, 4.0)
          .to({}, { duration: 0.6 });
        tl.fromTo(q("[data-bar]")[0], { scaleX: 0 }, { scaleX: 1, duration: 0.5 }, 0);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="approach" className="relative pt-24 sm:pt-36">
      <Reveal className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <SectionHead index="02" title={t("title")} lead={t("lead")} />
      </Reveal>
      <div data-pin className="relative flex min-h-[100svh] items-center">
        <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-5 pt-16 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pt-0">
          <div className="lg:col-span-4">
            <div className="flex gap-2" aria-hidden>
              {steps.map((s) => (
                <span key={s.name} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
                  <span data-bar className="block h-full origin-left scale-x-0 bg-[var(--sky)]" />
                </span>
              ))}
            </div>
            <div className="relative mt-8 grid">
              {steps.map((s, i) => (
                <div key={s.name} data-step className="[grid-area:1/1]">
                  <p className="t-label font-mono text-[var(--sky)]">
                    {String(i + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 text-[clamp(34px,4vw,56px)] font-medium leading-[1] tracking-[-0.045em] text-ink">{s.name}</h3>
                  <dl className="mt-6 grid gap-4 text-[17px] leading-[1.45]">
                    <div>
                      <dt className="t-label text-ink-3">{t("you")}</dt>
                      <dd className="mt-1 text-ink">{s.you}</dd>
                    </div>
                    <div>
                      <dt className="t-label text-ink-3">{t("get")}</dt>
                      <dd className="mt-1 text-ink">{s.get}</dd>
                    </div>
                  </dl>
                  <ul className="mt-6 hidden flex-wrap gap-2 sm:flex">
                    {s.chips.map((c) => (
                      <li key={c} className="drop flex h-9 items-center px-3.5 text-[13px] text-ink-2" style={{ ["--drop-tint" as string]: "rgba(28,28,30,.6)" }}>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-[18px] bg-[#111214] shadow-[0_60px_120px_-40px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.08)]">
              <div className="relative flex h-9 items-center gap-2 bg-[#1a1b1e] px-4">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/15" />
                ))}
                <span className="relative mx-auto h-5 w-[180px] text-center text-[12px] text-white/50">
                  <span data-url-a className="absolute inset-0 rounded-full bg-white/5 leading-5">bozza</span>
                  <span data-url-b className="invisible absolute inset-0 rounded-full bg-white/5 leading-5 opacity-0">studykit</span>
                </span>
                <span className="w-10" />
              </div>
              <div className="relative aspect-[16/10] overflow-hidden [container-type:inline-size]">
                {/* schizzo su carta da progetto */}
                <div aria-hidden className="absolute inset-0 bg-[#111214] [background-image:radial-gradient(rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:18px_18px]" />
                <svg aria-hidden viewBox="0 0 100 62.5" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                  {BOXES.map((b) => (
                    <rect key={b.k} data-line x={b.x} y={b.y * 0.625} width={b.w} height={b.h * 0.625} rx={b.r} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="0.14" />
                  ))}
                </svg>
                {/* prototipo: blocchi pieni, un tasto che risponde */}
                {BOXES.map((b) => (
                  <span
                    key={b.k}
                    data-proto
                    {...(b.main ? { "data-main": "" } : {})}
                    aria-hidden
                    className="absolute bg-[#26282d]"
                    style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%`, borderRadius: `${b.r}cqw` }}
                  />
                ))}
                <span data-cursor aria-hidden className="absolute z-10">
                  <span data-click className="absolute -left-3 -top-3 h-6 w-6 rounded-full border border-[#3F9C97] opacity-0" />
                  <MousePointer2 size={22} strokeWidth={1.6} className="fill-white text-black" />
                </span>
                {/* il prodotto vero */}
                <img data-product src="/work/unispace/studykit.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
                  <span data-live className="drop flex h-9 items-center gap-2 px-3.5 text-[13px] text-white" style={{ ["--drop-tint" as string]: "rgba(12,13,15,.55)" }}>
                    <span className="h-2 w-2 rounded-full bg-[var(--positive)] shadow-[0_0_10px_var(--positive)]" />
                    {t("online")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
