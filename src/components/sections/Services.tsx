"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AppWindow, Bot, Cable, Gauge, LayoutTemplate, MonitorSmartphone, ServerCog, ShoppingBag, Sparkles } from "lucide-react";
import MagicBento, { type MagicBentoItem } from "@/components/reactbits/MagicBento";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHead } from "./SectionHead";
import { ApiW, AppsW, ChatW, DesignW, GeoW, OpsW, SeoW, ShopW, SiteW, type WidgetText } from "./ServiceWidgets";

type Service = { key: string; label: string; title: string; body: string };

/* Icona, disegno animato e ingombro di ogni servizio nella griglia a 4 colonne. */
const LAYOUT: Record<string, { icon: typeof Gauge; visual: (w: WidgetText) => ReactNode; col: number; row: number }> = {
  web: { icon: AppWindow, visual: (w) => <SiteW w={w} />, col: 2, row: 2 },
  seo: { icon: Gauge, visual: () => <SeoW />, col: 2, row: 1 },
  geo: { icon: Sparkles, visual: (w) => <GeoW w={w} />, col: 2, row: 1 },
  apps: { icon: MonitorSmartphone, visual: () => <AppsW />, col: 1, row: 1 },
  design: { icon: LayoutTemplate, visual: (w) => <DesignW w={w} />, col: 1, row: 1 },
  ai: { icon: Bot, visual: (w) => <ChatW w={w} />, col: 2, row: 1 },
  api: { icon: Cable, visual: () => <ApiW />, col: 1, row: 1 },
  shop: { icon: ShoppingBag, visual: (w) => <ShopW w={w} />, col: 1, row: 1 },
  ops: { icon: ServerCog, visual: (w) => <OpsW w={w} />, col: 2, row: 1 },
};

/** Colonne della griglia: 4 su desktop, 2 su tablet, 1 su telefono (lì diventa un carosello). */
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

/** Telefono: un servizio alla volta, si scorre di lato; sotto, la posizione nel carosello. */
function Carousel({ list, w }: { list: Service[]; w: WidgetText }) {
  const track = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  useEffect(() => {
    const el = track.current!;
    const on = () => {
      const card = el.firstElementChild as HTMLElement | null;
      if (!card) return;
      setAt(Math.round(el.scrollLeft / (card.offsetWidth + 12)));
    };
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, []);
  return (
    <>
      <div ref={track} className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {list.map((s) => {
          const L = LAYOUT[s.key];
          const I = L.icon;
          return (
            <article key={s.key} className="flex h-[360px] w-[84vw] max-w-[380px] shrink-0 snap-start flex-col rounded-[28px] bg-[#111214] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.07)]">
              <p className="flex items-center gap-2 text-[13px] text-ink-3">
                <I size={16} strokeWidth={1.8} className="text-ink-2" />
                {s.label}
              </p>
              <div className="relative min-h-0 flex-1 py-3 [container-type:size]">{L.visual(w)}</div>
              <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{s.title}</h3>
              <p className="mt-1 text-[14px] leading-[1.45] text-ink-2">{s.body}</p>
            </article>
          );
        })}
      </div>
      <div className="mt-5 flex items-center justify-center gap-1.5" aria-hidden>
        {list.map((s, i) => (
          <span key={s.key} className={`h-1.5 rounded-full transition-all duration-500 ${i === at ? "w-6 bg-[var(--sky)]" : "w-1.5 bg-white/20"}`} />
        ))}
      </div>
    </>
  );
}

export function Services() {
  const t = useTranslations("services");
  const list = t.raw("items") as Service[];
  const w = t.raw("w") as WidgetText;
  const cols = useColumns();

  const items: MagicBentoItem[] = list.map((s) => {
    const L = LAYOUT[s.key];
    const I = L.icon;
    return {
      id: s.key,
      label: s.label,
      title: s.title,
      description: s.body,
      icon: <I size={16} strokeWidth={1.8} />,
      visual: L.visual(w),
      colSpan: Math.min(L.col, cols),
      rowSpan: L.row,
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
            <Carousel list={list} w={w} />
          ) : (
            <MagicBento
              items={items}
              columns={cols}
              rowHeight={260}
              textAutoHide={false}
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
                  "--mb-surface": "#111214",
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
