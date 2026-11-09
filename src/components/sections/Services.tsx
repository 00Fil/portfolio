"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AppWindow, Bot, Cable, Check, Gauge, LayoutTemplate, LifeBuoy, MonitorSmartphone, ServerCog, ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";
import MagicBento, { type MagicBentoItem, type MagicBentoVisual } from "@/components/reactbits/MagicBento";
import * as si from "simple-icons";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHead } from "./SectionHead";

type Service = { label: string; title: string; body: string };

/* Disegni dei servizi: lavori veri o schemi onesti, niente numeri inventati. */
const Site = (
  <div className="relative mx-auto aspect-[16/10] h-[min(94cqh,58cqw)] overflow-hidden rounded-[12px] bg-[#16171a] shadow-[0_0_0_1px_rgba(255,255,255,.08),0_30px_60px_-30px_rgba(0,0,0,.9)]">
    <div className="flex h-6 items-center gap-1.5 bg-[#1d1e22] px-3">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-2 w-2 rounded-full bg-white/15" />
      ))}
    </div>
    <img src="/work/unispace/studykit.webp" alt="" className="h-[calc(100%-24px)] w-full object-cover object-left-top" />
  </div>
);
const SCORES = ["Performance", "Accessibility", "Best practices", "SEO"];
const Seo = (
  <div className="flex items-center justify-around gap-2">
    {SCORES.map((n) => (
      <div key={n} className="flex flex-col items-center gap-2">
        <span className="relative flex h-14 w-14 items-center justify-center">
        <span className="t-fig absolute text-[15px] font-medium text-[#4cc38a]">100</span>
        <svg viewBox="0 0 48 48" className="h-14 w-14 -rotate-90" aria-hidden>
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(76,195,138,.15)" strokeWidth="4" />
          <circle cx="24" cy="24" r="20" fill="none" stroke="#4cc38a" strokeWidth="4" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="0" />
        </svg>
        </span>
        <span className="whitespace-nowrap text-[11px] text-ink-3">{n}</span>
      </div>
    ))}
  </div>
);
const chat = (en: boolean) => (
  <div className="mx-auto flex w-full max-w-[380px] flex-col gap-2 text-[13px]">
    <p className="max-w-[80%] self-start rounded-[14px] rounded-bl-[4px] bg-white/[0.07] px-3 py-2 text-ink">{en ? "Can I come Thursday at 5 instead of 3?" : "Giovedì posso alle 17 invece che alle 15?"}</p>
    <p className="flex max-w-[85%] items-center gap-2 self-end rounded-[14px] rounded-br-[4px] bg-[#5ec4ff] px-3 py-2 text-black">
      <Check size={14} strokeWidth={2.6} /> {en ? "Moved to Thursday at 5" : "Spostata a giovedì alle 17"}
    </p>
  </div>
);
const Apps = (
  <div className="flex items-center justify-center gap-4">
    {["/work/relay/icon.webp", "/work/creacloud/icon.svg", "/work/unispace/mascot-base.webp"].map((src) => (
      <img key={src} src={src} alt="" className="h-14 w-14 rounded-[14px] shadow-[0_14px_30px_-10px_rgba(0,0,0,.8)]" />
    ))}
  </div>
);

const Pipeline = (
  <div className="flex items-center justify-center gap-2 text-[12px]">
    {["Build", "Test", "Deploy"].map((n, i) => (
      <span key={n} className="flex items-center gap-2">
        <span className="flex h-9 items-center gap-2 rounded-full bg-white/[0.06] px-3 text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#4cc38a] text-black">
            <Check size={10} strokeWidth={3} />
          </span>
          {n}
        </span>
        {i < 2 && <span className="h-px w-5 bg-white/20" />}
      </span>
    ))}
  </div>
);
const Status = (
  <div className="flex items-center justify-center">
    <span className="flex h-10 items-center gap-2.5 rounded-full bg-white/[0.06] px-4 text-[13px] text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#4cc38a] opacity-60" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-[#4cc38a]" />
      </span>
      Online · v2.4.1
    </span>
  </div>
);
const Shop = (
  <div className="mx-auto flex w-full max-w-[220px] items-center gap-3 rounded-[14px] bg-white/[0.05] p-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.07)]">
    <span className="h-10 w-10 shrink-0 rounded-[10px] bg-[linear-gradient(135deg,#2a2d33,#1c1c1e)]" />
    <span className="flex-1 space-y-1.5">
      <span className="block h-2 w-3/4 rounded-full bg-white/20" />
      <span className="block h-2 w-1/3 rounded-full bg-white/10" />
    </span>
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5ec4ff] text-black">
      <Check size={14} strokeWidth={3} />
    </span>
  </div>
);

/* Dal wireframe all'interfaccia: due schermate sovrapposte. */
const Proto = (
  <div className="relative mx-auto h-[min(86cqh,140px)] w-[min(90cqw,220px)]">
    <div className="absolute left-0 top-0 h-[78%] w-[62%] rounded-[12px] border border-dashed border-white/20 p-2.5">
      <span className="block h-2 w-1/2 rounded-full bg-white/15" />
      <span className="mt-2 block h-8 rounded-[6px] border border-dashed border-white/15" />
      <span className="mt-2 block h-2 w-2/3 rounded-full bg-white/10" />
    </div>
    <div className="absolute bottom-0 right-0 h-[78%] w-[62%] rounded-[12px] bg-[#1f2126] p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-16px_rgba(0,0,0,.9)]">
      <span className="block h-2 w-1/2 rounded-full bg-white/50" />
      <span className="mt-2 block h-8 rounded-[6px] bg-[linear-gradient(135deg,#5ec4ff,#2f5fff)] opacity-80" />
      <span className="mt-2 flex items-center justify-between">
        <span className="block h-2 w-1/2 rounded-full bg-white/20" />
        <span className="block h-4 w-9 rounded-full bg-[#5ec4ff]" />
      </span>
    </div>
  </div>
);

/* Il gestionale al centro, i servizi esterni attorno. */
const LINKED = [si.siWhatsapp, si.siStripe, si.siGoogle, si.siGithub];
const Hub = (
  <div className="relative mx-auto h-[min(86cqh,130px)] w-[min(90cqw,200px)]">
    <svg viewBox="0 0 200 130" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
      {[[22, 22], [178, 22], [22, 108], [178, 108]].map(([x, y]) => (
        <line key={`${x}${y}`} x1="100" y1="65" x2={x} y2={y} stroke="rgba(255,255,255,.14)" strokeDasharray="3 4" />
      ))}
    </svg>
    {LINKED.map((ic, i) => (
      <span
        key={ic.slug}
        className={`absolute flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#1f2126] text-ink-2 shadow-[0_0_0_1px_rgba(255,255,255,.08)] ${["left-0 top-0", "right-0 top-0", "bottom-0 left-0", "bottom-0 right-0"][i]}`}
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden>
          <path d={ic.path} />
        </svg>
      </span>
    ))}
    <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[14px] bg-[#5ec4ff] text-black shadow-[0_0_30px_-6px_#5ec4ff]">
      <Cable size={20} strokeWidth={1.9} />
    </span>
  </div>
);

/* Ordine, icona, disegno e ingombro di ogni servizio nella griglia a 4 colonne. */
const LAYOUT: { icon: typeof Gauge; visual?: MagicBentoVisual | ReactNode; col: number; row: number }[] = [
  { icon: AppWindow, visual: Site, col: 2, row: 2 },
  { icon: Gauge, visual: Seo, col: 2, row: 1 },
  { icon: MonitorSmartphone, visual: Apps, col: 1, row: 1 },
  { icon: LayoutTemplate, visual: Proto, col: 1, row: 1 },
  { icon: Bot, visual: "chat", col: 2, row: 1 },
  { icon: Cable, visual: Hub, col: 1, row: 1 },
  { icon: ShoppingBag, visual: Shop, col: 1, row: 1 },
  { icon: ServerCog, visual: Pipeline, col: 2, row: 1 },
  { icon: LifeBuoy, visual: Status, col: 2, row: 1 },
];

/** Colonne della griglia: 4 su desktop, 2 su tablet, 1 su telefono. */
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

export function Services() {
  const t = useTranslations("services");
  const list = t.raw("items") as Service[];
  const cols = useColumns();
  const en = useLocale() === "en";

  const items: MagicBentoItem[] = list.map((s, i) => {
    const L = LAYOUT[i];
    const I = L.icon;
    return {
      id: s.title,
      label: s.label,
      title: s.title,
      description: s.body,
      icon: <I size={16} strokeWidth={1.8} />,
      visual: L.visual === "chat" ? chat(en) : L.visual,
      colSpan: Math.min(L.col, cols),
      rowSpan: cols === 1 ? 1 : L.row,
    };
  });

  return (
    <section id="approach" className="relative mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-36">
      <Reveal>
        <SectionHead index="02" title={t("title")} lead={t("lead")} />
      </Reveal>
      <Reveal>
        <div data-reveal>
          <MagicBento
            items={items}
            columns={cols}
            rowHeight={cols === 1 ? 280 : 250}
            textAutoHide={false}
            gap={14}
            radius={28}
            theme="dark"
            glowColor="94, 196, 255"
            enableSpotlight
            enableBorderGlow
            enableStars={false}
            enableTilt={false}
            enableMagnetism={false}
            clickEffect={false}
            spotlightRadius={320}
            style={
              {
                "--mb-surface": "#111214",
                "--mb-tile": "#1c1c1e",
                "--mb-edge": "rgba(255,255,255,0.07)",
              } as CSSProperties
            }
          />
        </div>
      </Reveal>
    </section>
  );
}
