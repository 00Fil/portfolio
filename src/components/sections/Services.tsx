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
import { GooDefs, ServiceVisual, type WidgetText } from "./ServiceWidgets";
import { Bead } from "@/components/glass/Bead";
import { ServiceBg } from "./ServiceBg";

/* Ingombro di ogni servizio nella griglia a 4 colonne. */
const SPAN: Record<string, [number, number]> = {
  web: [2, 2],
  seo: [2, 1],
  geo: [2, 1],
  ai: [2, 1],
  design: [2, 1],
  api: [2, 1],
  ops: [2, 1],
};
/* Solo i servizi essenziali, tutti in schede grandi: righe piene, nessun buco. */
const ORDER = ["web", "seo", "geo", "ai", "design", "api", "ops"];
const SHOWN = ORDER.map((k) => SERVICES.find((x) => x.key === k)!);

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
function Body({ s, w, locale, open }: { s: Service; w: WidgetText; locale: Locale; open: string }) {
  return (
    <div className="theme-dark relative flex h-full flex-col">
      <div aria-hidden className="pointer-events-none absolute overflow-hidden" style={{ inset: "calc(var(--mb-pad, 20px) * -1)" }}>
        <ServiceBg k={s.key} />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent" />
      </div>
      {/* il disegno compare al passaggio del mouse; a riposo resta solo lo sfondo */}
      <div className="svc-vis absolute inset-x-2 bottom-[92px] top-[58px]">
        <ServiceVisual k={s.key} t={w} max={1} />
      </div>
      <div className="relative flex items-center justify-between">
        <span className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-white/85">{s.label[locale]}</span>
        <Bead tint="rgba(8,9,12,.55)" className="flex h-8 w-8 items-center justify-center text-white/80 transition-colors duration-300 group-hover:text-ink" aria-label={open}>
          <ArrowUpRight size={15} strokeWidth={1.9} />
        </Bead>
      </div>
      {/* sotto il titolo una velatura sfocata che sfuma verso l'alto, per leggere sempre il testo */}
      <div className="relative mt-auto">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 backdrop-blur-[10px] [mask-image:linear-gradient(to_top,#000_55%,transparent)]"
          style={{ left: "calc(var(--mb-pad, 20px) * -1)", right: "calc(var(--mb-pad, 20px) * -1)", bottom: "calc(var(--mb-pad, 20px) * -1)", background: "linear-gradient(to top, rgba(6,7,9,.9), rgba(6,7,9,.55) 60%, transparent)" }}
        />
        <h3 className="relative text-[18px] font-semibold tracking-[-0.02em] text-ink">{s.title[locale]}</h3>
        <p className="relative mt-1.5 max-w-[52ch] text-[13.5px] leading-[1.5] text-ink-2">{s.short[locale]}</p>
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
        {SHOWN.map((s) => (
          <Link
            key={s.slug}
            href={`/servizi/${s.slug}`}
            className="group relative h-[440px] w-[84vw] max-w-[380px] shrink-0 snap-start overflow-hidden rounded-[30px] bg-[#0d0e10] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,.07)] [--mb-pad:24px]"
          >
            <Body s={s} w={w} locale={locale} open={open} />
          </Link>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-center gap-1.5" aria-hidden>
        {SHOWN.map((s, i) => (
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

  const items: MagicBentoItem[] = SHOWN.map((s) => {
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
      content: <Body s={s} w={w} locale={locale} open={t("open")} />,
      colSpan: Math.min(c, cols),
      rowSpan: r,
    };
  });

  return (
    <section id="approach" className="relative mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-36">
      <GooDefs />
      <Reveal>
        <SectionHead index="01" title={t("title")} lead={t("lead")} />
      </Reveal>
      <Reveal>
        <div data-reveal>
          {cols === 1 ? (
            <Carousel w={w} locale={locale} open={t("open")} />
          ) : (
            <MagicBento
              items={items}
              columns={cols}
              rowHeight={360}
              gap={22}
              radius={30}
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
                  "--mb-pad": "28px",
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
