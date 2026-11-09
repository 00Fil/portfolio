"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import MagicBento, { type MagicBentoItem } from "@/components/reactbits/MagicBento";
import { Reveal } from "@/components/motion/Reveal";
import { Link, useRouter } from "@/i18n/navigation";
import { SERVICES, type Service } from "@/content/services";
import type { Locale } from "@/i18n/routing";
import { SectionHead } from "./SectionHead";
import { ServiceVisual, type WidgetText } from "./ServiceWidgets";

/* Ingombro di ogni servizio nella griglia a 4 colonne. */
const SPAN: Record<string, [number, number]> = {
  web: [2, 2],
  seo: [2, 1],
  geo: [2, 1],
  ai: [2, 1],
  hw: [2, 1],
  apps: [1, 1],
  design: [1, 1],
  ops: [2, 1],
  api: [2, 1],
  shop: [2, 1],
};
/* Ordine nella griglia: righe piene, nessun buco. */
const ORDER = ["web", "seo", "geo", "ai", "hw", "apps", "design", "ops", "api", "shop"];
/* Ogni scheda inquadra un punto diverso dello stesso fondo di fibre. */
const BG: CSSProperties[] = [
  { objectPosition: "20% 30%" },
  { objectPosition: "80% 20%", transform: "scaleX(-1)" },
  { objectPosition: "40% 80%" },
  { objectPosition: "90% 60%", transform: "scaleY(-1)" },
  { objectPosition: "10% 50%", transform: "scale(-1,-1)" },
  { objectPosition: "60% 40%" },
  { objectPosition: "30% 10%", transform: "scaleX(-1)" },
  { objectPosition: "70% 90%" },
  { objectPosition: "50% 50%", transform: "scaleY(-1)" },
  { objectPosition: "35% 65%", transform: "scaleX(-1)" },
];

function useColumns() {
  const [c, setC] = useState(4);
  useEffect(() => {
    const m = () => setC(window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 2 : 1);
    m();
    window.addEventListener("resize", m);
    return () => window.removeEventListener("resize", m);
  }, []);
  return c;
}

/** Il corpo di una scheda: fondo di fibre, disegno animato, titolo e una riga. */
function Body({ s, i, w, locale, open }: { s: Service; i: number; w: WidgetText; locale: Locale; open: string }) {
  return (
    <div className="relative flex h-full flex-col">
      <div aria-hidden className="pointer-events-none absolute overflow-hidden" style={{ inset: "calc(var(--mb-pad, 20px) * -1)" }}>
        <img src="/visual/fibers-sky.webp" alt="" className="h-full w-full object-cover opacity-60" style={BG[i % BG.length]} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0e10]/30 via-transparent to-[#0d0e10]" />
      </div>
      <div className="relative flex items-center justify-between">
        <span className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-ink-2">{s.label[locale]}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-ink-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] transition-colors duration-300 group-hover:bg-[var(--sky)] group-hover:text-black" aria-label={open}>
          <ArrowUpRight size={15} strokeWidth={1.9} />
        </span>
      </div>
      <div className="relative min-h-0 flex-1 py-4">
        <ServiceVisual k={s.key} t={w} max={s.key === "web" ? 1.4 : 1.15} />
      </div>
      <div className="relative">
        <h3 className="text-[17px] font-semibold tracking-[-0.015em] text-ink">{s.title[locale]}</h3>
        <p className="mt-1 text-[13.5px] leading-[1.45] text-ink-2">{s.short[locale]}</p>
      </div>
    </div>
  );
}

/** Telefono: un servizio alla volta, si scorre di lato. */
function Carousel({ w, locale, open }: { w: WidgetText; locale: Locale; open: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  useEffect(() => {
    const el = track.current!;
    const on = () => {
      const card = el.firstElementChild as HTMLElement | null;
      if (card) setAt(Math.round(el.scrollLeft / (card.offsetWidth + 12)));
    };
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, []);
  return (
    <>
      <div ref={track} className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SERVICES.map((s, i) => (
          <Link
            key={s.slug}
            href={`/servizi/${s.slug}`}
            className="group relative h-[400px] w-[84vw] max-w-[380px] shrink-0 snap-start overflow-hidden rounded-[28px] bg-[#0d0e10] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.07)] [--mb-pad:20px]"
          >
            <Body s={s} i={i} w={w} locale={locale} open={open} />
          </Link>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-center gap-1.5" aria-hidden>
        {SERVICES.map((s, i) => (
          <span key={s.slug} className={`h-1.5 rounded-full transition-all duration-500 ${i === at ? "w-6 bg-[var(--sky)]" : "w-1.5 bg-white/20"}`} />
        ))}
      </div>
    </>
  );
}

export function Services() {
  const t = useTranslations("services");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const w = t.raw("w") as WidgetText;
  const cols = useColumns();

  const items: MagicBentoItem[] = ORDER.map((key) => SERVICES.find((x) => x.key === key)!).map((s, i) => {
    const [c, r] = SPAN[s.key];
    const href = `/servizi/${s.slug}`;
    return {
      id: s.slug,
      href: `/${locale}${href}`,
      onClick: (e: MouseEvent<HTMLElement>) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        router.push(href);
      },
      content: <Body s={s} i={i} w={w} locale={locale} open={t("open")} />,
      colSpan: Math.min(c, cols),
      rowSpan: r,
    };
  });

  return (
    <section id="approach" className="relative mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-36">
      <Reveal>
        <SectionHead index="02" title={t("title")} lead={t("lead")} />
      </Reveal>
      <Reveal>
        <div data-reveal>
          {cols === 1 ? (
            <Carousel w={w} locale={locale} open={t("open")} />
          ) : (
            <MagicBento
              items={items}
              columns={cols}
              rowHeight={310}
              gap={14}
              radius={28}
              theme="dark"
              glowColor="94, 196, 255"
              enableSpotlight={false}
              enableBorderGlow
              enableStars={false}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect={false}
              style={
                {
                  "--mb-surface": "#0d0e10",
                  "--mb-tile": "#1c1c1e",
                  "--mb-edge": "rgba(255,255,255,0.07)",
                } as CSSProperties
              }
            />
          )}
        </div>
      </Reveal>
    </section>
  );
}
