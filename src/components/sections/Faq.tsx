"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { Plus } from "lucide-react";
import { Bead } from "@/components/glass/Bead";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHead } from "./SectionHead";

type QA = { q: string; a: string };

function Item({ it, open, onToggle }: { it: QA; open: boolean; onToggle: () => void }) {
  const body = useRef<HTMLDivElement>(null);
  const toggle = () => {
    const el = body.current!;
    if (open) gsap.to(el, { height: 0, duration: 0.45, ease: "power3.inOut" });
    else gsap.fromTo(el, { height: 0 }, { height: "auto", duration: 0.55, ease: "expo.out" });
    onToggle();
  };
  return (
    <li className="border-b border-[var(--hair)]">
      <button type="button" onClick={toggle} aria-expanded={open} className="group flex w-full items-center justify-between gap-6 py-6 text-left">
        <span className="text-[clamp(18px,1.7vw,22px)] font-medium tracking-[-0.02em] text-ink">{it.q}</span>
        <Bead tint={open ? "sky" : undefined} className="flex h-10 w-10 shrink-0 items-center justify-center text-ink transition-[rotate] duration-500" style={{ rotate: open ? "45deg" : "0deg" }}>
          <Plus size={17} strokeWidth={2} />
        </Bead>
      </button>
      <div ref={body} className={`overflow-hidden ${open ? "" : "h-0"}`}>
        <p className="max-w-[64ch] pb-6 text-[16px] leading-[1.6] text-ink-2">{it.a}</p>
      </div>
    </li>
  );
}

/** Domande frequenti: le obiezioni prima della richiesta. Anche come dati strutturati per Google e per le AI. */
export function Faq() {
  const t = useTranslations("faq");
  const items = t.raw("items") as QA[];
  const [open, setOpen] = useState<number | null>(0);
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
  };
  return (
    <section id="faq" className="relative mx-auto w-full max-w-[1280px] px-5 pt-20 sm:px-8 sm:pt-36">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <SectionHead index="05" title={t("title")} />
          <p className="-mt-4 max-w-[34ch] text-ink-2" data-reveal>
            {t("lead")}
          </p>
        </Reveal>
        <ul className="border-t border-[var(--hair)] lg:col-span-8">
          {items.map((it, i) => (
            <Item key={it.q} it={it} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </ul>
      </div>
    </section>
  );
}
