"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHead } from "./SectionHead";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LightRays = dynamic(() => import("@/components/reactbits/LightRays"), { ssr: false });

type Step = { name: string; title: string; body: string; get: string };

/* Disegni al tratto: si disegnano mentre scorri. Un tratto = data-d, un riempimento = data-f. */
const S = { stroke: "#5ec4ff", strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
const Q = { ...S, stroke: "rgba(242,242,240,.55)", strokeWidth: 2 };

function Listen() {
  return (
    <g data-scene>
      {/* lui racconta */}
      <path data-d {...S} d="M70 90h270a24 24 0 0 1 24 24v92a24 24 0 0 1-24 24H150l-38 34v-34H70a24 24 0 0 1-24-24v-92a24 24 0 0 1 24-24z" />
      <path data-d {...Q} d="M84 132h220M84 162h250M84 192h160" />
      {/* io rispondo */}
      <path data-d {...S} d="M300 268h210a22 22 0 0 1 22 22v58a22 22 0 0 1-22 22h-30v30l-34-30H300a22 22 0 0 1-22-22v-58a22 22 0 0 1 22-22z" />
      <path data-d {...Q} d="M300 306h170M300 334h120" />
      {/* il preventivo */}
      <path data-d {...S} d="M104 328h150l40 40v190a12 12 0 0 1-12 12H104a12 12 0 0 1-12-12V340a12 12 0 0 1 12-12z" />
      <path data-d {...S} d="M254 328v40h40" />
      <path data-d {...Q} d="M118 380h96" />
      <path data-d {...S} d="M118 424l10 10 18-20M118 468l10 10 18-20M118 512l10 10 18-20" />
      <path data-d {...Q} d="M166 428h96M166 472h80M166 516h100" />
    </g>
  );
}

function Prototype() {
  return (
    <g data-scene>
      <rect data-d {...S} x="70" y="70" width="460" height="330" rx="22" />
      <path data-d {...Q} d="M70 112h460" />
      <circle data-f cx="96" cy="91" r="5" fill="rgba(242,242,240,.4)" />
      <circle data-f cx="114" cy="91" r="5" fill="rgba(242,242,240,.4)" />
      <circle data-f cx="132" cy="91" r="5" fill="rgba(242,242,240,.4)" />
      <rect data-d {...Q} x="96" y="140" width="110" height="234" rx="12" />
      <path data-d {...Q} d="M232 150h170M232 176h230" />
      <rect data-d {...S} x="232" y="206" width="270" height="110" rx="14" />
      <path data-d {...Q} d="M232 206l270 110M502 206L232 316" />
      <rect data-d {...S} x="232" y="336" width="128" height="40" rx="20" />
      {/* il cursore clicca il tasto */}
      <path data-d {...S} stroke="#F2F2F0" d="M330 352l0 52 14-14 10 24 10-4-10-24 20 0z" />
      <circle data-ring cx="330" cy="352" r="14" fill="none" stroke="#5ec4ff" strokeWidth="2" />
      {/* il percorso tra le schermate */}
      <rect data-d {...Q} x="110" y="460" width="90" height="70" rx="12" />
      <rect data-d {...Q} x="255" y="460" width="90" height="70" rx="12" />
      <rect data-d {...S} x="400" y="460" width="90" height="70" rx="12" />
      <path data-d {...S} d="M206 495h40m-10-10l10 10-10 10M351 495h40m-10-10l10 10-10 10" />
    </g>
  );
}

function Build() {
  return (
    <g data-scene>
      <rect data-d {...S} x="70" y="70" width="460" height="300" rx="22" />
      <path data-d {...Q} d="M70 112h460" />
      <rect data-f x="96" y="136" width="110" height="210" rx="12" fill="rgba(94,196,255,.16)" />
      <rect data-f x="232" y="136" width="270" height="96" rx="14" fill="rgba(94,196,255,.28)" />
      <rect data-f x="232" y="250" width="130" height="96" rx="14" fill="rgba(242,242,240,.10)" />
      <rect data-f x="376" y="250" width="126" height="96" rx="14" fill="rgba(242,242,240,.10)" />
      <path data-d {...S} d="M262 184l-18 18 18 18M472 184l18 18-18 18M380 172l-34 60" />
      {/* tappe brevi: ogni pallino è una versione da provare */}
      <path data-d {...Q} d="M90 470h420" />
      {[110, 243, 376, 490].map((x, i) => (
        <g key={x}>
          <circle data-d {...S} cx={x} cy={470} r="20" />
          <circle data-node cx={x} cy={470} r="20" fill="#5ec4ff" opacity="0" />
          <path data-node d={`M${x - 8} 470l6 6 11-12`} stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
          <path data-d {...Q} d={`M${x - 18} 520h36`} opacity={0.6 + i * 0.1} />
        </g>
      ))}
    </g>
  );
}

function Live() {
  return (
    <g data-scene>
      {/* il mondo che lo usa */}
      <circle data-d {...S} cx="230" cy="290" r="140" />
      <ellipse data-d {...Q} cx="230" cy="290" rx="60" ry="140" />
      <path data-d {...Q} d="M90 290h280M108 220h244M108 360h244" />
      {/* il segnale: online */}
      <path data-d {...S} d="M402 170a60 60 0 0 1 0 84M428 146a96 96 0 0 1 0 132" />
      <circle data-f cx="380" cy="212" r="10" fill="#5ec4ff" />
      {/* al sicuro */}
      <path data-d {...S} d="M460 330l60 22v46c0 40-28 66-60 78-32-12-60-38-60-78v-46z" />
      <path data-d {...S} d="M436 402l16 16 30-32" />
      {/* e resto: assistenza continua */}
      <path data-d {...S} d="M120 500a210 70 0 0 0 360 0" />
      <path data-d {...S} d="M466 486l14 14-18 8" />
    </g>
  );
}

export function Process() {
  const t = useTranslations("process");
  const steps = t.raw("steps") as Step[];
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const scenes = gsap.utils.toArray<SVGGElement>("[data-scene]", el);
      const blocks = gsap.utils.toArray<HTMLElement>("[data-block]", el);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        scenes.forEach((g, i) => {
          gsap.utils.toArray<SVGGeometryElement>("[data-d]", g).forEach((p) => {
            const len = p.getTotalLength ? p.getTotalLength() : 600;
            gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
          });
          gsap.set(g.querySelectorAll("[data-f]"), { opacity: 0 });
          if (i > 0) gsap.set(g, { opacity: 0 });
        });

        blocks.forEach((b, i) => {
          const g = scenes[i];
          const tl = gsap.timeline({ scrollTrigger: { trigger: b, start: "top 80%", end: "center 45%", scrub: 0.7 } });
          if (i > 0) tl.to(scenes[i - 1], { opacity: 0, scale: 0.94, transformOrigin: "50% 50%", duration: 0.3, ease: "power2.in" }, 0);
          tl.to(g, { opacity: 1, scale: 1, duration: 0.2 }, i > 0 ? 0.2 : 0)
            .to(g.querySelectorAll("[data-d]"), { strokeDashoffset: 0, duration: 1, stagger: 0.05, ease: "power1.inOut" }, i > 0 ? 0.25 : 0)
            .to(g.querySelectorAll("[data-f]"), { opacity: 1, duration: 0.3, stagger: 0.05 }, ">-0.4");
          if (g.querySelector("[data-ring]")) tl.fromTo(g.querySelector("[data-ring]"), { scale: 0.3, opacity: 1, transformOrigin: "50% 50%" }, { scale: 2.6, opacity: 0, duration: 0.4 }, ">-0.2");
          const nodes = g.querySelectorAll("[data-node]");
          if (nodes.length) tl.to(nodes, { opacity: 1, duration: 0.15, stagger: 0.12 }, ">-0.6");

          // le parole del titolo si accendono una a una
          gsap.fromTo(
            b.querySelectorAll("[data-w]"),
            { opacity: 0.14 },
            { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: b, start: "top 75%", end: "top 30%", scrub: true } },
          );
          gsap.fromTo(b.querySelectorAll("[data-in]"), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: b, start: "top 55%", end: "top 30%", scrub: true } });
          // il numero grande scorre più lento
          gsap.fromTo(b.querySelector("[data-num]"), { yPercent: 40 }, { yPercent: -40, ease: "none", scrollTrigger: { trigger: b, start: "top bottom", end: "bottom top", scrub: true } });
        });

        gsap.fromTo("[data-pbar]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-steps]", start: "top 50%", end: "bottom 50%", scrub: true } });
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

      <div className="relative mx-auto grid w-full max-w-[1280px] px-5 sm:px-8 lg:grid-cols-12 lg:gap-12">
        {/* disegno fisso: su telefono in alto, su desktop a destra */}
        <div className="sticky top-14 z-20 h-[42svh] bg-black after:absolute after:inset-x-0 after:top-full after:h-16 after:bg-gradient-to-b after:from-black after:to-transparent lg:z-0 lg:order-2 lg:col-span-6 lg:top-0 lg:h-[100svh] lg:bg-transparent lg:after:hidden">
          <div className="absolute inset-0 overflow-hidden [mask-image:radial-gradient(closest-side,#000_55%,transparent)]">
            <LightRays raysOrigin="top-center" raysColor="#5ec4ff" raysSpeed={0.6} lightSpread={0.9} rayLength={1.6} fadeDistance={1.1} followMouse mouseInfluence={0.08} noiseAmount={0.05} distortion={0.04} opacity={0.55} />
          </div>
          <svg viewBox="0 0 600 600" className="relative mx-auto h-full w-full max-w-[600px]" aria-hidden>
            <Listen />
            <Prototype />
            <Build />
            <Live />
          </svg>
        </div>

        <div data-steps className="relative z-10 lg:order-1 lg:col-span-6">
          <span aria-hidden className="absolute -left-5 top-0 hidden h-full w-px bg-white/10 sm:-left-8 lg:block">
            <span data-pbar className="block h-full w-full origin-top bg-[var(--sky)]" />
          </span>
          {steps.map((s, i) => (
            <article key={s.name} data-block className="relative flex min-h-[90svh] flex-col justify-end pb-28 pt-16 lg:min-h-[100svh] lg:justify-center lg:py-16">
              <span data-num aria-hidden className="pointer-events-none absolute -top-4 right-0 select-none font-mono text-[clamp(120px,16vw,220px)] font-medium leading-none tracking-[-0.06em] text-white/[0.04]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="t-label font-mono text-[var(--sky)]">
                {String(i + 1).padStart(2, "0")} · {s.name}
              </p>
              <h3 className="mt-5 max-w-[14ch] text-[clamp(38px,5vw,72px)] font-medium leading-[1] tracking-[-0.045em] text-ink" aria-label={s.title}>
                <span aria-hidden>
                  {s.title.split(" ").map((w, k) => (
                    <span key={k} data-w className="inline-block whitespace-pre">
                      {w}{" "}
                    </span>
                  ))}
                </span>
              </h3>
              <p data-in className="mt-6 max-w-[40ch] text-[18px] leading-[1.55] text-ink-2">
                {s.body}
              </p>
              <p data-in className="mt-6 flex max-w-[40ch] items-start gap-3 text-[16px] leading-[1.5] text-ink">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--sky)] text-black">
                  <Check size={14} strokeWidth={3} aria-hidden />
                </span>
                <span>
                  <span className="text-ink-3">{t("get")}: </span>
                  {s.get}
                </span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
