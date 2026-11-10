"use client";

import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
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

/**
 * Il corpo di una scheda. A riposo: il gradiente (che si mescola sotto il cursore) e il titolo al centro.
 * Al passaggio del mouse il titolo si dissolve e al suo posto compare, a tutta scheda, il servizio in azione.
 */
function Body({ s, w, locale, open, still = false }: { s: Service; w: WidgetText; locale: Locale; open: string; still?: boolean }) {
  const bleed = { inset: "calc(var(--mb-pad, 20px) * -1)" };
  return (
    <div className="theme-dark relative h-full">
      <div aria-hidden className="pointer-events-none absolute overflow-hidden" style={bleed}>
        <ServiceBg k={s.key} live={!still} still={still} />
      </div>
      <div className="svc-vis absolute overflow-hidden" style={bleed}>
        <ServiceVisual k={s.key} t={w} max={1.2} />
      </div>
      <div className="svc-rest pointer-events-none absolute flex flex-col items-center justify-center px-8 text-center" style={bleed}>
        <span className="flex items-center gap-2.5 font-mono text-[11.5px] uppercase tracking-[0.16em] text-white/75">
          <span className="h-px w-6 bg-white/40" />
          {s.label[locale]}
          <span className="h-px w-6 bg-white/40" />
        </span>
        <h3 className="mt-4 max-w-[16ch] text-[clamp(28px,2.9vw,44px)] font-medium leading-[1.02] tracking-[-0.045em] text-white">
          {s.title[locale]}
        </h3>
        <p className="mt-4 max-w-[38ch] text-[14px] leading-[1.5] text-white/70">{s.short[locale]}</p>
        <Bead tint="rgba(255,255,255,.14)" className="svc-arrow mt-7 flex h-11 w-11 items-center justify-center text-white" aria-label={open}>
          <ArrowUpRight size={18} strokeWidth={1.8} />
        </Bead>
      </div>
    </div>
  );
}

/** Telefono: le schede una sotto l'altra, con lo sfondo fermo (niente WebGL mentre si scorre). */
function List({ w, locale, open }: { w: WidgetText; locale: Locale; open: string }) {
  return (
    <div className="grid gap-4">
      {SHOWN.map((s) => (
        <Reveal key={s.slug}>
          <Link
            href={`/servizi/${s.slug}`}
            data-reveal
            className="group relative block h-[440px] overflow-hidden rounded-[28px] bg-[#0d0e10] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,.07)] [--mb-pad:24px]"
          >
            <Body s={s} w={w} locale={locale} open={open} still />
          </Link>
        </Reveal>
      ))}
    </div>
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
    <section id="approach" className="relative mx-auto w-full max-w-[1280px] px-5 pt-20 sm:px-8 sm:pt-36">
      <GooDefs />
      <Reveal>
        <SectionHead index="01" title={t("title")} lead={t("lead")} />
      </Reveal>
      {cols === 1 ? (
        <List w={w} locale={locale} open={t("open")} />
      ) : (
      <Reveal>
        <div data-reveal>
            <MagicBento
              items={items}
              columns={cols}
              rowHeight={360}
              gap={22}
              radius={30}
              theme="dark"
              glowColor="94, 196, 255"
              enableSpotlight
              spotlightRadius={420}
              enableBorderGlow
              enableStars={false}
              enableTilt
              enableMagnetism={false}
              clickEffect
              style={
                {
                  "--mb-surface": "#0d0e10",
                  "--mb-pad": "28px",
                  "--mb-tile": "#1c1c1e",
                  "--mb-edge": "rgba(255,255,255,0.07)",
                } as CSSProperties
              }
            />
        </div>
      </Reveal>
      )}
    </section>
  );
}
