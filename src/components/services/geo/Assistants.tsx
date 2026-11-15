"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Bead } from "@/components/glass/Bead";
import { prefersReducedMotion } from "@/lib/env";
import { play as sfx } from "@/lib/sound";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** I quattro assistenti, sempre nello stesso ordine, ognuno con il suo marchio a colori. */
export const ASSISTANTS = [
  { n: "ChatGPT", src: "/visual/brands/openai.svg" },
  { n: "Gemini", src: "/visual/brands/gemini.svg" },
  { n: "Claude", src: "/visual/brands/claude.svg" },
  { n: "Perplexity", src: "/visual/brands/perplexity.svg" },
] as const;

/** Il marchio dentro una tessera di vetro bianco, come l'icona di un'app. La misura segue il testo (em) o è fissa (px). */
export function AiTile({ i, size = "1em", radius = 12, className = "" }: { i: number; size?: number | string; radius?: number; className?: string }) {
  const a = ASSISTANTS[i];
  return (
    <Bead tint="rgba(255,255,255,.95)" radius={radius} className={`inline-flex shrink-0 items-center justify-center align-middle ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={a.src} alt="" draggable={false} className="block h-[56%] w-[56%]" />
    </Bead>
  );
}

/**
 * La riga firma della pagina: «Su ChatGPT ▢, Gemini ▢, Claude ▢ e Perplexity ▢.»
 * Ogni nome sale dal basso e il suo marchio si apre subito dopo, uno alla volta, con un tocco di vetro che sale di tono.
 * `start`: "scroll" parte quando la riga entra nello schermo; "manual" la fa partire chi la contiene, con `playLine`.
 */
export function AssistantLine({ prefix, and, className = "", start = "scroll", radius = 12 }: { prefix?: string; and: string; className?: string; start?: "scroll" | "manual"; radius?: number }) {
  const root = useRef<HTMLParagraphElement>(null);
  useGSAP(
    () => {
      if (start !== "scroll" || prefersReducedMotion()) return;
      const tl = gsap.timeline({ paused: true });
      playLine(tl, root.current!, 0);
      ScrollTrigger.create({ trigger: root.current, start: "top 85%", once: true, onEnter: () => void tl.play() });
    },
    { scope: root },
  );
  return (
    <p ref={root} data-aline className={`font-semibold leading-[1.3] tracking-[-0.04em] ${className}`}>
      {prefix && (
        <span data-n className="inline-block">
          {prefix}&nbsp;
        </span>
      )}
      {ASSISTANTS.map((a, i) => (
        <span key={a.n}>
          {i === ASSISTANTS.length - 1 && (
            <span data-n className="inline-block">
              {and}&nbsp;
            </span>
          )}
          <span data-n className="inline-flex items-center gap-[0.22em] whitespace-nowrap">
            {a.n}
            <span data-lg className="inline-flex">
              <AiTile i={i} size="1.05em" radius={radius} />
            </span>
            {i < ASSISTANTS.length - 2 ? "," : i === ASSISTANTS.length - 1 ? "." : ""}
          </span>
          {i < ASSISTANTS.length - 1 && " "}
        </span>
      ))}
    </p>
  );
}

/** Il movimento della riga, da mettere in una timeline: nomi in salita, marchi che si aprono, un tocco per logo. */
export function playLine(tl: gsap.core.Timeline, el: Element, at: number) {
  const q = gsap.utils.selector(el);
  tl.fromTo(q("[data-n]"), { yPercent: 35, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: "expo.out" }, at).fromTo(
    q("[data-lg]"),
    { scale: 0.6, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.6, stagger: 0.16, ease: "expo.out" },
    at + 0.2,
  );
  [1, 1.12, 1.26, 1.5].forEach((p, i) => tl.call(() => sfx("copy", p), undefined, at + 0.2 + i * 0.16));
  return tl;
}
