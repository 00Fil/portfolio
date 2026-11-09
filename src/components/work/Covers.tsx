"use client";

import type { CSSProperties, ReactNode } from "react";
import { ArrowLeftRight, ArrowRight, CalendarDays, FileText, MessageCircle, Monitor, Smartphone, Video } from "lucide-react";
import { Stage } from "./Stage";

/**
 * Copertine dei progetti, tutte con lo stesso impianto di Relay:
 * lo sfondo vivo a fibre nei colori del progetto, l'icona dell'app a sinistra, il nome e due pillole di vetro
 * che dicono in una riga cosa fa. Cambiano colori, icona e carattere del nome: ogni progetto resta riconoscibile.
 *
 * `hero`: apertura della pagina, nome e pillole lasciano posto al titolo e l'icona sale a sinistra.
 * `mini`: miniatura (menu), solo sfondo e icona al centro.
 * `live`: al posto dell'immagine ferma, lo sfondo animato vero.
 */
export type CoverProps = { live?: boolean; hero?: boolean; mini?: boolean; active?: boolean };

type Brand = {
  bg: string;
  fibers: string;
  live: string;
  icon: string;
  glow: string;
  name: string;
  nameClass: string;
  pills: [ReactNode, string][];
  link: ReactNode;
  tint: string;
};

const BRANDS: Record<string, Brand> = {
  creacloud: {
    bg: "#10122A",
    fibers: "/work/creacloud/fibers.webp",
    live: "bg=10122a&glow=5F6BA3&sec=D98A6C&line=F4C9B6",
    icon: "/work/creacloud/icon.svg",
    glow: "#7C89C4",
    name: "CreaCloud",
    nameClass: "t-serif text-[230px] leading-[0.9] tracking-[-0.03em]",
    pills: [
      [<MessageCircle key="i" size={26} strokeWidth={1.6} />, "WhatsApp"],
      [<CalendarDays key="i" size={26} strokeWidth={1.6} />, "Calendario"],
    ],
    link: <ArrowRight size={30} strokeWidth={1.6} className="text-[#F4C9B6]" />,
    tint: "rgba(30,32,70,.55)",
  },
  relay: {
    bg: "#05070F",
    fibers: "/work/relay/fibers.webp",
    live: "bg=05070f",
    icon: "/work/relay/icon.webp",
    glow: "#2F5FFF",
    name: "Relay",
    nameClass: "text-[210px] font-medium leading-[0.9] tracking-[-0.06em]",
    pills: [
      [<Monitor key="i" size={26} strokeWidth={1.6} />, "Windows"],
      [<Smartphone key="i" size={26} strokeWidth={1.6} />, "Android"],
    ],
    link: <ArrowLeftRight size={30} strokeWidth={1.6} className="text-[#5C9DFF]" />,
    tint: "rgba(20,26,48,.55)",
  },
  unispace: {
    bg: "#0B1414",
    fibers: "/work/unispace/fibers.webp",
    live: "bg=0b1414&glow=2E8F8A&sec=EE8A6C&line=BFE7E2",
    icon: "/work/unispace/mascot-base.webp",
    glow: "#3F9C97",
    name: "uniSpace",
    nameClass: "font-[family-name:var(--font-anton)] text-[200px] uppercase leading-[0.95] tracking-[-0.01em]",
    pills: [
      [<Video key="i" size={26} strokeWidth={1.6} />, "Lezione"],
      [<FileText key="i" size={26} strokeWidth={1.6} />, "Trascrizione"],
    ],
    link: <ArrowRight size={30} strokeWidth={1.6} className="text-[#EE8A6C]" />,
    tint: "rgba(14,30,30,.55)",
  },
};

const ease = "cubic-bezier(.7,0,.2,1)";

export function Cover({ slug, live, hero, mini }: CoverProps & { slug: string }) {
  const b = BRANDS[slug];
  const out: CSSProperties = { opacity: hero ? 0 : 1, transform: hero ? "translateY(-20px)" : "none", transition: `opacity .5s ease, transform .9s ${ease}` };
  return (
    <div className="absolute inset-0" style={{ background: b.bg }}>
      <img src={b.fibers} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      {live && (
        <iframe
          title=""
          aria-hidden
          tabIndex={-1}
          src={`/visual/gradient.html?shape=hero&touch=0&intro=0&${b.live}`}
          className="pointer-events-none absolute inset-0 h-full w-full border-0 opacity-0 transition-opacity duration-1000"
          onLoad={(e) => (e.currentTarget.style.opacity = "1")}
        />
      )}
      <Stage>
        {mini ? (
          <div className="absolute" style={{ left: 560, top: 260, width: 480, height: 480 }}>
            <div aria-hidden className="absolute inset-[-20%] rounded-full opacity-50 blur-[90px]" style={{ background: b.glow }} />
            <img src={b.icon} alt="" className="relative h-full w-full" draggable={false} />
          </div>
        ) : (
          <>
            <div
              data-depth="1.2"
              className="absolute"
              style={{ left: 250, top: 290, width: 360, height: 360, transform: hero ? "translate(-110px, -170px) scale(.78)" : "none", transition: `transform 1s ${ease}` }}
            >
              <div aria-hidden className="absolute inset-[-30%] rounded-full opacity-50 blur-[90px]" style={{ background: b.glow }} />
              <img src={b.icon} alt="" className="relative h-full w-full drop-shadow-[0_40px_60px_rgba(0,0,0,.6)]" draggable={false} />
            </div>
            <div data-depth="0.6" className="absolute" style={{ left: 680, top: 330, ...out }}>
              <span className={`block whitespace-nowrap text-[#F2F2F0] ${b.nameClass}`}>{b.name}</span>
              <div className="mt-[44px] flex items-center gap-[18px] text-[26px] text-[#F2F2F0]">
                <span className="drop flex h-[64px] items-center gap-[12px] px-[26px]" style={{ ["--drop-tint" as string]: b.tint }}>
                  {b.pills[0][0]} {b.pills[0][1]}
                </span>
                {b.link}
                <span className="drop flex h-[64px] items-center gap-[12px] px-[26px]" style={{ ["--drop-tint" as string]: b.tint }}>
                  {b.pills[1][0]} {b.pills[1][1]}
                </span>
              </div>
            </div>
          </>
        )}
      </Stage>
    </div>
  );
}
